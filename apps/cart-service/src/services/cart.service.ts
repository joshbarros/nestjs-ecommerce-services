import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { MESSAGES } from '@app/common';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  private readonly CART_EXPIRY_DAYS = 30;

  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @Inject('CATALOG_SERVICE') private catalogClient: ClientProxy,
  ) {}

  async findOrCreateCart(userId?: string, sessionId?: string): Promise<Cart> {
    if (!userId && !sessionId) {
      throw new BadRequestException('Either userId or sessionId is required');
    }

    let cart: Cart | null;

    if (userId) {
      cart = await this.cartRepository.findOne({ where: { userId } });
    } else {
      cart = await this.cartRepository.findOne({ where: { sessionId } });
    }

    if (!cart) {
      cart = this.cartRepository.create({
        userId,
        sessionId,
        expiresAt: this.calculateExpiryDate(),
      });
      await this.cartRepository.save(cart);
      this.logger.log(`Cart created for ${userId ? `user ${userId}` : `session ${sessionId}`}`);
    }

    return cart;
  }

  async getCart(userId?: string, sessionId?: string): Promise<Cart> {
    if (!userId && !sessionId) {
      throw new BadRequestException('Either userId or sessionId is required');
    }

    const cart = await this.findOrCreateCart(userId, sessionId);

    // Update last activity
    cart.lastActivity = new Date();
    await this.cartRepository.save(cart);

    return cart;
  }

  async addToCart(
    addToCartDto: AddToCartDto,
    userId?: string,
  ): Promise<Cart> {
    const { productId, quantity, variantId, sessionId } = addToCartDto;

    // Fetch product details from catalog service
    const product = await this.fetchProductFromCatalog(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.isActive) {
      throw new BadRequestException('Product is not available');
    }

    if (product.trackInventory && product.stock < quantity) {
      throw new BadRequestException(
        `Only ${product.stock} items available in stock`,
      );
    }

    // Get or create cart
    const cart = await this.findOrCreateCart(userId, sessionId);

    // Check if item already exists in cart
    const existingItem = cart.items.find(
      (item) =>
        item.productId === productId &&
        (!variantId || item.variantId === variantId),
    );

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;

      if (product.trackInventory && product.stock < newQuantity) {
        throw new BadRequestException(
          `Only ${product.stock} items available in stock`,
        );
      }

      existingItem.quantity = newQuantity;
      existingItem.calculateSubtotal();
      await this.cartItemRepository.save(existingItem);
    } else {
      // Create new cart item
      const variant = variantId
        ? product.variants?.find((v: any) => v._id === variantId)
        : null;

      const cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId: product.id || product._id,
        productName: product.name,
        productSlug: product.slug,
        sku: variant?.sku || product.sku,
        price: variant?.price || product.price,
        compareAtPrice: product.compareAtPrice,
        quantity,
        imageUrl: product.images?.[0]?.url,
        variantId,
        variantName: variant?.name,
        variantValue: variant?.value,
        available: product.isActive,
        stockQuantity: product.stock,
      });

      cartItem.calculateSubtotal();
      cart.items.push(cartItem);
      await this.cartItemRepository.save(cartItem);
    }

    // Recalculate cart totals
    await this.recalculateCart(cart);

    this.logger.log(
      `Added ${quantity}x ${product.name} to cart ${cart.id}`,
    );

    return this.cartRepository.findOne({
      where: { id: cart.id },
    }) as Promise<Cart>;
  }

  async updateCartItem(
    cartId: string,
    itemId: string,
    updateDto: UpdateCartItemDto,
    userId?: string,
  ): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
    });

    if (!cart) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND('Cart'));
    }

    // Verify ownership
    if (userId && cart.userId !== userId) {
      throw new BadRequestException('Cart does not belong to user');
    }

    const item = cart.items.find((i) => i.id === itemId);

    if (!item) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND('Cart item'));
    }

    // Fetch product to check stock
    const product = await this.fetchProductFromCatalog(item.productId);

    if (product.trackInventory && product.stock < updateDto.quantity) {
      throw new BadRequestException(
        `Only ${product.stock} items available in stock`,
      );
    }

    item.quantity = updateDto.quantity;
    item.calculateSubtotal();
    await this.cartItemRepository.save(item);

    await this.recalculateCart(cart);

    this.logger.log(`Updated item ${itemId} in cart ${cart.id}`);

    return this.cartRepository.findOne({
      where: { id: cart.id },
    }) as Promise<Cart>;
  }

  async removeFromCart(
    cartId: string,
    itemId: string,
    userId?: string,
  ): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
    });

    if (!cart) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND('Cart'));
    }

    // Verify ownership
    if (userId && cart.userId !== userId) {
      throw new BadRequestException('Cart does not belong to user');
    }

    const item = cart.items.find((i) => i.id === itemId);

    if (!item) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND('Cart item'));
    }

    await this.cartItemRepository.remove(item);
    cart.items = cart.items.filter((i) => i.id !== itemId);

    await this.recalculateCart(cart);

    this.logger.log(`Removed item ${itemId} from cart ${cart.id}`);

    return this.cartRepository.findOne({
      where: { id: cart.id },
    }) as Promise<Cart>;
  }

  async clearCart(cartId: string, userId?: string): Promise<void> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
    });

    if (!cart) {
      throw new NotFoundException(MESSAGES.GENERAL.NOT_FOUND('Cart'));
    }

    // Verify ownership
    if (userId && cart.userId !== userId) {
      throw new BadRequestException('Cart does not belong to user');
    }

    await this.cartItemRepository.remove(cart.items);
    cart.items = [];

    await this.recalculateCart(cart);

    this.logger.log(`Cleared cart ${cart.id}`);
  }

  async mergeGuestCart(sessionId: string, userId: string): Promise<Cart> {
    const guestCart = await this.cartRepository.findOne({
      where: { sessionId },
    });

    if (!guestCart || guestCart.items.length === 0) {
      return this.findOrCreateCart(userId);
    }

    let userCart = await this.cartRepository.findOne({
      where: { userId },
    });

    if (!userCart) {
      // Convert guest cart to user cart
      guestCart.userId = userId;
      guestCart.sessionId = null;
      await this.cartRepository.save(guestCart);
      return guestCart;
    }

    // Merge items from guest cart to user cart
    for (const guestItem of guestCart.items) {
      const existingItem = userCart.items.find(
        (item) =>
          item.productId === guestItem.productId &&
          item.variantId === guestItem.variantId,
      );

      if (existingItem) {
        existingItem.quantity += guestItem.quantity;
        existingItem.calculateSubtotal();
        await this.cartItemRepository.save(existingItem);
      } else {
        guestItem.cartId = userCart.id;
        guestItem.cart = userCart;
        userCart.items.push(guestItem);
        await this.cartItemRepository.save(guestItem);
      }
    }

    // Delete guest cart
    await this.cartRepository.remove(guestCart);

    await this.recalculateCart(userCart);

    this.logger.log(`Merged guest cart ${guestCart.id} into user cart ${userCart.id}`);

    return this.cartRepository.findOne({
      where: { id: userCart.id },
    }) as Promise<Cart>;
  }

  private async recalculateCart(cart: Cart): Promise<void> {
    cart.subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.subtotal),
      0,
    );
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    // Apply tax (simplified - in production, use tax service)
    cart.tax = Number((cart.subtotal * cart.taxRate).toFixed(2));

    // Calculate total
    cart.total = Number(
      (cart.subtotal - cart.discount + cart.tax).toFixed(2),
    );

    cart.lastActivity = new Date();

    await this.cartRepository.save(cart);
  }

  private async fetchProductFromCatalog(productId: string): Promise<any> {
    try {
      const product = await firstValueFrom(
        this.catalogClient.send({ cmd: 'get_product' }, { productId }),
      );
      return product;
    } catch (error) {
      this.logger.error(`Failed to fetch product ${productId}:`, error);
      throw new BadRequestException('Unable to fetch product details');
    }
  }

  private calculateExpiryDate(): Date {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + this.CART_EXPIRY_DAYS);
    return expiryDate;
  }

  async cleanupExpiredCarts(): Promise<number> {
    const result = await this.cartRepository
      .createQueryBuilder()
      .delete()
      .where('expires_at < :now', { now: new Date() })
      .andWhere('session_id IS NOT NULL')
      .execute();

    const deletedCount = result.affected || 0;

    if (deletedCount > 0) {
      this.logger.log(`Cleaned up ${deletedCount} expired guest carts`);
    }

    return deletedCount;
  }
}
