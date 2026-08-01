export interface Department {
  id: string;
  name: string;
  facultyCategory: 'Physical Sciences' | 'Biological Sciences' | 'Social Sciences & Humanities' | 'Support Services';
  overview: string;
  programs: string[];
}

export interface FacultyMember {
  id: string;
  deptId: string;
  name: string;
  designation: string;
  specialization: string;
  email: string;
  photo: string;
  qualification: string;
  biography: string;
  researchInterests: string[];
  publications: string[];
  googleScholar?: string;
  linkedin?: string;
  contactInfo: string;
}

const baseUrl = import.meta.env.BASE_URL || '/';

const facultyPhoto = (filename: string) =>
  `${baseUrl}faculty/faculty%20pic/${encodeURIComponent(filename)}`;

export const DEPARTMENTS: Department[] = [
  // ── Physical Sciences ──────────────────────────────────────────────
  {
    id: 'chemistry',
    name: 'BS Chemistry',
    facultyCategory: 'Physical Sciences',
    overview: 'The Department of Chemistry provides theoretical knowledge and practical laboratory experience in organic, inorganic, and physical chemistry. Students engage in experimental research, analytical testing, and safety-focused laboratory practices.',
    programs: ['BS Chemistry (4 Years)']
  },
  {
    id: 'computer-science',
    name: 'BS Computer Science',
    facultyCategory: 'Physical Sciences',
    overview: 'The Department of Computer Science at Government College Peshawar provides state-of-the-art education in computing. Equipped with modern computer labs and high-speed internet, we prepare students for careers in software development, AI, and IT.',
    programs: ['BS Computer Science (4 Years)']
  },
  {
    id: 'mathematics',
    name: 'BS Mathematics',
    facultyCategory: 'Physical Sciences',
    overview: 'The Department of Mathematics fosters analytical thinking and deep problem-solving skills. Our curriculum covers pure and applied mathematics, preparing students for careers in research, financial analysis, data science, and education.',
    programs: ['BS Mathematics (4 Years)']
  },
  {
    id: 'physics',
    name: 'BS Physics',
    facultyCategory: 'Physical Sciences',
    overview: 'The Department of Physics offers a comprehensive understanding of the physical world. Through experimental laboratory work and theoretical study, students explore classical mechanics, electromagnetic theory, thermodynamics, and modern quantum physics.',
    programs: ['BS Physics (4 Years)']
  },
  {
    id: 'statistics',
    name: 'BS Statistics',
    facultyCategory: 'Physical Sciences',
    overview: 'The Department of Statistics equips students with statistical methods, data analysis, and quantitative research skills essential for academia, industry, and public-sector decision making.',
    programs: ['BS Statistics (4 Years)']
  },
  {
    id: 'computer-sciences',
    name: 'Computer Sciences',
    facultyCategory: 'Physical Sciences',
    overview: 'The Computer Sciences programme builds foundational computing skills, programming concepts, and IT literacy for students preparing for higher studies in computer science and related fields.',
    programs: ['Computer Sciences']
  },
  {
    id: 'artificial-intelligence',
    name: 'Artificial Intelligence (New)',
    facultyCategory: 'Physical Sciences',
    overview: 'The Artificial Intelligence programme introduces students to modern AI concepts, machine learning foundations, and emerging intelligent systems — preparing graduates for the next generation of computing careers.',
    programs: ['BS Artificial Intelligence (4 Years)']
  },

  // ── Biological Sciences ────────────────────────────────────────────
  {
    id: 'botany',
    name: 'BS Botany',
    facultyCategory: 'Biological Sciences',
    overview: 'The Department of Botany specializes in plant sciences, ecology, physiology, and plant biochemistry. With well-equipped labs and field excursions, students explore biodiversity conservation and environmental challenges.',
    programs: ['BS Botany (4 Years)']
  },
  {
    id: 'zoology',
    name: 'BS Zoology',
    facultyCategory: 'Biological Sciences',
    overview: 'The Department of Zoology focuses on animal biology, physiology, genetics, evolution, and ecology. Students gain hands-on experience through laboratory investigations, microscope studies, and ecological field trips.',
    programs: ['BS Zoology (4 Years)']
  },
  {
    id: 'health-physical-education',
    name: 'BS Health & Physical Education',
    facultyCategory: 'Biological Sciences',
    overview: 'The Department of Health & Physical Education promotes fitness, sports science, and wellness education. Students develop practical coaching skills alongside theoretical knowledge of human movement and health.',
    programs: ['BS Health & Physical Education (4 Years)']
  },

  // ── Social Sciences & Humanities ───────────────────────────────────
  {
    id: 'arts-humanities',
    name: 'Arts/Humanities',
    facultyCategory: 'Social Sciences & Humanities',
    overview: 'The Arts and Humanities programme offers a broad liberal-arts foundation covering languages, social studies, and cultural subjects for students pursuing intermediate FA pathways.',
    programs: ['Arts/Humanities']
  },
  {
    id: 'economics',
    name: 'BS Economics',
    facultyCategory: 'Social Sciences & Humanities',
    overview: 'The Department of Economics introduces economic theories, market analysis, econometrics, and public policy. Students gain analytical tools to assess economic problems at local and global scales.',
    programs: ['BS Economics (4 Years)']
  },
  {
    id: 'english',
    name: 'BS English',
    facultyCategory: 'Social Sciences & Humanities',
    overview: 'The Department of English develops language proficiency, critical reading, and appreciation of global literature through balanced courses in linguistics, writing, and literary studies.',
    programs: ['BS English (4 Years)']
  },
  {
    id: 'geography',
    name: 'BS Geography',
    facultyCategory: 'Social Sciences & Humanities',
    overview: 'The Department of Geography explores human-environment relationships, physical mapping, climatology, and Geographic Information Systems (GIS). Students gain skills in field surveying and digital cartography.',
    programs: ['BS Geography (4 Years)']
  },
  {
    id: 'islamic-studies',
    name: 'BS Islamic Studies',
    facultyCategory: 'Social Sciences & Humanities',
    overview: 'The Department of Islamic Studies offers a comprehensive study of Islamic theology, history, jurisprudence, and contemporary Muslim thought, fostering scholarly understanding of Islamic civilization.',
    programs: ['BS Islamic Studies (4 Years)']
  },
  {
    id: 'pakistan-studies',
    name: 'BS Pakistan Studies',
    facultyCategory: 'Social Sciences & Humanities',
    overview: 'The Department of Pakistan Studies examines the history, politics, geography, and culture of Pakistan, preparing students for careers in civil service, education, journalism, and research.',
    programs: ['BS Pakistan Studies (4 Years)']
  },
  {
    id: 'political-science',
    name: 'BS Political Science',
    facultyCategory: 'Social Sciences & Humanities',
    overview: 'The Department of Political Science covers political systems, governance, public policy, and international relations — preparing students for public service, law, journalism, and academic research.',
    programs: ['BS Political Science (4 Years)']
  },
  {
    id: 'urdu',
    name: 'BS Urdu',
    facultyCategory: 'Social Sciences & Humanities',
    overview: 'The Department of Urdu promotes the national language, culture, and heritage, offering deep insights into Urdu poetry, prose, classical texts, and contemporary literary criticism.',
    programs: ['BS Urdu (4 Years)']
  },

  // ── Support & Services ─────────────────────────────────────────────
  {
    id: 'higher-education-department',
    name: 'Higher Education Department',
    facultyCategory: 'Support Services',
    overview: 'The Higher Education Department wing coordinates academic governance, faculty development, and policy alignment with the Higher Education Department of Khyber Pakhtunkhwa for Government College Peshawar.',
    programs: ['Academic Governance', 'Faculty Development', 'Policy Coordination']
  }
];

