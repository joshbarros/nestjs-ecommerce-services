import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
  ApiQuery,
} from '@nestjs/swagger';
import { CartService } from '../services/cart.service';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { CartResponseDto } from '../dto/cart-response.dto';
import { JwtAuthGuard, CurrentUser, ResponseDto, Public } from '@app/common';

@ApiTags('Shopping Cart')
@Controller('cart')
export class CartController {
  private readonly logger = new Logger(CartController.name);

  constructor(private readonly cartService: CartService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get cart',
    description: 'Get cart for authenticated user or guest session',
  })
  @ApiQuery({
    name: 'sessionId',
    required: false,
    description: 'Session ID for guest carts',
  })
  @ApiResponse({
    status: 200,
    description: 'Cart retrieved successfully',
    type: CartResponseDto,
  })
  async getCart(
    @CurrentUser('id') userId?: string,
    @Query('sessionId') sessionId?: string,
  ): Promise<ResponseDto<CartResponseDto>> {
    this.logger.log(
      `Getting cart for ${userId ? `user ${userId}` : `session ${sessionId}`}`,
    );
    const cart = await this.cartService.getCart(userId, sessionId);
    return ResponseDto.success(cart);
  }

  @Post('items')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Add item to cart',
    description: 'Add a product to the cart',
  })
  @ApiResponse({
    status: 200,
    description: 'Item added to cart successfully',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid product or insufficient stock' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async addToCart(
    @Body() addToCartDto: AddToCartDto,
    @CurrentUser('id') userId?: string,
  ): Promise<ResponseDto<CartResponseDto>> {
    this.logger.log(
      `Adding product ${addToCartDto.productId} to cart for ${userId || addToCartDto.sessionId}`,
    );
    const cart = await this.cartService.addToCart(addToCartDto, userId);
    return ResponseDto.success(cart, 'Item added to cart successfully');
  }

  @Patch(':cartId/items/:itemId')
  @Public()
  @ApiOperation({
    summary: 'Update cart item',
    description: 'Update the quantity of a cart item',
  })
  @ApiParam({ name: 'cartId', description: 'Cart ID' })
  @ApiParam({ name: 'itemId', description: 'Cart item ID' })
  @ApiResponse({
    status: 200,
    description: 'Cart item updated successfully',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid quantity or insufficient stock' })
  @ApiResponse({ status: 404, description: 'Cart or item not found' })
  async updateCartItem(
    @Param('cartId', ParseUUIDPipe) cartId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() updateDto: UpdateCartItemDto,
    @CurrentUser('id') userId?: string,
  ): Promise<ResponseDto<CartResponseDto>> {
    this.logger.log(`Updating cart item ${itemId} in cart ${cartId}`);
    const cart = await this.cartService.updateCartItem(
      cartId,
      itemId,
      updateDto,
      userId,
    );
    return ResponseDto.success(cart, 'Cart item updated successfully');
  }

  @Delete(':cartId/items/:itemId')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove item from cart',
    description: 'Remove a specific item from the cart',
  })
  @ApiParam({ name: 'cartId', description: 'Cart ID' })
  @ApiParam({ name: 'itemId', description: 'Cart item ID' })
  @ApiResponse({
    status: 200,
    description: 'Item removed from cart successfully',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cart or item not found' })
  async removeFromCart(
    @Param('cartId', ParseUUIDPipe) cartId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @CurrentUser('id') userId?: string,
  ): Promise<ResponseDto<CartResponseDto>> {
    this.logger.log(`Removing cart item ${itemId} from cart ${cartId}`);
    const cart = await this.cartService.removeFromCart(cartId, itemId, userId);
    return ResponseDto.success(cart, 'Item removed from cart successfully');
  }

  @Delete(':cartId')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Clear cart',
    description: 'Remove all items from the cart',
  })
  @ApiParam({ name: 'cartId', description: 'Cart ID' })
  @ApiResponse({ status: 204, description: 'Cart cleared successfully' })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  async clearCart(
    @Param('cartId', ParseUUIDPipe) cartId: string,
    @CurrentUser('id') userId?: string,
  ): Promise<void> {
    this.logger.log(`Clearing cart ${cartId}`);
    await this.cartService.clearCart(cartId, userId);
  }

  @Post('merge')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Merge guest cart',
    description: 'Merge a guest cart into user cart after login',
  })
  @ApiQuery({ name: 'sessionId', description: 'Guest cart session ID' })
  @ApiResponse({
    status: 200,
    description: 'Carts merged successfully',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async mergeCart(
    @CurrentUser('id') userId: string,
    @Query('sessionId') sessionId: string,
  ): Promise<ResponseDto<CartResponseDto>> {
    this.logger.log(`Merging guest cart ${sessionId} for user ${userId}`);
    const cart = await this.cartService.mergeGuestCart(sessionId, userId);
    return ResponseDto.success(cart, 'Carts merged successfully');
  }
}
