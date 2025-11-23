import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { IPaginatedResult } from '@app/common';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { Refund, RefundStatus } from '../entities/refund.entity';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { ProcessPaymentDto, FailPaymentDto } from '../dto/process-payment.dto';
import { RefundPaymentDto } from '../dto/refund-payment.dto';
import { FilterPaymentDto } from '../dto/filter-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Refund)
    private refundRepository: Repository<Refund>,
    @Inject('ORDER_SERVICE') private orderClient: ClientProxy,
  ) {}

  /**
   * Create a new payment record
   */
  async create(
    createPaymentDto: CreatePaymentDto,
    userId: string,
  ): Promise<Payment> {
    // Verify order exists
    const order = await this.fetchOrder(createPaymentDto.orderId);
    if (!order) {
      throw new NotFoundException(
        `Order with ID ${createPaymentDto.orderId} not found`,
      );
    }

    // Check if payment already exists for this order
    const existingPayment = await this.paymentRepository.findOne({
      where: { orderId: createPaymentDto.orderId },
    });

    if (existingPayment && existingPayment.isCompleted) {
      throw new BadRequestException('Payment already completed for this order');
    }

    // Create payment record
    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      userId,
      currency: createPaymentDto.currency || 'USD',
      status: PaymentStatus.PENDING,
      refundedAmount: 0,
    });

    return await this.paymentRepository.save(payment);
  }

  /**
   * Process payment (mark as completed)
   */
  async processPayment(
    paymentId: string,
    processPaymentDto: ProcessPaymentDto,
  ): Promise<Payment> {
    const payment = await this.findById(paymentId);

    if (payment.isCompleted) {
      throw new BadRequestException('Payment is already completed');
    }

    if (payment.isFailed) {
      throw new BadRequestException(
        'Cannot process a failed payment. Create a new payment.',
      );
    }

    payment.status = PaymentStatus.COMPLETED;
    payment.transactionId = processPaymentDto.transactionId;
    payment.gatewayOrderId = processPaymentDto.gatewayOrderId;
    payment.gatewayResponse = processPaymentDto.gatewayResponse;
    payment.cardLastFour = processPaymentDto.cardLastFour;
    payment.cardBrand = processPaymentDto.cardBrand;
    payment.paidAt = new Date();

    const updatedPayment = await this.paymentRepository.save(payment);

    // Notify order service about payment completion
    this.notifyOrderService(payment.orderId, 'payment_completed', {
      paymentId: payment.id,
      transactionId: payment.transactionId,
    });

    return updatedPayment;
  }

  /**
   * Mark payment as failed
   */
  async failPayment(
    paymentId: string,
    failPaymentDto: FailPaymentDto,
  ): Promise<Payment> {
    const payment = await this.findById(paymentId);

    if (payment.isCompleted) {
      throw new BadRequestException('Cannot fail a completed payment');
    }

    payment.status = PaymentStatus.FAILED;
    payment.failureReason = failPaymentDto.failureReason;
    payment.failureCode = failPaymentDto.failureCode;
    payment.gatewayResponse = failPaymentDto.gatewayResponse;
    payment.failedAt = new Date();

    const updatedPayment = await this.paymentRepository.save(payment);

    // Notify order service about payment failure
    this.notifyOrderService(payment.orderId, 'payment_failed', {
      paymentId: payment.id,
      failureReason: payment.failureReason,
    });

    return updatedPayment;
  }

  /**
   * Initiate refund
   */
  async initiateRefund(
    paymentId: string,
    refundDto: RefundPaymentDto,
    initiatedBy: string,
  ): Promise<Refund> {
    const payment = await this.findById(paymentId);

    if (!payment.canBeRefunded) {
      throw new BadRequestException(
        'Payment cannot be refunded. Either not completed or already fully refunded.',
      );
    }

    if (refundDto.amount > payment.remainingRefundableAmount) {
      throw new BadRequestException(
        `Refund amount exceeds remaining refundable amount of ${payment.remainingRefundableAmount}`,
      );
    }

    // Create refund record
    const refund = this.refundRepository.create({
      paymentId: payment.id,
      amount: refundDto.amount,
      reason: refundDto.reason,
      reasonDetails: refundDto.reasonDetails,
      initiatedBy,
      status: RefundStatus.PENDING,
    });

    const savedRefund = await this.refundRepository.save(refund);

    // In a real implementation, this would call the payment gateway API
    // For now, we'll simulate by immediately processing the refund
    await this.processRefund(savedRefund.id);

    return savedRefund;
  }

  /**
   * Process refund (mark as completed)
   */
  async processRefund(refundId: string): Promise<Refund> {
    const refund = await this.refundRepository.findOne({
      where: { id: refundId },
    });

    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    if (refund.isCompleted) {
      throw new BadRequestException('Refund is already completed');
    }

    const payment = await this.findById(refund.paymentId);

    // Update refund status
    refund.status = RefundStatus.COMPLETED;
    refund.refundTransactionId = `re_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    refund.processedAt = new Date();
    refund.completedAt = new Date();

    const updatedRefund = await this.refundRepository.save(refund);

    // Update payment refunded amount
    payment.refundedAmount = Number(payment.refundedAmount) + Number(refund.amount);

    if (payment.refundedAmount >= Number(payment.amount)) {
      payment.status = PaymentStatus.REFUNDED;
      payment.refundedAt = new Date();
    } else {
      payment.status = PaymentStatus.PARTIALLY_REFUNDED;
    }

    await this.paymentRepository.save(payment);

    // Notify order service about refund
    this.notifyOrderService(payment.orderId, 'payment_refunded', {
      paymentId: payment.id,
      refundId: refund.id,
      amount: refund.amount,
    });

    return updatedRefund;
  }

  /**
   * Find payment by ID
   */
  async findById(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  /**
   * Find payment by order ID
   */
  async findByOrderId(orderId: string): Promise<Payment | null> {
    return await this.paymentRepository.findOne({ where: { orderId } });
  }

  /**
   * Find all payments with filters and pagination
   */
  async findAll(filterDto: FilterPaymentDto): Promise<IPaginatedResult<Payment>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = filterDto;

    const queryBuilder = this.paymentRepository.createQueryBuilder('payment');

    // Apply filters
    if (filterDto.orderId) {
      queryBuilder.andWhere('payment.orderId = :orderId', {
        orderId: filterDto.orderId,
      });
    }

    if (filterDto.userId) {
      queryBuilder.andWhere('payment.userId = :userId', {
        userId: filterDto.userId,
      });
    }

    if (filterDto.status) {
      queryBuilder.andWhere('payment.status = :status', {
        status: filterDto.status,
      });
    }

    if (filterDto.paymentMethod) {
      queryBuilder.andWhere('payment.paymentMethod = :paymentMethod', {
        paymentMethod: filterDto.paymentMethod,
      });
    }

    if (filterDto.paymentGateway) {
      queryBuilder.andWhere('payment.paymentGateway = :paymentGateway', {
        paymentGateway: filterDto.paymentGateway,
      });
    }

    // Apply sorting
    queryBuilder.orderBy(`payment.${sortBy}`, sortOrder);

    // Apply pagination
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get refunds for a payment
   */
  async getRefunds(paymentId: string): Promise<Refund[]> {
    await this.findById(paymentId); // Verify payment exists

    return await this.refundRepository.find({
      where: { paymentId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get payment statistics for a user
   */
  async getStats(userId: string) {
    const payments = await this.paymentRepository.find({ where: { userId } });

    const stats = {
      totalPayments: payments.length,
      completedPayments: payments.filter((p) => p.isCompleted).length,
      failedPayments: payments.filter((p) => p.isFailed).length,
      pendingPayments: payments.filter((p) => p.isPending).length,
      refundedPayments: payments.filter((p) => p.isRefunded).length,
      totalAmountPaid: payments
        .filter((p) => p.isCompleted)
        .reduce((sum, p) => sum + Number(p.amount), 0),
      totalAmountRefunded: payments.reduce(
        (sum, p) => sum + Number(p.refundedAmount),
        0,
      ),
    };

    return stats;
  }

  /**
   * Fetch order from order service
   */
  private async fetchOrder(orderId: string): Promise<any> {
    try {
      const order = await firstValueFrom(
        this.orderClient.send({ cmd: 'get_order' }, { orderId }),
      );
      return order;
    } catch (error) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
  }

  /**
   * Notify order service about payment events
   */
  private notifyOrderService(
    orderId: string,
    event: string,
    data: any,
  ): void {
    // Fire and forget
    this.orderClient
      .emit(`order.${event}`, { orderId, ...data })
      .subscribe();
  }
}
