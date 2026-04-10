export interface OrderItem {
    productName: string;
    variant: string;
    price: number;
    quantity: number;
}

export interface WhatsAppOrderData {
    orderCode: string;
    customerName: string;
    customerPhone: string;
    notes?: string;
    items: OrderItem[];
    totalPrice: number;
    currency: string;
    locale?: 'en' | 'ar';
}

export function generateOrderCode(): string {
    const prefix = 'SH';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 999999)
        .toString()
        .padStart(6, '0');
    return `${prefix}-${year}-${random}`;
}

export function buildWhatsAppMessage(data: WhatsAppOrderData): string {
    const isAr = data.locale === 'ar';

    const line = '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500';
    const dot = '\u25CF';
    const arrow = '\u25B8';

    if (isAr) {
        const itemsText = data.items
            .map(
                (item, index) =>
                    `  ${index + 1}. *${item.productName}*\n      ${arrow} \u0627\u0644\u062E\u0637\u0629: ${item.variant}\n      ${arrow} \u0627\u0644\u0633\u0639\u0631: ${item.price.toFixed(2)} ${data.currency}\n      ${arrow} \u0627\u0644\u0643\u0645\u064A\u0629: ${item.quantity}`
            )
            .join('\n\n');

        const notesSection = data.notes
            ? `\n${line}\n${dot} *\u0645\u0644\u0627\u062D\u0638\u0627\u062A:*\n${data.notes}\n`
            : '';

        return [
            `*\u2729 Service Hub \u2729*`,
            line,
            ``,
            `*\u0637\u0644\u0628 \u062C\u062F\u064A\u062F*`,
            ``,
            `${dot} *\u0631\u0645\u0632 \u0627\u0644\u0637\u0644\u0628:* \`${data.orderCode}\``,
            ``,
            line,
            `${dot} *\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A:*`,
            ``,
            itemsText,
            ``,
            line,
            `${dot} *\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0639\u0645\u064A\u0644:*`,
            `   ${arrow} \u0627\u0644\u0627\u0633\u0645: ${data.customerName}`,
            `   ${arrow} \u0627\u0644\u0647\u0627\u062A\u0641: ${data.customerPhone}`,
            notesSection,
            line,
            `${dot} *\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A: ${data.totalPrice.toFixed(2)} ${data.currency}*`,
            line,
            ``,
            `\u0634\u0643\u0631\u0627\u064B \u0644\u0627\u062E\u062A\u064A\u0627\u0631\u0643 Service Hub!`,
        ].join('\n');
    }

    // English version
    const itemsText = data.items
        .map(
            (item, index) =>
                `  ${index + 1}. *${item.productName}*\n      ${arrow} Plan: ${item.variant}\n      ${arrow} Price: ${item.price.toFixed(2)} ${data.currency}\n      ${arrow} Qty: ${item.quantity}`
        )
        .join('\n\n');

    const notesSection = data.notes
        ? `\n${line}\n${dot} *Notes:*\n${data.notes}\n`
        : '';

    return [
        `*\u2729 Service Hub \u2729*`,
        line,
        ``,
        `*New Order*`,
        ``,
        `${dot} *Order Code:* \`${data.orderCode}\``,
        ``,
        line,
        `${dot} *Products:*`,
        ``,
        itemsText,
        ``,
        line,
        `${dot} *Customer Info:*`,
        `   ${arrow} Name: ${data.customerName}`,
        `   ${arrow} Phone: ${data.customerPhone}`,
        notesSection,
        line,
        `${dot} *Total: ${data.totalPrice.toFixed(2)} ${data.currency}*`,
        line,
        ``,
        `Thank you for choosing Service Hub!`,
    ].join('\n');
}

export function generateWhatsAppUrl(phone: string, message: string): string {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const encodedMessage = encodeURIComponent(message);
    // Use api.whatsapp.com for better mobile compatibility
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
}

/**
 * Opens WhatsApp URL reliably on both desktop and mobile.
 * window.open with '_blank' gets blocked by mobile popup blockers.
 * Using window.location.href works reliably as a fallback.
 */
export function openWhatsApp(url: string): void {
    // Try to detect mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );

    if (isMobile) {
        // On mobile, direct navigation works better and avoids popup blockers
        window.location.href = url;
    } else {
        // On desktop, open in new tab
        const newWindow = window.open(url, '_blank');
        if (!newWindow || newWindow.closed) {
            // Fallback if popup was blocked
            window.location.href = url;
        }
    }
}
