/**
 * customer-order-status.ts
 *
 * Maps internal Admin OrderStatus values to the two customer-facing states:
 *   "Order Accepted" — order has been received and is being prepared
 *   "Order Shipped"  — order has been dispatched
 *
 * THALF business rule:
 *   PENDING_CONFIRMATION / CONFIRMED / PREPARING / PACKED → Order Accepted
 *   SHIPPED                                               → Order Shipped
 *   DELIVERED                                             → (no customer UI)
 *   CANCELLED                                             → Cancelled
 *
 * Admin continues to see the full internal lifecycle unchanged.
 * Do NOT expose the internal OrderStatus to customers.
 */

export type CustomerOrderStatus = 'Order Accepted' | 'Order Shipped' | 'Cancelled' | 'Unknown';

/**
 * Maps an internal Prisma OrderStatus string to a customer-facing label.
 * Accepts a string so this utility works without importing Prisma types in
 * client components.
 */
export function toCustomerStatus(internalStatus: string): CustomerOrderStatus {
  switch (internalStatus) {
    case 'PENDING_CONFIRMATION':
    case 'CONFIRMED':
    case 'PREPARING':
    case 'PACKED':
      return 'Order Accepted';
    case 'SHIPPED':
      return 'Order Shipped';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return 'Unknown';
  }
}

/**
 * Returns the customer-facing message for a given internal status.
 */
export function toCustomerStatusMessage(internalStatus: string): string {
  const status = toCustomerStatus(internalStatus);
  switch (status) {
    case 'Order Accepted':
      return 'Thank you for your order. Your order has been accepted by THALF and is being prepared for dispatch.';
    case 'Order Shipped':
      return 'Your THALF order has been dispatched.';
    case 'Cancelled':
      return 'This order has been cancelled. Please contact us on WhatsApp if you have any questions.';
    default:
      return '';
  }
}
