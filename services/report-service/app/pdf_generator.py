from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer,
    Image, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

import uuid
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

REPORT_OUTPUT_DIR = os.getenv("REPORT_OUTPUT_DIR", "reports")

# ── Brand Colors ──────────────────────────────────────────────
NAVY       = colors.HexColor("#0D1B2A")
TEAL       = colors.HexColor("#00B4D8")
TEAL_LIGHT = colors.HexColor("#E0F7FA")
GREEN      = colors.HexColor("#2DC653")
RED        = colors.HexColor("#E63946")
GRAY       = colors.HexColor("#6B7280")
LIGHT_GRAY = colors.HexColor("#F3F4F6")
WHITE      = colors.white
GOLD       = colors.HexColor("#F4A261")

W, H = A4


def _styles():
    base = getSampleStyleSheet()

    def add(name, **kw):
        base.add(ParagraphStyle(name=name, **kw))

    add("AifaTitle",
        fontName="Helvetica-Bold", fontSize=22,
        textColor=WHITE, alignment=TA_LEFT, leading=28)

    add("AifaSubtitle",
        fontName="Helvetica", fontSize=10,
        textColor=TEAL, alignment=TA_LEFT, leading=14)

    add("AifaMeta",
        fontName="Helvetica", fontSize=9,
        textColor=WHITE, alignment=TA_LEFT, leading=13)

    add("SectionHeading",
        fontName="Helvetica-Bold", fontSize=13,
        textColor=NAVY, spaceBefore=16, spaceAfter=6, leading=18)

    add("SubHeading",
        fontName="Helvetica-Bold", fontSize=11,
        textColor=NAVY, spaceBefore=10, spaceAfter=4, leading=15)

    add("BodyText2",
        fontName="Helvetica", fontSize=9,
        textColor=NAVY, leading=14, spaceAfter=3)

    add("BulletItem",
        fontName="Helvetica", fontSize=9,
        textColor=NAVY, leading=14, leftIndent=10,
        spaceAfter=4, bulletIndent=0)

    add("Footer",
        fontName="Helvetica", fontSize=8,
        textColor=GRAY, alignment=TA_CENTER)

    return base


def _header_canvas(canvas, doc):
    """Draws the branded header band and footer on every page."""
    canvas.saveState()

    # Header band
    canvas.setFillColor(NAVY)
    canvas.rect(0, H - 55*mm, W, 55*mm, fill=1, stroke=0)

    # Teal accent stripe
    canvas.setFillColor(TEAL)
    canvas.rect(0, H - 58*mm, W, 3*mm, fill=1, stroke=0)

    # Logo text
    canvas.setFont("Helvetica-Bold", 22)
    canvas.setFillColor(WHITE)
    canvas.drawString(20*mm, H - 28*mm, "AIFA")

    canvas.setFont("Helvetica", 10)
    canvas.setFillColor(TEAL)
    canvas.drawString(20*mm, H - 36*mm, "AI Financial Advisor")

    # Report label (right side)
    canvas.setFont("Helvetica-Bold", 11)
    canvas.setFillColor(WHITE)
    canvas.drawRightString(W - 20*mm, H - 26*mm, "Monthly Financial Report")

    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(TEAL)
    canvas.drawRightString(
        W - 20*mm, H - 35*mm,
        datetime.now().strftime("%B %Y")
    )

    # Footer
    canvas.setFillColor(LIGHT_GRAY)
    canvas.rect(0, 0, W, 12*mm, fill=1, stroke=0)
    canvas.setFillColor(TEAL)
    canvas.rect(0, 12*mm, W, 0.5*mm, fill=1, stroke=0)

    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(GRAY)
    canvas.drawString(20*mm, 4*mm, "AIFA — AI Financial Advisor  |  Confidential Report")
    canvas.drawRightString(
        W - 20*mm, 4*mm,
        f"Page {doc.page}"
    )

    canvas.restoreState()


def _score_color(score):
    if score >= 80:
        return GREEN
    if score >= 60:
        return GOLD
    return RED


def _risk_color(risk):
    mapping = {"Low": GREEN, "Medium": GOLD, "High": RED}
    return mapping.get(risk, GRAY)


