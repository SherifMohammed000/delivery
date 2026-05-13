/**
 * Utility to send email notifications via the server-side API route.
 */
export async function sendEmailNotification({
  templateId,
  templateParams,
}: {
  templateId: string;
  templateParams: Record<string, any>;
}) {
  try {
    // Validate recipient email
    const recipientEmail =
      templateParams?.to_email ||
      templateParams?.customer_email ||
      templateParams?.user_email ||
      templateParams?.email ||
      templateParams?.to;

    if (!recipientEmail || recipientEmail.trim() === "") {
      throw new Error("Recipient email is missing");
    }

    const payload = {
      templateId,
      templateParams: {
        ...templateParams,
        to_email: recipientEmail,
      },
    };

    console.log("Sending email payload:", payload);

    const response = await fetch("/api/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to send email notification");
    }

    return data;
  } catch (error: any) {
    console.error("sendEmailNotification error:", error.message);

    // Prevent app crash if email fails
    return {
      success: false,
      error: error.message,
    };
  }
}