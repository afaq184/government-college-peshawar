import { SITE } from '../site';
import type { GalleryItem, NewsItem, SiteSettings } from '../types/cms';

const base = import.meta.env.BASE_URL;

const galleryTitles = [
  'Annual Sports Day Inauguration',
  'College Science Lab Session',
  'Principal addressing the Students at Shahi Bagh Event',
  'Faculty Meeting in Staff Room',
  'Students attending Intermediate Physics Lecture',
  'Inter-College Cricket Tournament',
  'Tree Plantation Drive on Campus Lawns',
  'Annual Prize Distribution Ceremony',
  'Seminar on Modern Higher Education in KP',
  'Board Examination in Main Hall',
  'Language & Literature Society Discussion',
  'Student Counseling and Career Workshop',
  'Library Study & Reference Section',
  'Independence Day Celebrations',
  'KP HED Officials Visit to Campus',
  'Chemistry Practical Session',
  'Alumni Reunion Meet',
  'College Main Building Entrance',
  'Computer Science Lab Session',
  'Faculty Group Photo',
  'Parent-Teacher Association Meeting',
  'Students Celebrating Exam Success',
  'Inter-Class Debate Competition',
  'Fine Arts Society Exhibition',
  'Staff Seminar on Academic Excellence',
  'Morning Assembly and National Anthem',
  'Botanical Garden Tour',
  'College Quiz Competition Winners',
];

const categories = ['Campus', 'Academics', 'Events'] as const;
const excludedImages = [11, 12, 26, 28];

export function getDefaultGallery(): Omit<GalleryItem, 'id'>[] {
  return Array.from({ length: 28 }, (_, i) => {
    const n = i + 1;
    return {
      title: galleryTitles[i] || `Campus Highlight ${n}`,
      category: categories[i % categories.length],
      image: `${base}gallery/p${n}.jpeg`,
      order: n,
      imgClass: n === 3 ? 'object-contain bg-slate-950 p-2' : 'object-cover object-center',
    };
  }).filter((_, i) => !excludedImages.includes(i + 1));
}

export function getDefaultNews(): Omit<NewsItem, 'id'>[] {
  return [
    {
      category: 'Official Notification',
      date: '16-06-2026',
      title: 'University of Peshawar – Re-Revised Exam Fee Schedule',
      desc: 'The Controller of Examinations has re-revised the fee structure and dates for BS 4-Year Program 2nd, 4th, 6th & 8th Semester Examinations (Spring 2026). Normal fee deadline: 24-06-2026, Late fee: 30-06-2026, Double fee: 06-07-2026, Triple fee: 13-07-2026. HEC Sports Charges are deferred per directive. Fees must be paid via Bank of Khyber, Campus Branch Peshawar only.',
      link: 'Read Notice',
      href: SITE.facebookUrl,
      external: true,
      image: `${base}news/gn1.jpg`,
      order: 1,
    },
    {
      category: 'Student Welfare',
      date: 'Undated',
      title: "Sports Fees Issue Resolved in Students' Favor",
      desc: 'Principal Professor Shafiullah Khattak and Additional Director Ishtiaq Sahib, along with BS Coordinator Syed Wali, held successful talks with the Vice Chancellor of University of Peshawar, Dr. Jabar Ali, on the sports fees issue. Key outcomes: students will NOT need to pay current/past sports fee arrears with exam forms; fees are deferred pending further consultation post-exams; since the original 2021 Syndicate decision created the issue, a permanent resolution will be pursued in an upcoming Syndicate meeting.',
      link: 'Read Article',
      href: SITE.facebookUrl,
      external: true,
      image: `${base}news/gn2.jpg`,
      order: 2,
    },
    {
      category: 'Lost & Found',
      date: 'Undated',
      title: 'CNIC Found – Mr. Sana Ullah',
      desc: 'A National Identity Card (CNIC) belonging to Mr. Sana Ullah has been found and submitted to the Superintendent Office. He is requested to collect it at the earliest, bringing appropriate ID for verification.',
      link: 'Contact Office',
      href: '/contact',
      external: false,
      image: `${base}news/gn3.jpg`,
      order: 3,
    },
    {
      category: 'Course Announcement',
      date: 'Starts 15 June 2026',
      title: 'Free Graphics Designing Course Launched',
      desc: 'In collaboration with KPITB and Pak-Austria Fachhochschule: Isar University, GC Peshawar is offering a free Graphic Design course (Photoshop & Illustrator) for First Year, Second Year, and BS students. Duration ~2.5 months, classes daily 9:00 AM–12:00 PM, limited to 50 students on a first-come-first-served basis. Registration forms must be submitted to Professor Rahat Khan, Chairman, Computer Science Department.',
      link: 'View Details',
      href: SITE.facebookUrl,
      external: true,
      image: `${base}news/gn4.jpg`,
      order: 4,
    },
    {
      category: 'Greeting',
      date: 'Undated',
      title: 'Eid-ul-Adha Mubarak from the Principal',
      desc: 'Professor Shafiullah Khattak, Principal of GC Peshawar, extends Eid-ul-Adha greetings to all Muslims, professors, ministerial staff, friends, relatives, and students.',
      link: 'View Greeting',
      href: SITE.facebookUrl,
      external: true,
      image: `${base}news/gn5.jpg`,
      order: 5,
    },
    {
      category: 'Sports Achievement',
      date: 'Undated',
      title: 'Bank Alfalah 55th National Volleyball Championship – Wah Cantt',
      desc: 'A player (jersey #04) celebrates with the Winner trophy and a gold medal from the Bank Alfalah 55th National Senior Men\'s Volleyball Championship.',
      link: 'View Photos',
      href: SITE.facebookUrl,
      external: true,
      image: `${base}news/gn6.jpg`,
      order: 6,
    },
    {
      category: 'Sports Achievement',
      date: 'Undated',
      title: 'Volleyball Player Wins Top Honors',
      desc: 'A player (jersey #07) poses with a "Winner" trophy and a "Best Outside Hitter" award at a national volleyball championship sponsored by Bank Alfalah, Pepsi, Zong 5G, and others.',
      link: 'View Photos',
      href: SITE.facebookUrl,
      external: true,
      image: `${base}news/gn7.jpg`,
      order: 7,
    },
    {
      category: 'Board Notice',
      date: 'Undated',
      title: 'BISEP Practical Date Sheet Updated',
      desc: 'The Board of Intermediate & Secondary Education Peshawar has updated the practical exam date sheet for the Annual Intermediate Exam 2026. Candidates are instructed to download their new roll number slips immediately from the official BISEP portal (portal.bisep.edu.pk/rno_online_hssc/) to avoid issues.',
      link: 'BISEP Portal',
      href: 'https://portal.bisep.edu.pk/rno_online_hssc/',
      external: true,
      image: `${base}news/gn8.jpg`,
      order: 8,
    },
    {
      category: 'Results',
      date: '14 May 2026',
      title: 'Fall Semester 2025 Results Announcement Begins',
      desc: 'Results for exams held in March/April (Fall Semester 2025) have started being announced. Political Science semester result was officially announced today. Remaining departments/semesters\' results will follow gradually.',
      link: 'View Results',
      href: SITE.facebookUrl,
      external: true,
      image: `${base}news/gn9.jpg`,
      order: 9,
    },
    {
      category: 'Achievement',
      date: 'Undated',
      title: 'Mission Accomplished – Final Year Project Defense',
      desc: 'CS department students pose with faculty mentors after successfully defending their final year project. Tagged #NewBeginnings #CSJourney.',
      link: 'View Photos',
      href: SITE.facebookUrl,
      external: true,
      image: `${base}news/gn10.jpg`,
      order: 10,
    },
    {
      category: 'Campus Theme',
      date: 'Undated',
      title: '"Learning Today, Leading Tomorrow"',
      desc: 'A motivational campus poster featuring classroom scenes, with the tagline "Knowledge shapes character, and character shapes the future," highlighting values: Seek Knowledge, Build Character, Achieve Success, Stay Focused, Keep Learning, Create Impact.',
      link: 'View Poster',
      href: SITE.facebookUrl,
      external: true,
      image: `${base}news/gn11.jpg`,
      order: 11,
    },
    {
      category: 'Notice',
      date: 'Undated',
      title: 'Important Message for Exam-Going Students',
      desc: "GC Peshawar's First Year and Second Year students sitting exams at other colleges are told to immediately contact Principal Professor Shafiullah on WhatsApp (0333-8471235) if they face issues like clean water, electricity, furniture, fans, discipline, or facilities during exams.",
      link: 'Read Notice',
      href: SITE.facebookUrl,
      external: true,
      image: `${base}news/gn12.jpg`,
      order: 12,
    },
    {
      category: 'Workshop',
      date: 'Undated',
      title: 'Stress Management Seminar at GC Peshawar',
      desc: 'A session on the "General Adaptation Syndrome – Hans Selye (1956)" was held, covering the three stages of stress response (Alarm, Resistance, Exhaustion). College officials, a police representative, and faculty attended alongside students presenting.',
      link: 'View Photos',
      href: SITE.facebookUrl,
      external: true,
      image: `${base}news/gn13.jpg`,
      order: 13,
    },
  ];
}

export function getDefaultSiteSettings(): SiteSettings {
  return {
    shortName: SITE.shortName,
    fullName: SITE.fullName,
    tagline: SITE.tagline,
    established: SITE.established,
    campusSince: SITE.campusSince,
    principal: SITE.principal,
    chiefProctor: SITE.chiefProctor,
    addressLine: SITE.addressLine,
    city: SITE.city,
    phone: SITE.phone,
    email: SITE.email,
    facebookUrl: SITE.facebookUrl,
    facebookPhotosUrl: SITE.facebookPhotosUrl,
    hedAdmissionUrl: SITE.hedAdmissionUrl,
    hedCollegeUrl: SITE.hedCollegeUrl,
    wikipediaUrl: SITE.wikipediaUrl,
    mapQuery: SITE.mapQuery,
    vision: SITE.vision,
    heroImage: `${base}hero-campus.jpg`,
    principalImage: `${base}principle.png`,
    aboutImage: `${base}about-campus.jpg`,
    chiefProctorImage: `${base}dr-usman-shah-katlang.png`,
  };
}

/** Merge Firebase site settings with build defaults (keeps new principal when CMS is stale). */
export function resolveSiteSettings(data: Partial<SiteSettings> | null | undefined): SiteSettings {
  const defaults = getDefaultSiteSettings();
  if (!data) return defaults;
  const merged = { ...defaults, ...data };
  if (!data.principal || /shafi/i.test(data.principal)) {
    merged.principal = defaults.principal;
  }
  if (!data.principalImage || /principal\.jpe?g/i.test(data.principalImage)) {
    merged.principalImage = defaults.principalImage;
  }
  return merged;
}
