import os
import sys
from reportlab.lib.pagesizes import landscape
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    BaseDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, PageTemplate, Frame, Image
)
from reportlab.pdfgen import canvas

SLIDE_WIDTH = 13.333 * 72   # 960 points
SLIDE_HEIGHT = 7.5 * 72     # 540 points
SCREENSHOTS_DIR = r"D:\Omnikon Project\docs\screenshots"


class NumberedSlideCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_overlay(num_pages)
            super().showPage()
        super().save()

    def draw_overlay(self, page_count):
        self.saveState()
        if self._pageNumber == 1:
            self.setStrokeColor(colors.HexColor("#0284C7"))
            self.setLineWidth(1)
            self.line(36, 44, SLIDE_WIDTH - 36, 44)
            
            self.setFont("Helvetica-Bold", 8.5)
            self.setFillColor(colors.HexColor("#38BDF8"))
            self.drawString(36, 30, "OMNI_BIOTECH_9 • HOSPITAL-ACQUIRED INFECTIONS")
            self.drawRightString(SLIDE_WIDTH - 36, 30, "SUBMISSION DEADLINE: 27 AUGUST 2026 • 11:59 PM IST")
        else:
            self.setStrokeColor(colors.HexColor("#0284C7"))
            self.setLineWidth(2)
            self.line(0, SLIDE_HEIGHT - 38, SLIDE_WIDTH, SLIDE_HEIGHT - 38)
            
            self.setFont("Helvetica-Bold", 10)
            self.setFillColor(colors.HexColor("#0F172A"))
            self.drawString(36, SLIDE_HEIGHT - 25, "HAI-SENTINEL")
            
            self.setFont("Helvetica", 9)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawString(125, SLIDE_HEIGHT - 25, "•  Explainable AI Prevention Intelligence")
            
            self.setFont("Helvetica-Bold", 8.5)
            self.setFillColor(colors.HexColor("#0284C7"))
            self.drawRightString(SLIDE_WIDTH - 36, SLIDE_HEIGHT - 25, "PREDICT → EXPLAIN → TRACK → PRIORITIZE → PREVENT")
            
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.75)
            self.line(36, 26, SLIDE_WIDTH - 36, 26)
            
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawString(36, 14, "OMNI_BIOTECH_9 • 27 AUGUST 2026 • CONFIDENTIAL COMPETITION SUBMISSION • AIR-GAPPED READY")
            
            page_text = f"Slide {self._pageNumber} of {page_count}"
            self.drawRightString(SLIDE_WIDTH - 36, 14, page_text)
        self.restoreState()


