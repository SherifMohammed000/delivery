import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * POST /api/payments/webhook
 * Receives Paystack webhook events (e.g. charge.success).
 * Validates HMAC-SHA512 signature before processing.
 *
 * This is a fallback — the primary flow verifies via the inline popup callback.
 * In production, configure this URL in your Paystack Dashboard → Settings → Webhooks.
 */
export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    // Validate HMAC-SHA512 signature
    const hash = crypto
      .createHmac("sha512", secretKey)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      console.warn("Webhook signature mismatch — rejecting");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const data = event.data;
      console.log(
        `[Webhook] charge.success — ref: ${data.reference}, amount: ${data.amount / 100} ${data.currency}`
      );

      // In production, you would update the Firestore order here
      // using the reference stored in metadata.
      // For now, the inline popup flow handles this on the client side.
    }

    // Paystack expects a 200 response to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
