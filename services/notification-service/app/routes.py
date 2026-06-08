from fastapi import APIRouter
from pydantic import BaseModel

from .tasks import (
    send_email_task,
    send_sms_task,
    evening_reminder_task,
    monthly_report_task
)

router = APIRouter()


class EmailRequest(BaseModel):
    to_email: str
    subject: str
    content: str


class SMSRequest(BaseModel):
    to_phone: str
    message: str


# ---------------------------------
# Send Email
# ---------------------------------

@router.post("/email")
def send_email(data: EmailRequest):

    task = send_email_task.delay(
        data.to_email,
        data.subject,
        data.content
    )

    return {
        "success": True,
        "task_id": task.id
    }


# ---------------------------------
# Send SMS
# ---------------------------------

@router.post("/sms")
def send_sms(data: SMSRequest):

    task = send_sms_task.delay(
        data.to_phone,
        data.message
    )

    return {
        "success": True,
        "task_id": task.id
    }


# ---------------------------------
# Evening Reminder
# ---------------------------------

@router.post("/reminder")
def reminder():

    task = evening_reminder_task.delay()

    return {
        "success": True,
        "task_id": task.id
    }


# ---------------------------------
# Monthly Report
# ---------------------------------

@router.post("/monthly-report")
def monthly_report():

    task = monthly_report_task.delay()

    return {
        "success": True,
        "task_id": task.id
    }