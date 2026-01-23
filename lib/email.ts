import { ServerClient } from "postmark";

/**
 * Get Postmark client instance
 * Uses POSTMARK_SERVER_API_TOKEN from environment variables
 */
function getPostmarkClient(): ServerClient {
  const apiToken = process.env.POSTMARK_SERVER_API_TOKEN;
  
  if (!apiToken) {
    throw new Error("POSTMARK_SERVER_API_TOKEN environment variable is not set");
  }
  
  return new ServerClient(apiToken);
}

/**
 * Get the configured from email address
 * Defaults to newsletter@dreamriver.eshaansood.in
 */
export function getFromEmail(): string {
  return process.env.POSTMARK_FROM_EMAIL || "newsletter@dreamriver.eshaansood.in";
}

/**
 * Send an email via Postmark
 * 
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param htmlBody - HTML email body
 * @param textBody - Plain text email body (optional, will be generated from HTML if not provided)
 * @param replyTo - Reply-to email address (optional)
 * @returns Promise resolving to the email send result
 */
export async function sendEmail({
  to,
  subject,
  htmlBody,
  textBody,
  replyTo,
}: {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  replyTo?: string;
}) {
  const client = getPostmarkClient();
  const fromEmail = getFromEmail();
  
  try {
    const result = await client.sendEmail({
      From: fromEmail,
      To: to,
      Subject: subject,
      HtmlBody: htmlBody,
      TextBody: textBody,
      ReplyTo: replyTo || fromEmail,
      MessageStream: "outbound",
    });
    
    return {
      success: true,
      messageId: result.MessageID,
      submittedAt: result.SubmittedAt,
    };
  } catch (error) {
    console.error("Failed to send email via Postmark:", error);
    throw error;
  }
}

/**
 * Send a batch of emails via Postmark
 * Useful for sending newsletters to multiple subscribers
 * 
 * @param messages - Array of email messages to send
 * @returns Promise resolving to the batch send result
 */
export async function sendBatchEmails(
  messages: Array<{
    to: string;
    subject: string;
    htmlBody: string;
    textBody?: string;
  }>
) {
  const client = getPostmarkClient();
  const fromEmail = getFromEmail();
  
  const postmarkMessages = messages.map((msg) => ({
    From: fromEmail,
    To: msg.to,
    Subject: msg.subject,
    HtmlBody: msg.htmlBody,
    TextBody: msg.textBody,
    MessageStream: "outbound" as const,
  }));
  
  try {
    const result = await client.sendEmailBatch(postmarkMessages);
    
    return {
      success: true,
      submittedCount: result.length,
      messages: result.map((r) => ({
        messageId: r.MessageID,
        to: r.To,
        submittedAt: r.SubmittedAt,
        errorCode: r.ErrorCode,
        message: r.Message,
      })),
    };
  } catch (error) {
    console.error("Failed to send batch emails via Postmark:", error);
    throw error;
  }
}

/**
 * Send a welcome email to a new subscriber
 */
export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string;
  name?: string;
}) {
  const greeting = name ? `Hi ${name},` : "Hi there,";
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Welcome to the Newsletter!</h1>
        <p>${greeting}</p>
        <p>Thank you for subscribing to our newsletter. We're excited to have you on board!</p>
        <p>You'll receive updates about new blog posts, projects, and other interesting content.</p>
        <p>If you have any questions or feedback, feel free to reply to this email.</p>
        <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
          Best regards,<br>
          The Team
        </p>
      </body>
    </html>
  `;
  
  const textBody = `
${greeting}

Thank you for subscribing to our newsletter. We're excited to have you on board!

You'll receive updates about new blog posts, projects, and other interesting content.

If you have any questions or feedback, feel free to reply to this email.

Best regards,
The Team
  `.trim();
  
  return sendEmail({
    to,
    subject: "Welcome to the Newsletter!",
    htmlBody,
    textBody,
  });
}
