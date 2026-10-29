/** Official-style facts: Wikipedia + KP HED public listings (verify phone/email with the college office). */

export const SITE = {
  shortName: 'GC Peshawar',
  fullName: 'Government College Peshawar',
  tagline:
    'A historic public sector college near Shahi Bagh, Peshawar, offering Intermediate, Degree, and BS programmes affiliated with the University of Peshawar and BISE Peshawar.',
  established: 1959,
  campusSince: 1959,
  principal: 'Prof. Shafi Ullah Khattak',
  chiefProctor: 'Dr. Usman Shah Katlang',
  addressLine: 'Zaryab Colony, Faqirabad',
  city: 'Peshawar, Khyber Pakhtunkhwa, Pakistan',
  phone: '091-9211283',
  email: 'gcpeshawar@hed.gkp.pk',
  facebookUrl: 'https://www.facebook.com/gcpeshawar01/',
  /** Official page photo albums — use for gallery CTAs (Facebook does not allow stable hotlinks). */
  facebookPhotosUrl: 'https://www.facebook.com/gcpeshawar01/photos',
  hedAdmissionUrl: 'https://admission.hed.gkp.pk/college.php?college_id=3',
  hedCollegeUrl: 'https://hed.gkp.pk/',
  wikipediaUrl: 'https://en.wikipedia.org/wiki/Government_College_Peshawar',
  mapQuery: 'Government College Peshawar',
  vision:
    'To provide affordable, high-quality education that empowers students with both knowledge and character to lead and serve society effectively.',
} as const;

export const PROGRAMS = {
  intermediate: [
    'FSc Pre-Medical (2 years)',
    'FSc Pre-Engineering (2 years)',
    'FSc Computer Science (2 years)',
    'FA General Science (2 years)',
    'FA Humanities (2 years)',
  ],
  degreeTwoYear: ['BA Humanities (2 years)', 'Associate Degree (2 years)'],
  bsFourYear: [
    'Arts/Humanities',
    'BS Botany',
    'BS Chemistry',
    'BS Computer Science',
    'BS Economics',
    'BS English',
    'BS Geography',
    'BS Health & Physical Education',
    'BS Islamic Studies',
    'BS Mathematics',
    'BS Pakistan Studies',
    'BS Physics',
    'BS Political Science',
    'BS Statistics',
    'BS Urdu',
    'BS Zoology',
    'Computer Sciences',
    'Pre-Engineering',
    'Pre-Medical',
    'Artificial Intelligence (New)',
  ],
} as const;
