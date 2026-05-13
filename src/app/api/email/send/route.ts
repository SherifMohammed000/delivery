import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { templateId, templateParams } = await req.json();

    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    if (!serviceId || !publicKey || !privateKey) {
      console.error("Missing EmailJS credentials in environment variables");
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
    }

    const recipientEmail = templateParams?.to_email || templateParams?.customer_email || templateParams?.user_email;

    if (!recipientEmail || recipientEmail.trim() === "") {
      return NextResponse.json({ error: "Recipient email is missing" }, { status: 400 });
    }

    console.log(`Sending email via EmailJS: Template=${templateId} To=${recipientEmail}`);

    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: templateParams,
      }),
    });

    const result = await response.text();
    if (!response.ok) throw new Error(result || "Failed to send email");

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Email API error:", error);
    return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
  }
}