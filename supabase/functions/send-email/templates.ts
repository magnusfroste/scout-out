
/**
 * Email template utilities for creating professional HTML emails
 */

/**
 * Creates a professional HTML email template with the provided content
 */
export function createEmailTemplate(content: string, senderName: string, senderEmail: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email from ${senderName}</title>
  <style>
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      line-height: 1.6;
      color: #333333;
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    .email-wrapper {
      width: 100%;
      max-width: 620px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .email-container {
      padding: 30px;
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    .email-content {
      padding-bottom: 20px;
    }
    .email-footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e8e8e8;
      font-size: 13px;
      color: #888888;
    }
    .email-signature {
      margin-top: 25px;
    }
    a {
      color: #2563eb;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    p {
      margin: 16px 0;
    }
    .header-image {
      width: 100%;
      max-height: 200px;
      object-fit: cover;
      border-radius: 4px 4px 0 0;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-content">
        ${content}
      </div>
      <div class="email-footer">
        <p>This email was sent by ${senderName} via Master Business Agent</p>
        <p>For any questions, please reply directly to this email at <a href="mailto:${senderEmail}">${senderEmail}</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
