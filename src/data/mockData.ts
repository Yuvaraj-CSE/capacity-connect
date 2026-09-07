import type {
  User, Competency, Course, Enrollment, LearningPath,
  Assessment, Certificate, Department, KnowledgeResource, RiskAlert, TrainingImpact
} from '../types';

// ─── Users ───────────────────────────────────────────────────────────────────

export const users: User[] = [
  {
    id: 'u1', name: 'Arjun Sharma', email: 'arjun@capacityconnect.in',
    role: 'learner', department: 'Engineering', position: 'Senior Software Engineer',
    avatar: 'AS', joinedDate: '2022-03-15', managerId: 'u6'
  },
  {
    id: 'u2', name: 'Priya Reddy', email: 'priya@capacityconnect.in',
    role: 'learner', department: 'Finance', position: 'Financial Analyst',
    avatar: 'PR', joinedDate: '2021-07-01', managerId: 'u7'
  },
  {
    id: 'u3', name: 'Rahul Kumar', email: 'rahul@capacityconnect.in',
    role: 'learner', department: 'Operations', position: 'Project Coordinator',
    avatar: 'RK', joinedDate: '2023-01-10', managerId: 'u8'
  },
  {
    id: 'u4', name: 'Sneha Patel', email: 'sneha@capacityconnect.in',
    role: 'learner', department: 'HR', position: 'HR Business Partner',
    avatar: 'SP', joinedDate: '2020-11-20', managerId: 'u7'
  },
  {
    id: 'u5', name: 'Vikram Singh', email: 'vikram@capacityconnect.in',
    role: 'learner', department: 'Engineering', position: 'DevOps Engineer',
    avatar: 'VS', joinedDate: '2022-09-05', managerId: 'u6'
  },
  {
    id: 'u6', name: 'Meera Nair', email: 'meera@capacityconnect.in',
    role: 'manager', department: 'Engineering', position: 'Engineering Manager',
    avatar: 'MN', joinedDate: '2019-04-12'
  },
  {
    id: 'u7', name: 'Suresh Iyer', email: 'suresh@capacityconnect.in',
    role: 'manager', department: 'Finance', position: 'Finance Director',
    avatar: 'SI', joinedDate: '2018-08-30'
  },
  {
    id: 'u8', name: 'Deepa Krishnan', email: 'deepa@capacityconnect.in',
    role: 'manager', department: 'Operations', position: 'Operations Head',
    avatar: 'DK', joinedDate: '2020-02-14'
  },
  {
    id: 'u9', name: 'Admin User', email: 'admin@capacityconnect.in',
    role: 'admin', department: 'Administration', position: 'Training & Development Manager',
    avatar: 'AU', joinedDate: '2018-01-01'
  },
];

// ─── Competencies per user ────────────────────────────────────────────────────

