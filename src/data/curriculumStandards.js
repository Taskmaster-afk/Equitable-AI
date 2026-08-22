// =========================================================================
// WORLDWIDE CURRICULUM STANDARDS & UNIVERSAL INSTITUTIONAL FRAMEWORKS
// =========================================================================
// Architecture Note:
// Supports universal education spanning Higher Education (Universities,
// Colleges, Medical/Engineering Institutes) through Secondary & Middle schools,
// with full support for global educational frameworks and custom institutional syllabi.
// =========================================================================

export const SCHOOL_CLASSES = [
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12"
];

export const SCHOOL_SECTIONS = [
  "Section A",
  "Section B",
  "Section C",
  "Section D"
];

export const DEFAULT_CUSTOM_CURRICULUM = {
  name: "National School Standards Framework",
  domains: "Mathematics, Physical & Life Sciences, Languages, Social Studies",
  gradingScale: "Percentage / Letter Grade (A1 to E)",
  degreeOrAward: "Senior Secondary School Certificate",
  department: "School Academic Council",
  accreditation: "National & State School Boards"
};

export const CURRICULUM_CATEGORIES = [
  { id: "nat-boards", name: "National School Boards (CBSE / NCERT / ICSE)" },
  { id: "state-boards", name: "State Education Boards (Class 1-12)" },
  { id: "intl-school", name: "International School Frameworks (IB / Cambridge)" },
  { id: "foundation", name: "STEM & Remedial School Foundation" }
];

export const INSTITUTION_CATEGORIES = [
  "Kendriya Vidyalaya / Central School (K-12)",
  "Jawahar Navodaya Vidyalaya (JNV)",
  "Private Senior Secondary School (CBSE / ICSE)",
  "Government / State Model Senior Secondary School",
  "Sarvodaya Kanya / Bal Vidyalaya",
  "Army Public School (APS)",
  "Delhi Public School (DPS Cluster)",
  "International Day & Boarding School (IB / IGCSE)",
  "Integrated Middle School (Class 1-8)"
];

export const ACADEMIC_TIERS = [
  {
    id: "tier-senior-sec",
    name: "Senior Secondary",
    label: "Senior Secondary (Class 11-12)",
    description: "High School, Science / Commerce / Humanities Tracks"
  },
  {
    id: "tier-secondary",
    name: "Secondary Standard",
    label: "Secondary School (Class 9-10)",
    description: "Board Standard, Core Math & Science Foundation"
  },
  {
    id: "tier-middle",
    name: "Middle School",
    label: "Middle School (Class 6-8)",
    description: "Middle School Foundational Concepts & Skills"
  },
  {
    id: "tier-primary",
    name: "Primary School",
    label: "Primary School (Class 1-5)",
    description: "Elementary Numeracy, Science & Literacy Foundations"
  }
];

