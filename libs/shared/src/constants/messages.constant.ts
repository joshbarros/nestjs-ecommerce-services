export const MESSAGES = {
  // Auth messages
  AUTH: {
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    REGISTER_SUCCESS: 'Registration successful',
    INVALID_CREDENTIALS: 'Invalid email or password',
    TOKEN_EXPIRED: 'Token has expired',
    TOKEN_INVALID: 'Invalid token',
    EMAIL_EXISTS: 'Email already exists',
    USER_NOT_FOUND: 'User not found',
    PASSWORD_RESET_SUCCESS: 'Password reset successful',
    EMAIL_VERIFIED: 'Email verified successfully',
  },

  // User messages
  USER: {
    CREATED: 'User created successfully',
    UPDATED: 'User updated successfully',
    DELETED: 'User deleted successfully',
    NOT_FOUND: 'User not found',
  },

  // Product messages
  PRODUCT: {
    CREATED: 'Product created successfully',
    UPDATED: 'Product updated successfully',
    DELETED: 'Product deleted successfully',
    NOT_FOUND: 'Product not found',
    OUT_OF_STOCK: 'Product is out of stock',
  },

  // Order messages
  ORDER: {
    CREATED: 'Order created successfully',
    UPDATED: 'Order updated successfully',
    CANCELLED: 'Order cancelled successfully',
    NOT_FOUND: 'Order not found',
    CANNOT_CANCEL: 'Order cannot be cancelled',
  },

  // Payment messages
  PAYMENT: {
    SUCCESS: 'Payment processed successfully',
    FAILED: 'Payment processing failed',
    REFUNDED: 'Payment refunded successfully',
  },

  // Cart messages
  CART: {
    ITEM_ADDED: 'Item added to cart',
    ITEM_REMOVED: 'Item removed from cart',
    ITEM_UPDATED: 'Cart item updated',
    CLEARED: 'Cart cleared',
    EMPTY: 'Cart is empty',
  },

  // General messages
  GENERAL: {
    SUCCESS: 'Operation completed successfully',
    ERROR: 'An error occurred',
    VALIDATION_ERROR: 'Validation error',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    NOT_FOUND: 'Resource not found',
  },
} as const;
