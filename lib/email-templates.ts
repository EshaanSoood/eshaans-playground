/**
 * Email templates for blog posts and newsletters
 * Uses email-safe CSS with inline styles for maximum client compatibility
 */

const BLOG_URL = process.env.NEXT_PUBLIC_BLOG_URL || process.env.PUBLIC_MAIN_SITE_URL || 'https://dreamriver.eshaansood.in';

/**
 * Format a date string for display in emails
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Generate unsubscribe link for a subscriber
 * Links to the unsubscribe page at /unsubscribe with the email as a query parameter
 */
function getUnsubscribeLink(email: string): string {
  return `${BLOG_URL}/unsubscribe?email=${encodeURIComponent(email)}`;
}

/**
 * Email-safe CSS styles (inline styles will be applied to elements)
 * This is the base CSS that should be used in the email template
 */
const EMAIL_CSS = `
/* Client resets */
body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
img { -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; display:block; }
table { border-collapse:collapse !important; }
body { margin:0 !important; padding:0 !important; width:100% !important; }

/* Page background */
.email-body {
  background-color:#D9DAD5; /* --bg-main */
  margin:0;
  padding:0;
}

/* Outer wrapper padding */
.email-pad {
  padding:24px 12px;
}

/* Main container */
.container {
  width:100%;
  max-width:640px;
  margin:0 auto;
}

/* Card / section block */
.card {
  background-color:#F0F1ED; /* --bg-card */
  border:1px solid #C6CBC8; /* --border-light */
  border-radius:12px;
  padding:20px;
}

/* Typography */
.text {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size:14px;
  line-height:20px;
  color:#1F2A33; /* --text-main */
}

.muted {
  color:#4F6473; /* --text-secondary */
}

.meta {
  color:#7C93A3; /* --text-light */
  font-size:12px;
  line-height:18px;
}

/* Headings (email-safe: no custom font vars) */
.h1, .h2, .h3, .h4 {
  font-family: Georgia, "Times New Roman", serif;
  font-weight:700;
  color:#1F2A33;
  margin:0 0 10px 0;
}
.h1 { font-size:28px; line-height:34px; }
.h2 { font-size:22px; line-height:28px; }
.h3 { font-size:18px; line-height:24px; }
.h4 { font-size:14px; line-height:20px; }

/* Paragraph spacing */
.p { margin:0 0 10px 0; }

/* Links */
a {
  color:#094881; /* --blue-deep */
  text-decoration:underline;
}
a:hover { color:#597191; } /* harmless if unsupported */

/* Divider */
.hr {
  border-top:1px solid #C6CBC8;
  margin:16px 0;
  line-height:1px;
}

/* Quote / pull-quote */
.quote {
  border-left:5px solid #B7BDC0; /* --border-soft */
  padding:10px 16px;
  margin:12px 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size:16px;
  line-height:22px;
  color:#1F2A33;
  background-color:#E7E9E3; /* --bg-soft */
}

/* Button-like link (works best as <a> inside a table cell) */
.btn {
  display:inline-block;
  background-color:#C14A23; /* --orange-main */
  color:#FFFFFF !important;
  text-decoration:none;
  padding:10px 14px;
  border-radius:10px;
  font-weight:600;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* Small footer */
.footer {
  font-size:12px;
  line-height:18px;
  color:#4F6473;
}

/* Mobile tweaks */
@media screen and (max-width:480px) {
  .email-pad { padding:16px 10px; }
  .card { padding:16px; }
  .h1 { font-size:24px; line-height:30px; }
}
`;

/**
 * Generate email HTML wrapper with inline styles
 */
function generateEmailWrapper(content: string, options?: {
  title?: string;
  date?: string;
  unsubscribeEmail?: string;
  viewOnlineUrl?: string;
}): string {
  const { title, date, unsubscribeEmail, viewOnlineUrl } = options || {};
  
  const unsubscribeLink = unsubscribeEmail ? getUnsubscribeLink(unsubscribeEmail) : null;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
${EMAIL_CSS}
  </style>
</head>
<body class="email-body" style="background-color:#D9DAD5; margin:0; padding:0; width:100%; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#D9DAD5;">
    <tr>
      <td class="email-pad" style="padding:24px 12px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="container" style="width:100%; max-width:640px; margin:0 auto;">
          <tr>
            <td>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="card" style="background-color:#F0F1ED; border:1px solid #C6CBC8; border-radius:12px; padding:20px;">
                ${title || date ? `
                <tr>
                  <td style="padding-bottom:16px; border-bottom:1px solid #C6CBC8;">
                    ${title ? `<h1 class="h1" style="font-family:Georgia,'Times New Roman',serif; font-weight:700; font-size:28px; line-height:34px; color:#1F2A33; margin:0 0 10px 0;">${title}</h1>` : ''}
                    ${date ? `<p class="meta" style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:12px; line-height:18px; color:#7C93A3; margin:0;">${formatDate(date)}</p>` : ''}
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding-top:16px;">
                    ${content}
                  </td>
                </tr>
                ${viewOnlineUrl || unsubscribeLink ? `
                <tr>
                  <td style="padding-top:24px; border-top:1px solid #C6CBC8; margin-top:24px;">
                    ${viewOnlineUrl ? `<p class="footer" style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:12px; line-height:18px; color:#4F6473; margin:0 0 8px 0;"><a href="${viewOnlineUrl}" style="color:#094881; text-decoration:underline;">View online</a></p>` : ''}
                    ${unsubscribeLink ? `<p class="footer" style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:12px; line-height:18px; color:#4F6473; margin:0;"><a href="${unsubscribeLink}" style="color:#4F6473; text-decoration:underline;">Unsubscribe</a></p>` : ''}
                  </td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Generate HTML email for a blog post
 */
export function generateBlogPostEmail({
  title,
  date,
  contentHtml,
  slug,
  subscriberEmail,
}: {
  title: string;
  date: string;
  contentHtml: string;
  slug: string;
  subscriberEmail: string;
}): string {
  const viewOnlineUrl = `${BLOG_URL}/posts/${slug}`;
  
  return generateEmailWrapper(contentHtml, {
    title,
    date,
    unsubscribeEmail: subscriberEmail,
    viewOnlineUrl,
  });
}

/**
 * Generate HTML email for a newsletter
 */
export function generateNewsletterEmail({
  title,
  date,
  contentHtml,
  subscriberEmail,
  viewOnlineUrl,
}: {
  title: string;
  date: string;
  contentHtml: string;
  subscriberEmail: string;
  viewOnlineUrl?: string;
}): string {
  return generateEmailWrapper(contentHtml, {
    title,
    date,
    unsubscribeEmail: subscriberEmail,
    viewOnlineUrl,
  });
}

/**
 * Generate plain text version from HTML (simple strip)
 * For better results, consider using a proper HTML-to-text converter
 */
export function generatePlainTextFromHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}