export const WORLDWIDE_CURRICULUMS = [
  // School Education Curriculums
  {
    id: "curr-ncert-cbse",
    name: "CBSE / NCERT National Curriculum (Class 1-12)",
    code: "NCERT-CBSE-K12",
    category: "National School Boards (CBSE / NCERT / ICSE)",
    tier: "School Standard (Class 1-12)",
    region: "India / National / Global CBSE",
    gradingScale: "Percentage / Letter Grades (A1, A2, B1, B2, C1, C2, D, E)",
    domains: ["Physics", "Chemistry", "Mathematics", "Biology", "General Science", "Languages"],
    accreditation: "Central Board of Secondary Education (CBSE) / NCERT",
    description: "Comprehensive national standard school curriculum aligned with NEP frameworks from Class 1 through Class 12."
  },
  {
    id: "curr-cisce-icse",
    name: "CISCE / ICSE / ISC School Curriculum (Class 1-12)",
    code: "CISCE-ICSE-K12",
    category: "National School Boards (CBSE / NCERT / ICSE)",
    tier: "School Standard (Class 1-12)",
    region: "India / International CISCE",
    gradingScale: "Percentage Marks (1-100 scale)",
    domains: ["English & Literature", "Mathematics", "Science (Physics, Chem, Bio)", "Computer Applications", "Social Sciences"],
    accreditation: "Council for the Indian School Certificate Examinations",
    description: "Rigorous concept-driven school curriculum covering foundational, secondary, and higher secondary education."
  },
  {
    id: "curr-med-sciences",
    name: "Medical & Healthcare Sciences Curriculum (MBBS / MD / USMLE Aligned)",
    code: "MED-MBBS-USMLE",
    category: "Higher Education & Universities",
    tier: "Higher Education (Medical MBBS / MD)",
    region: "Global / USMLE / NMC / WFME",
    gradingScale: "Competency-Based Medical Education (CBME / Pass-Honors)",
    domains: ["Human Anatomy & Embryology", "Medical Physiology", "Biochemistry & Genetics", "Pathology & Microbiology", "Pharmacology & Bedside Clinical"],
    accreditation: "WFME / National Medical Council / ECFMG",
    description: "Comprehensive medical doctor training integrating foundational preclinical sciences with systemic bedside clinical diagnostics."
  },
  {
    id: "curr-cs-acm",
    name: "ACM / IEEE Computer Science & Software Systems Curriculum",
    code: "CS-ACM-IEEE",
    category: "Higher Education & Universities",
    tier: "Higher Education (B.S. / B.Tech / M.S.)",
    region: "Global Standard",
    gradingScale: "4.0 GPA / Letter Grades (A+ to F)",
    domains: ["Data Structures & Algorithms", "Computer Architecture & OS", "Discrete Mathematics", "Artificial Intelligence & ML", "Distributed Systems & Networks"],
    accreditation: "ACM / IEEE-CS Joint Curriculum Task Force",
    description: "Standard worldwide curriculum for computer science covering theory, algorithms, machine learning, systems, and cloud infrastructure."
  },
  {
    id: "curr-bologna-ects",
    name: "European Higher Education Area (Bologna Process / ECTS Credit Framework)",
    code: "EU-BOLOGNA-ECTS",
    category: "Higher Education & Universities",
    tier: "Higher Education (Bachelor / Master / PhD)",
    region: "European Union & EHEA (48 Countries)",
    gradingScale: "ECTS Grade Scale (A-F) & European Credits (60 ECTS / Year)",
    domains: ["Core Discipline Modules", "Research Seminars", "Elective Specializations", "Thesis Defense"],
    accreditation: "European Association for Quality Assurance in Higher Education (ENQA)",
    description: "Standardized European three-cycle higher education framework promoting seamless student mobility and research credit transfer."
  },
  {
    id: "curr-postgrad-research",
    name: "University Postgraduate & Master's Degree (M.S. / M.Sc. / M.Tech / MBA)",
    code: "UNIV-PG-MASTERS",
    category: "Higher Education & Universities",
    tier: "Higher Education (Postgraduate Master's / PhD)",
    region: "Global Universities",
    gradingScale: "4.0 Scale GPA / ECTS Credits / CGPA",
    domains: ["Advanced Statistical Inference", "Disciplinary Literature Critique", "Specialized Seminar Labs", "Thesis Research & Defense"],
    accreditation: "University Academic Senate & Graduate Studies Board",
    description: "Advanced post-graduate research framework fostering specialized investigative inquiry, peer-reviewed seminars, and dissertation defense."
  },

  // International & Global Baccalaureate
  {
    id: "curr-ib-dp",
    name: "International Baccalaureate (IB) Diploma Programme (DP) & MYP",
    code: "IB-DP-MYP",
    category: "International & Global Baccalaureate",
    tier: "Secondary & Senior Secondary (Grades 6-12)",
    region: "International (150+ Countries)",
    gradingScale: "1 to 7 Points Scale (Max 45 Points with TOK / Extended Essay)",
    domains: ["Mathematics: Analysis & Approaches", "Physics (HL/SL)", "Chemistry (HL/SL)", "Biology (HL/SL)", "Theory of Knowledge (TOK)"],
    accreditation: "International Baccalaureate Organization (Geneva)",
    description: "Premier inquiry-based international curriculum with Higher Level and Standard Level coursework, Theory of Knowledge, and Extended Essay."
  },
  {
    id: "curr-cambridge-cie",
    name: "Cambridge Assessment International (CAIE - IGCSE & A-Levels)",
    code: "CAMBRIDGE-A-LEVEL",
    category: "International & Global Baccalaureate",
    tier: "Secondary & Senior Secondary (Grades 9-12)",
    region: "UK & International (10,000+ Schools)",
    gradingScale: "A* to E Grade Scale (International Standard)",
    domains: ["Pure Mathematics & Mechanics (9709)", "Physics A-Level (9702)", "Chemistry (9701)", "Biology (9700)", "Computer Science (9618)"],
    accreditation: "Cambridge University Press & Assessment (UK)",
    description: "Rigorous British international curriculum emphasizing conceptual depth, mathematical derivations, and laboratory investigations."
  },
  {
    id: "curr-us-ap-commoncore",
    name: "US Advanced Placement (AP) & Next Generation Science Standards (NGSS)",
    code: "US-AP-NGSS",
    category: "International & Global Baccalaureate",
    tier: "Secondary & Senior Secondary (Grades 9-12)",
    region: "United States & International Schools",
    gradingScale: "GPA 4.0 / 5.0 (Weighted AP) & AP Exam Scores (1-5)",
    domains: ["AP Calculus BC / AB", "AP Physics C: Mechanics & E/M", "AP Chemistry", "AP Biology", "AP Computer Science A"],
    accreditation: "College Board / US State Departments of Education",
    description: "University-level coursework and standardized examinations granting global collegiate credits and honors standing."
  },

  // National Boards & Ministries
  {
    id: "curr-cbse-ncert",
    name: "CBSE / NCERT National Curriculum Framework (NCF 2023-25)",
    code: "CBSE-NCERT-NCF",
    category: "National Boards & Ministries",
    tier: "Secondary & Senior Secondary (Classes 9-12)",
    region: "India & 26+ International Centers",
    gradingScale: "Marks Percentage (0-100%) & Grade Points (A1 to E)",
    domains: ["Physics (042)", "Chemistry (043)", "Mathematics (041)", "Biology (044)", "Computer Science (083)"],
    accreditation: "Central Board of Secondary Education (CBSE) / NCERT",
    description: "Official Indian national curriculum framework with unified open educational textbook standards across science and math."
  },
  {
    id: "curr-icse-isc",
    name: "ICSE / ISC (Council for the Indian School Certificate Examinations)",
    code: "CISCE-ICSE-ISC",
    category: "National Boards & Ministries",
    tier: "Secondary & Senior Secondary (Classes 9-12)",
    region: "India & South Asia",
    gradingScale: "Marks Percentage & Numerical Scale 1-9",
    domains: ["ISC Mathematics", "ISC Physics with Lab Practicals", "ISC Chemistry", "ISC Biology", "Computer Science (Java)"],
    accreditation: "CISCE (Council for the Indian School Certificate Examinations)",
    description: "Comprehensive national curriculum with rigorous experimental practicals, advanced literature, and mathematical problem-solving."
  },
  {
    id: "curr-uk-national",
    name: "UK National Curriculum (GCSE & GCE A-Levels - Edexcel / AQA / OCR)",
    code: "UK-GCSE-ALEVEL",
    category: "National Boards & Ministries",
    tier: "Secondary & Senior Secondary (Years 7-13)",
    region: "United Kingdom & British Overseas Schools",
    gradingScale: "Grades 9-1 (GCSE) & A*-E (A-Levels)",
    domains: ["Higher Mathematics", "Combined & Triple Sciences", "Computing & Electronics", "English & Humanities"],
    accreditation: "Ofqual (UK Office of Qualifications and Examinations Regulation)",
    description: "Official National Curriculum of England, Wales, and Northern Ireland with rigorous subject depth and external board exams."
  },
  {
    id: "curr-french-bac",
    name: "French Baccalauréat (Bac Général - Ministère de l'Éducation)",
    code: "FRENCH-BAC",
    category: "National Boards & Ministries",
    tier: "Secondary & Senior Secondary (Seconde, Première, Terminale)",
    region: "France & Lycées Français Internationaux",
    gradingScale: "Scale of 0 to 20 (Mention Très Bien >= 16)",
    domains: ["Spécialité Mathématiques", "Physique-Chimie", "Sciences de la Vie et de la Terre (SVT)", "Philosophie & Humanités"],
    accreditation: "Ministère de l'Éducation Nationale (France)",
    description: "Comprehensive French secondary education with specialized scientific concentrations in mathematics, physics, and life sciences."
  },
  {
    id: "curr-german-abitur",
    name: "German Abitur (Gymnasiale Oberstufe / KMK Standards)",
    code: "GERMAN-ABITUR",
    category: "National Boards & Ministries",
    tier: "Secondary & Senior Secondary (Gymnasium Grades 5-13)",
    region: "Germany & German Schools Abroad",
    gradingScale: "15-Point Grading System (1.0 to 4.0 Final Abitur Grade)",
    domains: ["Mathematik Leistungskurs", "Physik & Chemie", "Biologie", "Informatik", "Deutsch & Fremdsprachen"],
    accreditation: "Kultusministerkonferenz (KMK)",
    description: "University qualifying examination for German and European universities with intensive advanced STEM courses."
  },
  {
    id: "curr-australian-atar",
    name: "Australian National Curriculum (Senior Secondary - ATAR / VCE / HSC)",
    code: "AU-ATAR-HSC",
    category: "National Boards & Ministries",
    tier: "Secondary & Senior Secondary (Years 7-12)",
    region: "Australia & Asia-Pacific",
    gradingScale: "ATAR Percentile Ranking (0.00 to 99.95) & Letter Grades A-E",
    domains: ["Mathematical Methods & Specialist Math", "Physics & Chemistry Units", "Biology & Environmental Science", "Digital Technologies"],
    accreditation: "ACARA (Australian Curriculum, Assessment and Reporting Authority)",
    description: "Inquiry-led national Australian standards with specialized Senior Secondary Mathematics and physical sciences."
  },
  {
    id: "curr-singapore-gce",
    name: "Singapore-Cambridge GCE (O-Levels / A-Levels / MOE Integrated Programme)",
    code: "SG-GCE-A-LEVEL",
    category: "National Boards & Ministries",
    tier: "Secondary & Senior Secondary (Sec 1-4 & JC 1-2)",
    region: "Singapore & Southeast Asia",
    gradingScale: "H1/H2/H3 Grades (A-U) & University Admission Score (UAS)",
    domains: ["H2 Mathematics (9758)", "H2 Physics (9749)", "H2 Chemistry (9729)", "H2 Biology (9744)", "General Paper & Computing"],
    accreditation: "Ministry of Education (MOE) Singapore & SEAB",
    description: "World-renowned heuristic problem-solving framework with intensive H2/H3 advanced STEM mathematics and sciences."
  },
  {
    id: "curr-canadian-oss",
    name: "Canadian Provincial Curricula (Ontario OSSD / Alberta / BC Dogwood)",
    code: "CA-PROVINCIAL-OSS",
    category: "National Boards & Ministries",
    tier: "Secondary & Senior Secondary (Grades 9-12)",
    region: "Canada & Canadian Overseas Schools",
    gradingScale: "Percentage Scale (0-100%) & Provincial Credit Points",
    domains: ["Calculus and Vectors (MCV4U)", "Advanced Functions (MHF4U)", "Physics 12 (SPH4U)", "Chemistry 12 (SCH4U)", "Biology 12 (SBI4U)"],
    accreditation: "Provincial Ministries of Education (Ontario / Alberta / BC)",
    description: "Credit-based secondary diploma with university-preparation STEM courses."
  },
  {
    id: "curr-state-boards",
    name: "State Higher Secondary Education Boards (State Boards)",
    code: "INDIA-STATE-BOARDS",
    category: "National Boards & Ministries",
    tier: "Secondary & Senior Secondary (Classes 9-12)",
    region: "Indian States (Maharashtra, Karnataka, Tamil Nadu, UP, etc.)",
    gradingScale: "Marks Percentage & State Board GPA",
    domains: ["State Board Physics", "Chemistry", "Mathematics", "Biology", "Regional Medium Languages"],
    accreditation: "State Departments of School Education",
    description: "State-specific curricula aligned with national frameworks for regional vernacular and English medium schools."
  },

  // Foundation & Pre-Professional
  {
    id: "curr-stem-olympiad-jee",
    name: "STEM Advanced Honors & Competitive Track (JEE / NEET / SAT / Olympiad)",
    code: "STEM-HONORS-COMPETITIVE",
    category: "Foundation & Pre-Professional",
    tier: "Pre-University & University Foundation (Years 11-14)",
    region: "Global & National",
    gradingScale: "Percentile & Normalized Scaled Scores",
    domains: ["Calculus & Coordinate Geometry", "Rotational Mechanics & Wave Optics", "Organic Synthesis & Chemical Equilibrium", "Cellular Genetics & Physiology"],
    accreditation: "National Testing Agency / College Board / International Science Olympiad Committees",
    description: "High-rigor analytical problem-solving syllabus for competitive entrance examinations, Olympiads, and honors placements."
  },

  // Technical & Vocational
  {
    id: "curr-polytech-hnd",
    name: "Polytechnic, Higher National Diploma & Applied Technology (Pearson BTEC)",
    code: "POLYTECH-HND",
    category: "Technical & Vocational",
    tier: "Higher Education / Applied Vocational (Year 1-3)",
    region: "UK / Commonwealth / Global",
    gradingScale: "Distinction / Merit / Pass Framework",
    domains: ["Applied Mechanics & Structures", "Circuits & Instrumentation", "Computer-Aided Design (CAD)", "Industrial Safety & Standards"],
    accreditation: "National Board of Technical Education / Pearson BTEC",
    description: "Applied engineering, laboratory instrumentation, industrial electronics, and technical operations."
  }
];

