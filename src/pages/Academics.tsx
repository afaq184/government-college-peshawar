import { Book, Globe, Star, Trophy, Microscope, ChevronRight, CheckCircle2, FlaskConical } from 'lucide-react';
import { SITE, PROGRAMS } from '../site';

const libraryBanner =
  'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80';

export default function Academics() {
  return (
    <div className="flex flex-col">
      <section className="pt-1 pb-14 md:pt-2 md:pb-16 bg-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-academy-gold font-bold tracking-widest uppercase text-xs mb-4 block">Academic programmes</span>
          <h1 className="text-5xl md:text-7xl font-bold text-academy-green mb-8">Pathways at {SITE.shortName}</h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Intermediate classes in science and four-year BS programmes, delivered by
            experienced faculty across multiple departments.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="bg-academy-green-dark rounded-[2rem] overflow-hidden relative p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <img src={libraryBanner} alt="" className="w-full h-full object-cover grayscale" />
          </div>
          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Affiliated with University of Peshawar</h2>
            <p className="text-academy-cream/70 text-lg">
              Programme offerings, seat allocations, and eligibility are published each year on the KP HED admission portal. Always
              refer to the official notice for the session you are applying to.
            </p>
            <a
              href={SITE.hedAdmissionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex mt-8 items-center gap-2 text-academy-gold-light font-bold hover:underline"
            >
              Open HED admission listing <ChevronRight size={18} />
            </a>
          </div>
          <div className="relative z-10 flex gap-12 text-center">
            <div>
              <div className="text-5xl md:text-7xl font-serif font-bold text-academy-gold-light mb-2">{SITE.established}</div>
              <div className="text-white/60 text-xs uppercase tracking-widest font-bold">Year established</div>
            </div>
            <div>
              <div className="text-5xl md:text-7xl font-serif font-bold text-academy-gold-light mb-2">BS</div>
              <div className="text-white/60 text-xs uppercase tracking-widest font-bold">4-year disciplines</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-academy-green text-center mb-16">Programme overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col self-start hover-lift hover-glow group cursor-default">
              <div className="flex justify-between items-start mb-8">
                <div className="bg-academy-green/10 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-academy-green group-hover:text-white transition-all duration-500 group-hover:rotate-6">
                  <FlaskConical className="text-academy-green group-hover:text-white" size={32} />
                </div>
                <span className="text-academy-gold font-bold text-xs uppercase tracking-widest">Two years</span>
              </div>
              <h3 className="text-3xl font-bold text-academy-green mb-6 group-hover:text-academy-gold transition-colors">Intermediate</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Board-recognised higher secondary programmes that prepare students for medical, engineering, IT, general science, or
                humanities tracks.
              </p>
              <ul className="space-y-3">
                {PROGRAMS.intermediate.map((sub) => (
                  <li
                    key={sub}
                    className="bg-slate-50 px-6 py-4 rounded-xl text-slate-700 font-medium flex items-center gap-3 hover:bg-academy-cream transition-colors"
                  >
                    <div className="w-2 h-2 bg-academy-gold rounded-full shrink-0" />
                    {sub}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col hover-lift hover-glow group cursor-default">
              <div className="flex justify-between items-start mb-8">
                <div className="bg-academy-gold/10 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-academy-gold group-hover:text-white transition-all duration-500 group-hover:-rotate-6">
                  <Globe className="text-academy-gold group-hover:text-white" size={32} />
                </div>
                <span className="text-academy-gold font-bold text-xs uppercase tracking-widest">Undergraduate</span>
              </div>
              <h3 className="text-3xl font-bold text-academy-green mb-6 group-hover:text-academy-gold transition-colors">
                Degree & BS programmes
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Two-year BA/BSc routes and four-year BS degrees across science and social science disciplines, governed by
                University of Peshawar regulations.
              </p>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-academy-green uppercase tracking-widest mb-3">Two-year degrees</p>
                  <ul className="space-y-2">
                    {PROGRAMS.degreeTwoYear.map((p) => (
                      <li key={p} className="text-slate-600 text-sm flex gap-2">
                        <span className="text-academy-gold">•</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold text-academy-green uppercase tracking-widest mb-3">Representative BS majors</p>
                  <ul className="space-y-2">
                    {PROGRAMS.bsFourYear.map((p) => (
                      <li key={p} className="text-slate-600 text-sm flex gap-2">
                        <span className="text-academy-gold">•</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-white border-t border-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-academy-green/5 border border-academy-green/10 rounded-full mb-6">
                <span className="text-academy-green font-bold text-xs uppercase tracking-widest">Public college advantage</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-academy-green mb-8 leading-tight">
                Why families consider <span className="text-academy-gold">{SITE.shortName}</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                Competitive board results, disciplined campus life, and affordable fee structures under government policy make {SITE.shortName}
                a practical choice for serious students in Peshawar.
              </p>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 w-fit">
                <div className="w-10 h-10 bg-academy-green rounded-full flex items-center justify-center text-white shadow-lg">
                  <CheckCircle2 size={20} />
                </div>
                <p className="text-sm font-bold text-academy-green">Oversight by KP Higher Education Department</p>
              </div>
            </div>

            <div className="bg-academy-cream p-10 md:p-16 rounded-[3rem] shadow-xl border border-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-academy-gold/5 rounded-full -mr-16 -mt-16" />
              <ul className="space-y-8">
                {[
                  'Dedicated departments in physical, biological, and social sciences',
                  'Laboratories and library facilities supporting board & university curricula',
                  'Sports grounds and student societies for holistic development',
                  'Merit-based admissions through the official KP online portal',
                  'Experienced teaching faculty aligned with public sector standards',
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-5 group">
                    <div className="mt-1 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 group-hover:bg-green-500 transition-colors duration-300">
                      <CheckCircle2 size={16} className="text-green-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-lg font-bold text-slate-700 leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[3rem] p-12 md:p-20 shadow-xl border border-slate-100">
            <div className="flex items-center gap-4 mb-12">
              <Star className="text-academy-gold" fill="currentColor" />
              <h2 className="text-3xl font-bold text-academy-green">Student recognition</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Board positions',
                  desc: 'Students regularly appear in BISE Peshawar honour lists across pre-medical, pre-engineering, and computer science groups.',
                  icon: <Trophy />,
                },
                {
                  title: 'Science culture',
                  desc: 'Departmental societies host seminars, quiz competitions, and lab weeks to deepen scientific inquiry.',
                  icon: <Microscope />,
                },
                {
                  title: 'Graduate mobility',
                  desc: 'Alumni progress to medical colleges, engineering universities, and University of Peshawar professional programmes.',
                  icon: <Book />,
                },
              ].map((award, idx) => (
                <div key={idx} className="bg-slate-50 p-10 rounded-3xl border border-slate-100 hover-lift hover-glow group cursor-default">
                  <div className="text-academy-gold mb-6 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                    {award.icon}
                  </div>
                  <h3 className="text-xl font-bold text-academy-green mb-4 group-hover:text-academy-gold transition-colors">{award.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{award.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
