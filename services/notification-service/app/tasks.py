from .scheduler import celery

from .email_sender import (
    send_email
)

from .sms_sender import (
    send_sms
)


# ---------------------------------
# Email Task
# ---------------------------------

@celery.task
def send_email_task(
    to_email,
    subject,
    content
):

    return send_email(
        to_email,
        subject,
        content
    )


# ---------------------------------
# SMS Task
# ---------------------------------

@celery.task
def send_sms_task(
    to_phone,
    message
):

    return send_sms(
        to_phone,
        message
    )


# ---------------------------------
# Evening Reminder
# ---------------------------------

@celery.task
def evening_reminder_task():

    print(
        "🌙 Evening Reminder Triggered"
    )

    return {
        "message": "Evening reminder executed"
    }


# ---------------------------------
# Monthly Report
# ---------------------------------

@celery.task
def monthly_report_task():

    print(
        "📊 Monthly Report Triggered"
    )

    return {
        "message": "Monthly report executed"
    }