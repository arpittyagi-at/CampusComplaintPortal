const fs = require('fs');
const path = require('path');
const PptxGenJS = require('pptxgenjs');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Shiv Shankar';
pptx.company = 'ECE Department';
pptx.subject = 'Full Stack Project Submission';
pptx.title = 'Smart Campus Complaint & Service Management Portal';
pptx.lang = 'en-US';
pptx.theme = {
  headFontFace: 'Aptos Display',
  bodyFontFace: 'Aptos'
};

function resolveLogoPath() {
  const preferred = [
    'srm-inner-logo.png',
    'srm-inner-logo.jpg',
    'srm-inner-logo.jpeg',
    'college-logo.png',
    'college-logo.jpg',
    'college-logo.jpeg',
    'logo.png',
    'logo.jpg',
    'logo.jpeg'
  ];

  for (const fileName of preferred) {
    const candidate = path.join(__dirname, fileName);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  const images = fs
    .readdirSync(__dirname)
    .filter((name) => /\.(png|jpg|jpeg|webp)$/i.test(name))
    .sort();

  if (images.length > 0) {
    return path.join(__dirname, images[0]);
  }

  return null;
}

const logoPath = resolveLogoPath();
const hasLogo = Boolean(logoPath);
const totalSlides = 14;

const COLORS = {
  bg: 'F6FAFF',
  panel: '1E1F26',
  panelLite: 'FFFFFF',
  accent: 'C67A2B',
  accent2: '14B8A6',
  text: '17375E',
  muted: '4B668A',
  white: 'FFFFFF',
  slate: 'C7D9EE'
};

function addTopBar(slide, title, index) {
  slide.background = { color: COLORS.bg };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.86,
    fill: { color: COLORS.panel },
    line: { color: COLORS.panel, pt: 0 }
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0.82,
    w: 13.333,
    h: 0.05,
    fill: { color: COLORS.accent },
    line: { color: COLORS.accent, pt: 0 }
  });

  slide.addText(title, {
    x: 0.45,
    y: 0.23,
    w: 8.9,
    h: 0.34,
    color: COLORS.white,
    fontSize: 19,
    bold: true
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 11.78,
    y: 0.06,
    w: 1.45,
    h: 0.74,
    fill: { color: COLORS.white },
    line: { color: 'B9BEC8', pt: 1 }
  });

  if (hasLogo) {
    slide.addImage({ path: logoPath, x: 11.84, y: 0.09, w: 1.33, h: 0.66 });
  } else {
    slide.addText('LOGO', {
      x: 11.95,
      y: 0.31,
      w: 1.1,
      h: 0.2,
      color: COLORS.panel,
      fontSize: 10,
      align: 'center',
      bold: true
    });
  }

  slide.addText(`${index}/${totalSlides}`, {
    x: 12.25,
    y: 7.2,
    w: 0.9,
    h: 0.2,
    color: '6D84A6',
    fontSize: 11,
    align: 'right'
  });

  slide.addText('Smart Campus Complaint & Service Management Portal', {
    x: 0.45,
    y: 7.2,
    w: 8.5,
    h: 0.2,
    color: '6D84A6',
    fontSize: 11
  });
}

function addBullets(slide, items, x = 0.8, y = 1.3, w = 11.7, h = 5.4, fontSize = 20) {
  const lines = items.map((item) => ({ text: item, options: { bullet: { indent: 16 } } }));
  slide.addText(lines, {
    x,
    y,
    w,
    h,
    color: COLORS.text,
    fontSize,
    breakLine: true,
    paraSpaceAfterPt: 10
  });
}

function addCard(slide, x, y, w, h, title, body) {
  slide.addShape(pptx.ShapeType.rect, {
    x,
    y,
    w,
    h,
    fill: { color: COLORS.panelLite },
    line: { color: COLORS.slate, pt: 1 }
  });
  slide.addText(title, {
    x: x + 0.2,
    y: y + 0.16,
    w: w - 0.4,
    h: 0.24,
    color: COLORS.accent,
    fontSize: 14,
    bold: true
  });
  slide.addText(body, {
    x: x + 0.2,
    y: y + 0.5,
    w: w - 0.4,
    h: h - 0.7,
    color: COLORS.text,
    fontSize: 12,
    valign: 'top'
  });
}

let slide = pptx.addSlide();
addTopBar(slide, 'Project Submission Deck', 1);
slide.addText('Smart Campus Complaint\n& Service Management Portal', {
  x: 0.75,
  y: 1.3,
  w: 7.2,
  h: 1.6,
  color: COLORS.panel,
  fontSize: 42,
  bold: true
});
slide.addText('Individual Full Stack Project | 3rd Year ECE', {
  x: 0.78,
  y: 3.2,
  w: 7.8,
  h: 0.4,
  color: COLORS.muted,
  fontSize: 18
});
addCard(slide, 0.8, 4.0, 5.8, 2.25, 'Submitted By', 'Shiv Shankar\nDepartment: Electronics & Communication Engineering\nYear: 3rd Year\nCollege: [College Name]');
addCard(slide, 6.95, 4.0, 5.6, 2.25, 'Viva Focus', 'Production-ready full stack app\nReal SQL CRUD + role-based dashboard\nDeployment-ready architecture');

slide = pptx.addSlide();
addTopBar(slide, 'Problem Statement', 2);
addBullets(slide, [
  'Traditional complaint systems in colleges are mostly manual and paper-based.',
  'Complaint handling often suffers from delayed response and unclear ownership.',
  'Students cannot track progress transparently after raising an issue.',
  'Administration lacks centralized analytics for workload and resolution trends.',
  'Result: poor service quality perception and inefficient operations.'
]);

slide = pptx.addSlide();
addTopBar(slide, 'Proposed Solution', 3);
addBullets(slide, [
  'A centralized Smart Campus Portal with separate Student and Admin workflows.',
  'Students can register complaints instantly, track status, and receive activity updates.',
  'Admins can filter, prioritize, update statuses, and export records for reporting.',
  'Analytics cards and trend charts support faster operational decision-making.',
  'End-to-end digital workflow improves transparency, speed, and accountability.'
]);

slide = pptx.addSlide();
addTopBar(slide, 'Project Objectives', 4);
addCard(slide, 0.8, 1.25, 3.95, 1.5, '01', 'Fast complaint registration');
addCard(slide, 4.9, 1.25, 3.95, 1.5, '02', 'Efficient service management');
addCard(slide, 9.0, 1.25, 3.55, 1.5, '03', 'Transparent status tracking');
addCard(slide, 0.8, 3.05, 3.95, 1.5, '04', 'Analytics-driven monitoring');
addCard(slide, 4.9, 3.05, 3.95, 1.5, '05', 'Role-based secure access');
addCard(slide, 9.0, 3.05, 3.55, 1.5, '06', 'Digital workflow modernization');
addCard(slide, 0.8, 4.85, 11.75, 1.35, 'Outcome', 'Build a serious, scalable full-stack academic product with real-world relevance and viva-ready architecture explanation.');

slide = pptx.addSlide();
addTopBar(slide, 'Technology Stack', 5);
addCard(slide, 0.8, 1.2, 2.25, 1.4, 'HTML5', 'Semantic structure\nResponsive layout');
addCard(slide, 3.25, 1.2, 2.25, 1.4, 'CSS3', 'Modern styling\nGlassmorphism UI');
addCard(slide, 5.7, 1.2, 2.25, 1.4, 'JavaScript', 'Vanilla JS logic\nClient interactions');
addCard(slide, 8.15, 1.2, 2.25, 1.4, 'Node.js', 'Runtime environment\nAPI execution');
addCard(slide, 10.6, 1.2, 1.95, 1.4, 'Express', 'Routing\nMiddleware');
addCard(slide, 0.8, 2.95, 5.85, 1.55, 'SQLite (SQL)', 'Relational schema for users, complaints, activity_logs\nPersistent local DB with SQL CRUD operations');
addCard(slide, 6.85, 2.95, 5.7, 1.55, 'Chart.js', 'Monthly trend visualization for admin analytics');
addCard(slide, 0.8, 4.85, 11.75, 1.35, 'Backend Capability Summary', 'Authentication + Protected Routes + Role Access + Search/Filter APIs + CSV Export + Activity Logging');

slide = pptx.addSlide();
addTopBar(slide, 'System Architecture', 6);
addCard(slide, 0.9, 2.0, 2.6, 1.2, 'Student', 'Signup/Login\nRaise complaint\nTrack status');
addCard(slide, 0.9, 3.5, 2.6, 1.2, 'Admin', 'Manage complaints\nUpdate priority\nAnalytics');
addShapeArrow(slide, 3.7, 2.55, 1.0, 0.45);
addShapeArrow(slide, 3.7, 4.05, 1.0, 0.45);
addCard(slide, 4.95, 2.75, 3.0, 1.55, 'Frontend', 'HTML + CSS + JS\nDashboards & forms');
addShapeArrow(slide, 8.15, 3.25, 1.0, 0.45);
addCard(slide, 9.35, 2.75, 2.7, 1.55, 'Backend API', 'Node.js + Express\nBusiness logic');
addShapeArrow(slide, 10.65, 4.6, 0.45, 0.9, 90);
addCard(slide, 9.3, 5.5, 2.8, 1.1, 'SQLite DB', 'SQL CRUD + logs');
slide.addText('Data Flow: Student/Admin -> Frontend -> API -> SQLite -> JSON Response', {
  x: 0.9,
  y: 6.85,
  w: 11.3,
  h: 0.3,
  color: COLORS.muted,
  fontSize: 12,
  italic: true
});

slide = pptx.addSlide();
addTopBar(slide, 'Database Design', 7);
addCard(slide, 0.8, 1.3, 3.7, 2.2, 'users', 'id (PK)\nname\nemail (UNIQUE)\npassword\nrole (student/admin)');
addCard(slide, 4.9, 1.3, 3.7, 2.7, 'complaints', 'id (PK)\nuser_id (FK -> users.id)\ntitle\ncategory\ndescription\nstatus\npriority\ncreated_at');
addCard(slide, 9.0, 1.3, 3.5, 2.0, 'activity_logs', 'id (PK)\naction\ncreated_at');
addShapeArrow(slide, 3.95, 2.15, 0.8, 0.4);
slide.addText('1 : N', { x: 4.2, y: 2.35, w: 0.5, h: 0.2, color: COLORS.accent2, fontSize: 11, bold: true });
addCard(slide, 0.8, 4.45, 11.75, 1.75, 'SQL Integrity + Seeds', 'Foreign-key based complaint ownership is enforced through user_id.\nStartup initializes schema and seeds default admin + demo complaint records for ready-to-present dashboard state.');

slide = pptx.addSlide();
addTopBar(slide, 'Student Module', 8);
addCard(slide, 0.8, 1.25, 3.8, 1.4, 'Authentication', 'Student signup/login with session management and protected access.');
addCard(slide, 4.9, 1.25, 3.8, 1.4, 'Raise Complaint', 'Category-based complaint form with Others manual entry support.');
addCard(slide, 9.0, 1.25, 3.55, 1.4, 'Track Status', 'View complaint list with status badges and filters.');
addCard(slide, 0.8, 2.95, 3.8, 1.4, 'Dashboard Stats', 'Total, pending, resolved, high-priority counters in real time.');
addCard(slide, 4.9, 2.95, 3.8, 1.4, 'Profile + Activity', 'Edit profile and monitor recent notification logs.');
addCard(slide, 9.0, 2.95, 3.55, 1.4, 'UX Polish', 'Dark mode, toast alerts, loaders, and empty states.');
addCard(slide, 0.8, 4.8, 11.75, 1.45, 'Screenshot Placeholder', 'Insert student dashboard screenshot here during final submission for stronger evaluation impact.');

slide = pptx.addSlide();
addTopBar(slide, 'Admin Module', 9);
addCard(slide, 0.8, 1.25, 3.7, 1.4, 'Admin Login', 'Secure admin access with role-based authorization.');
addCard(slide, 4.85, 1.25, 3.7, 1.4, 'Complaint Management', 'Search by title and filter by category/status.');
addCard(slide, 8.9, 1.25, 3.65, 1.4, 'Status/Priority', 'Update progress and assign urgency level.');
addCard(slide, 0.8, 2.95, 3.7, 1.4, 'Delete + Cleanup', 'Remove complaint records where needed.');
addCard(slide, 4.85, 2.95, 3.7, 1.4, 'CSV Export', 'Download full complaint sheet for reporting.');
addCard(slide, 8.9, 2.95, 3.65, 1.4, 'Analytics', 'Cards + monthly trend chart for monitoring.');
addCard(slide, 0.8, 4.8, 11.75, 1.45, 'Screenshot Placeholder', 'Insert admin dashboard screenshot here for viva and report consistency.');

slide = pptx.addSlide();
addTopBar(slide, 'CRUD Operations (SQL-Backed)', 10);
addCard(slide, 0.8, 1.45, 5.7, 1.3, 'CREATE', 'POST /api/complaints\nInserts new complaint rows in SQLite.');
addCard(slide, 6.85, 1.45, 5.7, 1.3, 'READ', 'GET /api/complaints and /api/admin/complaints\nFetches filtered rows for dashboards.');
addCard(slide, 0.8, 3.1, 5.7, 1.3, 'UPDATE', 'PUT routes update status, priority, title, category, description.');
addCard(slide, 6.85, 3.1, 5.7, 1.3, 'DELETE', 'DELETE routes remove complaint records with role checks.');
addCard(slide, 0.8, 4.8, 11.75, 1.45, 'API to SQL Flow', 'Routes -> Model layer -> SQL queries -> JSON responses.\nThis fulfills mandatory backend CRUD with SQL operations for academic evaluation.');

slide = pptx.addSlide();
addTopBar(slide, 'Key Features / Highlights', 11);
addBullets(slide, [
  'Role-based login system (Student/Admin) with protected routes.',
  'Search and multi-filter complaint management for faster navigation.',
  'Dark mode toggle and modern responsive dashboard UI.',
  'CSV export for institutional reporting and documentation.',
  'Real SQL backend with structured schema and activity logging.',
  'Student-friendly complaint form with custom Others category support.'
], 0.8, 1.4, 11.7, 5.4, 18);

slide = pptx.addSlide();
addTopBar(slide, 'Future Scope', 12);
addBullets(slide, [
  'Mobile application for Android/iOS complaint access.',
  'Automated email/SMS alerts for status updates.',
  'AI-based complaint routing to relevant department.',
  'Hostel and transport submodules with dedicated workflows.',
  'QR-code based complaint registration from physical locations.'
], 0.8, 1.45, 11.7, 5.2, 19);

slide = pptx.addSlide();
addTopBar(slide, 'Results / Benefits', 13);
addCard(slide, 0.8, 1.35, 3.9, 1.8, 'Operational Impact', 'Faster issue registration and improved turnaround visibility.');
addCard(slide, 4.95, 1.35, 3.9, 1.8, 'Data Quality', 'Centralized records with consistent status and priority tracking.');
addCard(slide, 9.1, 1.35, 3.45, 1.8, 'Governance', 'Audit-friendly logs and exportable datasets.');
addCard(slide, 0.8, 3.45, 11.75, 2.6, 'Benefits Summary', '1. Faster response cycle for campus complaints\n2. Better student satisfaction through transparent tracking\n3. Easier administration through dashboard analytics\n4. Stronger technical credibility in viva due to real full-stack implementation');

slide = pptx.addSlide();
addTopBar(slide, 'Thank You', 14);
slide.addText('Thank You', {
  x: 0.8,
  y: 2.1,
  w: 6.0,
  h: 0.9,
  color: COLORS.panel,
  fontSize: 54,
  bold: true
});
slide.addText('Questions & Discussion', {
  x: 0.85,
  y: 3.2,
  w: 5.5,
  h: 0.4,
  color: COLORS.accent,
  fontSize: 22,
  bold: true
});
addCard(slide, 0.8, 4.1, 5.9, 1.95, 'Presented By', 'Shiv Shankar\n3rd Year, ECE\nSmart Campus Complaint & Service Management Portal');
addCard(slide, 7.05, 4.1, 5.5, 1.95, 'Contact / Reference', 'Source code + report + deployment URL\n(to be shared during evaluation)');

function addShapeArrow(slideRef, x, y, w, h, rotate = 0) {
  slideRef.addShape(pptx.ShapeType.chevron, {
    x,
    y,
    w,
    h,
    rotate,
    fill: { color: COLORS.accent },
    line: { color: COLORS.accent, pt: 1 }
  });
}

const outputPath = path.join(__dirname, 'Full_Stack_Project_Presentation_ECE_Premium_Light_NonBlueHeader.pptx');
pptx.writeFile({ fileName: outputPath }).then(() => {
  console.log('PPT generated:', outputPath);
  if (!hasLogo) {
    console.log('Logo note: Place your attached image inside submission folder as college-logo.png (or logo.png) and rerun this script.');
  }
});
