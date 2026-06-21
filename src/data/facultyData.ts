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

export const DEPARTMENTS: Department[] = [
  {
    id: 'computer-science',
    name: 'Computer Science Department',
    facultyCategory: 'Physical Sciences',
    overview: 'The Department of Computer Science at Government College Peshawar provides state-of-the-art education in computing. Equipped with modern computer labs and high-speed internet, we prepare students for dynamic careers in software development, AI, and IT. Our curriculum integrates theoretical principles with extensive practical laboratory sessions.',
    programs: ['BS Computer Science (4 Years)', 'FSc Computer Science (2 Years)', 'Free Graphic Design Course (KPITB/PAFH-IUST)']
  },
  {
    id: 'mathematics',
    name: 'Mathematics Department',
    facultyCategory: 'Physical Sciences',
    overview: 'The Department of Mathematics fosters analytical thinking and deep problem-solving skills. Our curriculum covers pure and applied mathematics, preparing students for successful careers in academic research, financial analysis, data science, and secondary education.',
    programs: ['BS Mathematics (4 Years)', 'Associate Degree (2 Years)', 'FSc Pre-Engineering (2 Years)']
  },
  {
    id: 'physics',
    name: 'Physics Department',
    facultyCategory: 'Physical Sciences',
    overview: 'The Department of Physics offers a comprehensive understanding of the physical world. Through rigorous experimental laboratory work and theoretical study, students explore classical mechanics, electromagnetic theory, thermodynamics, and modern quantum physics.',
    programs: ['BS Physics (4 Years)', 'Associate Degree (2 Years)', 'FSc Pre-Engineering (2 Years)']
  },
  {
    id: 'chemistry',
    name: 'Chemistry Department',
    facultyCategory: 'Physical Sciences',
    overview: 'The Department of Chemistry provides theoretical knowledge and practical laboratory experience in organic, inorganic, and physical chemistry. Our students engage in experimental research, analytical testing, and safety-focused laboratory practices.',
    programs: ['BS Chemistry (4 Years)', 'Associate Degree (2 Years)', 'FSc Pre-Medical (2 Years)']
  },
  {
    id: 'botany',
    name: 'Botany Department',
    facultyCategory: 'Biological Sciences',
    overview: 'The Department of Botany specializes in plant sciences, ecology, physiology, and plant biochemistry. With well-equipped labs, student-guided field excursions, and plant herbariums, we explore biodiversity conservation and environmental challenges.',
    programs: ['BS Botany (4 Years)', 'FSc Pre-Medical (2 Years)']
  },
  {
    id: 'zoology',
    name: 'Zoology Department',
    facultyCategory: 'Biological Sciences',
    overview: 'The Department of Zoology focuses on animal biology, physiology, genetics, evolution, and ecology. Students gain hands-on experience through advanced laboratory investigations, microscope studies, and local ecological field trips.',
    programs: ['BS Zoology (4 Years)', 'FSc Pre-Medical (2 Years)']
  },
  {
    id: 'english',
    name: 'English Department',
    facultyCategory: 'Social Sciences & Humanities',
    overview: 'The Department of English develops language proficiency, critical reading capabilities, and a deep appreciation of global literature. We offer balanced courses in linguistics, writing, and literature to foster creative communication and critical analysis.',
    programs: ['BS English (4 Years)', 'FA Humanities (2 Years)']
  },
  {
    id: 'political-science',
    name: 'Political Science Department',
    facultyCategory: 'Social Sciences & Humanities',
    overview: 'The Department of Political Science covers political systems, governance, public policies, and international relations. We aim to prepare students for public service careers, law, journalism, and academic research.',
    programs: ['BS Political Science (4 Years)', 'FA Humanities (2 Years)']
  },
  {
    id: 'urdu',
    name: 'Urdu Department',
    facultyCategory: 'Social Sciences & Humanities',
    overview: 'The Department of Urdu promotes the national language, culture, and heritage, offering deep insights into Urdu poetry, prose, classical texts, and contemporary literary criticism.',
    programs: ['BS Urdu (4 Years)', 'FA Humanities (2 Years)']
  },
  {
    id: 'arabic',
    name: 'Arabic Department',
    facultyCategory: 'Social Sciences & Humanities',
    overview: 'The Department of Arabic offers classical and modern Arabic language learning, enhancing the understanding of Islamic history, classical literature, grammar, and translation techniques.',
    programs: ['BS Arabic (4 Years)', 'FA Humanities (2 Years)']
  },
  {
    id: 'history',
    name: 'History Department',
    facultyCategory: 'Social Sciences & Humanities',
    overview: 'The Department of History covers local, regional, and global historical trajectories. We help students develop historical research skills and analyze how past societies shape contemporary socio-political developments.',
    programs: ['BS History (4 Years)', 'FA Humanities (2 Years)']
  },
  {
    id: 'geography',
    name: 'Geography Department',
    facultyCategory: 'Social Sciences & Humanities',
    overview: 'The Department of Geography explores human-environment relationships, physical mapping, climatology, and Geographic Information Systems (GIS). Our students gain skills in field surveying and digital cartography.',
    programs: ['BS Geography (4 Years)', 'Associate Degree (2 Years)', 'FA General Science (2-Year)']
  },
  {
    id: 'economics',
    name: 'Economics Department',
    facultyCategory: 'Social Sciences & Humanities',
    overview: 'The Department of Economics introduces economic theories, market analysis, econometrics, and public policy issues. We equip students with analytical tools to assess economic problems at local and global scales.',
    programs: ['BS Economics (4 Years)', 'Associate Degree (2 Years)']
  }
];