def _kpi_table(data_rows):
    """Renders a 3-column KPI card row."""
    tbl = Table(data_rows, colWidths=[55*mm, 55*mm, 55*mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND",   (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR",    (0, 0), (-1, 0), WHITE),
        ("FONTNAME",     (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",     (0, 0), (-1, 0), 9),
        ("BACKGROUND",   (0, 1), (-1, 1), TEAL_LIGHT),
        ("FONTNAME",     (0, 1), (-1, 1), "Helvetica-Bold"),
        ("FONTSIZE",     (0, 1), (-1, 1), 13),
        ("TEXTCOLOR",    (0, 1), (-1, 1), NAVY),
        ("ALIGN",        (0, 0), (-1, -1), "CENTER"),
        ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING",   (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 8),
        ("GRID",         (0, 0), (-1, -1), 0.5, WHITE),
        ("ROUNDEDCORNERS", [3]),
    ]))
    return tbl


def generate_pdf_report(
    user_id,
    monthly_income,
    expenses,
    ai_data,
    pie_chart,
    bar_chart,
    trend_chart
):
    os.makedirs(REPORT_OUTPUT_DIR, exist_ok=True)

    pdf_path = os.path.join(
        REPORT_OUTPUT_DIR, f"report_{uuid.uuid4()}.pdf"
    )

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        topMargin=65*mm,
        bottomMargin=18*mm,
        leftMargin=20*mm,
        rightMargin=20*mm
    )

    styles = _styles()
    E = []   # elements

    def section(title):
        E.append(Paragraph(title, styles["SectionHeading"]))
        E.append(HRFlowable(
            width="100%", thickness=1.5,
            color=TEAL, spaceAfter=8
        ))

    # ── PAGE 1: Overview ─────────────────────────────────────

    # User meta row
    meta_data = [
        [
            Paragraph(f"<b>User ID:</b>  {user_id}", styles["BodyText2"]),
            Paragraph(
                f"<b>Generated:</b>  {datetime.now().strftime('%d %b %Y, %I:%M %p')}",
                styles["BodyText2"]
            ),
            Paragraph(
                f"<b>Period:</b>  {datetime.now().strftime('%B %Y')}",
                styles["BodyText2"]
            ),
        ]
    ]
    meta_tbl = Table(meta_data, colWidths=[55*mm, 75*mm, 40*mm])
    meta_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_GRAY),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("BOX", (0, 0), (-1, -1), 0.5, TEAL),
    ]))
    E.append(meta_tbl)
    E.append(Spacer(1, 12))

    # ── KPI Cards ──
    section("Financial Overview")

    score = ai_data["financial_score"]
    score_color = _score_color(score)

    kpi1 = _kpi_table([
        ["Monthly Income", "Total Expenses", "Net Savings"],
        [
            Paragraph(f"<font color='#{NAVY.hexval()[2:]}'>Rs. {monthly_income:,.0f}</font>", styles["SubHeading"]),
            Paragraph(f"Rs. {ai_data['total_expense']:,.0f}", styles["SubHeading"]),
            Paragraph(f"Rs. {ai_data['savings']:,.0f}", styles["SubHeading"]),
        ]
    ])
    E.append(kpi1)
    E.append(Spacer(1, 8))

    kpi2 = _kpi_table([
        ["Savings Rate", "Financial Score", "Risk Level"],
        [
            Paragraph(f"{ai_data['savings_rate']}%", styles["SubHeading"]),
            Paragraph(f"{score}/100", styles["SubHeading"]),
            Paragraph(
                ai_data["prediction"]["risk_level"],
                styles["SubHeading"]
            ),
        ]
    ])
    E.append(kpi2)
    E.append(Spacer(1, 14))

    # ── Expense Breakdown Table ──
    section("Expense Breakdown")

    total = ai_data["total_expense"]
    exp_data = [["Category", "Amount (Rs.)", "Share"]]
    for exp in expenses:
        pct = round((exp["amount"] / total) * 100, 1) if total else 0
        exp_data.append([
            exp["category"],
            f"{exp['amount']:,.0f}",
            f"{pct}%"
        ])
    exp_data.append(["TOTAL", f"{total:,.0f}", "100%"])

    exp_tbl = Table(exp_data, colWidths=[80*mm, 60*mm, 30*mm])
    exp_tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR",     (0, 0), (-1, 0), WHITE),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 9),
        ("BACKGROUND",    (0, -1), (-1, -1), TEAL_LIGHT),
        ("FONTNAME",      (0, -1), (-1, -1), "Helvetica-Bold"),
        ("ROWBACKGROUNDS",(0, 1), (-1, -2), [WHITE, LIGHT_GRAY]),
        ("ALIGN",         (1, 0), (-1, -1), "CENTER"),
        ("GRID",          (0, 0), (-1, -1), 0.4, colors.HexColor("#D1D5DB")),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (0, -1), 10),
    ]))
    E.append(exp_tbl)

    E.append(PageBreak())

    # ── PAGE 2: Charts ───────────────────────────────────────

    section("Financial Analytics")

    # Pie + Bar side by side
    img_pie = Image(pie_chart, width=85*mm, height=85*mm)
    img_bar = Image(bar_chart, width=85*mm, height=85*mm)

    chart_row = Table(
        [[img_pie, img_bar]],
        colWidths=[87*mm, 87*mm]
    )
    chart_row.setStyle(TableStyle([
        ("ALIGN",   (0, 0), (-1, -1), "CENTER"),
        ("VALIGN",  (0, 0), (-1, -1), "MIDDLE"),
    ]))
    E.append(chart_row)

    cap_row = Table(
        [[
            Paragraph("Expense Distribution", ParagraphStyle(
                "Cap", fontName="Helvetica", fontSize=8,
                textColor=GRAY, alignment=TA_CENTER)),
            Paragraph("Category Comparison", ParagraphStyle(
                "Cap2", fontName="Helvetica", fontSize=8,
                textColor=GRAY, alignment=TA_CENTER)),
        ]],
        colWidths=[87*mm, 87*mm]
    )
    E.append(cap_row)
    E.append(Spacer(1, 10))

    # Trend chart full width
    img_trend = Image(trend_chart, width=170*mm, height=70*mm)
    E.append(img_trend)
    E.append(Paragraph(
        "Monthly Spending Trend",
        ParagraphStyle("CapC", fontName="Helvetica", fontSize=8,
                       textColor=GRAY, alignment=TA_CENTER)
    ))

    E.append(PageBreak())

    # ── PAGE 3: AI Insights ──────────────────────────────────

    section("AI Financial Insights")

    for i, insight in enumerate(ai_data["insights"], 1):
        E.append(Paragraph(
            f"<b>{i}.</b>  {insight}",
            styles["BulletItem"]
        ))

    E.append(Spacer(1, 10))
    section("Recommendations")

    for i, rec in enumerate(ai_data["recommendations"], 1):
        E.append(Paragraph(
            f"<b>{i}.</b>  {rec}",
            styles["BulletItem"]
        ))

    E.append(Spacer(1, 10))
    section("Next Month Predictions")

    risk = ai_data["prediction"]["risk_level"]
    pred_data = [
        ["Predicted Expenses", "Predicted Savings", "Risk Level"],
        [
            f"Rs. {ai_data['prediction']['predicted_expense']:,}",
            f"Rs. {ai_data['prediction']['predicted_savings']:,}",
            risk
        ]
    ]
    pred_tbl = Table(pred_data, colWidths=[60*mm, 60*mm, 50*mm])
    pred_tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR",     (0, 0), (-1, 0), WHITE),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 10),
        ("BACKGROUND",    (0, 1), (-1, 1), TEAL_LIGHT),
        ("FONTNAME",      (0, 1), (-1, 1), "Helvetica-Bold"),
        ("TEXTCOLOR",     (0, 1), (1, 1), NAVY),
        ("TEXTCOLOR",     (2, 1), (2, 1), _risk_color(risk)),
        ("ALIGN",         (0, 0), (-1, -1), "CENTER"),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING",    (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("GRID",          (0, 0), (-1, -1), 0.4, colors.HexColor("#D1D5DB")),
    ]))
    E.append(pred_tbl)

    # ── Disclaimer ──
    E.append(Spacer(1, 20))
    E.append(HRFlowable(width="100%", thickness=0.5, color=GRAY))
    E.append(Spacer(1, 6))
    E.append(Paragraph(
        "This report is auto-generated by AIFA and is intended for personal financial guidance only. "
        "It does not constitute professional financial advice.",
        ParagraphStyle("Disc", fontName="Helvetica-Oblique", fontSize=8,
                       textColor=GRAY, alignment=TA_CENTER)
    ))

    doc.build(E, onFirstPage=_header_canvas, onLaterPages=_header_canvas)

    return pdf_path