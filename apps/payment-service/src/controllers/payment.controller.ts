import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@app/common';
import { PaymentService } from '../services/payment.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { ProcessPaymentDto, FailPaymentDto } from '../dto/process-payment.dto';
import { RefundPaymentDto } from '../dto/refund-payment.dto';
import {
  PaymentResponseDto,
  PaymentDataResponseDto,
  PaymentsDataResponseDto,
} from '../dto/payment-response.dto';
import {
  RefundResponseDto,
  RefundDataResponseDto,
  RefundsDataResponseDto,
} from '../dto/refund-response.dto';
import { FilterPaymentDto } from '../dto/filter-payment.dto';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment created successfully',
    type: PaymentDataResponseDto,
  })
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @Req() req: any,
  ): Promise<PaymentDataResponseDto> {
    const payment = await this.paymentService.create(
      createPaymentDto,
      req.user.userId,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Payment created successfully',
      data: PaymentResponseDto.fromEntity(payment),
    };
  }

  @Patch(':id/process')
  @ApiOperation({ summary: 'Process payment (mark as completed)' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment processed successfully',
    type: PaymentDataResponseDto,
  })
  async processPayment(
    @Param('id') id: string,
    @Body() processPaymentDto: ProcessPaymentDto,
  ): Promise<PaymentDataResponseDto> {
    const payment = await this.paymentService.processPayment(
      id,
      processPaymentDto,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Payment processed successfully',
      data: PaymentResponseDto.fromEntity(payment),
    };
  }

  @Patch(':id/fail')
  @ApiOperation({ summary: 'Mark payment as failed' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment marked as failed',
    type: PaymentDataResponseDto,
  })
  async failPayment(
    @Param('id') id: string,
    @Body() failPaymentDto: FailPaymentDto,
  ): Promise<PaymentDataResponseDto> {
    const payment = await this.paymentService.failPayment(id, failPaymentDto);

    return {
      statusCode: HttpStatus.OK,
      message: 'Payment marked as failed',
      data: PaymentResponseDto.fromEntity(payment),
    };
  }

  @Post(':id/refund')
  @Roles('Admin', 'Support')
  @ApiOperation({ summary: 'Initiate payment refund' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Refund initiated successfully',
    type: RefundDataResponseDto,
  })
  async refund(
    @Param('id') id: string,
    @Body() refundDto: RefundPaymentDto,
    @Req() req: any,
  ): Promise<RefundDataResponseDto> {
    const refund = await this.paymentService.initiateRefund(
      id,
      refundDto,
      req.user.userId,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Refund initiated successfully',
      data: RefundResponseDto.fromEntity(refund),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payments retrieved successfully',
    type: PaymentsDataResponseDto,
  })
  async findAll(
    @Query() filterDto: FilterPaymentDto,
    @Req() req: any,
  ): Promise<any> {
    // Non-admin users can only see their own payments
    if (!req.user.roles.includes('Admin') && !req.user.roles.includes('Support')) {
      filterDto.userId = req.user.userId;
    }

    const result = await this.paymentService.findAll(filterDto);

    return {
      statusCode: HttpStatus.OK,
      message: 'Payments retrieved successfully',
      data: result.data.map((payment) =>
        PaymentResponseDto.fromEntity(payment),
      ),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get payment statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment statistics retrieved successfully',
  })
  async getStats(@Req() req: any): Promise<any> {
    const stats = await this.paymentService.getStats(req.user.userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Payment statistics retrieved successfully',
      data: stats,
    };
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get payment by order ID' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment retrieved successfully',
    type: PaymentDataResponseDto,
  })
  async findByOrderId(
    @Param('orderId') orderId: string,
  ): Promise<PaymentDataResponseDto> {
    const payment = await this.paymentService.findByOrderId(orderId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Payment retrieved successfully',
      data: payment ? PaymentResponseDto.fromEntity(payment) : null,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment retrieved successfully',
    type: PaymentDataResponseDto,
  })
  async findById(@Param('id') id: string): Promise<PaymentDataResponseDto> {
    const payment = await this.paymentService.findById(id);

    return {
      statusCode: HttpStatus.OK,
      message: 'Payment retrieved successfully',
      data: PaymentResponseDto.fromEntity(payment),
    };
  }

  @Get(':id/refunds')
  @ApiOperation({ summary: 'Get refunds for a payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Refunds retrieved successfully',
    type: RefundsDataResponseDto,
  })
  async getRefunds(@Param('id') id: string): Promise<RefundsDataResponseDto> {
    const refunds = await this.paymentService.getRefunds(id);

    return {
      statusCode: HttpStatus.OK,
      message: 'Refunds retrieved successfully',
      data: refunds.map((refund) => RefundResponseDto.fromEntity(refund)),
    };
  }
}