export const FACULTY_MEMBERS: FacultyMember[] = [
  // Computer Science
  {
    id: 'dr-ahmad-khan',
    deptId: 'computer-science',
    name: 'Dr. Ahmad Khan',
    designation: 'Professor & Chair',
    specialization: 'Artificial Intelligence & Machine Learning',
    email: 'ahmad.khan@gcpeshawar.edu.pk',
    photo: `${baseUrl}faculty/male1.png`,
    qualification: 'Ph.D. in Computer Science, University of Peshawar; Postdoc, Linköping University, Sweden',
    biography: 'Dr. Ahmad Khan has over 18 years of academic and research experience. He has published over 30 research articles in top-tier journals and has spearheaded several governmental IT initiatives in Khyber Pakhtunkhwa. He is passionate about mentoring undergraduate students in AI research.',
    researchInterests: ['Computer Vision', 'Deep Learning for Medical Imaging', 'Natural Language Processing for Pashto/Urdu'],
    publications: [
      'Khan, A., et al. "Deep Learning-based Diagnosis of Retinopathy," IEEE Access, 2024.',
      'Khan, A. "Pashto Language Modeling using Transformer Networks," Language Resources & Evaluation, 2022.'
    ],
    googleScholar: 'https://scholar.google.com/',
    linkedin: 'https://linkedin.com/',
    contactInfo: 'Room 102, Science Block A, GC Peshawar'
  },
  {
    id: 'dr-sara-ali',
    deptId: 'computer-science',
    name: 'Dr. Sara Ali',
    designation: 'Associate Professor',
    specialization: 'Software Engineering & Cloud Computing',
    email: 'sara.ali@gcpeshawar.edu.pk',
    photo: `${baseUrl}faculty/female1.png`,
    qualification: 'Ph.D. in Software Engineering, NUST Islamabad',
    biography: 'Dr. Sara Ali joined GC Peshawar in 2018. Her work focuses on cloud resource optimization and agile software methodologies. She coordinates the final year project defenses and industry internship programs for BS Computer Science.',
    researchInterests: ['Agile Methodologies', 'Cloud Architecture Optimization', 'IoT Systems Security'],
    publications: [
      'Ali, S. "A Framework for Microservice Migration in Cloud Environments," Journal of Systems and Software, 2023.',
      'Ali, S. "Securing Edge Devices in IoT Smart Campus Architectures," IEEE Internet of Things Journal, 2021.'
    ],
    googleScholar: 'https://scholar.google.com/',
    linkedin: 'https://linkedin.com/',
    contactInfo: 'Room 105, Science Block A, GC Peshawar'
  },
  {
    id: 'prof-usman-shah',
    deptId: 'computer-science',
    name: 'Prof. Usman Shah',
    designation: 'Assistant Professor',
    specialization: 'Data Science & Databases',
    email: 'usman.shah@gcpeshawar.edu.pk',
    photo: `${baseUrl}faculty/male2.png`,
    qualification: 'M.S. in Computer Science, FAST-NUCES Peshawar',
    biography: 'Prof. Usman Shah has been teaching database design and data structures at GC Peshawar since 2015. He represents the department in the college sports board and coordinates computing lab upgrades.',
    researchInterests: ['Big Data Analytics', 'Distributed Systems', 'Relational Database Performance'],
    publications: [
      'Shah, U. "Optimizing Query Execution in Distributed NoSQL Systems," Journal of Big Data, 2022.'
    ],
    googleScholar: 'https://scholar.google.com/',
    linkedin: 'https://linkedin.com/',
    contactInfo: 'Lab Coordinator Office, Main IT Lab, GC Peshawar'
  },
  // Mathematics
  {
    id: 'prof-tariq-mahmood',
    deptId: 'mathematics',
    name: 'Prof. Tariq Mahmood',
    designation: 'Professor & Head',
    specialization: 'Pure Mathematics & Algebra',
    email: 'tariq.mahmood@gcpeshawar.edu.pk',
    photo: `${baseUrl}faculty/male2.png`,
    qualification: 'M.Phil. in Mathematics, University of Peshawar',
    biography: 'Prof. Tariq Mahmood is one of the most senior faculty members at Government College Peshawar, with over 25 years of teaching service. He has authored multiple board text books in algebra and calculus.',
    researchInterests: ['Group Theory', 'Ring Theory', 'Mathematical Pedagogy'],
    publications: [
      'Mahmood, T. "On Finite Groups and Homology Relations," Peshawar Journal of Mathematics, 2019.'
    ],
    googleScholar: 'https://scholar.google.com/',
    contactInfo: 'Room 201, Science Block B, GC Peshawar'
  },
  {
    id: 'dr-ayesha-rehman',
    deptId: 'mathematics',
    name: 'Dr. Ayesha Rehman',
    designation: 'Assistant Professor',
    specialization: 'Applied Mathematics & Fluid Dynamics',
    email: 'ayesha.rehman@gcpeshawar.edu.pk',
    photo: `${baseUrl}faculty/female2.png`,
    qualification: 'Ph.D. in Applied Mathematics, QAU Islamabad',
    biography: 'Dr. Ayesha Rehman researches mathematical modeling of fluid flows. She coordinates semester system schedules and exam evaluations for the Mathematics department.',
    researchInterests: ['Computational Fluid Dynamics', 'Differential Equations', 'Numerical Methods'],
    publications: [
      'Rehman, A. "Numerical Study of Boundary Layer Flows over Stretching Sheets," Physics of Fluids, 2023.'
    ],
    googleScholar: 'https://scholar.google.com/',
    linkedin: 'https://linkedin.com/',
    contactInfo: 'Room 203, Science Block B, GC Peshawar'
  },
  // Physics
  {
    id: 'dr-bilal-ahmed',
    deptId: 'physics',
    name: 'Dr. Bilal Ahmed',
    designation: 'Professor & Head',
    specialization: 'Quantum Physics',
    email: 'bilal.ahmed@gcpeshawar.edu.pk',
    photo: `${baseUrl}faculty/male1.png`,
    qualification: 'Ph.D. in Physics, University of Punjab',
    biography: 'Dr. Bilal Ahmed directs the physical sciences laboratory and has over 20 years of research experience in quantum information theory and lasers.',
    researchInterests: ['Quantum Decoherence', 'Optoelectronics', 'Laser Spectroscopy'],
    publications: [
      'Ahmed, B. "Decoherence Control in Multi-qubit Systems," Physical Review A, 2022.'
    ],
    googleScholar: 'https://scholar.google.com/',
    contactInfo: 'Physics Lab Director Office, Ground Floor, GC Peshawar'
  },
  {
    id: 'prof-nida-yasmin',
    deptId: 'physics',
    name: 'Prof. Nida Yasmin',
    designation: 'Assistant Professor',
    specialization: 'Solid State Physics',
    email: 'nida.yasmin@gcpeshawar.edu.pk',
    photo: `${baseUrl}faculty/female1.png`,
    qualification: 'M.Phil. in Physics, Peshawar University',
    biography: 'Prof. Nida Yasmin manages the physics equipment repository and coordinates practical board exams for intermediate students.',
    researchInterests: ['Semiconductor Nanostructures', 'Thin Film Materials'],
    publications: [
      'Yasmin, N. "Structural Characterization of ZnO Thin Films," Materials Letters, 2021.'
    ],
    contactInfo: 'Main Physics Lab, GC Peshawar'
  },
  // Chemistry
  {
    id: 'dr-haroon-rasheed',
    deptId: 'chemistry',
    name: 'Dr. Haroon Rasheed',
    designation: 'Professor & Chair',
    specialization: 'Organic Chemistry',
    email: 'haroon.rasheed@gcpeshawar.edu.pk',
    photo: `${baseUrl}faculty/male2.png`,
    qualification: 'Ph.D. in Chemistry, HEJ Research Institute of Chemistry, Karachi',
    biography: 'Dr. Haroon Rasheed specializes in natural product isolation and medicinal chemistry. He has successfully patented two herbal extracts for local medicinal use.',
    researchInterests: ['Natural Product Chemistry', 'Bioactive Compounds Extraction', 'Spectroscopic Analysis'],
    publications: [
      'Rasheed, H. "Bioactive Alkaloids from Indigenous Herbs of KP," Phytochemistry, 2023.'
    ],
    googleScholar: 'https://scholar.google.com/',
    contactInfo: 'Chemistry Wing A, GC Peshawar'
  },
  {
    id: 'prof-sadia-farooq',
    deptId: 'chemistry',
    name: 'Prof. Sadia Farooq',
    designation: 'Assistant Professor',
    specialization: 'Physical Chemistry',
    email: 'sadia.farooq@gcpeshawar.edu.pk',
    photo: `${baseUrl}faculty/female2.png`,
    qualification: 'M.Phil. in Chemistry, University of Peshawar',
    biography: 'Prof. Sadia Farooq supervises chemical laboratory safety protocols and teaches chemical thermodynamics to BS students.',
    researchInterests: ['Chemical Kinetics', 'Photochemistry', 'Adsorption Processes'],
    publications: [
      'Farooq, S. "Adsorption Kinetics of Heavy Metals on Clay Minerals," Journal of Hazardous Materials, 2020.'
    ],
    contactInfo: 'Chemistry Lab B, GC Peshawar'
  },
  // Botany
  {
    id: 'dr-muhammad-irfan',
    deptId: 'botany',
    name: 'Dr. Muhammad Irfan',
    designation: 'Professor & Head',
    specialization: 'Plant Ecology & Flora of KP',
    email: 'irfan.botany@gcpeshawar.edu.pk',
    photo: `${baseUrl}faculty/male1.png`,
    qualification: 'Ph.D. in Plant Ecology, Quaid-i-Azam University, Islamabad',
    biography: 'Dr. Muhammad Irfan has published extensively on the flora of northern Pakistan and Khyber Pakhtunkhwa. He maintains the college herbarium and guides seasonal flora cataloging field trips.',
    researchInterests: ['Ethnobotany', 'Biodiversity Cataloging', 'Climate Change Effects on Alpine Plants'],
    publications: [
      'Irfan, M. "Ethnobotany of District Peshawar," Pakistan Journal of Botany, 2022.'
    ],
    googleScholar: 'https://scholar.google.com/',
    contactInfo: 'Botany Dept Office, Block C, GC Peshawar'
  },
  {
    id: 'prof-lubna-jamil',
    deptId: 'botany',
    name: 'Prof. Lubna Jamil',
    designation: 'Assistant Professor',
    specialization: 'Plant Physiology',
    email: 'lubna.jamil@gcpeshawar.edu.pk',
    photo: `${baseUrl}faculty/female1.png`,
    qualification: 'M.Phil. in Botany, University of Peshawar',
    biography: 'Prof. Lubna Jamil oversees botany laboratory courses and advises the student botany society.',
    researchInterests: ['Salt Stress in Crops', 'Phytohormones'],
    publications: [],
    contactInfo: 'Botany Lab 1, GC Peshawar'
  },
  // Zoology
  {
    id: 'dr-khalid-khan',
    deptId: 'zoology',
    name: 'Dr. Khalid Khan',
    designation: 'Professor & Chair',
    specialization: 'Entomology & Parasitology',
    email: 'khalid.zoology@gcpeshawar.edu.pk',
    photo: `${baseUrl}faculty/male2.png`,
    qualification: 'Ph.D. in Zoology, University of Peshawar',
    biography: 'Dr. Khalid Khan is a recognized authority on vector-borne insect studies in Peshawar valley. He coordinates research seminars in biological sciences.',
    researchInterests: ['Mosquito vectors control', 'Parasitic diseases modeling'],
    publications: [
      'Khan, K. "Seasonal Abundance of Mosquito Species in Peshawar Valley," Acta Tropica, 2021.'
    ],
    googleScholar: 'https://scholar.google.com/',
    contactInfo: 'Zoology Block, GC Peshawar'
  },
  {
    id: 'prof-zainab-bibi',
    deptId: 'zoology',
    name: 'Prof. Zainab Bibi',
    designation: 'Assistant Professor',
    specialization: 'Molecular Biology',
    email: 'zainab.zoology@gcpeshawar.edu.pk',
    photo: `${baseUrl}faculty/female2.png`,
    qualification: 'M.Phil. in Zoology, Hazara University',
    biography: 'Prof. Zainab Bibi teaches molecular genetics and coordinates student practicals in the zoology labs.',
    researchInterests: ['Genetics', 'Cell Biology'],
    publications: [],
    contactInfo: 'Zoology Lab A, GC Peshawar'
  },
  // English
  {
    id: 'prof-imran-qureshi',
    deptId: 'english',
    name: 'Prof. Imran Qureshi',
    designation: 'Professor & Head',
    specialization: 'English Literature & Postcolonial Studies',
    email: 'imran.qureshi@gcpeshawar.edu.pk',
    photo: `${baseUrl}faculty/male1.png`,
    qualification: 'M.A. in English Literature, University of Peshawar',
    biography: 'Prof. Imran Qureshi has taught English literature and language at GC Peshawar since 2002. He serves as the chief editor of the college magazine and mentors the student literary society.',
    researchInterests: ['Modern English Poetry', 'Postcolonial Pakistani Literature'],
    publications: [],
    contactInfo: 'English Department Wing, Admin Block, GC Peshawar'
  },
  {
    id: 'dr-maria-shafiq',
    deptId: 'english',
    name: 'Dr. Maria Shafiq',
    designation: 'Assistant Professor',
    specialization: 'Linguistics & Discourse Analysis',
    email: 'maria.shafiq@gcpeshawar.edu.pk',
    photo: `${baseUrl}faculty/female1.png`,
    qualification: 'Ph.D. in Linguistics, BZU Multan',
    biography: 'Dr. Maria Shafiq joined the department in 2020. She coordinates communication skills courses across all BS majors and coordinates language laboratory sessions.',
    researchInterests: ['Sociolinguistics', 'Bilingualism in KP', 'Critical Discourse Analysis'],
    publications: [
      'Shafiq, M. "Code-switching patterns among university students in Peshawar," World Englishes, 2023.'
    ],
    googleScholar: 'https://scholar.google.com/',
    linkedin: 'https://linkedin.com/',
    contactInfo: 'English Dept Office, Admin Block, GC Peshawar'
  },
  // Political Science
  {
    id: 'dr-sajid-ali',
    deptId: 'political-science',
    name: 'Dr. Sajid Ali',
    designation: 'Professor & Chair',
    specialization: 'Comparative Politics & Governance',
    email: 'sajid.ps@gcpeshawar.edu.pk',
    photo: `${baseUrl}faculty/male2.png`,
    qualification: 'Ph.D. in Political Science, University of Peshawar',
    biography: 'Dr. Sajid Ali is an expert on constitutional governance and public policy systems in South Asia. He organizes annual student model parliaments.',
    researchInterests: ['Federalism in Pakistan', 'Local Government Systems'],
    publications: [
      'Ali, S. "Federalism and the 18th Amendment: A Ten Year Review," Pakistan Horizon, 2022.'
    ],
    googleScholar: 'https://scholar.google.com/',
    contactInfo: 'Room 301, Humanities Block, GC Peshawar'
  },
  {
    id: 'prof-farzana-begum',
    deptId: 'political-science',
    name: 'Prof. Farzana Begum',
    designation: 'Assistant Professor',
    specialization: 'International Relations',
    email: 'farzana.ps@gcpeshawar.edu.pk',
    photo: `${baseUrl}faculty/female2.png`,
    qualification: 'M.Phil. in International Relations, Quaid-i-Azam University',
    biography: 'Prof. Farzana Begum conducts courses on foreign policy and international organizations. She advises the college debating society.',
    researchInterests: ['CPEC and Regional Security', 'Foreign Policy of Pakistan'],
    publications: [],
    contactInfo: 'Room 303, Humanities Block, GC Peshawar'
  },
  // Urdu
  {
    id: 'dr-abdul-latif',
    deptId: 'urdu',
    name: 'Dr. Abdul Latif',
    designation: 'Professor & Head',
    specialization: 'Urdu Prose & Literary History',
    email: 'latif.urdu@gcpeshawar.edu.pk',
    photo: `${baseUrl}faculty/male1.png`,
    qualification: 'Ph.D. in Urdu Literature, University of Peshawar',
    biography: 'Dr. Abdul Latif has authored three books on the history of Urdu fiction in the frontier region. He coordinates poetry symposia (Mushairas) at the college.',
    researchInterests: ['Classic Urdu Fiction', 'Iqbaliyat', 'Literary Criticism'],
    publications: [
      'Latif, A. "Historical Evolution of Urdu Novel in KP," Daryaft, 2021.'
    ],
    contactInfo: 'Urdu Office, Humanities Block, GC Peshawar'
  },
  {
    id: 'prof-amna-malik',
    deptId: 'urdu',
    name: 'Prof. Amna Malik',
    designation: 'Assistant Professor',
    specialization: 'Urdu Poetry',
    email: 'amna.urdu@gcpeshawar.edu.pk',
    photo: `${baseUrl}faculty/female1.png`,
    qualification: 'M.Phil. in Urdu literature, Peshawar University',
    biography: 'Prof. Amna Malik teaches classical ghazal history and coordinates drama productions for the student arts society.',
    researchInterests: ['Classical Urdu Ghazal', 'Modern Progressive Poetry'],
    publications: [],
    contactInfo: 'Urdu Dept Room 12, GC Peshawar'
  },
  // Arabic
  {
    id: 'dr-hafiz-rehman',
    deptId: 'arabic',
    name: 'Dr. Hafiz Ur Rehman',
    designation: 'Professor & Head',
    specialization: 'Arabic Grammar & Linguistics',
    email: 'hafiz.arabic@gcpeshawar.edu.pk',
    photo: `${baseUrl}faculty/male2.png`,
    qualification: 'Ph.D. in Arabic, University of Peshawar',
    biography: 'Dr. Hafiz Ur Rehman teaches classical Arabic morphology, rhetoric, and literature. He conducts specialized workshops in Arabic calligraphy.',
    researchInterests: ['Quranic Linguistics', 'Classical Arabic Poetry'],
    publications: [
      'Rehman, H. "Linguistic Harmony in Arabic Rhetorical Devices," Al-Dirasat Al-Islamiyyah, 2023.'
    ],
    contactInfo: 'Arabic Dept Office, Ground Floor, Humanities Block'
  },
  // History
  {
    id: 'prof-shahid-khan',
    deptId: 'history',
    name: 'Prof. Shahid Khan',
    designation: 'Associate Professor & Head',
    specialization: 'South Asian History',
    email: 'shahid.history@gcpeshawar.edu.pk',
    photo: `${baseUrl}faculty/male2.png`,
    qualification: 'M.Phil. in History, University of Peshawar',
    biography: 'Prof. Shahid Khan specializes in the regional history of the Khyber Pass and the Gandhara civilization. He organizes historical trips for students.',
    researchInterests: ['Ancient Gandhara History', 'KP Political History'],
    publications: [],
    contactInfo: 'History Dept, Humanities Block, GC Peshawar'
  },
  // Geography
  {
    id: 'dr-yasmin-shah',
    deptId: 'geography',
    name: 'Dr. Yasmin Shah',
    designation: 'Assistant Professor & Head',
    specialization: 'GIS & Remote Sensing',
    email: 'yasmin.geog@gcpeshawar.edu.pk',
    photo: `${baseUrl}faculty/female2.png`,
    qualification: 'Ph.D. in Geography, University of Peshawar',
    biography: 'Dr. Yasmin Shah teaches physical geography and guides mapping practicums using GIS platforms. She coordinates academic environmental surveys.',
    researchInterests: ['GIS applications in Urban Planning', 'Glacier Dynamics in Northern Pakistan'],
    publications: [
      'Shah, Y. "Urban Expansion Analysis of Peshawar Valley using RS Data," Pakistan Geographical Review, 2022.'
    ],
    contactInfo: 'Geography Laboratory Room, GC Peshawar'
  },
  // Economics
  {
    id: 'prof-waheed-ullah',
    deptId: 'economics',
    name: 'Prof. Waheed Ullah',
    designation: 'Associate Professor & Head',
    specialization: 'Development Economics & Public Finance',
    email: 'waheed.econ@gcpeshawar.edu.pk',
    photo: `${baseUrl}faculty/male1.png`,
    qualification: 'M.Phil. in Economics, University of Peshawar',
    biography: 'Prof. Waheed Ullah has taught economics to intermediate and degree classes for over 15 years. He oversees budgeting seminars and acts as student advisor.',
    researchInterests: ['Public Debt in Pakistan', 'KP Local Economy Dynamics'],
    publications: [],
    contactInfo: 'Economics Wing, Admin Block, GC Peshawar'
  }
];
