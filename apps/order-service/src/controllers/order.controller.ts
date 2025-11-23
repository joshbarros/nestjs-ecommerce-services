import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto, CancelOrderDto } from '../dto/update-order.dto';
import { FilterOrderDto } from '../dto/filter-order.dto';
import { OrderResponseDto } from '../dto/order-response.dto';
import {
  JwtAuthGuard,
  Roles,
  RolesGuard,
  CurrentUser,
  ResponseDto,
  UserRole,
  PaginatedResponseDto,
} from '@app/common';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create order',
    description: 'Create a new order from cart',
  })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid cart or products unavailable' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('email') userEmail: string,
  ): Promise<ResponseDto<OrderResponseDto>> {
    this.logger.log(`Creating order from cart ${createOrderDto.cartId} for user ${userId}`);
    const order = await this.orderService.create(createOrderDto, userId, userEmail);
    return ResponseDto.success(order, 'Order created successfully');
  }

  @Get()
  @ApiOperation({
    summary: 'Get all orders',
    description: 'Get all orders for the current user with filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
  })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() filterDto: FilterOrderDto,
  ): Promise<PaginatedResponseDto<OrderResponseDto>> {
    this.logger.log(`Getting orders for user ${userId}`);
    const result = await this.orderService.findAll(userId, filterDto);
    return PaginatedResponseDto.success(result.data, result.meta);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get order statistics',
    description: 'Get order count statistics for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStats(
    @CurrentUser('id') userId: string,
  ): Promise<ResponseDto<any>> {
    this.logger.log(`Getting order stats for user ${userId}`);
    const stats = await this.orderService.getOrderStats(userId);
    return ResponseDto.success(stats);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get order by ID',
    description: 'Get a specific order by ID',
  })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ): Promise<ResponseDto<OrderResponseDto>> {
    this.logger.log(`Getting order ${id} for user ${userId}`);
    const order = await this.orderService.findOne(id, userId);
    return ResponseDto.success(order);
  }

  @Get('number/:orderNumber')
  @ApiOperation({
    summary: 'Get order by order number',
    description: 'Get a specific order by order number',
  })
  @ApiParam({ name: 'orderNumber', description: 'Order number' })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findByOrderNumber(
    @Param('orderNumber') orderNumber: string,
    @CurrentUser('id') userId: string,
  ): Promise<ResponseDto<OrderResponseDto>> {
    this.logger.log(`Getting order ${orderNumber} for user ${userId}`);
    const order = await this.orderService.findByOrderNumber(orderNumber, userId);
    return ResponseDto.success(order);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({
    summary: 'Update order',
    description: 'Update order status and tracking (Admin/Support only)',
  })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Order updated successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<ResponseDto<OrderResponseDto>> {
    this.logger.log(`Updating order ${id}`);
    const order = await this.orderService.update(id, updateOrderDto);
    return ResponseDto.success(order, 'Order updated successfully');
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel order',
    description: 'Cancel an order',
  })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Order cannot be cancelled' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() cancelDto: CancelOrderDto,
  ): Promise<ResponseDto<OrderResponseDto>> {
    this.logger.log(`Cancelling order ${id} for user ${userId}`);
    const order = await this.orderService.cancel(id, userId, cancelDto);
    return ResponseDto.success(order, 'Order cancelled successfully');
  }
}