def draw_first_page_bg(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(colors.HexColor("#070D18"))
    canvas.rect(0, 0, SLIDE_WIDTH, SLIDE_HEIGHT, fill=True, stroke=False)
    canvas.setFillColor(colors.HexColor("#0284C7"))
    canvas.rect(0, SLIDE_HEIGHT - 6, SLIDE_WIDTH, 6, fill=True, stroke=False)
    canvas.restoreState()


def draw_later_page_bg(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(colors.HexColor("#F8FAFC"))
    canvas.rect(0, 0, SLIDE_WIDTH, SLIDE_HEIGHT, fill=True, stroke=False)
    canvas.setFillColor(colors.HexColor("#FFFFFF"))
    canvas.rect(0, SLIDE_HEIGHT - 38, SLIDE_WIDTH, 38, fill=True, stroke=False)
    canvas.restoreState()


def build_pdf_deck(output_pdf="HAI_SENTINEL_Official_Presentation.pdf"):
    doc = BaseDocTemplate(
        output_pdf,
        pagesize=(SLIDE_WIDTH, SLIDE_HEIGHT),
        leftMargin=36,
        rightMargin=36,
        topMargin=44,
        bottomMargin=32
    )

    frame = Frame(36, 32, SLIDE_WIDTH - 72, SLIDE_HEIGHT - 76, id='normal')
    first_template = PageTemplate(id='FirstPage', frames=frame, onPage=draw_first_page_bg)
    later_template = PageTemplate(id='LaterPages', frames=frame, onPage=draw_later_page_bg)
    doc.addPageTemplates([first_template, later_template])

    styles = getSampleStyleSheet()

    NAVY = colors.HexColor("#0F172A")
    CYAN = colors.HexColor("#0284C7")
    EMERALD = colors.HexColor("#059669")
    ROSE = colors.HexColor("#E11D48")
    AMBER = colors.HexColor("#D97706")
    SLATE_TEXT = colors.HexColor("#334155")
    SLATE_MUTED = colors.HexColor("#64748B")
    BG_LIGHT = colors.HexColor("#F8FAFC")
    BORDER = colors.HexColor("#CBD5E1")

    cover_title = ParagraphStyle('CoverTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=32, leading=38, textColor=colors.white, spaceAfter=6)
    cover_subtitle = ParagraphStyle('CoverSubtitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=13, leading=17, textColor=colors.HexColor("#38BDF8"), spaceAfter=10)
    cover_desc = ParagraphStyle('CoverDesc', parent=styles['Normal'], fontName='Helvetica', fontSize=9.5, leading=14, textColor=colors.HexColor("#CBD5E1"), spaceAfter=12)

    slide_headline = ParagraphStyle('SlideHeadline', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=15, leading=19, textColor=NAVY, spaceAfter=2)
    slide_subheadline = ParagraphStyle('SlideSubheadline', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=11, textColor=CYAN, spaceAfter=6)

    card_title = ParagraphStyle('CardTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9, leading=11, textColor=NAVY, spaceAfter=2)
    card_body = ParagraphStyle('CardBody', parent=styles['Normal'], fontName='Helvetica', fontSize=7.5, leading=10.5, textColor=SLATE_TEXT)
    card_body_dark = ParagraphStyle('CardBodyDark', parent=styles['Normal'], fontName='Helvetica', fontSize=7.5, leading=10.5, textColor=colors.HexColor("#E2E8F0"))

    tbl_hdr = ParagraphStyle('TableHdr', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=7.5, leading=9.5, textColor=colors.white)
    tbl_cell = ParagraphStyle('TableCell', parent=styles['Normal'], fontName='Helvetica', fontSize=7, leading=9, textColor=SLATE_TEXT)
    tbl_cell_bold = ParagraphStyle('TableCellBold', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=7, leading=9, textColor=NAVY)

    def make_img(rel_path, width_in, height_in):
        full_p = os.path.join(SCREENSHOTS_DIR, rel_path)
        if os.path.exists(full_p):
            return Image(full_p, width=width_in * 72, height=height_in * 72)
        return Paragraph("[Visual Asset]", card_body)

    story = []

    # SLIDE 1: COVER
    dash_img = make_img("01_dashboard.png", 5.0, 3.2)
    c_left = [
        Paragraph("HAI-SENTINEL", cover_title),
        Paragraph("Explainable AI Early-Warning & Prevention Intelligence for Hospital-Acquired Infections", cover_subtitle),
        Paragraph("A clinically grounded, leakage-resistant decision-support platform that transforms continuous ICU telemetry into calibrated risk trajectories, discrete derivative calculus, TreeSHAP local attributions, and unit-level spatial cluster radar.", cover_desc)
    ]
    cover_top_tbl = Table([[c_left, dash_img]], colWidths=[480, 408])
    cover_top_tbl.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(cover_top_tbl)
    story.append(Spacer(1, 10))

    cover_meta = [
        [
            Paragraph("<font color='#38BDF8'><b>TRACK:</b></font><br/><font color='#FFFFFF'>Omni_BioTech_9 (Hospital-Acquired Infections)</font>", card_body_dark),
            Paragraph("<font color='#38BDF8'><b>OPERATIONAL DEPLOYMENT:</b></font><br/><font color='#FFFFFF'>100% Offline / Air-Gapped Ready</font>", card_body_dark),
            Paragraph("<font color='#38BDF8'><b>SUBMISSION DEADLINE:</b></font><br/><font color='#FFFFFF'>27 August 2026 • 11:59 PM IST</font>", card_body_dark),
            Paragraph("<font color='#38BDF8'><b>PARADIGM:</b></font><br/><font color='#FFFFFF'>PREDICT → EXPLAIN → TRACK → PRIORITIZE → PREVENT</font>", card_body_dark)
        ]
    ]
    cover_meta_tbl = Table(cover_meta, colWidths=[220, 220, 220, 228])
    cover_meta_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#0F172A")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#1E293B")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#334155")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(cover_meta_tbl)

    # SLIDE 2: CLINICAL PROBLEM
    story.append(PageBreak())
    story.append(Paragraph("“Hospitals often detect infection after deterioration has already begun.”", slide_headline))
    story.append(Paragraph("The Clinical Burden & Critical Time Window in Intensive Care Units", slide_subheadline))
    p2_cards = [
        [
            Paragraph("<b>The Massive ICU Burden</b><br/>Nearly <b>30% of ICU patients</b> experience at least one nosocomial infection (Vincent et al., EPIC II). Central line bacteremia (CLABSI), urinary infections (CAUTI), and ventilator events (VAE) drive severe morbidity.", card_body),
            Paragraph("<b>The Dangerous Diagnostic Delay</b><br/>Microbiological blood cultures require <b>24 to 72 hours</b> to yield confirmation. By the time bacteremia is laboratory-verified, physiological decompensation has often already initiated fulminant septic cascade.", card_body),
            Paragraph("<b>The Septic Cascade & Mortality</b><br/>Every hour of delayed antimicrobial therapy during septic shock escalates mortality by ~7.6%. Late detection leads to irreversible multi-organ dysfunction syndrome (MODS) and prolonged ICU stays.", card_body)
        ]
    ]
    p2_tbl = Table(p2_cards, colWidths=[290, 290, 290])
    p2_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.white),
        ('BOX', (0,0), (-1,-1), 1, BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(p2_tbl)
    story.append(Spacer(1, 10))

    timeline_data = [
        [
            Paragraph("<b>ICU Admission</b><br/><font color='#0284C7'>t = 0h (Baseline)</font>", tbl_cell_bold),
            Paragraph("&rarr;", ParagraphStyle('arr', parent=styles['Normal'], alignment=1, fontSize=12, textColor=SLATE_MUTED)),
            Paragraph("<b>Device Dwell</b><br/><font color='#D97706'>t = 24-48h (Dwell accumulates)</font>", tbl_cell_bold),
            Paragraph("&rarr;", ParagraphStyle('arr', parent=styles['Normal'], alignment=1, fontSize=12, textColor=SLATE_MUTED)),
            Paragraph("<b>Infection Window</b><br/><font color='#E11D48'>t = 48h+ (CDC Day 3)</font>", tbl_cell_bold),
            Paragraph("&rarr;", ParagraphStyle('arr', parent=styles['Normal'], alignment=1, fontSize=12, textColor=SLATE_MUTED)),
            Paragraph("<b>Clinical Suspicion</b><br/><font color='#7C3AED'>t = 54h (Fever, WBC spike)</font>", tbl_cell_bold),
            Paragraph("&rarr;", ParagraphStyle('arr', parent=styles['Normal'], alignment=1, fontSize=12, textColor=SLATE_MUTED)),
            Paragraph("<b>Culture Drawn</b><br/><font color='#64748B'>t = 60h (Labs ordered)</font>", tbl_cell_bold),
            Paragraph("&rarr;", ParagraphStyle('arr', parent=styles['Normal'], alignment=1, fontSize=12, textColor=SLATE_MUTED)),
            Paragraph("<b>Lab Result</b><br/><font color='#991B1B'>t = 84-132h (Late!)</font>", tbl_cell_bold)
        ]
    ]
    timeline_tbl = Table(timeline_data, colWidths=[90, 16, 120, 16, 110, 16, 100, 16, 95, 16, 90])
    timeline_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(timeline_tbl)
    story.append(Spacer(1, 8))

    callout_2 = Table([[Paragraph("<b>CLINICAL IMPERATIVE:</b> <i>THE WINDOW FOR PREVENTION CAN OPEN BEFORE CONFIRMATION.</i> Continuous longitudinal risk modeling enables bedside infection preventionists to review line hygiene and device readiness before bacterial cascades turn fatal.", ParagraphStyle('CalloutBold', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=11, textColor=NAVY))]], colWidths=[888])
    callout_2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FEF2F2")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#FECDD3")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(callout_2)

    # SLIDE 3: FAILURE MODES
    story.append(PageBreak())
    story.append(Paragraph("“Static risk scores see snapshots. HAI-Sentinel sees trajectories.”", slide_headline))
    story.append(Paragraph("Four Critical Failure Modes in Current Hospital Surveillance & Machine Learning Paradigms", slide_subheadline))
    failure_data = [
        [
            Paragraph("<b>01 • STATIC ASSESSMENT</b>", ParagraphStyle('f1', parent=card_title, textColor=ROSE)),
            Paragraph("<b>02 • BLACK-BOX ALERTS</b>", ParagraphStyle('f2', parent=card_title, textColor=AMBER)),
            Paragraph("<b>03 • POOR CALIBRATION</b>", ParagraphStyle('f3', parent=card_title, textColor=colors.HexColor("#7C3AED"))),
            Paragraph("<b>04 • NO SPATIAL RADAR</b>", ParagraphStyle('f4', parent=card_title, textColor=CYAN))
        ],
        [
            Paragraph("Traditional scores (APACHE, SOFA) and naive classifiers evaluate static admission snapshots. They fail to track the slope and acceleration of physiological decompensation over multi-hourly horizons.", card_body),
            Paragraph("Opaque risk numbers without local feature attribution cause severe clinician alarm fatigue. Clinicians cannot distinguish between benign chronic baseline risk vs. acute nosocomial infection signals.", card_body),
            Paragraph("Standard neural networks and uncalibrated tree outputs generate severely distorted probabilities in low-prevalence (~10-15%) ICU infection domains, compromising clinical triage thresholds.", card_body),
            Paragraph("Isolated patient-level predictions completely ignore unit-level spatial risk density. They fail to identify simultaneous upward velocity across adjacent physical ICU beds.", card_body)
        ]
    ]
    fail_tbl = Table(failure_data, colWidths=[216, 216, 216, 216])
    fail_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.white),
        ('BOX', (0,0), (-1,-1), 1, BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(fail_tbl)
    story.append(Spacer(1, 8))

    comp_data = [
        [Paragraph("Surveillance Dimension", tbl_hdr), Paragraph("Current Hospital Standard / Naive ML", tbl_hdr), Paragraph("HAI-Sentinel Prevention Intelligence", tbl_hdr)],
        [Paragraph("<b>Temporal Dynamics</b>", tbl_cell_bold), Paragraph("Static 24h snapshot or one-time admission score", tbl_cell), Paragraph("<b>Continuous multi-hourly trajectory calculus (v, a)</b>", tbl_cell_bold)],
        [Paragraph("<b>Explainability</b>", tbl_cell_bold), Paragraph("Black-box raw probability or global coefficient list", tbl_cell), Paragraph("<b>TreeSHAP local attributions grouped by clinical domain</b>", tbl_cell_bold)],
        [Paragraph("<b>Calibration Reliability</b>", tbl_cell_bold), Paragraph("Uncalibrated sigmoid/softmax (distorted ECE > 0.05)", tbl_cell), Paragraph("<b>Isotonic Probability Calibration (ECE = 0.0097)</b>", tbl_cell_bold)],
        [Paragraph("<b>Spatial Ward Context</b>", tbl_cell_bold), Paragraph("Isolated patient prediction with zero unit awareness", tbl_cell), Paragraph("<b>Unit risk density & spatial cluster early-warning radar</b>", tbl_cell_bold)],
        [Paragraph("<b>Clinical Workflow</b>", tbl_cell_bold), Paragraph("Binary alert buzzer generating alarm fatigue", tbl_cell), Paragraph("<b>Prioritized P1/P2/P3 IPC rounding with audit trail</b>", tbl_cell_bold)]
    ]
    comp_tbl = Table(comp_data, colWidths=[140, 370, 378])
    comp_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(comp_tbl)

    # SLIDE 4: TARGET GROUNDING
    story.append(PageBreak())
    story.append(Paragraph("“Prediction begins with the correct epidemiological definition.”", slide_headline))
    story.append(Paragraph("CDC/NHSN Protocol Grounding & Prevention of Target Contamination", slide_subheadline))
    p4_top = [
        [
            Paragraph("<b>Gold-Standard CDC/NHSN Protocol Alignment (2024)</b><br/>HAI-Sentinel operationalizes the prediction target strictly in concordance with the <b>CDC National Healthcare Safety Network (NHSN) Patient Safety Component Protocol</b>. An infection is classified as healthcare-associated IF AND ONLY IF the Infection Window Period begins on or after <b>Calendar Day 3 of ICU admission (≥ 48 hours)</b>.", card_body),
            Paragraph("<b>Strict Isolation of Community-Acquired Infections (CAI)</b><br/>Infections manifested on Day 1 or Day 2 are Community-Acquired. Naive models that conflate CAI with HAI predict pre-existing pathology rather than nosocomial transmission. HAI-Sentinel strictly isolates Day 1-2 CAI cases from the HAI target.", card_body)
        ]
    ]
    p4_top_tbl = Table(p4_top, colWidths=[436, 436])
    p4_top_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.white),
        ('BOX', (0,0), (-1,-1), 1, BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(p4_top_tbl)
    story.append(Spacer(1, 8))

    cdc_diagram = [
        [
            Paragraph("<b>DAY 1 (Hours 0–24)</b><br/><font color='#64748B'>Community-Acquired Window</font><br/>Pre-existing admission pathology.<br/><b>EXCLUDED FROM HAI TARGET</b>", tbl_cell),
            Paragraph("<b>DAY 2 (Hours 24–48)</b><br/><font color='#64748B'>Transition Baseline Window</font><br/>Device dwell begins accumulating.<br/><b>EXCLUDED FROM HAI TARGET</b>", tbl_cell),
            Paragraph("<b>DAY 3+ (Hours 48–168+)</b><br/><font color='#E11D48'><b>CDC / NHSN HAI SURVEILLANCE HORIZON</b></font><br/>True nosocomial infection onset window.<br/><b>VALIDATED HAI TARGET WINDOW (CLABSI / CAUTI / VAE / HAP)</b>", tbl_cell_bold)
        ]
    ]
    cdc_tbl = Table(cdc_diagram, colWidths=[270, 270, 334])
    cdc_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor("#F1F5F9")),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor("#F1F5F9")),
        ('BACKGROUND', (2,0), (2,0), colors.HexColor("#FFE4E6")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(cdc_tbl)

    # SLIDE 5: LITERATURE REVIEW
    story.append(PageBreak())
    story.append(Paragraph("“From risk scoring to explainable, temporal infection intelligence.”", slide_headline))
    story.append(Paragraph("Critical Review of Foundational Literature, Sepsis Systems & Surveillance Research", slide_subheadline))
    lit_data = [
        [Paragraph("Author / Year [Ref]", tbl_hdr), Paragraph("Methodological Approach", tbl_hdr), Paragraph("Key Strength", tbl_hdr), Paragraph("Identified Limitation", tbl_hdr), Paragraph("Unresolved Gap Addressed", tbl_hdr)],
        [
            Paragraph("<b>CDC NHSN (2024)</b> [1]", tbl_cell_bold),
            Paragraph("Standardized epidemiological protocol manual", tbl_cell),
            Paragraph("Gold-standard criteria for CLABSI/CAUTI/VAE", tbl_cell),
            Paragraph("Purely retrospective audit; zero predictive capability", tbl_cell),
            Paragraph("<b>Transforms retrospective definitions into prospective AI horizon</b>", tbl_cell_bold)
        ],
        [
            Paragraph("<b>Vincent et al. (2009)</b> [4]", tbl_cell_bold),
            Paragraph("EPIC II multinational ICU point-prevalence study", tbl_cell),
            Paragraph("Rigorous epidemiological evidence of 30% burden", tbl_cell),
            Paragraph("Static observational study; no real-time scoring", tbl_cell),
            Paragraph("<b>Provides epidemiological grounding for low-prevalence calibration</b>", tbl_cell_bold)
        ],
        [
            Paragraph("<b>Lundberg et al. (2020)</b> [2]", tbl_cell_bold),
            Paragraph("TreeSHAP game-theoretic local attribution", tbl_cell),
            Paragraph("Exact additive, polynomial-time tree explanation", tbl_cell),
            Paragraph("Generic ML method; lacks clinical domain structuring", tbl_cell),
            Paragraph("<b>Groups attributions into clinical domains (Devices, Vitals, Labs)</b>", tbl_cell_bold)
        ],
        [
            Paragraph("<b>Niculescu-Mizil (2005)</b> [3]", tbl_cell_bold),
            Paragraph("Isotonic probability calibration techniques", tbl_cell),
            Paragraph("Non-parametric mapping to empirical probabilities", tbl_cell),
            Paragraph("Rarely integrated in ICU dynamic surveillance", tbl_cell),
            Paragraph("<b>Achieves ECE = 0.0097, ensuring reliable posterior risk triage</b>", tbl_cell_bold)
        ],
        [
            Paragraph("<b>Henry et al. (2015)</b> [5]", tbl_cell_bold),
            Paragraph("TREWScore temporal sepsis early warning", tbl_cell),
            Paragraph("Dynamic time-series feature engineering", tbl_cell),
            Paragraph("Single-patient focus; no spatial ward contagion radar", tbl_cell),
            Paragraph("<b>Adds spatial unit risk density & multi-patient cluster radar</b>", tbl_cell_bold)
        ]
    ]
    lit_tbl = Table(lit_data, colWidths=[115, 170, 185, 195, 205])
    lit_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(lit_tbl)

    # SLIDE 6: RESEARCH GAP
    story.append(PageBreak())
    story.append(Paragraph("“The missing layer is not another risk score. It is actionable trajectory intelligence.”", slide_headline))
    story.append(Paragraph("Architectural & Clinical Decomposition of the Unresolved Surveillance Void", slide_subheadline))
    gap_data = [
        [
            Paragraph("<b>CONVENTIONAL APPROACHES</b><br/><font color='#64748B'>Snapshot Scoring &amp; Opaque Binary Classifiers</font><br/><br/>"
                      "• Static 24h time-aggregated features<br/>"
                      "• Uncalibrated binary classification output<br/>"
                      "• Opaque threshold alarms causing alert fatigue<br/>"
                      "• Isolated patient predictions in physical silos<br/>"
                      "• No velocity or directionality tracking", card_body),
            Paragraph("<b>THE CRITICAL UNRESOLVED GAP</b><br/><font color='#E11D48'>Why Prediction Fails to Translate into Prevention</font><br/><br/>"
                      "<b>1. No Continuous Trajectory:</b> Misses rate of change (v) and acceleration (a).<br/>"
                      "<b>2. No Local Explainability:</b> Clinicians cannot answer <i>'WHY is risk rising?'</i><br/>"
                      "<b>3. No Spatial Unit Radar:</b> Fails to detect co-located bed clusters.<br/>"
                      "<b>4. No Counterfactual Simulator:</b> Cannot explore sensitivity to devices.<br/>"
                      "<b>5. No Action Prioritization:</b> Alarms fail to guide bedside IPC rounding.", card_body),
            Paragraph("<b>HAI-SENTINEL ARCHITECTURE</b><br/><font color='#0284C7'>Explainable Prevention Intelligence Engine</font><br/><br/>"
                      "• <b>Continuous Dynamic Trajectory Engine</b> (v, a)<br/>"
                      "• <b>TreeSHAP Local Attribution Decomposition</b><br/>"
                      "• <b>Isotonic Probability Calibration (ECE 0.0097)</b><br/>"
                      "• <b>Spatial Ward Density &amp; Cluster Radar</b><br/>"
                      "• <b>What-If Non-Causal Simulator &amp; Audit Trail</b>", card_body)
        ]
    ]
    gap_tbl = Table(gap_data, colWidths=[280, 310, 280])
    gap_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor("#F1F5F9")),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor("#FFF1F2")),
        ('BACKGROUND', (2,0), (2,0), colors.HexColor("#F0F9FF")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(gap_tbl)

    # SLIDE 7: PARADIGM
    story.append(PageBreak())
    story.append(Paragraph("“From prediction to prevention intelligence.”", slide_headline))
    story.append(Paragraph("The Five-Stage Closed-Loop Clinical Intelligence Paradigm", slide_subheadline))
    sol_cards = [
        [
            Paragraph("<b>STAGE 1<br/>PREDICT</b>", ParagraphStyle('p1', parent=card_title, textColor=CYAN, alignment=1)),
            Paragraph("<b>STAGE 2<br/>EXPLAIN</b>", ParagraphStyle('p2', parent=card_title, textColor=EMERALD, alignment=1)),
            Paragraph("<b>STAGE 3<br/>TRACK</b>", ParagraphStyle('p3', parent=card_title, textColor=AMBER, alignment=1)),
            Paragraph("<b>STAGE 4<br/>PRIORITIZE</b>", ParagraphStyle('p4', parent=card_title, textColor=colors.HexColor("#7C3AED"), alignment=1)),
            Paragraph("<b>STAGE 5<br/>PREVENT</b>", ParagraphStyle('p5', parent=card_title, textColor=ROSE, alignment=1))
        ],
        [
            Paragraph("<b>Calibrated Posterior Risk</b><br/>Generates reliable risk probabilities P(Y=1|X) calibrated via Isotonic Regression, avoiding threshold distortion.", card_body),
            Paragraph("<b>TreeSHAP Decomposition</b><br/>Decomposes prediction into additive feature attributions across Devices, Vitals, and Laboratory factors.", card_body),
            Paragraph("<b>Trajectory Calculus</b><br/>Computes discrete velocity (v) and acceleration (a) over rolling windows to identify rapid escalation spikes.", card_body),
            Paragraph("<b>IPC Workflow Triage</b><br/>Automates rounding prioritization into Priority 1 (Immediate), Priority 2 (Watch), and Priority 3 (Routine).", card_body),
            Paragraph("<b>Actionable Decision Support</b><br/>Guides catheter bundle audits and disinfection workflows. (Prevention is an operational workflow objective).", card_body)
        ]
    ]
    sol_tbl = Table(sol_cards, colWidths=[172, 172, 172, 172, 172])
    sol_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.white),
        ('BOX', (0,0), (-1,-1), 1, BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(sol_tbl)

    # SLIDE 8: 5 PILLARS
    story.append(PageBreak())
    story.append(Paragraph("“Engineered for comprehensive clinical infection surveillance.”", slide_headline))
    story.append(Paragraph("The Five Architectural Pillars Powering the HAI-Sentinel Platform", slide_subheadline))
    pil_data = [
        [
            Paragraph("<b>PILLAR 01<br/>Dynamic Trajectory Engine</b>", ParagraphStyle('pl1', parent=card_title, textColor=CYAN)),
            Paragraph("<b>PILLAR 02<br/>TreeSHAP Explainability</b>", ParagraphStyle('pl2', parent=card_title, textColor=EMERALD)),
            Paragraph("<b>PILLAR 03<br/>Spatial Ward Radar</b>", ParagraphStyle('pl3', parent=card_title, textColor=AMBER))
        ],
        [
            Paragraph("• Rolling 12h and 24h backward windows<br/>• Discrete risk velocity calculation (v<sub>12h</sub>)<br/>• Non-linear acceleration tracking (a<sub>12h</sub>)<br/>• Automated rapid escalation alert trigger", card_body),
            Paragraph("• Exact game-theoretic Shapley attributions<br/>• Categorization into Devices, Vitals, Labs<br/>• Transparent positive and negative forces<br/>• Eliminates black-box alarm fatigue", card_body),
            Paragraph("• Aggregates spatial risk density across beds<br/>• Identifies multi-patient concurrent rises<br/>• Emits <i>'Potential cluster requiring IPC review'</i><br/>• Explicit non-outbreak clinical signal", card_body)
        ],
        [
            Paragraph("<b>PILLAR 04<br/>What-If Scenario Simulator</b>", ParagraphStyle('pl4', parent=card_title, textColor=colors.HexColor("#7C3AED"))),
            Paragraph("<b>PILLAR 05<br/>Prioritized IPC Rounding</b>", ParagraphStyle('pl5', parent=card_title, textColor=ROSE)),
            Paragraph("<b>PILLAR 06<br/>Cryptographic Audit Ledger</b>", ParagraphStyle('pl6', parent=card_title, textColor=NAVY))
        ],
        [
            Paragraph("• Interactive parameter sensitivity exploration<br/>• Tests CVC removal, WBC changes, temp slope<br/>• Recomputes trajectory and SHAP attributions<br/>• <b>Strict non-causal model sensitivity framing</b>", card_body),
            Paragraph("• Automated triage: Priority 1, 2, and 3<br/>• Connects predictions directly to rounding actions<br/>• Bedside line bundle hygiene verification<br/>• Converts data into preventative protocols", card_body),
            Paragraph("• Immutable cryptographic timestamping<br/>• Tracks all inferences, simulations, and reviews<br/>• Full regulatory traceability and governance<br/>• Zero PHI synthetic de-identification", card_body)
        ]
    ]
    pil_tbl = Table(pil_data, colWidths=[290, 290, 290])
    pil_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.white),
        ('BOX', (0,0), (-1,-1), 1, BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(pil_tbl)

    # SLIDE 9: TRAJECTORY MATH (WITH VISUAL CHART EMBEDDED)
    story.append(PageBreak())
    story.append(Paragraph("“A risk score becomes more informative when its direction and acceleration are visible.”", slide_headline))
    story.append(Paragraph("Mathematical Formulation of Discrete Derivatives & Rapid Escalation Dynamics", slide_subheadline))
    math_text = [
        Paragraph("<b>1. Calibrated Posterior Risk:</b> P(Y=1|X_t) &in; [0, 100%]<br/><br/>"
                  "<b>2. Discrete Risk Velocity (v):</b><br/>v<sub>12h</sub> = [Risk(t) &minus; Risk(t&minus;12h)] / 12 &nbsp; [%/h]<br/><br/>"
                  "<b>3. Discrete Risk Acceleration (a):</b><br/>a<sub>12h</sub> = [v(t) &minus; v(t&minus;12h)] / 12 &nbsp; [%/h&sup2;]<br/><br/>"
                  "<b>4. Rapid Escalation Trigger Rule:</b><br/>Flag = True IF (v<sub>12h</sub> &ge; +1.25%/h OR &Delta;Risk &ge; +15% OR Risk &ge; 80%)<br/><br/>"
                  "• <b>Velocity:</b> Rate of acute infection slope expansion.<br/>"
                  "• <b>Acceleration:</b> Non-linear inflection point detection.", card_body)
    ]
    math_chart = make_img("viz_risk_trajectory_curve.png", 5.8, 3.6)
    s9_tbl = Table([[math_text, math_chart]], colWidths=[360, 528])
    s9_tbl.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (0,0), (0,0), colors.white),
        ('BOX', (0,0), (0,0), 1, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(s9_tbl)

    # SLIDE 10: TREESHAP (WITH VISUAL CHART EMBEDDED)
    story.append(PageBreak())
    story.append(Paragraph("“Every alert must answer: WHY is this patient’s risk rising?”", slide_headline))
    story.append(Paragraph("Local Game-Theoretic TreeSHAP Attribution & Clinical Domain Structuring", slide_subheadline))
    shap_text = [
        Paragraph("<b>TreeSHAP Mathematical Properties:</b><br/>"
                  "• Exact Shapley decomposition satisfying local accuracy, missingness, and consistency.<br/>"
                  "• Additive: f(x) = E[f(x)] + &sum; &phi;<sub>i</sub>.<br/><br/>"
                  "<b>Attributions (Patient DEMO-1042):</b><br/>"
                  "• CVC Exposure (60h): <b>+0.84</b> (Devices)<br/>"
                  "• 12h Temp Upward Slope: <b>+0.62</b> (Vitals)<br/>"
                  "• 24h Leukocytosis Delta: <b>+0.53</b> (Labs)<br/>"
                  "• Serum Lactate Rise: <b>+0.39</b> (Labs)<br/>"
                  "• 12h Mean Arterial Pressure: <b>-0.11</b> (Vitals)<br/><br/>"
                  "<b>GUARDRAIL:</b> <i>FEATURE CONTRIBUTION &ne; CAUSATION</i>.", card_body)
    ]
    shap_chart = make_img("viz_treeshap_waterfall.png", 5.8, 3.6)
    s10_tbl = Table([[shap_text, shap_chart]], colWidths=[360, 528])
    s10_tbl.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (0,0), (0,0), colors.white),
        ('BOX', (0,0), (0,0), 1, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(s10_tbl)

    # SLIDE 11: SPATIAL WARD RADAR (WITH LIVE SCREENSHOT EMBEDDED)
    story.append(PageBreak())
    story.append(Paragraph("“HAI risk is not always isolated to one patient.”", slide_headline))
    story.append(Paragraph("Spatial-Temporal Risk Density & Unit Cluster Anomaly Surveillance Radar", slide_subheadline))
    ward_text = [
        Paragraph("<b>Spatial Risk Density Formulation:</b><br/>"
                  "Density<sub>ward</sub> = [&sum; Risk<sub>i</sub>] / [BedCount &times; 100]<br/><br/>"
                  "<b>ICU-A Multi-Bed Escalation:</b><br/>"
                  "• Bed ICU-A-04 (DEMO-1042): <b>84.0% CRIT</b> (Vel +23%/12h)<br/>"
                  "• Bed ICU-A-05 (DEMO-1043): <b>86.0% CRIT</b> (Vel +28%/12h)<br/>"
                  "• Bed ICU-A-06 (DEMO-1044): <b>78.0% HIGH</b> (Vel +30%/12h)<br/>"
                  "• Bed ICU-A-07 (DEMO-1045): <b>64.0% HIGH</b> (Vel +28%/12h)<br/><br/>"
                  "<b>Cluster Output:</b> <i>'Potential cluster requiring IPC review'</i> (Strictly NON-OUTBREAK wording).", card_body)
    ]
    ward_screenshot = make_img("04_ward_intelligence.png", 5.8, 3.6)
    s11_tbl = Table([[ward_text, ward_screenshot]], colWidths=[360, 528])
    s11_tbl.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (0,0), (0,0), colors.white),
        ('BOX', (0,0), (0,0), 1, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(s11_tbl)

    # SLIDE 12: 90-SECOND DEMO (WITH LIVE DEMO SCREENSHOT EMBEDDED)
    story.append(PageBreak())
    story.append(Paragraph("“A complete infection-risk escalation can be demonstrated in 90 seconds.”", slide_headline))
    story.append(Paragraph("Verifiable Step-by-Step Execution Sequence for Competition Evaluation", slide_subheadline))
    demo_text = [
        Paragraph("<b>Deterministic 6-Stage Timeline:</b><br/>"
                  "• <b>Stage 1 (Hr 0): 17.0% LOW</b> | Normal baseline.<br/>"
                  "• <b>Stage 2 (Hr 24): 29.0% LOW</b> | Dwell accumulation.<br/>"
                  "• <b>Stage 3 (Hr 48): 43.0% MOD</b> | Crosses Day 3 CDC.<br/>"
                  "• <b>Stage 4 (Hr 54): 61.0% HIGH</b> | Velocity +22%/12h alert.<br/>"
                  "• <b>Stage 5 (Hr 60): 82.0% CRIT</b> | CVC (+0.84), Temp (+0.62).<br/>"
                  "• <b>Stage 6 (Hr 66): 84.0% CRIT</b> | ICU-A Cluster Signal + Rounding List.<br/><br/>"
                  "<b>Playback:</b> [ RUN ]  [ PAUSE ]  [ STEP ]  [ RESET ] (100% Offline)", card_body)
    ]
    demo_screenshot = make_img("02_demo_mode.png", 5.8, 3.6)
    s12_tbl = Table([[demo_text, demo_screenshot]], colWidths=[360, 528])
    s12_tbl.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (0,0), (0,0), colors.white),
        ('BOX', (0,0), (0,0), 1, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(s12_tbl)

    # SLIDE 13: ARCHITECTURE
    story.append(PageBreak())
    story.append(Paragraph("“Designed as a leakage-resistant, modular clinical AI platform.”", slide_headline))
    story.append(Paragraph("Five-Tier Enterprise Architecture: Ingestion, Causal Features, ML, APIs, and UI", slide_subheadline))
    arch_tiers = [
        [Paragraph("<b>LAYER 1: CLINICAL INGESTION &amp; EHR BOUNDS CLEANING</b><br/>Ingests hourly vitals, laboratory telemetry, and invasive device exposure hours (CVC, Foley, Vent). Enforces physiological bounds (Temp 30–45°C, HR 20–300 bpm, SpO2 50–100%) and imputes missingness with backward forward-fill.", card_body)],
        [Paragraph("<b>LAYER 2: CAUSAL BACKWARD-LOOKING TEMPORAL FEATURE ENGINE</b><br/>Computes rolling 12h means, 24h deltas, and least-squares linear slopes (&Delta;Temp/&Delta;t, &Delta;WBC/&Delta;t). <b>STRICT ZERO LEAKAGE:</b> Slices strictly within historical interval [t-24h, t]. No future lookahead.", card_body)],
        [Paragraph("<b>LAYER 3: CALIBRATED MACHINE LEARNING &amp; EXPLAINABILITY ENGINE</b><br/>Tuned Gradient-Boosted Decision Trees (XGBoost) + Isotonic Probability Calibration (ECE 0.0097, Brier 0.0102). Integrated TreeSHAP explainer computes exact additive attribution vectors grouped by domain.", card_body)],
        [Paragraph("<b>LAYER 4: BACKEND REST API GATEWAY &amp; PERSISTENT DATABASE</b><br/>High-performance FastAPI async engine with SQLAlchemy 2.0 ORM, Pydantic v2 schemas, and SQLite / PostgreSQL. Endpoints: /api/dashboard, /api/patients, /api/patients/{id}/risk, /api/wards, /api/clusters, /api/audit, /api/demo.", card_body)],
        [Paragraph("<b>LAYER 5: REACT 18 INTELLIGENCE COMMAND CENTER</b><br/>TypeScript + Tailwind CSS + Recharts visualizer. Features: Executive KPI Dashboard, Patient Risk Trajectory, Spatial Bed Matrix, Cluster Radar, What-If Simulator, Audit Ledger, and Deterministic Demo.", card_body)]
    ]
    arch_tbl = Table(arch_tiers, colWidths=[888])
    arch_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, CYAN),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(arch_tbl)

    # SLIDE 14: LEAKAGE PROOFS
    story.append(PageBreak())
    story.append(Paragraph("“Clinical AI credibility depends on preventing leakage.”", slide_headline))
    story.append(Paragraph("Mathematical & Structural Proofs of Anti-Leakage Partition Isolation", slide_subheadline))
    p14_cards = [
        [
            Paragraph("<b>01 • PATIENT-LEVEL GROUPED SPLIT</b>", ParagraphStyle('s1', parent=card_title, textColor=CYAN)),
            Paragraph("<b>02 • CAUSAL BACKWARD WINDOWS</b>", ParagraphStyle('s2', parent=card_title, textColor=EMERALD)),
            Paragraph("<b>03 • UNCERTAINTY SCALING</b>", ParagraphStyle('s3', parent=card_title, textColor=colors.HexColor("#7C3AED")))
        ],
        [
            Paragraph("<b>Mechanism:</b> Partitioning is enforced strictly via <code>GroupShuffleSplit</code> grouped on <code>patient_id</code> (70% Train, 15% Validation, 15% Holdout Test).<br/><br/><b>Guarantee:</b> Zero individual patient observations or trajectory slices cross partition boundaries. Test metrics reflect genuine unseen generalizability.", card_body),
            Paragraph("<b>Mechanism:</b> All rolling statistics and linear regression slopes at timestamp t are computed strictly from historical window [t-24h, t].<br/><br/><b>Guarantee:</b> Zero future observations, downstream culture confirmations, or post-infection antibiotic treatments ever enter the feature matrix.", card_body),
            Paragraph("<b>Mechanism:</b> Real-time data completeness score (98.4%) dynamically scales output uncertainty intervals (±5% to ±18%).<br/><br/><b>Guarantee:</b> Telemetry missingness automatically widens uncertainty margins, preventing overconfident false alerts under missing lab feeds.", card_body)
        ]
    ]
    p14_tbl = Table(p14_cards, colWidths=[290, 290, 290])
    p14_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.white),
        ('BOX', (0,0), (-1,-1), 1, BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(p14_tbl)

    # SLIDE 15: EMPIRICAL VALIDATION (WITH ROC/PR & RELIABILITY CHART EMBEDDED)
    story.append(PageBreak())
    story.append(Paragraph("“Validation on unseen patients demonstrates strong predictive and calibration performance.”", slide_headline))
    story.append(Paragraph("Empirical Metric Transparency Across 3 Evaluated Model Architectures", slide_subheadline))
    val_text = [
        Paragraph("<b>Primary Calibrated XGBoost:</b><br/>"
                  "• <b>AUROC:</b> 0.9695<br/>"
                  "• <b>AUPRC (Primary):</b> <font color='#059669'><b>0.8877</b></font><br/>"
                  "• <b>F1-Score:</b> 0.8608<br/>"
                  "• <b>Sensitivity @ 85% Spec:</b> 0.9417<br/>"
                  "• <b>Brier Score:</b> 0.0102<br/>"
                  "• <b>ECE Calibration:</b> <font color='#0284C7'><b>0.0097</b></font><br/><br/>"
                  "<b>Benchmark Comparison:</b><br/>"
                  "• Random Forest: AUROC 0.9756, AUPRC 0.8609, ECE 0.0184<br/>"
                  "• Logistic Reg: AUROC 0.9481, AUPRC 0.7698, ECE 0.0241", card_body)
    ]
    val_chart = make_img("viz_model_calibration_roc_pr.png", 5.8, 3.6)
    s15_tbl = Table([[val_text, val_chart]], colWidths=[360, 528])
    s15_tbl.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (0,0), (0,0), colors.white),
        ('BOX', (0,0), (0,0), 1, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(s15_tbl)

    # SLIDE 16: DATASET PIPELINE
    story.append(PageBreak())
    story.append(Paragraph("“Validation is built around patient-level separation and clinically grounded labeling.”", slide_headline))
    story.append(Paragraph("Cohort Generation, Physiological Realism & De-Identification Safeguards", slide_subheadline))
    cohort_stats = [
        [
            Paragraph("<b>250 PATIENTS</b><br/><font color='#64748B'>Synthetic Cohort</font>", card_title),
            Paragraph("<b>21,358 RECORDS</b><br/><font color='#64748B'>Longitudinal Observations</font>", card_title),
            Paragraph("<b>168 HOURS MAX</b><br/><font color='#64748B'>ICU Length of Stay</font>", card_title),
            Paragraph("<b>0% PHI (DE-ID)</b><br/><font color='#64748B'>HIPAA Compliant</font>", card_title)
        ]
    ]
    cohort_tbl = Table(cohort_stats, colWidths=[218, 218, 218, 218])
    cohort_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.white),
        ('BOX', (0,0), (-1,-1), 1, BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(cohort_tbl)
    story.append(Spacer(1, 8))

    data_desc = [
        [
            Paragraph("<b>Physiologically Realistic Vital Autocorrelation</b><br/>Longitudinal hourly vitals modeled with stochastic Gaussian random walks, physiological bounds, and cross-variable correlations (e.g. pyrexia induces tachycardia and tachypnea).", card_body),
            Paragraph("<b>Invasive Device Exposure Modeling</b><br/>Indwelling Central Venous Catheters (CVC), Foley urinary catheters, and mechanical ventilators track dwell hours. Risk accumulates non-linearly with dwell duration.", card_body),
            Paragraph("<b>HIPAA De-Identification Disclosure</b><br/>All 250 cohort patients, MRNs, and encounter IDs are synthetic de-identified profiles. Zero real patient records were extracted, strictly satisfying privacy and ethics protocols.", card_body)
        ]
    ]
    data_desc_tbl = Table(data_desc, colWidths=[290, 290, 290])
    data_desc_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.white),
        ('BOX', (0,0), (-1,-1), 1, BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(data_desc_tbl)

    # SLIDE 17: MILESTONES
    story.append(PageBreak())
    story.append(Paragraph("“From architecture to a fully integrated offline command center.”", slide_headline))
    story.append(Paragraph("Concrete Deliverables & Verified Implementation Milestones", slide_subheadline))
    mile_data = [
        [Paragraph("Milestone Phase", tbl_hdr), Paragraph("Key Technical Deliverables", tbl_hdr), Paragraph("Verification Evidence & Status", tbl_hdr)],
        [
            Paragraph("<b>Phase 1: Architecture & Data Pipeline</b>", tbl_cell_bold),
            Paragraph("CDC NHSN cohort generation (250 pts, 21k obs), causal rolling feature engine, SQLite/PostgreSQL schemas.", tbl_cell),
            Paragraph("<font color='#059669'><b>COMPLETED • 100% Verified</b></font>", tbl_cell_bold)
        ],
        [
            Paragraph("<b>Phase 2: ML Training & Calibration</b>", tbl_cell_bold),
            Paragraph("Patient GroupShuffleSplit, XGBoost/RF/Logistic training, Isotonic calibration (ECE 0.0097), TreeSHAP explainer.", tbl_cell),
            Paragraph("<font color='#059669'><b>COMPLETED • AUROC 0.9695</b></font>", tbl_cell_bold)
        ],
        [
            Paragraph("<b>Phase 3: Dynamic Trajectory & Radar</b>", tbl_cell_bold),
            Paragraph("Discrete calculus (v12h, a12h), rapid escalation alerts, spatial ward risk density & cluster radar algorithm.", tbl_cell),
            Paragraph("<font color='#059669'><b>COMPLETED • Tested</b></font>", tbl_cell_bold)
        ],
        [
            Paragraph("<b>Phase 4: Full-Stack Command Center</b>", tbl_cell_bold),
            Paragraph("React 18 + Vite UI, Recharts trajectory visualization, What-If simulator, immutable audit trail ledger.", tbl_cell),
            Paragraph("<font color='#059669'><b>COMPLETED • Zero Build Errors</b></font>", tbl_cell_bold)
        ],
        [
            Paragraph("<b>Phase 5: Deterministic Hackathon Demo</b>", tbl_cell_bold),
            Paragraph("Offline-ready 90s judge demo controller with playback controls, animated risk meters & rounding list.", tbl_cell),
            Paragraph("<font color='#059669'><b>COMPLETED • /demo Live</b></font>", tbl_cell_bold)
        ],
        [
            Paragraph("<b>Phase 6: Clinical Deployment Roadmap</b>", tbl_cell_bold),
            Paragraph("FHIR / HL7 EHR connector pipeline, multicenter silent clinical validation, bedside tablet rollout.", tbl_cell),
            Paragraph("<b>FUTURE / PROPOSED</b>", tbl_cell)
        ]
    ]
    mile_tbl = Table(mile_data, colWidths=[180, 520, 188])
    mile_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(mile_tbl)

    # SLIDE 18: PRODUCT INTERFACE SHOWCASE (WITH 4 LIVE SCREENSHOTS)
    story.append(PageBreak())
    story.append(Paragraph("“An intelligence command center — not just a model.”", slide_headline))
    story.append(Paragraph("Real Implementation Interfaces Built for Infection-Prevention Teams", slide_subheadline))
    img_ptraj = make_img("03_patient_trajectory.png", 5.9, 1.8)
    img_cluster = make_img("05_cluster_radar.png", 5.9, 1.8)
    img_sim = make_img("07_scenario_simulator.png", 5.9, 1.8)
    img_audit = make_img("08_audit_trail.png", 5.9, 1.8)
    s18_grid = [
        [img_ptraj, img_cluster],
        [img_sim, img_audit]
    ]
    s18_tbl = Table(s18_grid, colWidths=[444, 444])
    s18_tbl.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(s18_tbl)

    # SLIDE 19: ETHICS & LIMITATIONS
    story.append(PageBreak())
    story.append(Paragraph("“Built with clinical restraint: assist decisions, never replace them.”", slide_headline))
    story.append(Paragraph("Ethical Governance Framework, Clinical Boundaries & Transparent Limitations", slide_subheadline))
    eth_cards = [
        [
            Paragraph("<b>1. Clinical Decision Support Only</b><br/>HAI-Sentinel assists infection preventionists and ICU rounding teams in prioritizing workflows. It <b>DOES NOT</b> provide clinical diagnoses or replace medical professionals.", card_body),
            Paragraph("<b>2. No Definitive Diagnosis Claim</b><br/>Risk trajectory probability is an early-warning signal, not a microbiological culture confirmation. Alerts trigger diagnostic review, not blind treatments.", card_body),
            Paragraph("<b>3. Non-Causal Scenario Framing</b><br/>The What-If Simulator describes mathematical tree model sensitivities. It is explicitly labeled: <i>'MODEL-BASED SIMULATION — NOT A CAUSAL PREDICTION.'</i>", card_body)
        ],
        [
            Paragraph("<b>4. Zero-PHI Synthetic Privacy</b><br/>All 250 cohort patients and MRNs are synthetic de-identified profiles. No protected health information was used, strictly complying with HIPAA guidelines.", card_body),
            Paragraph("<b>5. Cryptographic Auditability</b><br/>Every inference, what-if run, and clinician rounding acknowledgment is cryptographically timestamped in an immutable audit ledger (/api/audit).", card_body),
            Paragraph("<b>6. Transparent Limitations</b><br/>• Requires prospective multicenter clinical validation.<br/>• Developed on synthetic/de-identified ICU data.<br/>• Requires institutional EHR integration (FHIR/HL7).", card_body)
        ]
    ]
    eth_tbl = Table(eth_cards, colWidths=[290, 290, 290])
    eth_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.white),
        ('BOX', (0,0), (-1,-1), 1, BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(eth_tbl)

    # SLIDE 20: FUTURE ROADMAP
    story.append(PageBreak())
    story.append(Paragraph("“From offline prototype to clinically validated prevention intelligence.”", slide_headline))
    story.append(Paragraph("Four-Stage Translation Roadmap & Final Value Proposition", slide_subheadline))
    road_data = [
        [
            Paragraph("<b>STAGE 1 • NOW</b><br/><font color='#0284C7'><b>Offline Command Center</b></font><br/>• Calibrated XGBoost engine<br/>• Deterministic 90s demo<br/>• Trajectory &amp; SHAP visualizer<br/>• 100% Air-gapped operational", card_body),
            Paragraph("<b>STAGE 2 • NEXT</b><br/><font color='#059669'><b>Silent Prospective Validation</b></font><br/>• Real-world EHR shadow testing<br/>• Zero clinical disruption<br/>• Model drift monitoring<br/>• False alarm rate profiling", card_body),
            Paragraph("<b>STAGE 3 • INTEGRATION</b><br/><font color='#7C3AED'><b>EHR &amp; Bedside Connectivity</b></font><br/>• HL7 / FHIR connector pipeline<br/>• Epic / Cerner EHR integration<br/>• Bedside tablet rounding app<br/>• Automated lab feed ingestion", card_body),
            Paragraph("<b>STAGE 4 • SCALE</b><br/><font color='#E11D48'><b>Multicenter Impact Trial</b></font><br/>• Randomized controlled trial<br/>• Measure CLABSI/CAUTI rate drops<br/>• ICU stay length reduction<br/>• Health economics validation", card_body)
        ]
    ]
    road_tbl = Table(road_data, colWidths=[218, 218, 218, 218])
    road_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.white),
        ('BOX', (0,0), (-1,-1), 1, BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(road_tbl)
    story.append(Spacer(1, 8))

    closing_text = (
        "<b>WHY HAI-SENTINEL MATTERS:</b><br/>"
        "HAI-Sentinel does not wait for the final microbiological confirmation after septic cascades have started. "
        "It continuously asks: <i>What is changing? Why is risk rising? Where is risk concentrating? Who needs attention next?</i><br/><br/>"
        "<b>PREDICT &nbsp; &rarr; &nbsp; EXPLAIN &nbsp; &rarr; &nbsp; TRACK &nbsp; &rarr; &nbsp; PRIORITIZE &nbsp; &rarr; &nbsp; PREVENT</b>"
    )
    closing_tbl = Table([[Paragraph(closing_text, ParagraphStyle('CT', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=12, textColor=colors.white, alignment=1))]], colWidths=[888])
    closing_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), NAVY),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#38BDF8")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(closing_tbl)

    doc.build(story, canvasmaker=NumberedSlideCanvas)
    print(f"Rich Visual Presentation PDF generated successfully at: {os.path.abspath(output_pdf)}")
    return os.path.abspath(output_pdf)


if __name__ == "__main__":
    out_pdf = "HAI_SENTINEL_Official_Presentation.pdf"
    build_pdf_deck(out_pdf)
