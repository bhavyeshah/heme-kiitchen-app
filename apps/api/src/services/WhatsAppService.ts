import axios from 'axios';

export const WhatsAppService = {
  async sendTemplate(
    phone: string,
    templateName: string,
    components: object[]
  ): Promise<void> {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token) {
      console.warn('[WhatsApp] WHATSAPP_ACCESS_TOKEN not set — skipping notification');
      return;
    }

    if (!phoneNumberId) {
      console.warn('[WhatsApp] WHATSAPP_PHONE_NUMBER_ID not set — skipping notification');
      return;
    }

    try {
      await axios.post(
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en' },
            components,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(`[WhatsApp] Sent ${templateName} to ${phone}`);
    } catch (err: any) {
      console.error(
        `[WhatsApp] Failed to send ${templateName} to ${phone}:`,
        err?.response?.data || err.message
      );
    }
  },

  async sendOrderPlaced(customerName: string, phone: string): Promise<void> {
    await this.sendTemplate(phone, 'order_placed', [
      {
        type: 'body',
        parameters: [{ type: 'text', text: customerName }],
      },
    ]);
  },

  async sendOrderStatusUpdate(
    customerName: string,
    phone: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    await this.sendTemplate(phone, 'order_status_update', [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: customerName },
          { type: 'text', text: oldStatus },
          { type: 'text', text: newStatus },
        ],
      },
    ]);
  },

  async sendOrderCompleted(
    customerName: string,
    phone: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    await this.sendTemplate(phone, 'order_completed', [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: customerName },
          { type: 'text', text: oldStatus },
          { type: 'text', text: newStatus },
        ],
      },
    ]);
  },

  async sendOrderCancelled(customerName: string, phone: string): Promise<void> {
    await this.sendTemplate(phone, 'order_cancelled', [
      {
        type: 'body',
        parameters: [{ type: 'text', text: customerName }],
      },
    ]);
  },
};