export const competenciesByUser: Record<string, Competency[]> = {
  u1: [
    { id: 'c1', name: 'Digital Readiness', category: 'Technology', description: 'Ability to adapt and leverage digital tools', current: 78, required: 85 },
    { id: 'c2', name: 'Data Analytics', category: 'Data', description: 'Ability to interpret and use data for decisions', current: 42, required: 75 },
    { id: 'c3', name: 'Leadership', category: 'Soft Skills', description: 'Ability to lead and inspire teams', current: 65, required: 70 },
    { id: 'c4', name: 'Communication', category: 'Soft Skills', description: 'Clear and effective professional communication', current: 81, required: 80 },
    { id: 'c5', name: 'Project Management', category: 'Management', description: 'Planning, executing, and closing projects', current: 72, required: 80 },
    { id: 'c6', name: 'Cyber Security', category: 'Technology', description: 'Understanding of security best practices', current: 55, required: 75 },
  ],
  u2: [
    { id: 'c1', name: 'Digital Readiness', category: 'Technology', description: 'Ability to adapt and leverage digital tools', current: 58, required: 75 },
    { id: 'c2', name: 'Data Analytics', category: 'Data', description: 'Ability to interpret and use data for decisions', current: 38, required: 80 },
    { id: 'c3', name: 'Leadership', category: 'Soft Skills', description: 'Ability to lead and inspire teams', current: 60, required: 65 },
    { id: 'c4', name: 'Communication', category: 'Soft Skills', description: 'Clear and effective professional communication', current: 85, required: 80 },
    { id: 'c5', name: 'Financial Analysis', category: 'Domain', description: 'Advanced financial modeling and analysis', current: 74, required: 90 },
    { id: 'c6', name: 'Compliance', category: 'Regulatory', description: 'Regulatory and policy compliance knowledge', current: 62, required: 85 },
  ],
  u3: [
    { id: 'c1', name: 'Digital Readiness', category: 'Technology', description: 'Ability to adapt and leverage digital tools', current: 65, required: 70 },
    { id: 'c2', name: 'Data Analytics', category: 'Data', description: 'Ability to interpret and use data for decisions', current: 46, required: 70 },
    { id: 'c3', name: 'Leadership', category: 'Soft Skills', description: 'Ability to lead and inspire teams', current: 74, required: 75 },
    { id: 'c4', name: 'Communication', category: 'Soft Skills', description: 'Clear and effective professional communication', current: 83, required: 80 },
    { id: 'c5', name: 'Project Management', category: 'Management', description: 'Planning, executing, and closing projects', current: 72, required: 85 },
    { id: 'c6', name: 'Process Improvement', category: 'Management', description: 'Identify and implement operational improvements', current: 60, required: 75 },
  ],
  u4: [
    { id: 'c1', name: 'Digital Readiness', category: 'Technology', description: 'Ability to adapt and leverage digital tools', current: 70, required: 75 },
    { id: 'c2', name: 'Data Analytics', category: 'Data', description: 'Ability to interpret and use data for decisions', current: 54, required: 65 },
    { id: 'c3', name: 'Leadership', category: 'Soft Skills', description: 'Ability to lead and inspire teams', current: 80, required: 80 },
    { id: 'c4', name: 'Communication', category: 'Soft Skills', description: 'Clear and effective professional communication', current: 90, required: 85 },
    { id: 'c5', name: 'Talent Management', category: 'HR', description: 'Recruiting, developing, and retaining talent', current: 78, required: 85 },
    { id: 'c6', name: 'Compliance', category: 'Regulatory', description: 'Labor laws and policy compliance', current: 72, required: 80 },
  ],
  u5: [
    { id: 'c1', name: 'Digital Readiness', category: 'Technology', description: 'Ability to adapt and leverage digital tools', current: 88, required: 90 },
    { id: 'c2', name: 'Data Analytics', category: 'Data', description: 'Ability to interpret and use data for decisions', current: 62, required: 70 },
    { id: 'c3', name: 'Leadership', category: 'Soft Skills', description: 'Ability to lead and inspire teams', current: 55, required: 65 },
    { id: 'c4', name: 'Communication', category: 'Soft Skills', description: 'Clear and effective professional communication', current: 68, required: 70 },
    { id: 'c5', name: 'Cloud & Infrastructure', category: 'Technology', description: 'Design and management of cloud systems', current: 76, required: 90 },
    { id: 'c6', name: 'Cyber Security', category: 'Technology', description: 'Understanding of security best practices', current: 71, required: 85 },
  ],
};

// ─── Courses ──────────────────────────────────────────────────────────────────

