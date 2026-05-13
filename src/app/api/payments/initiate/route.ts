import { NextRequest, NextResponse } from "next/server";
import https from "https";
import { readFileSync } from "fs";

/**
 * POST /api/payments/initiate
 * Initializes a Paystack transaction and returns the access_code
 * for the inline popup, plus the reference for verification.
 *
 * Body: { amount: number (in GH₵), email: string, metadata?: object }
 */

function paystackRequest(secretKey: string, body: object): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const postData = JSON.stringify(body);
      const options = {
        hostname: "api.paystack.co",
        port: 443,
        path: "/transaction/initialize",
        method: "POST",
        rejectUnauthorized: false,
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
          "Connection": "close"
        },
        timeout: 20000 // 20 second timeout
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk: string) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error("Invalid JSON response from Paystack"));
          }
        });
      });

      req.on("error", (e) => {
        console.error("HTTPS Request Error:", e);
        reject(e);
      });
      
      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request to Paystack timed out"));
      });

      req.write(postData);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const { amount, email, metadata } = await request.json();

    if (!amount || !email) {
      return NextResponse.json(
        { error: "amount and email are required" },
        { status: 400 }
      );
    }

    let secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();
    
    // Cache-bypass: Read directly from .env file to avoid stale process.env
    try {
      const envContent = readFileSync(".env", "utf8");
      const match = envContent.match(/^PAYSTACK_SECRET_KEY=(.+)$/m);
      if (match) secretKey = match[1].trim();
    } catch (e) {
      console.warn("Direct .env read failed, using process.env");
    }

    if (!secretKey) {
      console.error("PAYSTACK_SECRET_KEY not found in process.env or .env file");
      return NextResponse.json(
        { error: "Payment service is not configured" },
        { status: 500 }
      );
    }
    
    console.log("DEBUG: FINAL_KEY_LENGTH:", secretKey.length);

    // Paystack expects amount in the smallest currency unit (pesewas)
    const amountInPesewas = Math.round(amount * 100);

    console.log("DEBUG: Final Payload:", { amount: amountInPesewas, email: email.trim().toLowerCase() });

    const paystackData = await paystackRequest(secretKey, {
      amount: Math.floor(amountInPesewas),
      email: email.trim().toLowerCase(),
      currency: "GHS",
      metadata: metadata || {},
    });

    if (!paystackData.status) {
      console.error("Paystack init failed:", paystackData);
      return NextResponse.json(
        { 
          error: paystackData.message || "Failed to initialize payment",
          details: paystackData
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      reference: paystackData.data.reference,
      publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim()
    });
  } catch (error: any) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        message: error?.message
      },
      { status: 500 }
    );
  }
}
