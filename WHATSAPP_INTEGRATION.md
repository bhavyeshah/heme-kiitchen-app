# WhatsApp Business API Integration — Hémé Kiitchen

Meta WhatsApp Cloud API is already wired into the codebase (`WhatsAppService.ts`).
This document covers every step needed to go live and the email to send Meta to start the process.

---

## Task Checklist

### Phase 1 — Meta Business Setup

- [ ] **1.1** Create a [Meta Business Account](https://business.facebook.com) if you don't have one
  - Business name: **Hémé Kiitchen**
  - Business email: your official business email
  - Business website: `https://www.hemekiitchen.com`

- [ ] **1.2** Complete **Business Verification** in Meta Business Manager
  - Go to: Business Settings → Security Centre → Start Verification
  - Required documents (any one): GST certificate, FSSAI licence, or bank statement showing business name
  - Verification takes 2–7 business days

- [ ] **1.3** Create a [Meta Developer account](https://developers.facebook.com) and link it to the Business Account

- [ ] **1.4** Create a new **Meta App**
  - Go to: developers.facebook.com → My Apps → Create App
  - App type: **Business**
  - Add **WhatsApp** as a product to the app

### Phase 2 — WhatsApp Business Account (WABA)

- [ ] **2.1** Create a **WhatsApp Business Account (WABA)** inside the Meta App
  - Go to: App Dashboard → WhatsApp → Getting Started
  - WABA is automatically created during setup

- [ ] **2.2** Add a **dedicated phone number** for the WhatsApp Business API
  - This number must NOT already be registered with WhatsApp (personal or Business App)
  - Recommended: get a new SIM / virtual number exclusively for API use
  - Verify the number via OTP inside Meta Dashboard

- [ ] **2.3** Note down:
  - `Phone Number ID` (shown in Dashboard → WhatsApp → Getting Started)
  - `WhatsApp Business Account ID`
  - `App ID`

### Phase 3 — Access Token

- [ ] **3.1** Generate a **Permanent System User Access Token**
  - Go to: Business Settings → Users → System Users → Add System User (Admin role)
  - Assign the WhatsApp app to this system user
  - Generate token with permissions: `whatsapp_business_messaging`, `whatsapp_business_management`
  - Copy the token — it will not be shown again

- [ ] **3.2** Add token to Render environment variables:
  ```
  WHATSAPP_ACCESS_TOKEN=<your system user token>
  WHATSAPP_PHONE_NUMBER_ID=<your phone number id>
  ```

### Phase 4 — Message Template Approval

All outbound business-initiated messages must use pre-approved templates.
The following 4 templates are used by the app and must be submitted for approval.

> Submit templates via: Meta App Dashboard → WhatsApp → Message Templates → Create Template

---

#### Template 1: `order_placed`
- **Category**: `TRANSACTIONAL`
- **Language**: English (en)
- **Body text**:
  ```
  Hi {{1}}! Your order at Hémé Kiitchen has been placed successfully. 🎉 We'll notify you as it gets prepared. Thank you for choosing us!
  ```
- **Variable**: `{{1}}` = Customer first name

---

#### Template 2: `order_status_update`
- **Category**: `TRANSACTIONAL`
- **Language**: English (en)
- **Body text**:
  ```
  Hi {{1}}, your Hémé Kiitchen order status has been updated from *{{2}}* to *{{3}}*. We'll keep you posted!
  ```
- **Variables**: `{{1}}` = Customer name, `{{2}}` = Previous status, `{{3}}` = New status

---

#### Template 3: `order_completed`
- **Category**: `TRANSACTIONAL`
- **Language**: English (en)
- **Body text**:
  ```
  Hi {{1}}, your Hémé Kiitchen order is now *{{3}}*! 🙌 We hope you enjoy every bite. Thank you for your support!
  ```
- **Variables**: `{{1}}` = Customer name, `{{2}}` = Previous status, `{{3}}` = New status

---

#### Template 4: `order_cancelled`
- **Category**: `TRANSACTIONAL`
- **Language**: English (en)
- **Body text**:
  ```
  Hi {{1}}, we're sorry to inform you that your Hémé Kiitchen order has been cancelled. Please reach out to us if you have any questions — we're happy to help.
  ```
- **Variable**: `{{1}}` = Customer name

---

- [ ] **4.1** Submit all 4 templates for approval (approval typically takes a few hours to 2 days)
- [ ] **4.2** Verify all 4 templates show **Approved** status before going live

### Phase 5 — Testing

- [ ] **5.1** Use the test phone number provided in Meta Dashboard (free for testing, no template approval needed)
- [ ] **5.2** Place a test order on the storefront and confirm `order_placed` WhatsApp message is received
- [ ] **5.3** Update the order status via admin panel and confirm `order_status_update` message is received
- [ ] **5.4** Mark order as completed and confirm `order_completed` message is received
- [ ] **5.5** Cancel an order and confirm `order_cancelled` message is received

### Phase 6 — Go Live

- [ ] **6.1** Switch from test number to the verified business phone number in `WHATSAPP_PHONE_NUMBER_ID`
- [ ] **6.2** Upgrade Meta App from **Development** to **Live** mode
  - Go to: App Dashboard → App Mode → switch to Live
- [ ] **6.3** Set messaging limit: by default new WABAs start at 1,000 conversations/day — sufficient for launch
- [ ] **6.4** Monitor the first 10–20 live orders to confirm messages are delivered correctly

---

## Email to Meta

Use this email when contacting Meta Business Support or a Meta Sales representative to:
- Request expedited business verification
- Escalate a stuck template approval
- Request a dedicated account manager once order volume grows

Send to: [Meta Business Support](https://www.facebook.com/business/help) via the support chat/ticket form, or to your assigned Meta account rep if you have one.

---

**Subject:** WhatsApp Business API Access Request — Hémé Kiitchen (Food & Beverage, India)

---

Dear Meta WhatsApp Business Team,

I am writing on behalf of **Hémé Kiitchen**, a registered food business based in India specialising in handcrafted, Jain-friendly dips and condiments. We are in the process of integrating the **WhatsApp Business Cloud API** into our online ordering platform to send automated transactional notifications to our customers.

**Business Details**

| Field | Details |
|---|---|
| Business Name | Hémé Kiitchen |
| Business Type | Food & Beverage — Home-based / Small Business |
| Website | https://www.hemekiitchen.com |
| FSSAI Licence No. | *(insert your licence number)* |
| Country | India |
| Primary Contact | *(Your full name)* |
| Contact Email | *(Your business email)* |
| Contact Phone | *(Your phone number with country code)* |

**Intended Use Case**

We intend to use the WhatsApp Cloud API exclusively for **transactional order notifications** — specifically:

1. Order confirmation when a customer places an order
2. Order status updates as the order moves through preparation stages
3. Order completion notification
4. Order cancellation notification (when applicable)

We will not use the API for marketing, promotional broadcasts, or unsolicited messaging. All messages will be sent only to customers who have actively placed an order on our platform and provided their phone number during checkout.

**Expected Volume**

We are a small-batch artisanal brand currently in the early growth phase. We anticipate:
- Estimated monthly orders at launch: **50–200 orders/month**
- Expected growth over 12 months: **up to 500 orders/month**
- Message volume will remain well within the standard 1,000 conversations/day tier

**Technical Setup**

We are using the **WhatsApp Cloud API** (self-managed, no BSP intermediary) via the Meta Graph API (`v18.0`). Our backend is hosted on Render and handles all API calls server-side. We have 4 message templates ready for submission — all are transactional in nature and follow Meta's messaging policy.

**Request**

We kindly request:

1. Assistance with completing our **Business Verification** if our submission requires any additional documentation
2. Guidance on the **template approval process** for our 4 transactional templates
3. Confirmation that our use case is compliant with the [WhatsApp Business Policy](https://www.whatsapp.com/legal/business-policy/)

We are excited to use WhatsApp to provide a better post-purchase experience for our customers and would appreciate any support you can offer in getting our integration live.

Please feel free to reach out if you need any additional information or documentation.

Warm regards,

**[Your Full Name]**
Hémé Kiitchen
[Your business email]
[Your phone number]
[https://www.hemekiitchen.com](https://www.hemekiitchen.com)

---

## Quick Reference — Environment Variables

```bash
# apps/api/.env (or Render dashboard)
WHATSAPP_ACCESS_TOKEN=        # System User permanent token from Meta Business Manager
WHATSAPP_PHONE_NUMBER_ID=     # Phone Number ID from WhatsApp → Getting Started

# apps/web/.env.local (or Render dashboard)
NEXT_PUBLIC_BUSINESS_WHATSAPP_NUMBER=   # Display number for "Chat with us" links (e.g. 919876543210)
```

## Useful Links

- [Meta Business Manager](https://business.facebook.com)
- [Meta for Developers](https://developers.facebook.com)
- [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Message Templates Guide](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates)
- [Business Verification Guide](https://www.facebook.com/business/help/2058515294227817)
- [WhatsApp Business Policy](https://www.whatsapp.com/legal/business-policy/)
- [Meta Business Support](https://www.facebook.com/business/help)
