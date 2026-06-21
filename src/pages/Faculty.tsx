import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { BookOpen, Microscope, Leaf, Users, Landmark, FlaskConical, Globe2, ArrowRight } from 'lucide-react';
import { SITE } from '../site';
import { DEPARTMENTS, Department } from '../data/facultyData';

type Category = 'Physical Sciences' | 'Biological Sciences' | 'Social Sciences & Humanities' | 'Support Services';

export default function Faculty() {
  const [activeCategory, setActiveCategory] = useState<Category>('Physical Sciences');

  const categories: { id: Category; label: string; icon: React.ReactNode }[] = [
    {
      id: 'Physical Sciences',
      label: 'Physical Sciences',
      icon: <FlaskConical size={18} />
    },
    {
      id: 'Biological Sciences',
      label: 'Biological Sciences',
      icon: <Leaf size={18} />
    },
    {
      id: 'Social Sciences & Humanities',
      label: 'Social Sciences & Humanities',
      icon: <Globe2 size={18} />
    },
    {
      id: 'Support Services',
      label: 'Support & Services',
      icon: <Landmark size={18} />
    }
  ];

  const filteredDepts = DEPARTMENTS.filter(d => d.facultyCategory === activeCategory);

  // Custom static support services for the 'Support Services' category
  const supportServices = [
    {
      id: 'admin',
      name: 'College Administration',
      overview: 'The administrative wing coordinates academic sessions, admissions, financial affairs, and board/university examinations under the leadership of the Principal.',
      programs: ['Principal Office', 'Admissions Desk', 'Registrar & Student Records', 'Accounts Section'],
      icon: <Landmark size={28} />
    },
    {
      id: 'library',
      name: 'Libraries & Learning Resources',
      overview: 'Our libraries host thousands of textbooks, reference guides, and reading materials, combined with a digital resource lab supporting BISE and UoP research.',
      programs: ['Main Reading Hall', 'Digital Reference Lab', 'Departmental Seminars', 'Book Bank Facility'],
      icon: <BookOpen size={28} />
    },
    {
      id: 'labs',
      name: 'Laboratories & ICT Infrastructure',
      overview: 'Well-equipped laboratories for Physics, Chemistry, Zoology, and Botany, alongside state-of-the-art computer labs with high-speed internet.',
      programs: ['Advanced Physics Lab', 'Analytical Chemistry Lab', 'Biology Practical Rooms', 'Central Computer Network Lab'],
      icon: <Microscope size={28} />
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="pt-1 pb-14 md:pt-2 md:pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-academy-gold font-bold tracking-widest uppercase text-xs mb-4 block">Academic structure</span>
          <h1 className="text-5xl md:text-7xl font-bold text-academy-green mb-8 leading-tight max-w-4xl">
            Departments & <span className="text-academy-gold">faculties</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-3xl">
            {SITE.fullName} is structured into academic departments and administrative offices. Navigate through our faculties below to view details, offerings, and lists of our distinguished teaching staff.
          </p>
        </div>
      </section>

      {/* Category Tabs Section */}
      <section className="pb-8 bg-white border-b border-slate-100 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 ${
                  activeCategory === cat.id
                    ? 'bg-academy-green text-white shadow-lg shadow-academy-green/20'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-academy-green'
                }`}
                type="button"
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Grid Section */}
      <section className="py-16 bg-slate-50 min-h-[500px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            layout
            className="grid grid-cols-1 lg:grid-cols-2 gap-10"
          >
            {activeCategory !== 'Support Services' ? (
              filteredDepts.map((dept) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  key={dept.id}
                  className="bg-white border border-slate-100 rounded-[2.5rem] p-10 md:p-12 shadow-sm hover-lift hover-glow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-academy-green/10 w-14 h-14 rounded-2xl flex items-center justify-center text-academy-green">
                        {activeCategory === 'Physical Sciences' && <FlaskConical size={28} />}
                        {activeCategory === 'Biological Sciences' && <Leaf size={28} />}
                        {activeCategory === 'Social Sciences & Humanities' && <Globe2 size={28} />}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-academy-gold bg-academy-gold/10 px-3 py-1 rounded-full">
                        {activeCategory}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold text-academy-green mb-4">
                      {dept.name}
                    </h3>
                    
                    <div className="mb-6">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Overview</h4>
                      <p className="text-slate-600 text-sm leading-relaxed text-justify">
                        {dept.overview}
                      </p>
                    </div>

                    <div className="mb-8">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Programs Offered</h4>
                      <div className="flex flex-wrap gap-2">
                        {dept.programs.map((p, index) => (
                          <span
                            key={index}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-academy-cream transition-colors cursor-default"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                      <Users size={16} /> Verified Academic Roster
                    </span>
                    <Link
                      to={`/departments/${dept.id}/faculty`}
                      className="btn-primary flex items-center gap-2 text-sm py-3 px-6 hover-scale hover-glow"
                    >
                      Faculty Members
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              // Support Services listing
              supportServices.map((service) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  key={service.id}
                  className="bg-white border border-slate-100 rounded-[2.5rem] p-10 md:p-12 shadow-sm hover-lift hover-glow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-academy-green/10 w-14 h-14 rounded-2xl flex items-center justify-center text-academy-green">
                        {service.icon}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                        Support Service
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold text-academy-green mb-4">
                      {service.name}
                    </h3>
                    
                    <div className="mb-6">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Overview</h4>
                      <p className="text-slate-600 text-sm leading-relaxed text-justify">
                        {service.overview}
                      </p>
                    </div>

                    <div className="mb-8">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Key Functions</h4>
                      <div className="flex flex-wrap gap-2">
                        {service.programs.map((f, index) => (
                          <span
                            key={index}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl cursor-default"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">
                      General Administration Wing
                    </span>
                    <Link
                      to="/contact"
                      className="bg-slate-100 hover:bg-slate-200 text-academy-green text-sm font-bold py-3 px-6 rounded-xl flex items-center gap-2 hover-scale"
                    >
                      Contact Department
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* Teaching Culture Section */}
      <section className="py-14 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 rounded-[3rem] p-12 md:p-20 border border-slate-100 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <span className="text-academy-gold font-bold tracking-widest uppercase text-xs mb-4 block">Teaching culture</span>
                <h2 className="text-4xl font-bold text-academy-green mb-8 leading-tight">Mentorship in a public college setting</h2>
                <p className="text-slate-600 leading-relaxed mb-10 text-justify">
                  Our faculty members combine classroom instruction with practical laboratory demonstrations, board-exam coaching, and research awareness for BS students. Professional development workshops are arranged in line with Higher Education Department guidelines.
                </p>
                <div className="flex gap-12">
                  <div>
                    <div className="text-4xl font-serif font-bold text-academy-green">{SITE.established}</div>
                    <div className="text-slate-400 text-xs uppercase tracking-widest font-bold">Serving generations</div>
                  </div>
                  <div>
                    <div className="text-4xl font-serif font-bold text-academy-green">UoP</div>
                    <div className="text-slate-400 text-xs uppercase tracking-widest font-bold">Affiliated degrees</div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-10 rounded-3xl border border-slate-100 flex gap-6 items-start hover-lift hover-glow group cursor-default">
                  <div className="bg-academy-gold/10 p-4 rounded-2xl group-hover:bg-academy-gold group-hover:text-white transition-all duration-500 group-hover:rotate-12 shrink-0">
                    <BookOpen className="text-academy-gold group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-academy-green mb-2 group-hover:text-academy-gold transition-colors">Research exposure</h3>
                    <p className="text-slate-500 text-sm">Senior faculty mentor BS students in literature review, field work, and lab safety.</p>
                  </div>
                </div>
                <div className="bg-academy-green p-10 rounded-3xl text-white flex gap-6 items-start hover-lift hover-glow group cursor-default">
                  <div className="bg-white/20 p-4 rounded-2xl group-hover:bg-academy-gold transition-all duration-500 group-hover:-rotate-12 shrink-0">
                    <Users className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 group-hover:text-academy-gold-light transition-colors">Student advisement</h3>
                    <p className="text-academy-cream/70 text-sm">Co-curricular advisers help students balance societies, sports, and academics.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Connection Section */}
      <section className="py-14 md:py-16 bg-white text-center border-t border-slate-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-academy-green mb-6">Meet educators on Facebook</h2>
          <p className="text-slate-500 mb-10">
            Event albums often introduce guest speakers, departmental heads, and student achievers. Follow the official page for authentic imagery and captions.
          </p>
          <a
            href={SITE.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary px-10 py-4 inline-flex items-center justify-center gap-2 hover-scale hover-glow"
          >
            Go to Facebook page
          </a>
        </div>
      </section>
    </div>
  );
}
