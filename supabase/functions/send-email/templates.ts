
/**
 * Email template utilities for creating clean HTML emails
 */

/**
 * Creates a professional HTML email with the provided content
 * Optimized for deliverability with proper HTML structure and spam-avoiding techniques
 */
export function createEmailTemplate(content: string, recipientName: string, senderEmail: string): string {
  // Ensure we have some content
  if (!content || content.trim() === '') {
    content = '<p>This email was sent with no content.</p>';
  }
  
  // Create a properly structured HTML email with deliverability best practices
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style>
    table {border-collapse: collapse;}
    td,th,div,p,a {font-family: Arial, sans-serif; line-height: normal;}
  </style>
  <![endif]-->
  <title>Message from Master Business Agent</title>
  <style>
    @media screen and (max-width: 640px) {
      .container {
        width: 100%!important;
      }
    }
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #2d2d2d!important;
        color: #ffffff!important;
      }
      .email-content {
        background-color: #333333!important;
        color: #f1f1f1!important;
      }
      a {
        color: #88b3fa!important;
      }
      .footer {
        color: #999999!important;
        border-color: #4d4d4d!important;
      }
    }
  </style>
</head>
<body style="margin:0;padding:0;word-spacing:normal;background-color:#f5f5f5;">
  <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
    <table role="presentation" style="width:100%;border:none;border-spacing:0;">
      <tr>
        <td align="center" style="padding:24px 0;">
          <table role="presentation" class="container" style="width:600px;border:none;border-spacing:0;text-align:left;font-family:Arial,sans-serif;background-color:#ffffff;box-shadow:0 3px 6px rgba(0,0,0,0.1);border-radius:8px;">
            <tr>
              <td style="padding:30px 30px 20px 30px;text-align:left;">
                <div class="email-content" style="font-family:Arial,sans-serif;line-height:1.5;color:#333333;">
                  ${content}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:15px 30px 30px 30px;">
                <table role="presentation" style="width:100%;border-top:1px solid #dddddd;">
                  <tr>
                    <td style="padding-top:20px;font-size:13px;line-height:1.4;color:#777777;" class="footer">
                      <p style="margin:0;">This email was sent via Master Business Agent</p>
                      <p style="margin:8px 0 0 0;">For any questions, please reply directly to this email at <a href="mailto:${senderEmail}" style="color:#2563eb;text-decoration:none;">${senderEmail}</a></p>
                      <p style="margin:12px 0 0 0;font-size:11px;line-height:1.3;">Please note this is a sent email, not an automated email. If you believe this was sent to you by mistake, simply reply to this email.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}
