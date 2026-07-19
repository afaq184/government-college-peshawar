import { Eye, Target, Award, BookOpen, Landmark, ExternalLink } from 'lucide-react';
import { SITE } from '../site';

const chiefProctorImage = `${import.meta.env.BASE_URL}dr-usman-shah-katlang.png`;
const aboutCampusImage = `${import.meta.env.BASE_URL}about-campus.jpg`;

export default function About() {
  return (
    <div className="flex flex-col">
      <section className="pt-1 pb-14 md:pt-2 md:pb-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-academy-gold font-bold tracking-widest uppercase text-sm mb-4 block">Our legacy</span>
              <h1 className="text-5xl md:text-6xl font-bold text-academy-green mb-6 leading-tight">
                Serving Peshawar since <span className="text-academy-gold">{SITE.established}</span>
              </h1>
              <p className="text-3xl font-serif italic text-slate-400 mb-8">علم اور کردار کی روایات</p>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                {SITE.fullName} is one of the city&apos;s most sought-after public colleges, offering intermediate classes in science
                and arts, two-year degree programmes, and four-year BS degrees. The institution stands next to historic Shahi Bagh and Arbab Niaz Stadium,
                with strong road links across Peshawar.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                Alongside academics, the college emphasises sports and social skills so graduates are prepared for higher education
                and civic life.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 transform-gpu">
                <img
                  src={aboutCampusImage}
                  alt="Government College Peshawar - main campus building"
                  className="h-full w-full object-cover object-center"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                <div className="text-4xl font-serif font-bold text-academy-green">{SITE.campusSince}</div>
                <div className="text-slate-500 text-xs uppercase tracking-widest font-bold">Present campus inaugurated</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 hover-lift hover-glow group cursor-default">
              <div className="bg-academy-gold/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-academy-gold group-hover:text-white transition-all duration-500 group-hover:rotate-12">
                <Eye className="text-academy-gold group-hover:text-white" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-academy-green mb-6 group-hover:text-academy-gold transition-colors">Vision</h2>
              <p className="text-slate-600 leading-relaxed">{SITE.vision}</p>
            </div>
            <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 hover-lift hover-glow group cursor-default">
              <div className="bg-academy-green/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-academy-green group-hover:text-white transition-all duration-500 group-hover:-rotate-12">
                <Target className="text-academy-green group-hover:text-white" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-academy-green mb-6 group-hover:text-academy-gold transition-colors">Mission</h2>
              <p className="text-slate-600 leading-relaxed">
                Provide accessible, high-quality intermediate and undergraduate education; strengthen laboratories and libraries;
                promote ethical scholarship; and support co-curricular programmes that build confident, well-rounded graduates for KP
                and Pakistan.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-academy-green text-center mb-12 md:mb-20">Milestones</h2>
          <div className="relative">
            {/* Desktop center line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-slate-100 hidden md:block" />
            {/* Mobile left rail */}
            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100 md:hidden" />

            <div className="space-y-12 md:space-y-24">
              {[
                {
                  year: String(SITE.established),
                  title: 'Establishment',
                  desc: 'Founded as a public sector college to widen access to science and general education in Peshawar.',
                  side: 'left' as const,
                },
                {
                  year: String(SITE.campusSince),
                  title: 'Shahi Bagh campus',
                  desc: 'The college is situated at Zaryab Colony in Faqirabad, adjacent to the historic Shahi Bagh and Arbab Niaz Stadium, serving students across Peshawar.',
                  side: 'right' as const,
                },
                {
                  year: 'Today',
                  title: 'BS & research outlook',
                  desc: 'Multiple BS disciplines across physical, biological, and social sciences, aligned with University of Peshawar policies and KP HED reforms.',
                  side: 'left' as const,
                },
              ].map((item, idx) => (
                <div key={idx} className="group/timeline">
                  {/* Mobile: left-rail timeline (dot + content side by side) */}
                  <div className="flex gap-4 md:hidden">
                    <div className="relative flex shrink-0 items-center justify-center w-8 h-8">
                      <div className="w-4 h-4 bg-academy-gold rounded-full z-10" />
                      <div className="absolute inset-0 bg-academy-gold/20 rounded-full animate-ping" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-3xl font-serif font-bold text-academy-gold mb-1">{item.year}</div>
                      <h3 className="text-lg font-bold text-academy-green mb-2">{item.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>

                  {/* Desktop: alternating left/right layout (unchanged) */}
                  <div className="hidden md:flex md:flex-row items-center">
                    <div className="flex-1 w-1/2 px-8 text-right">
                      {item.side === 'left' ? (
                        <div className="pr-12 transform transition-all duration-500 group-hover/timeline:-translate-x-2">
                          <div className="text-4xl font-serif font-bold text-academy-gold mb-2 group-hover/timeline:scale-110 origin-right transition-transform">
                            {item.year}
                          </div>
                          <h3 className="text-xl font-bold text-academy-green mb-4 group-hover/timeline:text-academy-gold transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                      ) : null}
                    </div>

                    <div className="relative flex items-center justify-center w-12 h-12">
                      <div className="w-4 h-4 bg-academy-gold rounded-full z-10 group-hover/timeline:scale-150 transition-transform duration-500" />
                      <div className="absolute w-8 h-8 bg-academy-gold/20 rounded-full animate-ping group-hover/timeline:bg-academy-gold/40" />
                    </div>

                    <div className="flex-1 w-1/2 px-8 text-left">
                      {item.side === 'right' ? (
                        <div className="pl-12 transform transition-all duration-500 group-hover/timeline:translate-x-2">
                          <div className="text-4xl font-serif font-bold text-academy-gold mb-2 group-hover/timeline:scale-110 origin-left transition-transform">
                            {item.year}
                          </div>
                          <h3 className="text-xl font-bold text-academy-green mb-4 group-hover/timeline:text-academy-gold transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-academy-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[3rem] overflow-hidden shadow-xl flex flex-col lg:flex-row">
            <div className="lg:w-1/3 aspect-square lg:aspect-auto min-h-[260px] relative bg-slate-200">
              <img
                src={chiefProctorImage}
                alt={`${SITE.chiefProctor}, Chief Proctor`}
                className="absolute inset-0 h-full w-full object-cover object-top"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-20">
                <span className="text-academy-gold-light text-xs font-bold uppercase tracking-widest">Chief Proctor</span>
                <p className="text-white font-bold text-sm sm:text-base leading-snug mt-2">{SITE.chiefProctor}</p>
                <a
                  href={SITE.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-white/90 hover:text-white"
                >
                  More on Facebook <ExternalLink size={14} />
                </a>
              </div>
            </div>
            <div className="lg:w-2/3 p-16 flex flex-col justify-center relative">
              <div className="absolute top-12 right-12 text-academy-gold/10">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C20.1216 16 21.017 16.8954 21.017 18V21C21.017 22.1046 20.1216 23 19.017 23H16.017C14.9124 23 14.017 22.1046 14.017 21Z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-academy-green mb-8">From the desk of the Chief Proctor</h3>
              <p className="text-2xl font-serif italic text-slate-600 leading-relaxed mb-12">
                “{SITE.vision}”
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-0.5 bg-academy-gold" />
                <div>
                  <p className="font-bold text-academy-green">{SITE.chiefProctor}</p>
                  <p className="text-slate-500 text-sm">Chief Proctor, {SITE.fullName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-slate-400 font-bold uppercase tracking-[0.3em] text-xs mb-16">Affiliation & oversight</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <Landmark size={48} className="text-slate-300 mb-6" />
              <p className="font-bold text-slate-600">University of Peshawar</p>
              <p className="text-slate-500 text-sm mt-2">Degree & BS programmes (as notified)</p>
            </div>
            <div className="flex flex-col items-center">
              <BookOpen size={48} className="text-slate-300 mb-6" />
              <p className="font-bold text-slate-600">Board of Intermediate & Secondary Education</p>
              <p className="text-slate-500 text-sm mt-2">Peshawar - intermediate examinations</p>
            </div>
            <div className="flex flex-col items-center">
              <Award size={48} className="text-slate-300 mb-6" />
              <p className="font-bold text-slate-600">Government of Khyber Pakhtunkhwa</p>
              <p className="text-slate-500 text-sm mt-2">Higher Education Department policies & admissions</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
