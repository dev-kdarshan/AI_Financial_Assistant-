import os

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

from dotenv import load_dotenv

load_dotenv()


def send_email(
    to_email,
    subject,
    content
):

    message = Mail(

        from_email="darshankhute2215@gmail.com",

        to_emails=to_email,

        subject=subject,

        html_content=content
    )

    try:

        sg = SendGridAPIClient(
            os.getenv("SENDGRID_API_KEY")
        )

        response = sg.send(message)

        return {
            "success": True,
            "status_code": response.status_code
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }