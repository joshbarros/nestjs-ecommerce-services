import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Order, OrderStatus, PaymentStatus, FulfillmentStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto, CancelOrderDto } from '../dto/update-order.dto';
import { FilterOrderDto } from '../dto/filter-order.dto';
import { IPaginatedResult, MESSAGES } from '@app/common';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @Inject('CART_SERVICE') private cartClient: ClientProxy,
    @Inject('USER_SERVICE') private userClient: ClientProxy,
    @Inject('CATALOG_SERVICE') private catalogClient: ClientProxy,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string, userEmail: string): Promise<Order> {
    this.logger.log(`Creating order for user ${userId}`);

    // Step 1: Fetch cart from cart-service
    const cart = await this.fetchCart(createOrderDto.cartId, userId);

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Step 2: Validate all products are still available
    await this.validateProductsAvailability(cart.items);

    // Step 3: Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Step 4: Create order
    const order = this.orderRepository.create({
      orderNumber,
      userId,
      userEmail,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      fulfillmentStatus: FulfillmentStatus.UNFULFILLED,

      // Pricing from cart
      subtotal: cart.subtotal,
      tax: cart.tax,
      taxRate: cart.taxRate,
      discount: cart.discount,
      discountCode: cart.discountCode,
      shippingCost: 0, // Will be calculated by shipping service
      total: cart.total,
      currency: cart.currency,

      // Shipping address
      shippingFirstName: createOrderDto.shippingAddress.firstName,
      shippingLastName: createOrderDto.shippingAddress.lastName,
      shippingPhone: createOrderDto.shippingAddress.phone,
      shippingAddressLine1: createOrderDto.shippingAddress.addressLine1,
      shippingAddressLine2: createOrderDto.shippingAddress.addressLine2,
      shippingCity: createOrderDto.shippingAddress.city,
      shippingState: createOrderDto.shippingAddress.state,
      shippingPostalCode: createOrderDto.shippingAddress.postalCode,
      shippingCountry: createOrderDto.shippingAddress.country,

      // Billing address (if provided, otherwise same as shipping)
      billingFirstName: createOrderDto.billingAddress?.firstName || createOrderDto.shippingAddress.firstName,
      billingLastName: createOrderDto.billingAddress?.lastName || createOrderDto.shippingAddress.lastName,
      billingPhone: createOrderDto.billingAddress?.phone || createOrderDto.shippingAddress.phone,
      billingAddressLine1: createOrderDto.billingAddress?.addressLine1 || createOrderDto.shippingAddress.addressLine1,
      billingAddressLine2: createOrderDto.billingAddress?.addressLine2 || createOrderDto.shippingAddress.addressLine2,
      billingCity: createOrderDto.billingAddress?.city || createOrderDto.shippingAddress.city,
      billingState: createOrderDto.billingAddress?.state || createOrderDto.shippingAddress.state,
      billingPostalCode: createOrderDto.billingAddress?.postalCode || createOrderDto.shippingAddress.postalCode,
      billingCountry: createOrderDto.billingAddress?.country || createOrderDto.shippingAddress.country,

      // Payment
      paymentMethod: createOrderDto.paymentMethod,

      // Notes
      customerNotes: createOrderDto.customerNotes,
    });

    // Step 5: Create order items from cart items
    const orderItems: OrderItem[] = [];
    for (const cartItem of cart.items) {
      const orderItem = this.orderItemRepository.create({
        productId: cartItem.productId,
        productName: cartItem.productName,
        productSlug: cartItem.productSlug,
        sku: cartItem.sku,
        price: cartItem.price,
        originalPrice: cartItem.compareAtPrice,
        quantity: cartItem.quantity,
        subtotal: cartItem.subtotal,
        taxAmount: 0, // Simplified - can be calculated per item
        discountAmount: 0,
        total: cartItem.subtotal,
        imageUrl: cartItem.imageUrl,
        variantId: cartItem.variantId,
        variantName: cartItem.variantName,
        variantValue: cartItem.variantValue,
        requiresShipping: true, // From product data
        isDigital: false,
        fulfilledQuantity: 0,
      });

      orderItems.push(orderItem);
    }

    order.items = orderItems;

    // Step 6: Save order
    const savedOrder = await this.orderRepository.save(order);

    // Step 7: Clear cart (fire and forget - don't wait)
    this.clearCart(createOrderDto.cartId, userId).catch(err =>
      this.logger.error(`Failed to clear cart ${createOrderDto.cartId}:`, err)
    );

    this.logger.log(`Order ${savedOrder.orderNumber} created successfully`);

    return savedOrder;
  }

  async findAll(
    userId: string,
    filterDto: FilterOrderDto,
  ): Promise<IPaginatedResult<Order>> {
    const { page = 1, limit = 20, status, paymentStatus, fulfillmentStatus, startDate, endDate } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (fulfillmentStatus) {
      where.fulfillmentStatus = fulfillmentStatus;
    }

    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    }

    const [orders, total] = await Promise.all([
      this.orderRepository.find({
        where,
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      }),
      this.orderRepository.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  async findOne(id: string, userId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id, userId },
    });

    if (!order) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND('Order'));
    }

    return order;
  }

  async findByOrderNumber(orderNumber: string, userId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderNumber, userId },
    });

    if (!order) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND('Order'));
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND('Order'));
    }

    // Update status and tracking
    if (updateOrderDto.status) {
      order.status = updateOrderDto.status;

      // Set timestamps based on status
      if (updateOrderDto.status === OrderStatus.SHIPPED && !order.shippedAt) {
        order.shippedAt = new Date();
      }

      if (updateOrderDto.status === OrderStatus.DELIVERED && !order.deliveredAt) {
        order.deliveredAt = new Date();
      }
    }

    if (updateOrderDto.fulfillmentStatus) {
      order.fulfillmentStatus = updateOrderDto.fulfillmentStatus;
    }

    if (updateOrderDto.trackingNumber) {
      order.trackingNumber = updateOrderDto.trackingNumber;
    }

    if (updateOrderDto.shippingCarrier) {
      order.shippingCarrier = updateOrderDto.shippingCarrier;
    }

    if (updateOrderDto.estimatedDelivery) {
      order.estimatedDelivery = new Date(updateOrderDto.estimatedDelivery);
    }

    if (updateOrderDto.internalNotes) {
      order.internalNotes = updateOrderDto.internalNotes;
    }

    const updatedOrder = await this.orderRepository.save(order);

    this.logger.log(`Order ${order.orderNumber} updated`);

    return updatedOrder;
  }

  async cancel(id: string, userId: string, cancelDto: CancelOrderDto): Promise<Order> {
    const order = await this.findOne(id, userId);

    if (!order.canBeCancelled) {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }

    order.status = OrderStatus.CANCELLED;
    order.cancelledAt = new Date();
    order.cancellationReason = cancelDto.reason;

    const cancelledOrder = await this.orderRepository.save(order);

    this.logger.log(`Order ${order.orderNumber} cancelled by user ${userId}`);

    // TODO: Trigger refund process if payment was completed
    // TODO: Restore inventory

    return cancelledOrder;
  }

  async confirmPayment(orderId: string, transactionId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND('Order'));
    }

    order.paymentStatus = PaymentStatus.PAID;
    order.transactionId = transactionId;
    order.status = OrderStatus.CONFIRMED;

    const updatedOrder = await this.orderRepository.save(order);

    this.logger.log(`Payment confirmed for order ${order.orderNumber}`);

    return updatedOrder;
  }

  private async fetchCart(cartId: string, userId: string): Promise<any> {
    try {
      const cart = await firstValueFrom(
        this.cartClient.send({ cmd: 'get_cart' }, { cartId, userId }),
      );
      return cart;
    } catch (error) {
      this.logger.error(`Failed to fetch cart ${cartId}:`, error);
      throw new BadRequestException('Unable to fetch cart');
    }
  }

  private async clearCart(cartId: string, userId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.cartClient.send({ cmd: 'clear_cart' }, { cartId, userId }),
      );
      this.logger.log(`Cart ${cartId} cleared after order creation`);
    } catch (error) {
      this.logger.error(`Failed to clear cart ${cartId}:`, error);
      // Don't throw - this is not critical
    }
  }

  private async validateProductsAvailability(cartItems: any[]): Promise<void> {
    for (const item of cartItems) {
      try {
        const product = await firstValueFrom(
          this.catalogClient.send({ cmd: 'get_product' }, { productId: item.productId }),
        );

        if (!product || !product.isActive) {
          throw new BadRequestException(
            `Product ${item.productName} is no longer available`,
          );
        }

        if (product.trackInventory && product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${item.productName}. Only ${product.stock} available.`,
          );
        }
      } catch (error) {
        this.logger.error(`Failed to validate product ${item.productId}:`, error);
        throw new BadRequestException(`Unable to validate product availability`);
      }
    }
  }

  private async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  async getOrderStats(userId: string): Promise<any> {
    const [total, pending, confirmed, shipped, delivered, cancelled] = await Promise.all([
      this.orderRepository.count({ where: { userId } }),
      this.orderRepository.count({ where: { userId, status: OrderStatus.PENDING } }),
      this.orderRepository.count({ where: { userId, status: OrderStatus.CONFIRMED } }),
      this.orderRepository.count({ where: { userId, status: OrderStatus.SHIPPED } }),
      this.orderRepository.count({ where: { userId, status: OrderStatus.DELIVERED } }),
      this.orderRepository.count({ where: { userId, status: OrderStatus.CANCELLED } }),
    ]);

    return {
      total,
      pending,
      confirmed,
      shipped,
      delivered,
      cancelled,
    };
  }
}
