from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER

def create_resume():
    doc = SimpleDocTemplate("../public/meenal_resume.pdf", pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        alignment=TA_CENTER,
        fontSize=24,
        spaceAfter=12
    )
    heading_style = ParagraphStyle(
        'HeadingStyle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor='#2B547E',
        spaceBefore=12,
        spaceAfter=6
    )
    body_style = styles['Normal']
    
    flowables = []
    
    # Header
    flowables.append(Paragraph("Meenal Pande", title_style))
    flowables.append(Paragraph("meenal.pande@berkeley.edu | (555) 123-4567 | San Francisco, CA | linkedin.com/in/meenalpande", ParagraphStyle('Contact', parent=styles['Normal'], alignment=TA_CENTER)))
    flowables.append(Spacer(1, 20))
    
    # Summary
    flowables.append(Paragraph("PROFESSIONAL SUMMARY", heading_style))
    flowables.append(Paragraph("Software Engineer and Technical Consultant with 2+ years of experience post-graduation from UC Berkeley. Proven track record in full-stack development, distributed systems, and cloud architecture via internships at Microsoft and Tencent. Currently working as an independent consultant helping early-stage startups scale their backend infrastructure, and eager to transition back into a full-time engineering role within a high-growth tech environment.", body_style))
    flowables.append(Spacer(1, 10))
    
    # Experience
    flowables.append(Paragraph("EXPERIENCE", heading_style))
    
    flowables.append(Paragraph("<b>Independent Technical Consultant</b> | <i>San Francisco, CA</i> | Oct 2024 - Present", body_style))
    flowables.append(ListFlowable([
        ListItem(Paragraph("Architected and deployed scalable microservices using Go and Docker for 3 early-stage SaaS startups.", body_style)),
        ListItem(Paragraph("Optimized PostgreSQL database queries, reducing average API response times by 40%.", body_style)),
        ListItem(Paragraph("Implemented CI/CD pipelines using GitHub Actions, ensuring zero-downtime deployments.", body_style))
    ], bulletType='bullet'))
    flowables.append(Spacer(1, 6))

    flowables.append(Paragraph("<b>Software Engineering Intern</b> | <i>Microsoft (Azure Team)</i> | <i>Redmond, WA</i> | May 2023 - Aug 2023", body_style))
    flowables.append(ListFlowable([
        ListItem(Paragraph("Developed internal dashboard tools using React and TypeScript to monitor Azure Kubernetes Service (AKS) cluster health.", body_style)),
        ListItem(Paragraph("Created automated testing scripts in Python, improving code coverage by 15%.", body_style)),
        ListItem(Paragraph("Collaborated closely with product managers and cross-functional engineering teams in an Agile environment.", body_style))
    ], bulletType='bullet'))
    flowables.append(Spacer(1, 6))
    
    flowables.append(Paragraph("<b>Software Engineering Intern</b> | <i>Tencent</i> | <i>Shenzhen, China (Remote)</i> | May 2022 - Aug 2022", body_style))
    flowables.append(ListFlowable([
        ListItem(Paragraph("Assisted in backend API development using C++ and Node.js for a high-traffic gaming service.", body_style)),
        ListItem(Paragraph("Built data pipeline ingestion frameworks handling over 1M+ daily telemetry events.", body_style))
    ], bulletType='bullet'))
    flowables.append(Spacer(1, 10))
    
    # Education
    flowables.append(Paragraph("EDUCATION", heading_style))
    flowables.append(Paragraph("<b>University of California, Berkeley</b> | <i>Berkeley, CA</i>", body_style))
    flowables.append(Paragraph("B.S. Electrical Engineering and Computer Sciences (EECS)", body_style))
    flowables.append(Paragraph("Graduation: May 2024 | GPA: 3.8/4.0", body_style))
    flowables.append(Spacer(1, 10))
    
    # Skills
    flowables.append(Paragraph("TECHNICAL SKILLS", heading_style))
    flowables.append(Paragraph("<b>Languages:</b> Python, JavaScript/TypeScript, Go, C++, SQL", body_style))
    flowables.append(Paragraph("<b>Frameworks/Tools:</b> React, Node.js, Docker, Kubernetes, Git, PostgreSQL", body_style))
    flowables.append(Paragraph("<b>Cloud:</b> Microsoft Azure, AWS", body_style))
    
    doc.build(flowables)
    print("meenal_resume.pdf generated.")

def create_transcript():
    doc = SimpleDocTemplate("../public/meenal_transcript.pdf", pagesize=letter)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        alignment=TA_CENTER,
        fontSize=20,
        spaceAfter=20
    )
    
    term_style = ParagraphStyle(
        'TermStyle',
        parent=styles['Heading3'],
        spaceBefore=12,
        spaceAfter=6
    )
    
    course_style = ParagraphStyle(
        'CourseStyle',
        parent=styles['Normal'],
        fontName='Courier'
    )
    
    flowables = []
    
    flowables.append(Paragraph("OFFICIAL ACADEMIC TRANSCRIPT", title_style))
    flowables.append(Paragraph("<b>Student:</b> Meenal Pande", styles['Normal']))
    flowables.append(Paragraph("<b>Institution:</b> University of California, Berkeley", styles['Normal']))
    flowables.append(Paragraph("<b>Degree:</b> B.S. Electrical Engineering and Computer Sciences", styles['Normal']))
    flowables.append(Spacer(1, 20))
    
    terms = [
        ("Fall 2020", [
            "CS 61A: Structure and Interpretation of Computer Programs - A",
            "MATH 53: Multivariable Calculus - A",
            "EE 16A: Designing Information Devices and Systems I - A-",
            "ENGLISH R1A: Reading and Composition - A"
        ]),
        ("Spring 2021", [
            "CS 61B: Data Structures - A",
            "MATH 54: Linear Algebra & Differential Equations - B+",
            "EE 16B: Designing Information Devices and Systems II - A-",
            "PHYSICS 7A: Physics for Scientists and Engineers - A"
        ]),
        ("Fall 2021", [
            "CS 61C: Machine Structures - A",
            "CS 70: Discrete Mathematics and Probability Theory - A",
            "STAT 134: Concepts of Probability - A-"
        ]),
        ("Spring 2022", [
            "CS 170: Efficient Algorithms and Intractable Problems - A",
            "CS 188: Introduction to Artificial Intelligence - A",
            "DATA 100: Principles & Techniques of Data Science - A"
        ]),
        ("Fall 2022", [
            "CS 162: Operating Systems and System Programming - A-",
            "CS 189: Introduction to Machine Learning - B+",
            "EE 120: Signals and Systems - A"
        ]),
        ("Spring 2023", [
            "CS 186: Introduction to Database Systems - A",
            "CS 161: Computer Security - A",
            "INFO 253: Web Architecture - A"
        ]),
        ("Fall 2023", [
            "CS 168: Introduction to the Internet: Architecture and Protocols - A",
            "CS 262: Advanced Topics in Computer Systems - A-",
            "EECS 151: Introduction to Digital Design and Integrated Circuits - A"
        ]),
        ("Spring 2024", [
            "CS 169A: Software Engineering - A",
            "CS 194-26: Image Manipulation and Computational Photography - A",
            "EECS 149: Introduction to Embedded Systems - A"
        ])
    ]
    
    for term, courses in terms:
        flowables.append(Paragraph(f"<b>{term}</b>", term_style))
        for course in courses:
            flowables.append(Paragraph(course, course_style))
        flowables.append(Spacer(1, 10))
        
    doc.build(flowables)
    print("meenal_transcript.pdf generated.")

if __name__ == "__main__":
    create_resume()
    create_transcript()