export const courses: Course[] = [
  {
    id: 'co1', title: 'Data Fundamentals for Professionals',
    description: 'Build a solid foundation in data concepts, types, and how data drives decision-making.',
    category: 'Data Analytics', duration: '3h 20m', durationMinutes: 200,
    level: 'Beginner', tags: ['data', 'analytics', 'fundamentals'],
    thumbnail: 'DA', instructor: 'Dr. Anita Rao', modules: 8,
    enrolledCount: 245, rating: 4.7, competencyIds: ['c2']
  },
  {
    id: 'co2', title: 'Excel for Business Analysis',
    description: 'Master Excel techniques used in real business analysis — pivot tables, VLOOKUP, dashboards.',
    category: 'Data Analytics', duration: '4h 10m', durationMinutes: 250,
    level: 'Intermediate', tags: ['excel', 'analysis', 'data'],
    thumbnail: 'EX', instructor: 'Rohit Mehta', modules: 10,
    enrolledCount: 312, rating: 4.5, competencyIds: ['c2']
  },
  {
    id: 'co3', title: 'Data Visualization with Power BI',
    description: 'Transform raw data into compelling visual stories using Power BI dashboards.',
    category: 'Data Analytics', duration: '5h 00m', durationMinutes: 300,
    level: 'Intermediate', tags: ['powerbi', 'visualization', 'dashboards'],
    thumbnail: 'PB', instructor: 'Kavitha Nambiar', modules: 12,
    enrolledCount: 189, rating: 4.8, competencyIds: ['c2']
  },
  {
    id: 'co4', title: 'Leadership Essentials',
    description: 'Core leadership principles: communication, delegation, conflict resolution, and team dynamics.',
    category: 'Leadership', duration: '6h 30m', durationMinutes: 390,
    level: 'Intermediate', tags: ['leadership', 'management', 'communication'],
    thumbnail: 'LE', instructor: 'Pradeep Iyengar', modules: 15,
    enrolledCount: 421, rating: 4.6, competencyIds: ['c3']
  },
  {
    id: 'co5', title: 'Effective Business Communication',
    description: 'Professional writing, presentations, and interpersonal communication for the workplace.',
    category: 'Communication', duration: '3h 00m', durationMinutes: 180,
    level: 'Beginner', tags: ['communication', 'writing', 'presentations'],
    thumbnail: 'BC', instructor: 'Shalini Verma', modules: 7,
    enrolledCount: 387, rating: 4.4, competencyIds: ['c4']
  },
  {
    id: 'co6', title: 'Project Management Professional (PMP) Prep',
    description: 'Comprehensive PMP preparation covering PM frameworks, Agile, and risk management.',
    category: 'Project Management', duration: '12h 00m', durationMinutes: 720,
    level: 'Advanced', tags: ['pmp', 'agile', 'risk', 'projects'],
    thumbnail: 'PM', instructor: 'Vinay Goswami', modules: 24,
    enrolledCount: 156, rating: 4.9, competencyIds: ['c5']
  },
  {
    id: 'co7', title: 'Cybersecurity Awareness',
    description: 'Essential cyber hygiene, phishing, password security, and threat awareness for all employees.',
    category: 'Cyber Security', duration: '2h 00m', durationMinutes: 120,
    level: 'Beginner', tags: ['security', 'phishing', 'cyber'],
    thumbnail: 'CS', instructor: 'Aditya Bhatt', modules: 6,
    enrolledCount: 534, rating: 4.3, competencyIds: ['c6']
  },
  {
    id: 'co8', title: 'Cloud Infrastructure Fundamentals',
    description: 'AWS, Azure, and GCP fundamentals. Design resilient, scalable cloud architectures.',
    category: 'Technology', duration: '8h 00m', durationMinutes: 480,
    level: 'Intermediate', tags: ['cloud', 'aws', 'azure', 'infrastructure'],
    thumbnail: 'CI', instructor: 'Naveen Subramaniam', modules: 18,
    enrolledCount: 203, rating: 4.7, competencyIds: ['c5', 'c1']
  },
  {
    id: 'co9', title: 'Digital Tools Mastery',
    description: 'Boost productivity with modern digital collaboration tools: Slack, Notion, Google Workspace.',
    category: 'Digital Skills', duration: '2h 30m', durationMinutes: 150,
    level: 'Beginner', tags: ['digital', 'productivity', 'tools'],
    thumbnail: 'DT', instructor: 'Ranjitha Kulkarni', modules: 6,
    enrolledCount: 445, rating: 4.2, competencyIds: ['c1']
  },
  {
    id: 'co10', title: 'Advanced Analytics & Interpretation',
    description: 'Statistical thinking, predictive analytics, and data-driven decision-making for managers.',
    category: 'Data Analytics', duration: '6h 00m', durationMinutes: 360,
    level: 'Advanced', tags: ['analytics', 'statistics', 'advanced', 'data'],
    thumbnail: 'AA', instructor: 'Dr. Anita Rao', modules: 14,
    enrolledCount: 98, rating: 4.8, competencyIds: ['c2']
  },
  {
    id: 'co11', title: 'Financial Analysis & Modeling',
    description: 'Advanced financial modeling, valuation techniques, and scenario analysis.',
    category: 'Finance', duration: '7h 00m', durationMinutes: 420,
    level: 'Advanced', tags: ['finance', 'modeling', 'valuation'],
    thumbnail: 'FA', instructor: 'CA Deepak Jain', modules: 16,
    enrolledCount: 87, rating: 4.9, competencyIds: ['c5']
  },
  {
    id: 'co12', title: 'Regulatory Compliance Essentials',
    description: 'Understanding compliance frameworks, GDPR, labor laws, and audit readiness.',
    category: 'Compliance', duration: '3h 30m', durationMinutes: 210,
    level: 'Intermediate', tags: ['compliance', 'legal', 'regulatory', 'audit'],
    thumbnail: 'RC', instructor: 'Adv. Suchitra Patil', modules: 9,
    enrolledCount: 267, rating: 4.5, competencyIds: ['c6']
  },
];

// ─── Enrollments ──────────────────────────────────────────────────────────────

export const enrollments: Enrollment[] = [
  { courseId: 'co1', userId: 'u1', progress: 100, startedAt: '2024-01-10', completedAt: '2024-01-18', score: 82 },
  { courseId: 'co2', userId: 'u1', progress: 65,  startedAt: '2024-02-05' },
  { courseId: 'co4', userId: 'u1', progress: 40,  startedAt: '2024-03-01' },
  { courseId: 'co7', userId: 'u1', progress: 100, startedAt: '2023-12-01', completedAt: '2023-12-05', score: 90 },
  { courseId: 'co9', userId: 'u1', progress: 100, startedAt: '2023-11-10', completedAt: '2023-11-12', score: 88 },

  { courseId: 'co2', userId: 'u2', progress: 30,  startedAt: '2024-03-10' },
  { courseId: 'co11', userId: 'u2', progress: 55, startedAt: '2024-02-20' },
  { courseId: 'co12', userId: 'u2', progress: 20, startedAt: '2024-03-15' },
  { courseId: 'co5', userId: 'u2', progress: 100, startedAt: '2023-10-01', completedAt: '2023-10-04', score: 95 },

  { courseId: 'co1', userId: 'u3', progress: 80,  startedAt: '2024-02-15' },
  { courseId: 'co6', userId: 'u3', progress: 45,  startedAt: '2024-01-20' },
  { courseId: 'co5', userId: 'u3', progress: 100, startedAt: '2023-09-10', completedAt: '2023-09-14', score: 87 },

  { courseId: 'co4', userId: 'u4', progress: 100, startedAt: '2023-08-01', completedAt: '2023-08-10', score: 91 },
  { courseId: 'co5', userId: 'u4', progress: 100, startedAt: '2023-07-15', completedAt: '2023-07-18', score: 96 },
  { courseId: 'co1', userId: 'u4', progress: 60,  startedAt: '2024-03-05' },

  { courseId: 'co8', userId: 'u5', progress: 70,  startedAt: '2024-02-01' },
  { courseId: 'co7', userId: 'u5', progress: 100, startedAt: '2023-11-01', completedAt: '2023-11-03', score: 85 },
  { courseId: 'co3', userId: 'u5', progress: 50,  startedAt: '2024-03-01' },
];

// ─── Learning Paths ───────────────────────────────────────────────────────────

export const learningPaths: LearningPath[] = [
  {
    id: 'lp1',
    title: 'Data Analytics Excellence',
    description: 'A structured 4-step journey to build strong data analytics capabilities.',
    targetCompetency: 'Data Analytics',
    estimatedHours: 16,
    steps: [
      { id: 'ls1', type: 'course', title: 'Data Fundamentals for Professionals', duration: '3h 20m', status: 'completed', courseId: 'co1' },
      { id: 'ls2', type: 'course', title: 'Excel for Business Analysis', duration: '4h 10m', status: 'in_progress', courseId: 'co2' },
      { id: 'ls3', type: 'course', title: 'Data Visualization with Power BI', duration: '5h 00m', status: 'available', courseId: 'co3' },
      { id: 'ls4', type: 'assessment', title: 'Data Analytics Proficiency Assessment', duration: '45m', status: 'locked' },
      { id: 'ls5', type: 'course', title: 'Advanced Analytics & Interpretation', duration: '6h 00m', status: 'locked', courseId: 'co10' },
      { id: 'ls6', type: 'certification', title: 'Certified Data Analyst', duration: '2h', status: 'locked' },
    ]
  },
  {
    id: 'lp2',
    title: 'Leadership Development Track',
    description: 'Build leadership skills from fundamentals to advanced people management.',
    targetCompetency: 'Leadership',
    estimatedHours: 12,
    steps: [
      { id: 'ls1', type: 'course', title: 'Effective Business Communication', duration: '3h 00m', status: 'completed', courseId: 'co5' },
      { id: 'ls2', type: 'course', title: 'Leadership Essentials', duration: '6h 30m', status: 'in_progress', courseId: 'co4' },
      { id: 'ls3', type: 'assessment', title: 'Leadership Readiness Assessment', duration: '30m', status: 'locked' },
      { id: 'ls4', type: 'certification', title: 'Emerging Leader Certificate', duration: '1h', status: 'locked' },
    ]
  },
];

// ─── Assessments ──────────────────────────────────────────────────────────────

export const assessments: Assessment[] = [
  {
    id: 'a1',
    title: 'Data Analytics Proficiency Assessment',
    competencyId: 'c2',
    duration: 45,
    passingScore: 70,
    questions: [
      {
        id: 'q1',
        text: 'Which chart type is most appropriate for showing trends over time?',
        options: ['Pie Chart', 'Bar Chart', 'Line Chart', 'Scatter Plot'],
        correctIndex: 2,
        explanation: 'Line charts are ideal for displaying data trends over a continuous time period.'
      },
      {
        id: 'q2',
        text: 'What does KPI stand for in a business context?',
        options: ['Key Performance Indicator', 'Key Process Input', 'Knowledge Performance Index', 'Key Productivity Instrument'],
        correctIndex: 0,
        explanation: 'KPI stands for Key Performance Indicator — a measurable value showing how effectively objectives are met.'
      },
      {
        id: 'q3',
        text: 'In a dataset, what does the "median" represent?',
        options: ['Average of all values', 'The middle value when sorted', 'The most frequent value', 'The difference between max and min'],
        correctIndex: 1,
        explanation: 'The median is the middle value in a sorted dataset, less affected by outliers than the mean.'
      },
      {
        id: 'q4',
        text: 'What is a pivot table primarily used for?',
        options: ['Database normalization', 'Summarizing and analyzing large datasets', 'Creating presentation slides', 'Writing complex macros'],
        correctIndex: 1,
        explanation: 'Pivot tables summarize and reorganize large datasets for easier analysis and reporting.'
      },
      {
        id: 'q5',
        text: 'Which measure of central tendency is most affected by outliers?',
        options: ['Median', 'Mode', 'Mean', 'Range'],
        correctIndex: 2,
        explanation: 'The mean (average) is most sensitive to extreme values (outliers) in a dataset.'
      },
      {
        id: 'q6',
        text: 'What does a correlation coefficient of -0.9 indicate?',
        options: ['No relationship', 'Weak positive relationship', 'Strong negative relationship', 'Perfect positive relationship'],
        correctIndex: 2,
        explanation: 'A correlation of -0.9 indicates a strong inverse relationship between two variables.'
      },
      {
        id: 'q7',
        text: 'Which function in Excel finds the nth largest value?',
        options: ['MAX()', 'LARGE()', 'RANK()', 'TOP()'],
        correctIndex: 1,
        explanation: 'The LARGE() function returns the k-th largest value from a dataset.'
      },
      {
        id: 'q8',
        text: 'What does "data normalization" mean?',
        options: ['Removing duplicates', 'Scaling data to a standard range', 'Filling missing values', 'Sorting data alphabetically'],
        correctIndex: 1,
        explanation: 'Normalization scales data to a common range (typically 0-1) to remove biases from different units.'
      },
    ]
  },
  {
    id: 'a2',
    title: 'Leadership Readiness Assessment',
    competencyId: 'c3',
    duration: 30,
    passingScore: 75,
    questions: [
      {
        id: 'q1',
        text: 'A team member consistently misses deadlines. What is the most effective first step?',
        options: ['Escalate to HR immediately', 'Have a private one-on-one conversation', 'Redistribute their tasks', 'Warn them publicly in a meeting'],
        correctIndex: 1,
        explanation: 'A private, direct conversation allows you to understand root causes before taking further action.'
      },
      {
        id: 'q2',
        text: 'Which leadership style is most effective in a crisis situation?',
        options: ['Democratic', 'Laissez-faire', 'Transformational', 'Autocratic'],
        correctIndex: 3,
        explanation: 'Autocratic leadership provides rapid decision-making crucial during time-sensitive crises.'
      },
      {
        id: 'q3',
        text: 'What is psychological safety in a team context?',
        options: ['Physical workplace safety', 'Feeling safe to take risks and speak up without fear', 'Job security guarantees', 'Avoiding all conflict'],
        correctIndex: 1,
        explanation: 'Psychological safety allows team members to voice ideas and concerns without fear of punishment.'
      },
      {
        id: 'q4',
        text: 'What is the primary goal of delegation?',
        options: ['Reduce your workload', 'Develop team members while achieving objectives', 'Avoid accountability', 'Control every detail'],
        correctIndex: 1,
        explanation: 'Effective delegation develops capability in team members while accomplishing organizational goals.'
      },
      {
        id: 'q5',
        text: 'Which of the following best describes a coaching leadership approach?',
        options: ['Giving direct orders', 'Asking questions to help team members find solutions', 'Making all decisions independently', 'Rewarding only top performers'],
        correctIndex: 1,
        explanation: 'Coaching focuses on developing capability through questions and guided discovery rather than directives.'
      },
    ]
  },
];

// ─── Certificates ─────────────────────────────────────────────────────────────

export const certificates: Certificate[] = [
  { id: 'cert1', userId: 'u1', courseId: 'co7', title: 'Cybersecurity Awareness', issuedDate: '2023-12-05' },
  { id: 'cert2', userId: 'u1', courseId: 'co9', title: 'Digital Tools Mastery', issuedDate: '2023-11-12' },
  { id: 'cert3', userId: 'u1', courseId: 'co1', title: 'Data Fundamentals for Professionals', issuedDate: '2024-01-18' },
  { id: 'cert4', userId: 'u2', courseId: 'co5', title: 'Effective Business Communication', issuedDate: '2023-10-04' },
  { id: 'cert5', userId: 'u4', courseId: 'co4', title: 'Leadership Essentials', issuedDate: '2023-08-10' },
  { id: 'cert6', userId: 'u4', courseId: 'co5', title: 'Effective Business Communication', issuedDate: '2023-07-18' },
  { id: 'cert7', userId: 'u5', courseId: 'co7', title: 'Cybersecurity Awareness', issuedDate: '2023-11-03' },
];

// ─── Departments ──────────────────────────────────────────────────────────────

export const departments: Department[] = [
  { id: 'd1', name: 'Engineering',     headId: 'u6', capabilityScore: 82, employeeCount: 48, criticalGap: false },
  { id: 'd2', name: 'HR',              headId: 'u7', capabilityScore: 76, employeeCount: 22, criticalGap: false },
  { id: 'd3', name: 'Finance',         headId: 'u7', capabilityScore: 61, employeeCount: 31, criticalGap: true  },
  { id: 'd4', name: 'Operations',      headId: 'u8', capabilityScore: 69, employeeCount: 56, criticalGap: false },
  { id: 'd5', name: 'Administration',  headId: 'u9', capabilityScore: 74, employeeCount: 18, criticalGap: false },
];

// ─── Knowledge Hub ────────────────────────────────────────────────────────────

export const knowledgeResources: KnowledgeResource[] = [
  {
    id: 'kr1', title: 'Customer Complaint Handling Procedure', category: 'Policy',
    description: 'Step-by-step procedure for handling and resolving customer complaints across all departments.',
    type: 'sop', tags: ['customer', 'complaint', 'procedure', 'SOP'],
    views: 342, updatedAt: '2024-01-15',
    content: 'When a customer complaint is received: 1) Acknowledge within 24 hours. 2) Log in the complaint register. 3) Assign to relevant department. 4) Investigate root cause. 5) Provide resolution within 5 working days. 6) Follow up with customer. 7) Document outcome and preventive actions.'
  },
  {
    id: 'kr2', title: 'Annual Performance Review Process', category: 'HR Policy',
    description: 'Complete guide to the annual performance review cycle, ratings, and feedback framework.',
    type: 'guide', tags: ['performance', 'review', 'HR', 'appraisal'],
    views: 521, updatedAt: '2024-02-10',
    content: 'The annual performance review is conducted in Q4 each year. Managers assess employees on KPIs, competency levels, and behavioral indicators. Ratings range from 1 (Below Expectations) to 5 (Exceptional). Calibration sessions ensure consistency across departments.'
  },
  {
    id: 'kr3', title: 'Data Privacy & GDPR Compliance Guide', category: 'Compliance',
    description: 'Understanding your obligations under GDPR and our internal data privacy policies.',
    type: 'document', tags: ['GDPR', 'privacy', 'compliance', 'data'],
    views: 289, updatedAt: '2024-01-20',
    content: 'All employees must handle personal data in accordance with GDPR principles: Lawfulness, Fairness, Transparency. Data must not be retained beyond its purpose. Report any data breaches to the DPO within 72 hours. Personal data must not be transferred outside approved systems.'
  },
  {
    id: 'kr4', title: 'Work From Home Policy', category: 'Policy',
    description: 'Guidelines for remote work eligibility, expectations, equipment, and communication protocols.',
    type: 'policy', tags: ['WFH', 'remote', 'policy', 'hybrid'],
    views: 678, updatedAt: '2024-03-01',
    content: 'Employees are eligible for up to 3 WFH days per week subject to manager approval. Core hours are 10am-4pm IST. Equipment costs up to ₹15,000 may be reimbursed. Weekly check-ins with manager are mandatory. All meetings must have video enabled.'
  },
  {
    id: 'kr5', title: 'Project Kickoff Best Practices', category: 'Operations',
    description: 'Structured guide to running effective project kickoffs that align teams from day one.',
    type: 'guide', tags: ['project', 'kickoff', 'planning', 'best-practice'],
    views: 203, updatedAt: '2024-02-05',
    content: 'A successful kickoff covers: Clear scope and objectives. RACI matrix. Communication plan. Risk register. Timeline with milestones. Success criteria. Decision-making authority. Escalation path. Resource allocation. First sprint/phase plan.'
  },
  {
    id: 'kr6', title: 'Cybersecurity Incident Response Playbook', category: 'Security',
    description: 'How to detect, report, contain, and recover from cybersecurity incidents.',
    type: 'sop', tags: ['cybersecurity', 'incident', 'response', 'security'],
    views: 156, updatedAt: '2024-01-08',
    content: 'Phase 1 - Identify: Detect and confirm the incident. Phase 2 - Contain: Isolate affected systems. Phase 3 - Eradicate: Remove the threat. Phase 4 - Recover: Restore systems and verify. Phase 5 - Post-incident Review: Document lessons learned. Report all incidents to IT Security immediately.'
  },
  {
    id: 'kr7', title: 'Leadership Competency Framework', category: 'Learning',
    description: 'Defines leadership competencies required at each level of the organization.',
    type: 'document', tags: ['leadership', 'competency', 'framework', 'development'],
    views: 394, updatedAt: '2024-02-28',
    content: 'The Leadership Framework has 4 levels: Team Lead (20+ competency score), Manager (50+), Senior Manager (70+), Director (85+). Core competencies include: Strategic Thinking, People Development, Communication, Decision Making, Change Management.'
  },
  {
    id: 'kr8', title: 'Onboarding Checklist for New Employees', category: 'HR',
    description: 'Complete onboarding guide covering Day 1 through Day 90 activities for new joiners.',
    type: 'guide', tags: ['onboarding', 'new-joiner', 'HR', 'checklist'],
    views: 512, updatedAt: '2024-03-05',
    content: 'Week 1: System access, orientation, meet-the-team. Month 1: Department deep-dive, shadow senior colleagues, complete mandatory training. Month 2: Take ownership of first project, 30-day review with manager. Month 3: Set 90-day goals, complete probation review.'
  },
];

