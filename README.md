# Hémé Kiitchen — Web App

Premium Jain-friendly dip brand website with online ordering and admin panel.

## Tech Stack

- **Frontend**: Next.js 16 (App Router, TypeScript, Tailwind CSS)
- **Backend**: Express 5 (TypeScript, JSON file storage)
- **Images**: Cloudinary CDN
- **Notifications**: Meta WhatsApp Cloud API
- **Hosting**: Render (free tier)

## Project Structure

```
heme-kiitchen-app/
├── apps/
│   ├── web/          # Next.js storefront + admin panel
│   └── api/          # Express REST API
├── packages/
│   └── types/        # Shared TypeScript types
└── data/             # JSON data files (orders, products, site-content)
```

## Local Dev Setup

### 1. Install dependencies

```bash
# API dependencies
cd apps/api
npm install --no-workspaces

# Web dependencies
cd ../web
npm install --no-workspaces
```

### 2. Configure environment variables

```bash
# API
cp apps/api/.env.example apps/api/.env

# Web
cp apps/web/.env.example apps/web/.env.local
```

**Minimum required for local dev** (no WhatsApp or Cloudinary needed to start):
```
# apps/api/.env
ADMIN_SECRET=any-secret-password
SESSION_SECRET=any-random-string
PORT=4000

# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Start the API

```bash
cd apps/api
npm run dev
# API runs at http://localhost:4000
```

### 4. Start the web app

```bash
cd apps/web
npm run dev
# Web runs at http://localhost:3000
```

### 5. Admin access

Go to `http://localhost:3000/admin/login` and enter the `ADMIN_SECRET` you set.

## Asset Update Guide

### Brand logo

Place your logo file at `apps/web/public/images/logo.png`.

### Product photos

Managed via the admin panel at `/admin/products`. Images are uploaded to Cloudinary automatically. For local dev without Cloudinary, skip image uploads — products will display without images.

### FSSAI certificate

Place the PDF at `apps/web/public/fssai-certificate.pdf`. It renders inline via PDF.js on the About page with no download button.

### Product catalogue

Manage products through the admin panel at `/admin/products`. Initial seed data is in `data/products.json`.

## Deployment (Render)

1. Create a Cloudinary account — note Cloud Name, API Key, API Secret
2. Set up Meta WhatsApp Cloud API — note Phone Number ID, Access Token
3. Deploy `apps/api` on Render as a web service:
   - Build command: `npm install --no-workspaces && npm run build`
   - Start command: `npm start`
   - Set env vars: `ADMIN_SECRET`, `SESSION_SECRET`, `PORT=10000`, `CLOUDINARY_*`, `WHATSAPP_*`, `WEB_URL=https://www.hemekiitchen.com`
4. Deploy `apps/web` on Render as a second web service:
   - Build command: `npm install --no-workspaces && npm run build`
   - Start command: `npm start`
   - Set env vars: `NEXT_PUBLIC_API_URL` (your API Render URL), `NEXT_PUBLIC_BUSINESS_WHATSAPP_NUMBER`, `NEXT_PUBLIC_FSSAI_LICENCE_NUMBER`
5. Add custom domain `www.hemekiitchen.com` to the web service in Render dashboard

## Changing the Admin Password

Update `ADMIN_SECRET` in the Render dashboard for the API service and redeploy. No code change required.
