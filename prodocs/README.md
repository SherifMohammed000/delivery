# Gas Delivery App

A full-stack web application for gas cylinder delivery that connects customers, delivery personnel, and administrators. The app eliminates the need to physically visit a filling station by bringing gas delivery to the user's doorstep.

## Core User Flow

Unlike food delivery (point A to point B), gas delivery is a **triangular flow**: Rider → Customer → Gas Station → Customer.

### Customer Flow

- **Request** — Select cylinder size (e.g., 6kg, 12kg, 50kg) and delivery address.
- **Payment** — Pay for gas + delivery fee + deposit (if applicable) upfront.
- **Handoff** — Rider arrives, takes the _empty_ cylinder.
- **Fulfillment** — Rider fills it at a designated station and returns it.
- **Completion** — Customer confirms receipt.

### Rider (Delivery Guy) Flow

- **Browse** — See open delivery requests nearby.
- **Accept** — Accept the job.
- **Pickup** — Go to customer, collect empty cylinder.
- **Refill** — Go to a designated or nearest gas station to fill.
- **Delivery** — Return full cylinder to customer.
- **Earn** — Receive payout (delivery fee + potential tips).

## Key Features

### The "Cylinder" Challenge

Gas cylinders are high-value assets. If a rider takes a cylinder and doesn't return, the customer is left with nothing.

**Solution — Digital Deposit:**
- Customer pays a refundable deposit on top of the gas cost.
- Rider scans a QR code on the customer's cylinder before pickup.
- Rider scans a QR code on the _new_ cylinder after refill.
- Deposit is released when the customer confirms receipt.

### Rider Verification

Because riders are handling heavy, pressurized equipment:

- **Background Check** — Require valid government ID and driver's license.
- **Equipment** — Riders must have a vehicle capable of securing a cylinder (motorbike with a rack or truck).
- **Safety Training** — Mandatory video tutorial on handling gas cylinders safely (valve protection, no smoking, upright transport).

### Pricing Structure

- **Gas Price** — Dynamic, linked to current market rates.
- **Delivery Fee** — Calculated based on distance (Rider → Customer → Station → Customer).
- **Service Fee** — Platform commission.

## Technical Architecture

For the MVP, the platform will be a **Progressive Web App (PWA)** so it works on browsers and mobile without needing an app store.

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) + React 18 |
| Styling | Tailwind CSS |
| Authentication | Firebase Authentication |
| Database | Firebase Firestore (real-time) |
| Backend | Next.js API Routes + Firebase Cloud Functions |
| Hosting | Vercel |
| Payments | Paystack (cards + mobile money) |
| SMS Notifications | Twilio or Africa's Talking |
| Email Notifications | Resend |

## Operational Challenges

| Challenge | Solution |
|-----------|----------|
| **Gas Station Partnership** | Partner with specific stations to negotiate bulk discounts and ensure quality. |
| **No-Show Rider** | Require a refundable "asset protection bond" before riders can accept gas jobs. |
| **Damaged Cylinder** | Mandatory photo uploads by rider at pickup (condition) and dropoff. |
| **Long Wait Times** | Implement waiting time pay for riders after 15 minutes at the station. |

## Project Structure

```
/src
  /app
    /(customer)     — Customer-facing pages (auth, orders, profile)
    /(delivery)     — Delivery personnel interface
    /(admin)        — Admin management dashboard
    /api            — API routes (payments, webhooks, admin ops)
  /components       — Reusable UI components
  /lib
    /firebase       — Firebase client SDK initialization
    /firebase-admin — Firebase Admin SDK (server-side)
    /utils          — Shared helpers
  /types            — TypeScript interfaces
```

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables and fill in your Firebase config
cp .env.example .env.local

# 3. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment

See the full deployment guide in [roadmap.md](./roadmap.md). The app is optimized for deployment on **Vercel** (with Firebase as the backend).

## Documentation

- [**backlog.md**](./backlog.md) — Software Requirements Specification (SRS)

## License

Confidential — Internal use only.