// ─── Risk Alerts ──────────────────────────────────────────────────────────────

export const riskAlerts: RiskAlert[] = [
  {
    id: 'ra1', severity: 'critical',
    title: 'Critical Data Analytics Gap in Finance',
    description: 'Finance department average Data Analytics competency (38%) is 42 points below the required threshold (80%). 8 employees are at severe risk.',
    affectedDepartment: 'Finance',
    recommendation: 'Launch mandatory "Data Analytics for Finance Professionals" program immediately. Target completion: 60 days.',
    createdAt: '2024-03-10'
  },
  {
    id: 'ra2', severity: 'warning',
    title: 'Expiring Certifications — Cybersecurity',
    description: '12 employees have Cybersecurity Awareness certifications expiring within 30 days across Engineering and Operations.',
    recommendation: 'Send renewal notifications and schedule batch assessment sessions for the upcoming week.',
    createdAt: '2024-03-08'
  },
  {
    id: 'ra3', severity: 'warning',
    title: 'Mandatory Compliance Training Incomplete',
    description: '23 employees have not completed the mandatory GDPR Compliance training due on March 31.',
    recommendation: 'Send automated reminders and escalate to department managers for non-compliant employees.',
    createdAt: '2024-03-09'
  },
  {
    id: 'ra4', severity: 'critical',
    title: 'Operations Department Below Readiness Threshold',
    description: 'Operations department capability score (61%) has dropped below the 65% organizational threshold, driven by gaps in Digital Readiness and Process Improvement.',
    affectedDepartment: 'Operations',
    recommendation: 'Initiate targeted upskilling sprint for Operations team. Assign 3 priority courses.',
    createdAt: '2024-03-07'
  },
  {
    id: 'ra5', severity: 'info',
    title: 'New Competency Framework Released',
    description: 'The updated Digital Readiness competency framework (v2.0) requires all employees to be re-assessed.',
    recommendation: 'Schedule department-wise self-assessments to collect updated baseline scores.',
    createdAt: '2024-03-05'
  },
];

// ─── Org-level metrics for charts ────────────────────────────────────────────

export const orgCapabilityBreakdown = [
  { name: 'Leadership',     value: 81, required: 80 },
  { name: 'Digital Skills', value: 67, required: 80 },
  { name: 'Data Literacy',  value: 54, required: 83 },
  { name: 'Communication',  value: 86, required: 80 },
  { name: 'Compliance',     value: 78, required: 85 },
  { name: 'Cyber Security', value: 63, required: 80 },
];

