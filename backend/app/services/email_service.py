"""
Finlytics AI - Email Service (SendGrid)

Triggered by real business events - never sends fake/test emails.
Gracefully degrades to console logging when SENDGRID_API_KEY is not set.

Trigger Points:
  1. Welcome Email          -> when admin creates a new client account
  2. Report Ready           -> when admin approves a monthly report
  3. Password Reset         -> /auth/forgot-password
  4. Cash Flow Alert        -> when cash runway < 3 months (analytics)
  5. Billing Reminder       -> 7 days before subscription renewal
"""

import logging
from app.config import settings

logger = logging.getLogger(__name__)


def _base_template(title: str, body_html: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><title>{title}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:28px 40px;">
            <span style="font-size:20px;font-weight:800;color:#ffffff;">Finlytics <span style="color:#ff6b00;">AI</span></span>
          </td>
        </tr>
        <tr><td style="padding:36px 40px 28px 40px;">{body_html}</td></tr>
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">
              This email was sent by Finlytics AI &middot; If sent in error, contact <a href="mailto:support@finlytics.ai" style="color:#ff6b00;">support@finlytics.ai</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>"""


def _send(to_email: str, to_name: str, subject: str, html_content: str) -> bool:
    api_key = getattr(settings, "SENDGRID_API_KEY", "")
    from_email = getattr(settings, "SENDGRID_FROM_EMAIL", "")

    if not api_key:
        logger.info(
            f"[EMAIL SERVICE - SIMULATED LOG] SENDGRID_API_KEY not configured.\n"
            f"  To: {to_name} <{to_email}>\n"
            f"  Subject: {subject}\n"
            f"  Status: Email rendered successfully (set SENDGRID_API_KEY in backend/.env to send real emails)"
        )
        return True

    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail, Email, To, Content

        sg = SendGridAPIClient(api_key)
        from_sender = Email(from_email or "notifications@finlytics.ai", "Finlytics AI")
        to_recipient = To(to_email, to_name)
        content = Content("text/html", html_content)
        mail = Mail(from_sender, to_recipient, subject, content)

        response = sg.client.mail.send.post(request_body=mail.get())
        if response.status_code in (200, 201, 202):
            logger.info(f"[EMAIL SERVICE] Successfully sent '{subject}' to {to_email} (Status {response.status_code})")
            return True
        else:
            logger.warning(f"[EMAIL SERVICE] SendGrid returned status {response.status_code} for {to_email}")
            return False
    except Exception as e:
        logger.error(f"[EMAIL SERVICE] Error sending email to {to_email}: {e}")
        return False


# --- 1. WELCOME EMAIL -------------------------------------------
def send_welcome_email(
    to_email: str,
    client_name: str,
    company_name: str,
    temp_password: str,
    portal_url: str = "http://localhost:3000",
) -> bool:
    first = client_name.split()[0] if client_name else "Client"
    subject = f"Welcome to Finlytics AI - Your Account is Ready, {first}!"
    body = f"""
      <h2 style="margin:0 0 8px 0;font-size:24px;font-weight:800;color:#0f172a;">Welcome, {first}!</h2>
      <p style="margin:0 0 20px 0;font-size:14px;color:#475569;line-height:1.7;">
        Your Finlytics AI account has been set up for <strong>{company_name}</strong>.
        Use the credentials below to log in and access your verified financial reports and AI insights.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:20px 24px;margin-bottom:24px;">
        <p style="margin:0 0 8px 0;font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Login Credentials</p>
        <p style="margin:4px 0;font-size:13px;color:#64748b;">Email: <strong style="color:#0f172a;">{to_email}</strong></p>
        <p style="margin:4px 0;font-size:13px;color:#64748b;">Temporary Password: <strong style="color:#ff6b00;font-family:monospace;font-size:15px;letter-spacing:2px;">{temp_password}</strong></p>
      </div>
      <div style="text-align:center;margin-bottom:20px;">
        <a href="{portal_url}/login" style="display:inline-block;background:#ff6b00;color:#ffffff;
           font-size:14px;font-weight:700;padding:14px 36px;border-radius:12px;text-decoration:none;">
          Access Your Dashboard &rarr;
        </a>
      </div>
      <div style="background:#fff5ed;border:1px solid #fed7aa;border-radius:12px;padding:14px 18px;">
        <p style="margin:0;font-size:13px;color:#92400e;">
          Notice: You will be prompted to set a new password on first login.
        </p>
      </div>
    """
    return _send(to_email, client_name, subject, _base_template(subject, body))


# --- 2. REPORT READY EMAIL --------------------------------------
def send_report_ready_email(
    to_email: str,
    client_name: str,
    company_name: str,
    report_month: str,
    report_year: int,
    report_url: str,
    revenue: str = "",
    net_profit: str = "",
) -> bool:
    subject = f"Your {report_month} {report_year} Financial Report is Ready - {company_name}"
    first = client_name.split()[0] if client_name else "Client"
    metrics = ""
    if revenue or net_profit:
        metrics = f"""
        <table width="100%" cellpadding="0" cellspacing="8" style="margin-bottom:24px;">
          <tr>
            <td width="48%" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;
                padding:14px;text-align:center;">
              <div style="font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;">Revenue</div>
              <div style="font-size:20px;font-weight:800;color:#15803d;">{revenue}</div>
            </td>
            <td width="4%"></td>
            <td width="48%" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;
                padding:14px;text-align:center;">
              <div style="font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;">Net Profit</div>
              <div style="font-size:20px;font-weight:800;color:#35577D;">{net_profit}</div>
            </td>
          </tr>
        </table>"""

    body = f"""
      <div style="display:inline-block;background:#dcfce7;color:#15803d;padding:6px 14px;
           border-radius:999px;font-size:12px;font-weight:700;margin-bottom:16px;">
        Verified - Reviewed &amp; Approved by Finlytics AI Team
      </div>
      <h2 style="margin:0 0 8px 0;font-size:22px;font-weight:800;color:#0f172a;">
        {report_month} {report_year} Financial Report Ready
      </h2>
      <p style="margin:0 0 20px 0;font-size:14px;color:#475569;line-height:1.7;">
        Hi {first}, your verified monthly report for <strong>{company_name}</strong>
        has been reviewed and is now available in your dashboard.
      </p>
      {metrics}
      <div style="text-align:center;margin-bottom:20px;">
        <a href="{report_url}" style="display:inline-block;background:#35577D;color:#ffffff;
           font-size:14px;font-weight:700;padding:14px 36px;border-radius:12px;text-decoration:none;">
          View Full Report &rarr;
        </a>
      </div>
      <p style="font-size:12px;color:#94a3b8;margin:0;">
        Includes P&amp;L statement, cash flow analysis, expense breakdown, and AI growth recommendations.
      </p>
    """
    return _send(to_email, client_name, subject, _base_template(subject, body))


# --- 3. PASSWORD RESET EMAIL ------------------------------------
def send_password_reset_email(
    to_email: str,
    client_name: str,
    reset_token: str,
    portal_url: str = "http://localhost:3000",
) -> bool:
    reset_url = f"{portal_url}/reset-password?token={reset_token}"
    subject = "Reset Your Finlytics AI Password"
    first = client_name.split()[0] if client_name else "there"
    body = f"""
      <h2 style="margin:0 0 8px 0;font-size:24px;font-weight:800;color:#0f172a;">Password Reset Request</h2>
      <p style="margin:0 0 20px 0;font-size:14px;color:#475569;line-height:1.7;">
        Hi {first}, we received a request to reset your Finlytics AI password.
        Click below to set a new one. This link expires in <strong>1 hour</strong>.
      </p>
      <div style="text-align:center;margin-bottom:20px;">
        <a href="{reset_url}" style="display:inline-block;background:#ff6b00;color:#ffffff;
           font-size:14px;font-weight:700;padding:14px 36px;border-radius:12px;text-decoration:none;">
          Reset My Password &rarr;
        </a>
      </div>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:14px 18px;">
        <p style="margin:0;font-size:13px;color:#7f1d1d;">
          Notice: If you did not request this, ignore this email. Your account remains secure.
        </p>
      </div>
    """
    return _send(to_email, client_name or "User", subject, _base_template(subject, body))


# --- 4. CASH FLOW ALERT EMAIL -----------------------------------
def send_cash_flow_alert_email(
    to_email: str,
    client_name: str,
    company_name: str,
    cash_balance: str,
    estimated_runway_months: float,
    dashboard_url: str = "http://localhost:3000/dashboard",
) -> bool:
    subject = f"Cash Flow Alert - {company_name}"
    first = client_name.split()[0] if client_name else "there"
    body = f"""
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
        <h3 style="margin:0 0 4px 0;font-size:16px;font-weight:800;color:#b91c1c;">Cash Runway Warning</h3>
        <p style="margin:0;font-size:13px;color:#7f1d1d;">Estimated runway is below the 3-month safe threshold.</p>
      </div>
      <h2 style="margin:0 0 8px 0;font-size:22px;font-weight:800;color:#0f172a;">Action Required</h2>
      <p style="margin:0 0 20px 0;font-size:14px;color:#475569;line-height:1.7;">
        Hi {first}, your current cash balance of <strong>{cash_balance}</strong> represents
        approximately <strong>{estimated_runway_months:.1f} months</strong> of runway -
        below the recommended 3-month buffer.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0 0 8px 0;font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Recommended Actions</p>
        <ul style="margin:0;padding-left:18px;font-size:13px;color:#334155;line-height:1.8;">
          <li>Review outstanding receivables and follow up on overdue invoices</li>
          <li>Defer non-essential discretionary expenditures</li>
          <li>Ask your Finlytics AI advisor for cash flow improvement strategies</li>
        </ul>
      </div>
      <div style="text-align:center;">
        <a href="{dashboard_url}" style="display:inline-block;background:#0f172a;color:#ffffff;
           font-size:14px;font-weight:700;padding:14px 36px;border-radius:12px;text-decoration:none;">
          Open Cash Flow Dashboard &rarr;
        </a>
      </div>
    """
    return _send(to_email, client_name, subject, _base_template(subject, body))


# --- 5. BILLING REMINDER EMAIL ----------------------------------
def send_billing_reminder_email(
    to_email: str,
    client_name: str,
    company_name: str,
    plan_name: str,
    plan_price: str,
    renewal_date: str,
    billing_url: str = "http://localhost:3000/dashboard/settings",
) -> bool:
    subject = f"Your Finlytics AI Subscription Renews in 7 Days - {company_name}"
    first = client_name.split()[0] if client_name else "there"
    body = f"""
      <h2 style="margin:0 0 8px 0;font-size:24px;font-weight:800;color:#0f172a;">Subscription Renewal Reminder</h2>
      <p style="margin:0 0 20px 0;font-size:14px;color:#475569;line-height:1.7;">
        Hi {first}, your Finlytics AI subscription will automatically renew in <strong>7 days</strong>.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:20px 24px;margin-bottom:24px;">
        <table width="100%" cellpadding="6" cellspacing="0">
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="font-size:12px;color:#94a3b8;font-weight:600;">Plan</td>
            <td style="font-size:14px;font-weight:700;color:#0f172a;text-align:right;">{plan_name}</td>
          </tr>
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="font-size:12px;color:#94a3b8;font-weight:600;">Amount</td>
            <td style="font-size:18px;font-weight:800;color:#ff6b00;text-align:right;">{plan_price}</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:#94a3b8;font-weight:600;">Renewal Date</td>
            <td style="font-size:14px;font-weight:700;color:#0f172a;text-align:right;">{renewal_date}</td>
          </tr>
        </table>
      </div>
      <div style="text-align:center;">
        <a href="{billing_url}" style="display:inline-block;background:#ff6b00;color:#ffffff;
           font-size:14px;font-weight:700;padding:14px 36px;border-radius:12px;text-decoration:none;">
          Manage Subscription &rarr;
        </a>
      </div>
    """
    return _send(to_email, client_name, subject, _base_template(subject, body))


# --- 6. NEW REPORT GENERATED - TEAM NOTIFICATION ----------------
def send_new_report_team_notification(
    to_email: str = "advisory@finlytics.ai",
    client_name: str = "Client",
    company_name: str = "Company",
    report_month: str = "Current",
    report_year: str = "2026",
    report_id: str = "",
    review_url: str = "http://localhost:3000/admin/review",
) -> bool:
    subject = f"[Review Required] New Report Draft Generated: {company_name} ({report_month} {report_year})"
    body = f"""
      <div style="background:#fff5ed;border:1px solid #fed7aa;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
        <h3 style="margin:0 0 4px 0;font-size:16px;font-weight:800;color:#ea580c;">New AI Report in Review Queue</h3>
        <p style="margin:0;font-size:13px;color:#9a3412;">An AI financial analysis report has been generated and is awaiting advisor verification.</p>
      </div>
      <h2 style="margin:0 0 8px 0;font-size:22px;font-weight:800;color:#0f172a;">Review Gatekeeper Alert</h2>
      <p style="margin:0 0 16px 0;font-size:14px;color:#475569;line-height:1.7;">
        A monthly financial draft for <strong>{company_name}</strong> ({client_name}) is ready for review.
        The client will NOT see this report until an advisor explicitly approves it.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:4px 0;font-size:13px;color:#64748b;">Period: <strong style="color:#0f172a;">{report_month} {report_year}</strong></p>
        <p style="margin:4px 0;font-size:13px;color:#64748b;">Report ID: <code style="color:#ff6b00;">{report_id}</code></p>
      </div>
      <div style="text-align:center;">
        <a href="{review_url}/{report_id}" style="display:inline-block;background:#ff6b00;color:#ffffff;
           font-size:14px;font-weight:700;padding:14px 36px;border-radius:12px;text-decoration:none;">
          Open Report Editor &rarr;
        </a>
      </div>
    """
    return _send(to_email, "Finlytics Advisory Team", subject, _base_template(subject, body))


# --- 7. DOCUMENT PROCESSING FAILED - TEAM NOTIFICATION ----------
def send_document_processing_failed_team_email(
    to_email: str = "advisory@finlytics.ai",
    client_name: str = "Client",
    company_name: str = "Company",
    filename: str = "document.pdf",
    error_message: str = "Extraction failed",
    tracker_url: str = "http://localhost:3000/admin/documents",
) -> bool:
    subject = f"[Error Alert] Document Processing Failed: {filename} ({company_name})"
    body = f"""
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
        <h3 style="margin:0 0 4px 0;font-size:16px;font-weight:800;color:#dc2626;">Document Extraction Error</h3>
        <p style="margin:0;font-size:13px;color:#991b1b;">An error occurred while parsing and categorizing an uploaded financial document.</p>
      </div>
      <h2 style="margin:0 0 8px 0;font-size:22px;font-weight:800;color:#0f172a;">Action Required</h2>
      <p style="margin:0 0 16px 0;font-size:14px;color:#475569;line-height:1.7;">
        Document <strong>{filename}</strong> uploaded for <strong>{company_name}</strong> ({client_name}) failed automated processing.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:4px 0;font-size:13px;color:#64748b;">Error Message: <strong style="color:#ef4444;">{error_message}</strong></p>
      </div>
      <div style="text-align:center;">
        <a href="{tracker_url}" style="display:inline-block;background:#0f172a;color:#ffffff;
           font-size:14px;font-weight:700;padding:14px 36px;border-radius:12px;text-decoration:none;">
          View Document Tracker &rarr;
        </a>
      </div>
    """
    return _send(to_email, "Finlytics Advisory Team", subject, _base_template(subject, body))

