import os
import smtplib
from email.message import EmailMessage


SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
EMAIL_FROM = os.getenv(
    "EMAIL_FROM",
    SMTP_USERNAME,
)


def send_email(
    recipient: str,
    subject: str,
    html_content: str,
) -> None:
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        raise RuntimeError(
            "Email service is not configured"
        )

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = EMAIL_FROM
    message["To"] = recipient

    message.set_content(
        "Open this email in an HTML-compatible email client."
    )

    message.add_alternative(
        html_content,
        subtype="html",
    )

    with smtplib.SMTP_SSL(
        SMTP_HOST,
        SMTP_PORT,
        timeout=20,
    ) as smtp:
        smtp.login(
            SMTP_USERNAME,
            SMTP_PASSWORD,
        )
        smtp.send_message(message)