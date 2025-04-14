
/**
 * Email template utilities for creating clean HTML emails
 */

/**
 * Creates a bare minimum HTML email with the provided content
 */
export function createEmailTemplate(content: string, recipientName: string, senderEmail: string): string {
  // Ensure we have some content
  if (!content || content.trim() === '') {
    content = '<p>This email was sent with no content.</p>';
  }
  
  // Create an extremely simple HTML structure with inline styles
  return `<html>
<head>
<meta charset="utf-8">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0; padding: 20px; color: #333;">
<div style="padding: 20px 0;">
${content}
</div>
<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #777;">
<p>This email was sent via Master Business Agent</p>
<p>For any questions, please reply directly to this email at <a href="mailto:${senderEmail}" style="color: #2563eb; text-decoration: none;">${senderEmail}</a></p>
</div>
</body>
</html>`;
}
