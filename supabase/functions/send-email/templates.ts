
/**
 * Email template utilities for creating professional HTML emails
 */

/**
 * Creates a professional HTML email template with the provided content
 */
export function createEmailTemplate(content: string, recipientName: string, senderEmail: string): string {
  // Ensure we have some content
  if (!content || content.trim() === '') {
    content = '<p>This email was sent with no content.</p>';
  }
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
    }
    .email-container {
      padding: 20px;
      border: 1px solid #eee;
      border-radius: 8px;
    }
    .email-content {
      padding: 20px 0;
    }
    .email-footer {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 14px;
      color: #777;
    }
    a {
      color: #2563eb;
      text-decoration: none;
    }
    p {
      margin: 1em 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-content">
      ${content}
    </div>
    <div class="email-footer">
      <p>This email was sent via Master Business Agent</p>
      <p>For any questions, please reply directly to this email at <a href="mailto:${senderEmail}">${senderEmail}</a></p>
    </div>
  </div>
</body>
</html>`;
}
