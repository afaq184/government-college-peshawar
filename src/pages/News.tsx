import { motion } from 'motion/react';
import { Bell, Calendar, FileText, ChevronRight, Download, ExternalLink } from 'lucide-react';
import { SITE } from '../site';

const base = import.meta.env.BASE_URL;

/** Official notices and press clippings — images in `public/news/`. Verify dates with the college office. */
const newsItems = [
  {
    category: 'Official Notification',
    date: '16-06-2026',
    title: 'University of Peshawar – Re-Revised Exam Fee Schedule',
    desc: 'The Controller of Examinations has re-revised the fee structure and dates for BS 4-Year Program 2nd, 4th, 6th & 8th Semester Examinations (Spring 2026). Normal fee deadline: 24-06-2026, Late fee: 30-06-2026, Double fee: 06-07-2026, Triple fee: 13-07-2026. HEC Sports Charges are deferred per directive. Fees must be paid via Bank of Khyber, Campus Branch Peshawar only.',
    link: 'Read Notice',
    href: SITE.facebookUrl,
    external: true,
    image: `${base}news/gn1.jpg`,
  },
  {
    category: 'Student Welfare',
    date: 'Undated',
    title: 'Sports Fees Issue Resolved in Students\' Favor',
    desc: 'Principal Professor Shafiullah Khattak and Additional Director Ishtiaq Sahib, along with BS Coordinator Syed Wali, held successful talks with the Vice Chancellor of University of Peshawar, Dr. Jabar Ali, on the sports fees issue. Key outcomes: students will NOT need to pay current/past sports fee arrears with exam forms; fees are deferred pending further consultation post-exams; since the original 2021 Syndicate decision created the issue, a permanent resolution will be pursued in an upcoming Syndicate meeting.',
    link: 'Read Article',
    href: SITE.facebookUrl,
    external: true,
    image: `${base}news/gn2.jpg`,
  },
  {
    category: 'Lost & Found',
    date: 'Undated',
    title: 'CNIC Found – Mr. Sana Ullah',
    desc: 'A National Identity Card (CNIC) belonging to Mr. Sana Ullah has been found and submitted to the Superintendent Office. He is requested to collect it at the earliest, bringing appropriate ID for verification.',
    link: 'Contact Office',
    href: '#/contact',
    external: false,
    image: `${base}news/gn3.jpg`,
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
  },
  {
    category: 'Notice',
    date: 'Undated',
    title: 'Important Message for Exam-Going Students',
    desc: 'GC Peshawar\'s First Year and Second Year students sitting exams at other colleges are told to immediately contact Principal Professor Shafiullah on WhatsApp (0333-8471235) if they face issues like clean water, electricity, furniture, fans, discipline, or facilities during exams.',
    link: 'Read Notice',
    href: SITE.facebookUrl,
    external: true,
    image: `${base}news/gn12.jpg`,
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
  },
];

export default function News() {
  return (
    <div className="flex flex-col">
      <section className="pt-1 pb-14 md:pt-2 md:pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-bold text-academy-green mb-6">News & updates</h1>
          <p className="text-xl text-slate-500 max-w-2xl leading-relaxed">
            Official notices, examination circulars, and press coverage, shown here as published. Always confirm dates and procedures
            with the college office, Facebook page, and KP HED / board notices.
          </p>
        </div>
      </section>

      <section className="pb-14 md:pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              {newsItems.map((item, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  key={idx}
                  className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 flex flex-col md:flex-row group hover-lift hover-glow transition-all duration-500"
                >
                  <div className="md:w-2/5 aspect-[4/3] md:aspect-auto md:min-h-[220px] overflow-hidden relative bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover object-top transition-all duration-700 group-hover:scale-[1.03]"
                      loading={idx < 3 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-academy-green/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>
                  <div className="md:w-3/5 p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="bg-academy-green/10 text-academy-green text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest group-hover:bg-academy-gold group-hover:text-white transition-colors duration-300">
                        {item.category}
                      </span>
                      <span className="text-slate-400 text-xs font-medium">{item.date}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-academy-green mb-4 leading-tight group-hover:text-academy-gold transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-4">{item.desc}</p>
                    <a
                      href={item.href}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                      className="flex items-center gap-2 text-academy-green font-bold text-sm hover:gap-3 transition-all group/btn w-fit"
                    >
                      {item.link}
                      {item.external ? <ExternalLink size={16} /> : <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />}
                    </a>
                  </div>
                </motion.div>
              ))}

              <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest pt-4">
                {newsItems.length} items - newest press items listed first
              </p>
            </div>

            <div className="space-y-8">
              <div className="bg-academy-gold/10 p-10 rounded-[2.5rem] border border-academy-gold/20 relative overflow-hidden hover-glow transition-all duration-500 group cursor-pointer">
                <div className="absolute -top-4 -right-4 text-academy-gold/10 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700">
                  <Bell size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 text-academy-gold mb-6">
                    <Bell size={20} className="animate-bounce" />
                    <span className="text-xs font-bold uppercase tracking-widest">Reminder</span>
                  </div>
                  <h3 className="text-2xl font-bold text-academy-green mb-4 group-hover:text-academy-gold transition-colors">
                    Verify contact details in person
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-8">
                    Phone numbers and office timings on third-party websites can become outdated. Confirm with the college clerk
                    during your visit.
                  </p>
                  <a href={`tel:${SITE.phone.replace(/-/g, '')}`} className="text-academy-green font-bold text-sm underline underline-offset-4 hover:text-academy-gold transition-colors">
                    Call {SITE.phone}
                  </a>
                </div>
              </div>



              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 text-academy-green mb-8">
                  <FileText size={20} />
                  <h3 className="font-bold uppercase tracking-widest text-xs">Official resources</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'HED admission portal', href: SITE.hedAdmissionUrl },
                    { name: 'HED college profile', href: SITE.hedCollegeUrl },
                    { name: 'Wikipedia article', href: SITE.wikipediaUrl },
                  ].map((file) => (
                    <a
                      key={file.name}
                      href={file.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-50 hover:border-academy-gold/30 hover:bg-slate-50 transition-all group text-left"
                    >
                      <div className="bg-slate-100 p-3 rounded-xl group-hover:bg-academy-gold/10 transition-colors">
                        <Download size={18} className="text-slate-400 group-hover:text-academy-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700 group-hover:text-academy-green transition-colors">{file.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">External link</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