export const departmentTrend = [
  { month: 'Oct', Engineering: 75, Finance: 55, HR: 70, Operations: 58 },
  { month: 'Nov', Engineering: 77, Finance: 56, HR: 71, Operations: 61 },
  { month: 'Dec', Engineering: 79, Finance: 57, HR: 73, Operations: 63 },
  { month: 'Jan', Engineering: 80, Finance: 58, HR: 74, Operations: 65 },
  { month: 'Feb', Engineering: 81, Finance: 59, HR: 75, Operations: 67 },
  { month: 'Mar', Engineering: 82, Finance: 61, HR: 76, Operations: 69 },
];

export const trainingImpactData: TrainingImpact[] = [
  { competency: 'Digital Readiness', before: 52, after: 71, participants: 45, date: '2023-Q4' },
  { competency: 'Communication',     before: 68, after: 86, participants: 62, date: '2023-Q3' },
  { competency: 'Cyber Security',    before: 40, after: 63, participants: 78, date: '2023-Q4' },
  { competency: 'Leadership',        before: 62, after: 81, participants: 30, date: '2024-Q1' },
];

export const completionTrendData = [
  { month: 'Oct', completions: 42, enrollments: 68 },
  { month: 'Nov', completions: 58, enrollments: 82 },
  { month: 'Dec', completions: 51, enrollments: 74 },
  { month: 'Jan', completions: 73, enrollments: 95 },
  { month: 'Feb', completions: 88, enrollments: 112 },
  { month: 'Mar', completions: 94, enrollments: 119 },
];

// ─── AI Responses ─────────────────────────────────────────────────────────────

export const aiPromptResponses: Record<string, string> = {
  default: "I'm here to help you build your capabilities. Ask me about courses, your skill gaps, learning paths, or any topic you'd like to learn more about.",
  data: `Based on your current competency profile, your **Data Analytics** score is **42/100** while your role requires **75/100** — a gap of 33 points.

I recommend this 4-step learning path:

1. **Data Fundamentals for Professionals** — 3h 20m *(already completed ✓)*
2. **Excel for Business Analysis** — 4h 10m *(in progress — 65% done)*
3. **Data Visualization with Power BI** — 5h 00m
4. **Advanced Analytics & Interpretation** — 6h 00m
5. **Data Analytics Proficiency Assessment** — 45m

**Estimated completion:** ~15 hours remaining

Starting with Excel for Business Analysis is your best next move. You're already 65% through it!`,

  leadership: `Your **Leadership** competency is at **65/100**, against a required level of **70/100** — you're only **5 points away** from meeting your target!

Recommended action:

1. **Leadership Essentials** *(in progress — 40% done)*: Focus on the "Delegation & Feedback" module — it directly maps to your gap area.
2. Complete the **Leadership Readiness Assessment** once the course is done.

Estimated time to hit your target: **~4 hours**.

You're very close — a strong push this week can close this gap completely.`,

  gap: `Here's a summary of your **current competency gaps**:

| Competency | Current | Required | Gap |
|---|---|---|---|
| Data Analytics | 42 | 75 | **−33** 🔴 |
| Cyber Security | 55 | 75 | **−20** 🟡 |
| Project Management | 72 | 80 | **−8** 🟡 |
| Leadership | 65 | 70 | **−5** ✅ |

**Priority recommendation:** Focus on Data Analytics first — it has the largest gap and directly impacts your performance rating.`,

  recommend: `Based on your role as **Senior Software Engineer** and your current competency profile, here are my top picks for you:

**Immediate Priority (High Impact):**
- 📊 Excel for Business Analysis *(continue — 65% done)*
- 🛡️ Cybersecurity Awareness *(fills a 20-point gap)*

**Next Month:**
- 📈 Data Visualization with Power BI
- ☁️ Cloud Infrastructure Fundamentals *(aligns with your DevOps work)*

These 4 courses together could increase your overall capability score from **68% → 82%**.`,

  knowledge: `The **Knowledge Hub** contains resources on a wide range of topics. Here's what I found relevant to your query:

- **Customer Complaint Handling Procedure** — Step-by-step SOP for complaint resolution
- **Project Kickoff Best Practices** — Structured guide for effective project initiation
- **Leadership Competency Framework** — Competency levels and development paths

Would you like me to search for something more specific, or explain any of these resources in detail?`,

  team: `Here's a summary of your team's capability profile:

**Engineering Team — Overall: 82%**

| Member | Score | Top Gap |
|---|---|---|
| Arjun Sharma | 68% | Data Analytics (−33) |
| Vikram Singh | 74% | Cloud Infrastructure (−14) |

**Required actions:**
1. Enroll Arjun in the Data Analytics pathway — **critical gap**
2. Recommend Cloud Fundamentals to Vikram
3. Schedule team-level assessment in April

Your team is above the organizational average, but Data Analytics remains a shared gap across 2 members.`,
};
