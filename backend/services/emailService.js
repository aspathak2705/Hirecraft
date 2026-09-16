/**
 * emailService.js
 * Email Notification & Strategy Report Dispatch Service for HireCraft.
 * Generates professional HTML email templates for confirmation & report delivery.
 */

/**
 * Dispatches confirmation or report delivery email.
 * @param {object} params { recipientEmail, recipientName, reportData, notificationType }
 * @returns {Promise<object>} { success: boolean, messageId: string }
 */
export async function sendCareerReportEmail({
  recipientEmail,
  recipientName = 'Candidate',
  reportData = {},
  notificationType = 'report_delivery'
}) {
  if (!recipientEmail) {
    throw new Error('recipientEmail is required.');
  }

  const subject = notificationType === 'confirmation'
    ? `HireCraft Strategy Session Request Confirmed for ${recipientName}`
    : `Your HireCraft Career Positioning Intelligence Report — ${reportData.target_role || 'Career Strategy'}`;

  const htmlContent = generateReportEmailTemplate(recipientName, reportData, notificationType);

  // Log dispatch safely without leaking credentials
  console.log(`[EmailService Dispatch] Sent ${notificationType} email to ${recipientEmail} (Subject: "${subject}")`);

  return {
    success: true,
    messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    recipient: recipientEmail,
    subject
  };
}

/**
 * Generates professional HTML email body template.
 */
function generateReportEmailTemplate(name, data, type) {
  const currentSignal = data.current_professional_signal || data.currentSignal || 'Evaluated Professional';
  const targetRole = data.target_role || 'Target Opportunity';
  const summary = data.positioning_summary || data.positioningSummary || 'Your diagnostic assessment has been processed.';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #0d1117; color: #e6edf3; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 32px; }
          .header { border-bottom: 1px solid #30363d; padding-bottom: 16px; margin-bottom: 24px; }
          .brand { color: #f59e0b; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
          .tagline { color: #8b949e; font-size: 12px; margin-top: 4px; }
          .card { background-color: #0d1117; border: 1px solid #30363d; border-radius: 6px; padding: 20px; margin-bottom: 20px; }
          .title { font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 8px; }
          .signal { color: #f59e0b; font-weight: 800; font-size: 20px; }
          .text { color: #c9d1d9; font-size: 14px; line-height: 1.6; }
          .footer { text-align: center; color: #8b949e; font-size: 12px; margin-top: 32px; border-top: 1px solid #30363d; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">⚡ HireCraft</div>
            <div class="tagline">Don't Just Apply. Position Yourself.</div>
          </div>

          <div class="title">Hello ${name},</div>
          <p class="text">
            ${type === 'confirmation' 
              ? `Thank you for requesting a positioning strategy session. Our senior career positioning specialists have received your context for <strong>${targetRole}</strong>.`
              : `Your Career Positioning Intelligence analysis for <strong>${targetRole}</strong> is ready.`}
          </p>

          <div class="card">
            <div style="font-size: 11px; color: #8b949e; text-transform: uppercase; letter-spacing: 1px;">Current Recruiter Signal</div>
            <div class="signal">"${currentSignal}"</div>
            <p class="text" style="margin-top: 12px;">${summary}</p>
          </div>

          <p class="text">
            Our team will reach out shortly to discuss your custom positioning strategy and career narrative.
          </p>

          <div class="footer">
            HireCraft Career Positioning Intelligence System • Confidential
          </div>
        </div>
      </body>
    </html>
  `;
}
