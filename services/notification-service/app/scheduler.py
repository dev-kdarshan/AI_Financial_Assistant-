from celery import Celery
import os
from dotenv import load_dotenv

load_dotenv()

celery = Celery(
    "notification_tasks",

    broker=os.getenv(
        "REDIS_URL"
    ),

    backend=os.getenv(
        "REDIS_URL"
    ),

    include=[
        "app.tasks"
    ]
)

celery.conf.timezone = "Asia/Kolkata"

celery.conf.beat_schedule = {

    # ---------------------------------
    # Daily Evening Reminder
    # ---------------------------------

    "evening-reminder": {

        "task": "app.tasks.evening_reminder_task",

        "schedule": 86400.0
    },

    # ---------------------------------
    # Monthly Report
    # ---------------------------------

    "monthly-report": {

        "task": "app.tasks.monthly_report_task",

        "schedule": 2592000.0
    }
}