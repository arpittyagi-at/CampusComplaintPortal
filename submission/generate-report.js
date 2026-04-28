const fs = require('fs');
const path = require('path');
const {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  PageNumber,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableOfContents,
  TableRow,
  TextRun,
  WidthType
} = require('docx');

const outputPath = path.join(__dirname, 'Smart_Campus_Project_Report_Final.docx');

const lineSpacing = { line: 360 }; // 1.5 spacing

function body(text, options = {}) {
  return new Paragraph({
    spacing: lineSpacing,
    alignment: AlignmentType.JUSTIFIED,
    children: [
      new TextRun({
        text,
        size: 24,
        font: 'Times New Roman',
        ...options
      })
    ]
  });
}

function heading1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 120, line: 360 },
    thematicBreak: false
  });
}

function heading2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 180, after: 80, line: 360 }
  });
}

function centered(text, opts = {}) {
  return new Paragraph({
    spacing: lineSpacing,
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text,
        font: 'Times New Roman',
        size: opts.size || 24,
        bold: Boolean(opts.bold)
      })
    ]
  });
}

function blankLine() {
  return new Paragraph({ spacing: { line: 360 }, children: [new TextRun({ text: '', font: 'Times New Roman', size: 24 })] });
}

function screenshotBox(label, heightTwips = 2200) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        height: { value: heightTwips },
        children: [
          new TableCell({
            borders: {
              top: { style: BorderStyle.SINGLE, size: 8, color: '666666' },
              bottom: { style: BorderStyle.SINGLE, size: 8, color: '666666' },
              left: { style: BorderStyle.SINGLE, size: 8, color: '666666' },
              right: { style: BorderStyle.SINGLE, size: 8, color: '666666' }
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: lineSpacing,
                children: [
                  new TextRun({
                    text: `[${label}]`,
                    italics: true,
                    color: '555555',
                    font: 'Times New Roman',
                    size: 24
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

function bullet(text) {
  return new Paragraph({
    spacing: lineSpacing,
    alignment: AlignmentType.JUSTIFIED,
    bullet: { level: 0 },
    children: [new TextRun({ text, font: 'Times New Roman', size: 24 })]
  });
}

function testCaseTable() {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({ children: [centered('Test ID', { bold: true })] }),
          new TableCell({ children: [centered('Test Scenario', { bold: true })] }),
          new TableCell({ children: [centered('Expected Result', { bold: true })] }),
          new TableCell({ children: [centered('Actual Result', { bold: true })] }),
          new TableCell({ children: [centered('Status', { bold: true })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [body('TC-01')] }),
          new TableCell({ children: [body('Student login with valid credentials')] }),
          new TableCell({ children: [body('User redirected to student dashboard')] }),
          new TableCell({ children: [body('User redirected successfully')] }),
          new TableCell({ children: [body('Pass')] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [body('TC-02')] }),
          new TableCell({ children: [body('Create complaint from student panel')] }),
          new TableCell({ children: [body('New complaint record saved in database')] }),
          new TableCell({ children: [body('Record inserted and displayed')] }),
          new TableCell({ children: [body('Pass')] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [body('TC-03')] }),
          new TableCell({ children: [body('Admin updates complaint status and priority')] }),
          new TableCell({ children: [body('Status and priority update reflected in list')] }),
          new TableCell({ children: [body('Updated values visible immediately')] }),
          new TableCell({ children: [body('Pass')] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [body('TC-04')] }),
          new TableCell({ children: [body('Admin exports complaint records as CSV')] }),
          new TableCell({ children: [body('CSV file downloaded with filtered data')] }),
          new TableCell({ children: [body('CSV download successful')] }),
          new TableCell({ children: [body('Pass')] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [body('TC-05')] }),
          new TableCell({ children: [body('Unauthorized API access without login')] }),
          new TableCell({ children: [body('Access denied with 401/403 response')] }),
          new TableCell({ children: [body('Unauthorized blocked successfully')] }),
          new TableCell({ children: [body('Pass')] })
        ]
      })
    ]
  });
}

const children = [
  centered('SMART CAMPUS COMPLAINT & SERVICE MANAGEMENT PORTAL', { bold: true, size: 36 }),
  blankLine(),
  centered('Project Report', { bold: true, size: 30 }),
  blankLine(),
  blankLine(),
  centered('Submitted by: Shiv Shankar', { size: 26 }),
  centered('Roll No: ___________________________', { size: 24 }),
  centered('Department: Electronics & Communication Engineering', { size: 24 }),
  centered('Year: 3rd Year', { size: 24 }),
  centered('College Name: ___________________________', { size: 24 }),
  centered('Session: 2025-2026', { size: 24 }),
  centered('Guide Name: ___________________________', { size: 24 }),
  new Paragraph({ pageBreakBefore: true }),

  centered('CERTIFICATE', { bold: true, size: 30 }),
  blankLine(),
  body('This is to certify that Mr. Shiv Shankar, student of 3rd Year, Electronics & Communication Engineering, has successfully completed the project titled "Smart Campus Complaint & Service Management Portal" under my supervision in partial fulfillment of the requirements for the degree/course. The work presented in this report is original and has been carried out by the student during the academic session 2025-2026.'),
  blankLine(),
  body('Guide Signature: ___________________________'),
  body('Head of Department: _______________________'),
  body('Date: ___________________________'),
  new Paragraph({ pageBreakBefore: true }),

  centered('DECLARATION', { bold: true, size: 30 }),
  blankLine(),
  body('I, Shiv Shankar, hereby declare that the project work entitled "Smart Campus Complaint & Service Management Portal" submitted by me is an original work carried out under the guidance of the concerned faculty member. This report has not been submitted to any other university or institution for the award of any degree or diploma.'),
  blankLine(),
  body('Signature of Student: _______________________'),
  body('Name: Shiv Shankar'),
  body('Date: _______________________'),
  new Paragraph({ pageBreakBefore: true }),

  centered('ACKNOWLEDGEMENT', { bold: true, size: 30 }),
  blankLine(),
  body('I express my sincere gratitude to my project guide, faculty members of the Electronics & Communication Engineering Department, and my college administration for their continuous support, guidance, and encouragement in completing this project. I also thank my peers and family for their motivation and valuable feedback throughout the development and documentation phases.'),
  new Paragraph({ pageBreakBefore: true }),

  centered('ABSTRACT', { bold: true, size: 30 }),
  blankLine(),
  body('The Smart Campus Complaint & Service Management Portal is an individual full-stack web application designed to digitize complaint handling in college campuses. The system provides dedicated dashboards for students and administrators with role-based access control. Students can register complaints, track status, edit profile details, and view activity notifications. Administrators can monitor all complaints, perform search and filtering, assign priorities, update statuses, remove records when required, and export data as CSV.'),
  body('The application is implemented using HTML5, CSS3, and Vanilla JavaScript on the frontend, with Node.js and Express.js on the backend. SQLite is used as the SQL database for persistent storage, and Chart.js supports analytics visualization. The project demonstrates complete CRUD operations, session-based authentication, responsive UI design, and practical deployment readiness.'),
  new Paragraph({ pageBreakBefore: true }),

  centered('TABLE OF CONTENTS', { bold: true, size: 30 }),
  blankLine(),
  new TableOfContents('Index', {
    hyperlink: true,
    headingStyleRange: '1-2',
    rightTabStop: 9000
  }),
  new Paragraph({ pageBreakBefore: true }),

  heading1('Chapter 1: Introduction'),
  heading2('1.1 Background'),
  body('In higher education institutions, complaint handling is a vital service process influencing student satisfaction and campus operations. Traditional methods involving manual registers, informal communication, and unstructured escalation often create inefficiency and delay.'),
  heading2('1.2 Need for System'),
  body('A digital complaint portal is necessary to provide traceability, accountability, and quick response. A centralized system ensures all complaints are logged, monitored, and resolved through a transparent workflow.'),
  heading2('1.3 Problem Statement'),
  body('The absence of an integrated complaint management platform causes delayed issue resolution, poor visibility, inconsistent prioritization, and limited administrative insight.'),
  heading2('1.4 Existing System Limitations'),
  bullet('Manual recording leads to missing or duplicate entries.'),
  bullet('Students cannot track real-time complaint progress.'),
  bullet('No role-based dashboard for academic administration.'),
  bullet('Lack of historical analytics and reporting export.'),
  heading2('1.5 Proposed Solution'),
  body('The proposed portal offers role-based authentication, complaint lifecycle management, SQL CRUD operations, analytics visualization, and export capabilities through a modern responsive interface.'),
  new Paragraph({ pageBreakBefore: true }),

  heading1('Chapter 2: Objectives'),
  heading2('2.1 Primary Objectives'),
  bullet('Implement a complete full-stack complaint system with SQL CRUD operations.'),
  bullet('Provide dedicated student and admin modules with secure role control.'),
  bullet('Ensure data consistency and traceability through structured database design.'),
  heading2('2.2 Secondary Objectives'),
  bullet('Deliver responsive and premium UI with usability-focused interactions.'),
  bullet('Provide analytics dashboard and export-ready reporting features.'),
  bullet('Prepare deployment-ready architecture for online hosting.'),
  new Paragraph({ pageBreakBefore: true }),

  heading1('Chapter 3: Literature Review'),
  body('Existing literature and practical systems in digital grievance management indicate that role-based workflow systems improve service quality and accountability. Modern campus portals integrate authentication, ticketing, and reporting to reduce complaint turnaround time.'),
  body('Studies and platform documentation in web engineering recommend separating presentation, business logic, and data access layers for maintainability. SQL-based persistence remains a preferred approach for transactional data in educational administration applications due to reliability and simple relational modeling.'),
  body('This project aligns with these findings by combining modular architecture, relational storage, dashboard analytics, and secure access control.'),
  new Paragraph({ pageBreakBefore: true }),

  heading1('Chapter 4: System Analysis & Design'),
  heading2('4.1 Functional Requirements'),
  bullet('Student registration and login.'),
  bullet('Complaint creation, viewing, updating, and deletion (with constraints).'),
  bullet('Admin complaint monitoring, filtering, status update, and export.'),
  bullet('Dashboard statistics and activity logs.'),
  heading2('4.2 Non-functional Requirements'),
  bullet('Responsiveness across desktop and mobile devices.'),
  bullet('Secure session handling with protected routes.'),
  bullet('Readable, maintainable code organization.'),
  bullet('Consistent UI performance and user feedback via toasts/loaders.'),
  heading2('4.3 Use Case Diagram'),
  screenshotBox('Insert Use Case Diagram Here', 1600),
  heading2('4.4 Data Flow Diagram'),
  screenshotBox('Insert Data Flow Diagram Here', 1600),
  heading2('4.5 System Architecture'),
  body('Architecture Flow: Student/Admin Client -> Frontend (HTML/CSS/JS) -> Express API Layer -> SQLite Database. The architecture follows a clean separation of concerns using routes, middleware, and model-level SQL operations.'),
  screenshotBox('Insert System Architecture Diagram Here', 1800),
  new Paragraph({ pageBreakBefore: true }),

  heading1('Chapter 5: Technology Used'),
  heading2('HTML5'),
  body('Used to structure pages for authentication, dashboards, forms, tables, and analytics sections with semantic layout.'),
  heading2('CSS3'),
  body('Used for premium visual styling including responsive layouts, card systems, dark mode support, and consistent design language.'),
  heading2('JavaScript'),
  body('Used for client-side interactivity, API integration, form handling, filtering logic, dynamic rendering, and state-driven updates.'),
  heading2('Node.js'),
  body('Provides JavaScript runtime environment for backend execution and non-blocking server operations.'),
  heading2('Express.js'),
  body('Used to build REST APIs, route organization, middleware handling, session-based authentication, and error responses.'),
  heading2('SQLite'),
  body('Used as lightweight SQL relational database for storing users, complaints, and activity logs with structured queries.'),
  heading2('Chart.js'),
  body('Used for plotting monthly complaint trends in admin analytics dashboard.'),
  new Paragraph({ pageBreakBefore: true }),

  heading1('Chapter 6: Database Design'),
  heading2('6.1 Table: users'),
  body('Stores student and admin account information including role for access control. Primary Key: id.'),
  heading2('6.2 Table: complaints'),
  body('Stores complaint metadata and resolution lifecycle. Primary Key: id. Foreign Key: user_id references users.id.'),
  heading2('6.3 Table: activity_logs'),
  body('Stores significant actions in the system for traceability and operational visibility. Primary Key: id.'),
  heading2('6.4 Relationship and Schema Explanation'),
  body('One user can create multiple complaints, resulting in a one-to-many relationship between users and complaints. activity_logs table is used for event tracking independent of complaint ownership.'),
  screenshotBox('Insert ER Diagram Here', 1800),
  new Paragraph({ pageBreakBefore: true }),

  heading1('Chapter 7: Module Description'),
  heading2('7.1 Student Module'),
  bullet('Signup/Login: Access portal with secure session handling.'),
  bullet('Raise Complaint: Register category-wise complaint with description.'),
  bullet('Track Status: Monitor complaint states (Pending/In Progress/Resolved).'),
  bullet('Dashboard: View personal complaint statistics.'),
  bullet('Profile: Update personal account information.'),
  heading2('7.2 Admin Module'),
  bullet('Admin Login with role validation.'),
  bullet('View all complaints with complete listing.'),
  bullet('Search and filter by title/category/status.'),
  bullet('Update complaint status and assign priority.'),
  bullet('Delete complaint records as required.'),
  bullet('Export complaint data as CSV.'),
  bullet('View analytics cards and monthly chart trends.'),
  new Paragraph({ pageBreakBefore: true }),

  heading1('Chapter 8: Implementation / Screenshots'),
  screenshotBox('Insert Home Page Screenshot Here'),
  blankLine(),
  screenshotBox('Insert Student Dashboard Screenshot Here'),
  blankLine(),
  screenshotBox('Insert Raise Complaint Screenshot Here'),
  blankLine(),
  screenshotBox('Insert Admin Dashboard Screenshot Here'),
  blankLine(),
  screenshotBox('Insert Analytics Screenshot Here'),
  blankLine(),
  screenshotBox('Insert Dark Mode Screenshot Here'),
  new Paragraph({ pageBreakBefore: true }),

  heading1('Chapter 9: Testing'),
  heading2('9.1 Unit Testing'),
  body('Model-level query functions and route handlers were validated for expected input-output behavior.'),
  heading2('9.2 Functional Testing'),
  body('Core workflows for student complaint lifecycle and admin management were tested end-to-end.'),
  heading2('9.3 UI Testing'),
  body('Layout responsiveness, table rendering, forms, toast notifications, and dark mode transitions were checked on common viewport sizes.'),
  heading2('9.4 Authentication Testing'),
  body('Session-based login flow and protected route restrictions were verified for student and admin roles.'),
  heading2('9.5 CRUD Testing'),
  body('Create, Read, Update, and Delete operations were validated with SQL persistence checks.'),
  blankLine(),
  testCaseTable(),
  new Paragraph({ pageBreakBefore: true }),

  heading1('Chapter 10: Results & Discussion'),
  body('The system executed successfully in local and deployment-ready environments. Student and admin workflows functioned as expected with correct role-based restrictions. SQL operations were consistent and reflected in dashboards and reports.'),
  body('The portal significantly improves complaint process visibility and management efficiency. The analytics panel and CSV export provide practical administrative value, while the student interface improves transparency and trust in service operations.'),
  new Paragraph({ pageBreakBefore: true }),

  heading1('Chapter 11: Future Scope'),
  bullet('Mobile application support for Android/iOS.'),
  bullet('Email/SMS notifications for complaint lifecycle events.'),
  bullet('AI-assisted complaint routing and categorization.'),
  bullet('QR-based instant complaint submission for campus facilities.'),
  bullet('Extended hostel-specific and transport-specific service modules.'),
  new Paragraph({ pageBreakBefore: true }),

  heading1('Chapter 12: Conclusion'),
  body('The Smart Campus Complaint & Service Management Portal fulfills the objectives of an individual full-stack academic project with real SQL-backed CRUD implementation, role-based security, and modern UI/UX. The system demonstrates practical applicability in campus administration and provides a strong foundation for advanced smart-campus service management solutions.'),
  new Paragraph({ pageBreakBefore: true }),

  heading1('References'),
  body('1. Node.js Official Documentation. https://nodejs.org/docs'),
  body('2. Express.js Official Documentation. https://expressjs.com'),
  body('3. SQLite Documentation. https://sqlite.org/docs.html'),
  body('4. Chart.js Documentation. https://www.chartjs.org/docs/'),
  body('5. MDN Web Docs (HTML, CSS, JavaScript). https://developer.mozilla.org')
];

const doc = new Document({
  features: { updateFields: true },
  styles: {
    default: {
      document: {
        run: {
          font: 'Times New Roman',
          size: 24
        },
        paragraph: {
          spacing: lineSpacing,
          alignment: AlignmentType.JUSTIFIED
        }
      }
    },
    paragraphStyles: [
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { font: 'Times New Roman', size: 32, bold: true },
        paragraph: { spacing: { before: 240, after: 120, line: 360 } }
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { font: 'Times New Roman', size: 28, bold: true },
        paragraph: { spacing: { before: 180, after: 80, line: 360 } }
      }
    ]
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: 1440,
            right: 1440,
            bottom: 1440,
            left: 1440
          }
        }
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { line: 240 },
              children: [
                new TextRun({ text: 'Page ', font: 'Times New Roman', size: 24 }),
                new TextRun({ children: [PageNumber.CURRENT], font: 'Times New Roman', size: 24 })
              ]
            })
          ]
        })
      },
      children
    }
  ]
});

Packer.toBuffer(doc)
  .then((buffer) => {
    fs.writeFileSync(outputPath, buffer);
    console.log('Report generated:', outputPath);
  })
  .catch((error) => {
    console.error('Failed to generate report:', error);
    process.exit(1);
  });
