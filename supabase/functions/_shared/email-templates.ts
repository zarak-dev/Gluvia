/**
 * Gluvia Shared Email Templates
 * Responsive, client-compatible HTML email templates with consistent Gluvia medical branding.
 */

export interface PasswordResetEmailOptions {
  resetUrl: string;
  username?: string | null;
  appUrl?: string;
}

export interface WeeklyReportStats {
  readingsCount: number;
  average: number;
  lowest: number;
  highest: number;
  inRangePct: number;
  fastingCount: number;
  fastingAvg: number | null;
  beforeMealCount: number;
  beforeMealAvg: number | null;
  afterMealCount: number;
  afterMealAvg: number | null;
  bedtimeCount: number;
  bedtimeAvg: number | null;
}

export interface WeeklyReportEmailOptions {
  username?: string | null;
  periodStart: string;
  periodEnd: string;
  stats: WeeklyReportStats;
  appUrl?: string;
}

const BRAND_COLOR = "#20B486";
const DARK_COLOR = "#1A202C";
const MUTED_COLOR = "#718096";
const BORDER_COLOR = "#E2E8F0";
const CARD_BG = "#FFFFFF";
const BODY_BG = "#F7FBFC";

/**
 * Renders the Gluvia Password Reset Email.
 */
export function renderPasswordResetEmail(options: PasswordResetEmailOptions): string {
  const greeting = options.username ? `Salam, ${options.username}` : "Salam & Welcome";
  let portalUrl = options.appUrl || "https://www.gluvia.world";
  if (portalUrl === "https://gluvia.world" || portalUrl === "http://gluvia.world") {
    portalUrl = "https://www.gluvia.world";
  }

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your Gluvia password</title>
  <style>
    body { margin: 0; padding: 0; background-color: ${BODY_BG}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    table { border-collapse: collapse; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; padding: 12px !important; }
      .email-card { padding: 24px 18px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BODY_BG}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${BODY_BG};">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 540px;">
          
          <!-- Header / Brand -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="cid:gluvia-logo" width="48" height="48" alt="Gluvia Logo" style="display: block; width: 48px; height: 48px; border-radius: 12px; border: 0; outline: none; margin: 0 auto; box-shadow: 0 4px 12px rgba(32, 180, 134, 0.25);" />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <span style="font-size: 24px; font-weight: 700; color: ${DARK_COLOR}; letter-spacing: -0.5px;">Gluvia</span>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <span style="font-size: 11px; font-weight: 500; color: ${MUTED_COLOR}; text-transform: uppercase; letter-spacing: 0.5px;">South Asian Diabetes Management</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td class="email-card" style="background-color: ${CARD_BG}; border: 1px solid ${BORDER_COLOR}; border-radius: 16px; padding: 36px 32px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <h1 style="margin: 0 0 12px; font-size: 20px; font-weight: 700; color: ${DARK_COLOR}; line-height: 1.3;">
                      ${greeting}
                    </h1>
                    <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #4A5568;">
                      You requested a password reset for your Gluvia account. Click the button below to choose a new secure password.
                    </p>
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td align="center" style="padding: 12px 0 28px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="border-radius: 10px; background-color: ${BRAND_COLOR};">
                          <a href="${options.resetUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 10px; background-color: ${BRAND_COLOR}; box-shadow: 0 4px 14px rgba(32, 180, 134, 0.35);">
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Security Note -->
                <tr>
                  <td style="border-top: 1px solid ${BORDER_COLOR}; padding-top: 20px;">
                    <p style="margin: 0 0 12px; font-size: 12px; line-height: 1.6; color: ${MUTED_COLOR};">
                      <strong>Security Note:</strong> If you didn&apos;t request a password reset, you can safely ignore this email. Your password will remain unchanged and your account is completely safe.
                    </p>
                    <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #A0AEC0; word-break: break-all;">
                      Button not working? Copy and paste this URL into your browser:<br>
                      <a href="${options.resetUrl}" style="color: ${BRAND_COLOR}; text-decoration: underline;">${options.resetUrl}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 24px;">
              <p style="margin: 0 0 6px; font-size: 11px; color: ${MUTED_COLOR};">
                A Project of Zarak K.
              </p>
              <p style="margin: 0; font-size: 11px; color: #A0AEC0;">
                <a href="${portalUrl}" style="color: ${MUTED_COLOR}; text-decoration: underline;">Visit Dashboard</a>
              </p>
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
 * Renders the Gluvia Weekly Health Report Email.
 */
export function renderWeeklyReportEmail(options: WeeklyReportEmailOptions): string {
  const greeting = options.username ? `Salam, ${options.username}` : "Salam";
  const { stats } = options;
  let portalUrl = options.appUrl || "https://www.gluvia.world";
  if (portalUrl === "https://gluvia.world" || portalUrl === "http://gluvia.world") {
    portalUrl = "https://www.gluvia.world";
  }

  const hasData = stats.readingsCount > 0;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Gluvia weekly health report</title>
  <style>
    body { margin: 0; padding: 0; background-color: ${BODY_BG}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    table { border-collapse: collapse; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; padding: 12px !important; }
      .email-card { padding: 24px 18px !important; }
      .stat-cell { display: block !important; width: 100% !important; margin-bottom: 12px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BODY_BG}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${BODY_BG};">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 560px;">
          
          <!-- Header / Brand -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="cid:gluvia-logo" width="48" height="48" alt="Gluvia Logo" style="display: block; width: 48px; height: 48px; border-radius: 12px; border: 0; outline: none; margin: 0 auto; box-shadow: 0 4px 12px rgba(32, 180, 134, 0.25);" />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <span style="font-size: 24px; font-weight: 700; color: ${DARK_COLOR}; letter-spacing: -0.5px;">Gluvia</span>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <span style="font-size: 11px; font-weight: 500; color: ${MUTED_COLOR}; text-transform: uppercase; letter-spacing: 0.5px;">Weekly Glycemic Summary</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td class="email-card" style="background-color: ${CARD_BG}; border: 1px solid ${BORDER_COLOR}; border-radius: 16px; padding: 36px 32px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                
                <!-- Report Header -->
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: rgba(32, 180, 134, 0.1); color: ${BRAND_COLOR}; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                      7-Day Clinical Snapshot
                    </div>
                    <h1 style="margin: 0 0 6px; font-size: 20px; font-weight: 700; color: ${DARK_COLOR}; line-height: 1.3;">
                      ${greeting}
                    </h1>
                    <p style="margin: 0 0 20px; font-size: 13px; color: ${MUTED_COLOR};">
                      Reporting Period: <strong>${options.periodStart}</strong> — <strong>${options.periodEnd}</strong>
                    </p>
                  </td>
                </tr>

                ${
                  hasData
                    ? `
                <!-- Week at a Glance Banner -->
                <tr>
                  <td style="padding-bottom: 20px;">
                    <div style="background-color: #F8FAFC; border: 1px solid ${BORDER_COLOR}; border-radius: 12px; padding: 18px;">
                      <div style="font-size: 11px; font-weight: 700; color: ${MUTED_COLOR}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                        Your Week at a Glance
                      </div>
                      
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td width="50%" style="padding-bottom: 14px;">
                            <span style="font-size: 11px; color: ${MUTED_COLOR}; display: block;">Readings Logged</span>
                            <span style="font-size: 22px; font-weight: 700; color: ${DARK_COLOR};">${stats.readingsCount}</span>
                          </td>
                          <td width="50%" style="padding-bottom: 14px;">
                            <span style="font-size: 11px; color: ${MUTED_COLOR}; display: block;">7-Day Average</span>
                            <span style="font-size: 22px; font-weight: 700; color: ${BRAND_COLOR};">${stats.average} <span style="font-size: 12px; font-weight: 500; color: ${MUTED_COLOR};">mg/dL</span></span>
                          </td>
                        </tr>
                        <tr>
                          <td width="50%">
                            <span style="font-size: 11px; color: ${MUTED_COLOR}; display: block;">Target In-Range (70-139)</span>
                            <span style="font-size: 18px; font-weight: 700; color: ${DARK_COLOR};">${stats.inRangePct}%</span>
                          </td>
                          <td width="50%">
                            <span style="font-size: 11px; color: ${MUTED_COLOR}; display: block;">Range (Low — High)</span>
                            <span style="font-size: 16px; font-weight: 600; color: ${DARK_COLOR};">${stats.lowest} — ${stats.highest} <span style="font-size: 11px; font-weight: normal; color: ${MUTED_COLOR};">mg/dL</span></span>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>

                <!-- Meal Breakdown (If Data Exists) -->
                <tr>
                  <td style="padding-bottom: 24px;">
                    <div style="font-size: 12px; font-weight: 700; color: ${DARK_COLOR}; margin-bottom: 10px;">
                      Readings by Category
                    </div>
                    <table role="presentation" border="0" cellpadding="8" cellspacing="0" width="100%" style="font-size: 12px; border: 1px solid ${BORDER_COLOR}; border-radius: 8px;">
                      <tr style="background-color: #F8FAFC; border-bottom: 1px solid ${BORDER_COLOR};">
                        <td align="left" style="font-weight: 600; color: ${DARK_COLOR};">Category</td>
                        <td align="center" style="font-weight: 600; color: ${DARK_COLOR};">Entries</td>
                        <td align="right" style="font-weight: 600; color: ${DARK_COLOR};">Average</td>
                      </tr>
                      ${
                        stats.fastingCount > 0
                          ? `<tr style="border-bottom: 1px solid ${BORDER_COLOR};">
                              <td>Fasting</td>
                              <td align="center">${stats.fastingCount}</td>
                              <td align="right" style="font-weight: 600;">${stats.fastingAvg} mg/dL</td>
                            </tr>`
                          : ""
                      }
                      ${
                        stats.beforeMealCount > 0
                          ? `<tr style="border-bottom: 1px solid ${BORDER_COLOR};">
                              <td>Before Meal</td>
                              <td align="center">${stats.beforeMealCount}</td>
                              <td align="right" style="font-weight: 600;">${stats.beforeMealAvg} mg/dL</td>
                            </tr>`
                          : ""
                      }
                      ${
                        stats.afterMealCount > 0
                          ? `<tr style="border-bottom: 1px solid ${BORDER_COLOR};">
                              <td>After Meal</td>
                              <td align="center">${stats.afterMealCount}</td>
                              <td align="right" style="font-weight: 600;">${stats.afterMealAvg} mg/dL</td>
                            </tr>`
                          : ""
                      }
                      ${
                        stats.bedtimeCount > 0
                          ? `<tr>
                              <td>Bedtime</td>
                              <td align="center">${stats.bedtimeCount}</td>
                              <td align="right" style="font-weight: 600;">${stats.bedtimeAvg} mg/dL</td>
                            </tr>`
                          : ""
                      }
                    </table>
                  </td>
                </tr>
                `
                    : `
                <!-- Zero Readings State -->
                <tr>
                  <td style="padding: 16px 0 24px;">
                    <div style="background-color: #F8FAFC; border: 1px dashed ${BORDER_COLOR}; border-radius: 12px; padding: 24px; text-align: center;">
                      <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: ${DARK_COLOR};">
                        No sugar readings logged this week
                      </p>
                      <p style="margin: 0; font-size: 12px; color: ${MUTED_COLOR}; line-height: 1.5;">
                        Consistently tracking your fasting and post-meal glucose values allows Gluvia to provide personalized South Asian nutrition insights and clinical trend charts.
                      </p>
                    </div>
                  </td>
                </tr>
                `
                }

                <!-- CTA Button -->
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="border-radius: 10px; background-color: ${BRAND_COLOR};">
                          <a href="${portalUrl}/dashboard" target="_blank" style="display: inline-block; padding: 13px 28px; font-size: 13px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 10px; background-color: ${BRAND_COLOR};">
                            Open Gluvia Dashboard
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Medical Disclaimer -->
                <tr>
                  <td style="border-top: 1px solid ${BORDER_COLOR}; padding-top: 18px;">
                    <p style="margin: 0 0 10px; font-size: 11px; line-height: 1.6; color: ${MUTED_COLOR};">
                      <strong>Medical Notice:</strong> This weekly report is an automated summary of your self-recorded glucose readings and is provided for informational and lifestyle tracking purposes only. It is not a clinical diagnosis or treatment prescription. Always consult your doctor or endocrinologist before making any changes to medication or medical treatment.
                    </p>
                    <p style="margin: 0; font-size: 10.5px; line-height: 1.5; color: #A0AEC0;">
                      You are receiving this summary because weekly health reports are enabled in your Gluvia profile. You can toggle this feature anytime from <a href="${portalUrl}/profile" style="color: ${MUTED_COLOR}; text-decoration: underline;">Notification Settings</a>.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 24px;">
              <p style="margin: 0 0 6px; font-size: 11px; color: ${MUTED_COLOR};">
                A Project of Zarak K.
              </p>
              <p style="margin: 0; font-size: 11px; color: #A0AEC0;">
                <a href="${portalUrl}" style="color: ${MUTED_COLOR}; text-decoration: underline;">Visit Dashboard</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
