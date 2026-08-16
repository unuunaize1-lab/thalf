export interface WhatsAppMessageData {
  orderNumber: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  giftWrap: boolean;
  giftMessage?: string | null;
  totalAmount: number;
  businessPhone?: string;
  messageFooter?: string;
}

export class WhatsAppService {
  /**
   * Normalizes phone numbers to standard E.164 without spaces/symbols for WhatsApp deep link
   * Example: "+91 98765 00000" -> "919876500000"
   */
  public normalizePhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `91${cleaned}`;
    }
    return cleaned;
  }

  /**
   * Generates a pre-filled, encoded WhatsApp deep link for order handoff
   */
  public generateOrderDeepLink(data: WhatsAppMessageData): string {
    const rawPhone = data.businessPhone || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919061107915';
    const targetPhone = this.normalizePhoneNumber(rawPhone);

    const lines: string[] = [];
    lines.push('Hello THALF,');
    lines.push('');
    lines.push('I\'d like to place an order.');
    lines.push('');
    lines.push(`Order: #${data.orderNumber}`);
    lines.push('');

    data.items.forEach((item) => {
      lines.push(`${item.productName}`);
      lines.push(`${item.quantity} × ₹${item.unitPrice.toLocaleString('en-IN')}`);
      lines.push('');
    });

    lines.push(`Order Total: ₹${data.totalAmount.toLocaleString('en-IN')}`);
    lines.push('');
    lines.push(data.messageFooter || 'Please confirm my order and share the payment details.\n\nThank you.');

    const fullMessage = lines.join('\n');
    const encodedMessage = encodeURIComponent(fullMessage);

    return `https://wa.me/${targetPhone}?text=${encodedMessage}`;
  }
}

export const whatsappService = new WhatsAppService();