export const FACULTY_MEMBERS: FacultyMember[] = [
  // ── BS Urdu ────────────────────────────────────────────────────────
  {
    id: 'dr-usman-shah',
    deptId: 'urdu',
    name: 'Dr. Usman Shah',
    designation: 'Professor / Chief Proctor / Chairman CBS',
    specialization: 'Language and Literature / Social',
    email: 'usmanshah1421@gmail.com',
    photo: facultyPhoto('Dr. Usman Shah.jpg'),
    qualification: 'MA Urdu, MA Pashto, MA English, M.Ed, Ph.D',
    biography:
      'I have 24 years of teaching and 14 years of administrative experience. I have served as a Subject Specialist for 3 years in Khyber Pakhtunkhwa Textbook Board. My publications include over 15 textbooks for the Khyber Pakhtunkhwa Textbook Board Peshawar, Azad Jammu & Kashmir Textbook Board Muzaffarabad, and Punjab, as well as 7 general and student guidance books. Remained as a member of National Curriculum Committee Pakistan for 3 years, participated in many national and international educational workshops and conferences. Remained the chief editor of journal of languages and literature Pakistan as well as the chief editor of the Louh O Qalam research journal (the ever first research journal in private sector of Khyber Pakhtunkhwa, Pakistan.).',
    researchInterests: ['Language and Literature', 'Social Studies'],
    publications: ['15 research papers'],
    contactInfo: 'Government College Faqirabad, Peshawar'
  },

  // ── BS Statistics ──────────────────────────────────────────────────
  {
    id: 'luqman-ahmad-mullagori',
    deptId: 'statistics',
    name: 'Luqman Ahmad Mullagori',
    designation: 'Assistant Professor of Statistics',
    specialization: 'Statistical Methods & Higher Education',
    email: 'luqman.hed@gmail.com',
    photo: facultyPhoto('Luqman Ahmad Mullagori.jpg'),
    qualification: 'MSc Statistics',
    biography:
      'Luqman Ahmad Mullagori is an Assistant Professor of Statistics in the Higher Education Department, Khyber Pakhtunkhwa, Pakistan. He is dedicated to teaching, research, and academic excellence, with a strong interest in statistical methods and higher education. He actively contributes to faculty development, educational leadership, and initiatives aimed at improving the quality of higher education.',
    researchInterests: ['Statistical Methods', 'Higher Education', 'Faculty Development'],
    publications: [],
    contactInfo: 'Department of Statistics, Government College Peshawar'
  },
  {
    id: 'salman-ejaz',
    deptId: 'statistics',
    name: 'Salman Ejaz',
    designation: 'Associate Professor / Principal',
    specialization: 'Statistics, Artificial Intelligence & Emerging Technologies',
    email: 'salmanejaz5@gmail.com',
    photo: facultyPhoto('salman ejaz.jpg'),
    qualification: 'M.Phil Statistics',
    biography:
      'My name is Salman Ejaz, and I am working as Associate Professor of Statistics and Principal of Government College Peshawar. I am passionate about education, leadership, and lifelong learning. I strive to make a positive impact by improving educational standards and supporting students and teachers in achieving their goals. I have a strong interest in research, statistics, artificial intelligence, and emerging technologies. I believe in integrity, hard work, and continuous self-improvement, and I enjoy finding practical solutions to both academic and technical challenges.',
    researchInterests: ['Statistics', 'Artificial Intelligence', 'Emerging Technologies'],
    publications: [],
    contactInfo: 'Government College Peshawar'
  },
  {
    id: 'irfan-ullah',
    deptId: 'statistics',
    name: 'Irfan Ullah',
    designation: 'Assistant Professor',
    specialization: 'Statistics',
    email: 'irfanullah.pesh@gmail.com',
    photo: facultyPhoto('IRFAN ULLAH.jpg'),
    qualification: 'M.Sc Statistics',
    biography: 'Assistant Professor of Statistics at Government College Peshawar.',
    researchInterests: ['Statistics'],
    publications: [],
    contactInfo: 'Government College Peshawar'
  },

  // ── BS Zoology ─────────────────────────────────────────────────────
  {
    id: 'umer-syed',
    deptId: 'zoology',
    name: 'Umer Syed',
    designation: 'Lecturer',
    specialization: 'Medical Microbiology, Environmental Microbiology & Epidemiology',
    email: 'umersyedmardan@gmail.com',
    photo: facultyPhoto('umer syed.jpg'),
    qualification: 'MPhil',
    biography:
      'With a passion for microbiology and a commitment to excellence, I leverage my expertise to drive innovation in both education and industry. From the classrooms of Peshawar to the laboratories of PepsiCo, I blend scientific rigor with practical application. Dedicated to enhancing every project I engage with, I strive to foster growth and uphold the highest standards in my field. My journey is a testament to the power of knowledge and the pursuit of continuous improvement.',
    researchInterests: ['Medical Microbiology', 'Environmental Microbiology', 'Epidemiology'],
    publications: [
      'Umer S., Shakirullah., Aziz U., Baharullah., Hamid I., Wahab A., and Ali R. 2013. Prevalence and Antimicrobial Susceptibility Pattern of ESBL Producing Gram Negative Rods (GNRs) Causing Nosocomial Infection. Int. J. Res. Sci., 4(2), 171-176'
    ],
    contactInfo: 'Department of Zoology, Govt College Peshawar'
  },

  // ── BS English ─────────────────────────────────────────────────────
  {
    id: 'muhammad-tariq-afridi',
    deptId: 'english',
    name: 'Muhammad Tariq Afridi',
    designation: 'Associate Professor (English) & HOD Department of English',
    specialization: 'Applied Linguistics',
    email: 'qaisafridi@gmail.com',
    photo: facultyPhoto('Muhammad Tariq Afridi.jpg'),
    qualification: 'PhD in progress',
    biography:
      'Hails from The Heart of Tirah TSD Khyber, residing at Peshawar for service as well as family reasons. Associate Professor of English and Head of the Department of English at Government College Peshawar.',
    researchInterests: ['Applied Linguistics'],
    publications: ['CSS Handbook of Every Day Science'],
    contactInfo: 'BS Block, Government College Peshawar'
  },

  // ── BS Physics ─────────────────────────────────────────────────────
  {
    id: 'umar-farooq',
    deptId: 'physics',
    name: 'Umar Farooq',
    designation: 'Lecturer',
    specialization: 'Computational Physics & Renewable Energy',
    email: 'umarphysics9696@gmail.com',
    photo: facultyPhoto('UMAR FAROOQ.jpg'),
    qualification: 'MPhil Physics, B.Ed, M.Sc Maths',
    biography:
      'Umar Farooq is a Lecturer in Physics with over 11 years of teaching experience at Government College Peshawar. He holds an MPhil in Physics from Islamia College Peshawar and B.Ed from Abasyn University Peshawar. He is passionate about teaching, research, and mentoring students in physics. He has also completed his Master in Mathematics in 2022.',
    researchInterests: ['Computational Physics', 'Renewable Energy'],
    publications: [],
    contactInfo: 'Government College Peshawar'
  },
  {
    id: 'shahab-ullah',
    deptId: 'physics',
    name: 'Shahab Ullah',
    designation: 'Assistant Professor',
    specialization: 'Computational Physics',
    email: 'shahabph44@gmail.com',
    photo: facultyPhoto('Shahab Ullah.png'),
    qualification: 'MPhil (Physics)',
    biography:
      'I am Shahab Ullah, Assistant Professor (Physics) at Govt. College Peshawar. My qualification is MPhil (Physics). I have been teaching physics at FSc and BS level since 2012.',
    researchInterests: ['Computational Physics'],
    publications: [],
    linkedin: 'https://www.linkedin.com/in/shahab-khan-504931183',
    contactInfo: 'Govt. College Peshawar'
  },
  {
    id: 'syed-imran-ali-shah',
    deptId: 'physics',
    name: 'Syed Imran Ali Shah',
    designation: 'Assistant Professor of Electronics',
    specialization: 'Wireless Communications',
    email: 'imranashah789@gmail.com',
    photo: facultyPhoto('Syed Imran Ali Shah.jpg'),
    qualification: 'MSc Electronics, MS, B.Ed',
    biography:
      'Syed Imran Ali Shah, Village Sufaid Dheri, Mohallah Peeran, Tehsil and District Peshawar. Assistant Professor of Electronics at Government College Peshawar.',
    researchInterests: ['Wireless Communications'],
    publications: [],
    contactInfo: 'Government College Peshawar'
  },

  {
    id: 'tauseef-ali',
    deptId: 'physics',
    name: 'Tauseef Ali',
    designation: 'Assistant Professor',
    specialization: 'Nanomaterials, Sensors & Thin-Film Technology',
    email: 'qazitauseef.ali@gmail.com',
    photo: facultyPhoto('Tauseef Ali.jpg'),
    qualification: 'PhD Physics',
    biography:
      'Tauseef Ali, an Assistant Professor of Physics at Government College Peshawar. I did my PhD in Physics and have several years of teaching and research experience. My research interests include nanomaterials, sensors, and thin-film technology. I am committed to excellence in teaching, research, and academic development.',
    researchInterests: ['Nanomaterials', 'Thin Film Sensors'],
    publications: [],
    contactInfo: 'Government College Peshawar'
  },

  // ── Higher Education Department (Support & Services) ───────────────
  {
    id: 'dr-mudassir-shah',
    deptId: 'higher-education-department',
    name: 'Dr. Mudassir Shah',
    designation: 'Assistant Professor / Head of Zoology Department',
    specialization: 'Molecular Biology & Parasitology',
    email: 'mshahsafi75@gmail.com',
    photo: facultyPhoto('Dr. Mudassir shah.jpg'),
    qualification: 'PhD (Zoology), MPhil, MSc Zoology',
    biography:
      'I am Head of Zoology Department, Govt College Peshawar. I did my FSc from GPGC Mardan, BSc from Islamia College Peshawar, MSc Zoology from University of Peshawar, MPhil from Islamia College, and PhD from Dept of Zoology ICP. I have 19 publications.',
    researchInterests: ['Molecular Biology', 'Parasitology'],
    publications: ['19 research publications'],
    contactInfo: 'Department of Zoology, Govt College Peshawar'
  },

  // ── BS Mathematics ─────────────────────────────────────────────────
  {
    id: 'dr-zeyad-min-ullah',
    deptId: 'mathematics',
    name: 'Dr. Zeyad Min Ullah',
    designation: 'Associate Professor of Mathematics',
    specialization: 'Computational Mathematics (Numerical Analysis)',
    email: 'zminullah@gmail.com',
    photo: facultyPhoto('Dr. Zeyad Min Ullah.jpg'),
    qualification: 'Ph.D (Computational Mathematics), University of Engineering and Technology, Peshawar',
    biography:
      'Associate Professor of Mathematics, Ph.D from University of Engineering and Technology, Peshawar. Actively engaged in teaching and research in computational mathematics and numerical analysis at Government College Peshawar.',
    researchInterests: ['Computational Mathematics', 'Numerical Analysis'],
    publications: ['8 international research publications'],
    googleScholar: 'https://www.researchgate.net/',
    contactInfo: 'Department of Mathematics, GC Peshawar'
  },
  {
    id: 'ali-ahmad',
    deptId: 'mathematics',
    name: 'Dr. Ali Ahmad',
    designation: 'Assistant Professor',
    specialization: 'Medical Image Analysis, Machine Learning & Fuzzy Set Theory',
    email: 'aliahmadmath@gmail.com',
    photo: facultyPhoto('Ali Ahmad.png'),
    qualification: 'Ph.D. in Computational Mathematics',
    biography:
      'Dr. Ali Ahmad is an Assistant Professor of Mathematics in the Department of Mathematics at Government College Peshawar and holds a Ph.D. in Computational Mathematics. His research focuses on medical image analysis, variational image segmentation, fuzzy set theory, and artificial intelligence. He is actively engaged in teaching, research, and the development of advanced mathematical models for real-world applications in computational imaging and computer vision.',
    researchInterests: [
      'Medical Image Analysis',
      'Machine Learning',
      'Fuzzy Set Theory',
      'Variational Image Segmentation'
    ],
    publications: [],
    googleScholar: 'https://scholar.google.com/citations?user=EUgVyK0AAAAJ&hl=en',
    contactInfo: 'BS Block, Government College Peshawar'
  },

  // ── BS Chemistry ───────────────────────────────────────────────────
  {
    id: 'dr-ikhtiar-gul',
    deptId: 'chemistry',
    name: 'Dr. Ikhtiar Gul',
    designation: 'Lecturer',
    specialization: 'Photocatalysis, Heterogeneous Catalysis & Advanced Functional Nanomaterials',
    email: 'ikhtiargul616@gmail.com',
    photo: facultyPhoto('Dr. Ikhtiar Gul.png'),
    qualification: 'PhD Chemistry',
    biography:
      'Dr. Ikhtiar Gul is a Lecturer in Chemistry whose research advances sustainable solutions for global energy and environmental challenges through innovative materials science. His work combines rational catalyst design, advanced characterization and mechanistic investigations to develop high performance functional materials for clean energy conversion and environmental applications. He has authored over 24 peer-reviewed publications in leading journals, holds three filed patents, and has received competitive HEC scholarships, research funding, and multiple national research awards. Through collaborations with leading researchers in the US, China, and UAE, he contributes to the development of next-generation catalytic technologies with global scientific impact.',
    researchInterests: [
      'Photocatalysis',
      'Heterogeneous Catalysis',
      'Advanced Oxidation Processes',
      'Advanced Functional Nanomaterials',
      'Wastewater Treatment',
      'Environmental Remediation',
      'Sustainable Hydrogen Production',
      'Electrochemical Energy Conversion',
      'Materials Characterization'
    ],
    publications: [
      'I. Gul, M. Sayed, F. Rehman, W. Jinlong, P. Fu, Y. Zhang, M.N. Nadagouda, Unlocking the potential of multifunctional and highly porous Ti3C2/TiO2@ Bi2O3-based MXene: synergetic photocatalytic activation of peroxymonosulfate, hydrogen evolution and antimicrobial activity, Applied Catalysis B: Environment and Energy, 359 (2024) 124493.',
      'I. Gul, M. Sayed, F. Rehman, W. Jinlong, P. Fu, Y. Zhang, M.N. Nadagouda, Z-scheme Ti3C2@ Bi2O3 based MXene with multifaceted (001) and (101) TiO2 and Ti3+/oxygen vacancies: photocatalytic degradation of dichlorophen via peroxymonosulfate activation, energy utilization and antibacterial activities, Chemical Engineering Journal, 506 (2025) 159992.',
      'I. Gul, M. Sayed, N.S. Shah, F. Rehman, J.A. Khan, S. Gul, N. Bibi, J. Iqbal, A novel route for catalytic activation of peroxymonosulfate by oxygen vacancies improved bismuth-doped titania for the removal of recalcitrant organic contaminant, Environmental Science and Pollution Research, 28 (2021) 23368-23385.',
      'I. Gul, M. Sayed, N.S. Shah, J.A. Khan, K. Polychronopoulou, J. Iqbal, F. Rehman, Solar light responsive bismuth doped titania with Ti3+ for efficient photocatalytic degradation of flumequine: Synergistic role of peroxymonosulfate, Chemical Engineering Journal, 384 (2020) 123255.',
      'I. Gul, M. Sayed, T. Saeed, F. Rehman, A. Naeem, S. Gul, Q. Khan, K. Naz, M. ur Rehman, Unveiling cutting-edge progress in the fundamentals of MXene: Synthesis strategies, energy and bio-environmental applications, Coordination Chemistry Reviews, 511 (2024) 215870.'
    ],
    googleScholar: 'https://scholar.google.com/citations?user=WTFDtjkAAAAJ&hl=en&oi=ao',
    linkedin: 'https://www.linkedin.com/in/ikhtiar-gul-530732184/',
    contactInfo: 'Department of Chemistry, Government College Peshawar'
  }
];
