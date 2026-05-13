import { NextRequest, NextResponse } from "next/server";
import https from "https";

/**
 * GET /api/payments/verify?reference=xxx
 * Verifies a Paystack transaction by its reference.
 * Returns the payment status, amount paid, and timestamp.
 */

function paystackVerify(secretKey: string, reference: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: `/transaction/verify/${encodeURIComponent(reference)}`,
      method: "GET",
      rejectUnauthorized: false,
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk: string) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error("Invalid JSON response from Paystack"));
        }
      });
    });

    req.on("error", (e) => reject(e));
    req.end();
  });
}

export async function GET(request: NextRequest) {
  try {
    const reference = request.nextUrl.searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "reference query parameter is required" },
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error("PAYSTACK_SECRET_KEY is not set");
      return NextResponse.json(
        { error: "Payment service is not configured" },
        { status: 500 }
      );
    }

    const paystackData = await paystackVerify(secretKey, reference);

    if (!paystackData.status) {
      console.error("Paystack verify failed:", paystackData);
      return NextResponse.json(
        { error: paystackData.message || "Verification failed" },
        { status: 502 }
      );
    }

    const txn = paystackData.data;

    return NextResponse.json({
      status: txn.status, // "success" | "failed" | "abandoned"
      amount: txn.amount / 100, // Convert pesewas back to GH₵
      currency: txn.currency,
      reference: txn.reference,
      paidAt: txn.paid_at,
      channel: txn.channel, // "card" | "mobile_money" etc.
      metadata: txn.metadata,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error?.message },
      { status: 500 }
    );
  }
}