export const SUBJECT_STREAMS_BY_TIER = {
  higherEd: [
    { value: "Computer Science & Engineering (B.Tech/BS)", label: "Computer Science & AI (Algorithms, Systems, ML)" },
    { value: "Electrical & Electronics Engineering", label: "Electrical & Electronics (Circuits, Signals, VLSI)" },
    { value: "Mechanical & Aerospace Engineering", label: "Mechanical & Aerospace (Thermo, Fluids, CAD)" },
    { value: "Medical & Health Sciences (MBBS/MD)", label: "Medical Sciences (Anatomy, Physiology, Pathology)" },
    { value: "Physical Sciences & Mathematics (B.Sc/BS)", label: "Physics & Mathematics Core (Quantum, Calculus, Linear Algebra)" },
    { value: "Chemical & Biological Sciences (B.Sc/BS)", label: "Chemistry & Bio (Organic, Molecular Biology, Genetics)" },
    { value: "Business, Finance & Economics (BBA/MBA)", label: "Economics & Management (Micro/Macro, Accounting, Finance)" },
    { value: "Humanities, Law & Social Sciences", label: "Social Sciences, Law & Policy" }
  ],
  secondary: [
    { value: "Science (PCM / PCB)", label: "Science Core (Physics, Chem, Math, Bio)" },
    { value: "Mathematics & Computer Science", label: "Math & Computer Science (Informatics, Calculus)" },
    { value: "Commerce & Applied Economics", label: "Commerce (Accountancy, Business Studies, Economics)" },
    { value: "Humanities & Social Sciences", label: "Humanities (History, Political Science, Psychology)" },
    { value: "General Secondary STEM", label: "General Secondary Science & Mathematics" }
  ],
  middle: [
    { value: "Integrated Science & Mathematics", label: "Integrated Science & Mathematics Foundation" },
    { value: "General Core Curriculum", label: "General Core (Math, Science, Social Studies, English)" }
  ]
};

export const CUSTOM_CURRICULUM_PRESETS = [
  {
    presetId: "cs-univ-preset",
    presetName: "University Computer Science & AI (B.S. / B.Tech)",
    curriculumTitle: "Undergraduate Computer Science & Artificial Intelligence Syllabus",
    academicTier: "Undergraduate Year 1-4 (8 Semesters)",
    termStructure: "Semester System (8 Semesters, 160 Credits)",
    gradingSystem: "10-Point CGPA & Letter Grades (A+ to F)",
    accreditationBody: "University Board of Studies & Computing Academic Council",
    coreModules: ["Data Structures & Algorithms", "Computer Systems & OS", "Linear Algebra & Probability", "Machine Learning & Neural Nets", "Database Engineering", "Distributed Cloud Systems"],
    description: "Rigorous 4-year undergraduate curriculum covering core computing fundamentals, mathematical logic, software design, and modern artificial intelligence applications."
  },
  {
    presetId: "med-univ-preset",
    presetName: "Medical & Clinical Healthcare Sciences (MBBS / Pre-Med)",
    curriculumTitle: "Integrated Medical Sciences & Clinical Diagnostic Curriculum",
    academicTier: "Professional Degree (5.5 Years / Clinical Phases)",
    termStructure: "Phased Professional Years with Bedside Clinical Rotations",
    gradingSystem: "Competency-Based Medical Education (CBME Standards)",
    accreditationBody: "National Medical Council & University Faculty of Medicine",
    coreModules: ["Human Anatomy & Histology", "Medical Physiology", "Clinical Biochemistry", "Systemic Pathology & Microbiology", "Pharmacology & Therapeutics", "Community Medicine & Ethics"],
    description: "Competency-driven medical curriculum integrating preclinical biomedical sciences with hospital diagnostic problem solving and clinical bedside diagnostics."
  },
  {
    presetId: "eng-mech-preset",
    presetName: "Mechanical & Robotics Engineering (B.Tech / B.E.)",
    curriculumTitle: "Mechanical Engineering & Mechatronics Syllabus",
    academicTier: "Undergraduate (8 Semesters)",
    termStructure: "Semester System with Lab Practicals & Capstone",
    gradingSystem: "4.0 GPA / 10-Point CGPA Scale",
    accreditationBody: "Engineering Accreditation Board & Institute Academic Senate",
    coreModules: ["Engineering Mechanics & Statics", "Thermodynamics & Heat Transfer", "Fluid Dynamics", "Kinematics of Machines", "Robotics & Control Systems", "Finite Element Analysis (FEA)"],
    description: "Engineering framework emphasizing fundamental physical laws, computer-aided design, robotic kinematics, thermal systems, and multidisciplinary lab projects."
  }
];
