import os

from twilio.rest import Client

from dotenv import load_dotenv

load_dotenv()


def send_sms(
    to_phone,
    message
):

    try:

        client = Client(

            os.getenv(
                "TWILIO_ACCOUNT_SID"
            ),

            os.getenv(
                "TWILIO_AUTH_TOKEN"
            )
        )

        sms = client.messages.create(

            body=message,

            from_=os.getenv(
                "TWILIO_PHONE"
            ),

            to=to_phone
        )

        return {
            "success": True,
            "sid": sms.sid
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }