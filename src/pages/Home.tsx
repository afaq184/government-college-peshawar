import { ArrowRight, ExternalLink, Calendar, Award, Users, GraduationCap, Microscope } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { INTRO_VIDEO_URL } from '../media';
import { SITE } from '../site';

/** Campus banner — file lives in `public/hero-campus.jpg` (Vite serves from site root). */
const heroImage = `${import.meta.env.BASE_URL}hero-campus.jpg`;
const principalImage = `${import.meta.env.BASE_URL}principal.jpg`;

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative flex min-h-[min(72svh,720px)] max-h-[900px] items-start overflow-hidden pb-20 pt-1 md:min-h-[min(78svh,780px)] md:pb-24 md:pt-2">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt={`${SITE.shortName} campus - main building with Pakistan flag`}
            className="absolute inset-0 h-full w-full min-h-full min-w-full object-cover object-center"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          {/* Very light gradient — only left side for text readability, right side fully clear */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#172554]/80 via-[#172554]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#172554]/20 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <p className="text-academy-gold-light font-bold tracking-widest uppercase text-sm mb-4">
              Public sector · University of Peshawar affiliation
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              {SITE.fullName}
            </h1>
            <p className="text-xl text-slate-200 mb-8 leading-relaxed">
              {SITE.tagline}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/contact" className="btn-secondary flex items-center gap-2 px-10 py-5 text-lg shadow-2xl hover-scale hover-glow">
                Contact the college
              </Link>
              <a
                href={SITE.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 backdrop-blur-xl text-white border-2 border-white/40 px-10 py-5 rounded-md font-bold flex items-center gap-2 hover:bg-white/20 transition-all shadow-2xl hover-scale"
              >
                <ExternalLink size={20} />
                Facebook updates
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-20 -mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white rounded-2xl shadow-2xl grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border border-slate-100 overflow-hidden">
          <div className="p-10 text-center hover:bg-slate-50 transition-colors group cursor-default">
            <div className="text-4xl font-serif font-bold text-academy-green mb-2 group-hover:scale-110 transition-transform duration-300">
              Since {SITE.established}
            </div>
            <div className="text-slate-500 text-sm uppercase tracking-wider font-medium">Years of public service</div>
          </div>
          <div className="p-10 text-center hover:bg-slate-50 transition-colors group cursor-default">
            <div className="text-4xl font-serif font-bold text-academy-green mb-2 group-hover:scale-110 transition-transform duration-300">
              FSc · FA · BS
            </div>
            <div className="text-slate-500 text-sm uppercase tracking-wider font-medium">Science & humanities pathways</div>
          </div>
          <div className="p-10 text-center hover:bg-slate-50 transition-colors group cursor-default">
            <div className="text-4xl font-serif font-bold text-academy-green mb-2 group-hover:scale-110 transition-transform duration-300">
              Shahi Bagh
            </div>
            <div className="text-slate-500 text-sm uppercase tracking-wider font-medium">Adjacent to Arbab Niaz Stadium</div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-academy-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl relative bg-slate-200">
                <img
                  src={principalImage}
                  alt={`${SITE.principal}, Principal`}
                  className="absolute inset-0 h-full w-full object-cover object-[center_15%]"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-academy-green-dark via-academy-green-dark/75 to-transparent px-6 pb-6 pt-28">
                  <span className="text-academy-gold-light font-bold tracking-widest uppercase text-xs block mb-2">Principal</span>
                  <p className="text-white font-serif font-bold text-lg sm:text-xl leading-snug">{SITE.principal}</p>
                </div>
              </div>
            </motion.div>

            <div>
              <span className="text-academy-gold font-bold tracking-widest uppercase text-sm mb-4 block">Leadership message</span>
              <h2 className="text-4xl md:text-5xl font-bold text-academy-green mb-8 leading-tight">Assalam-o-Alaikum</h2>
              <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
                <p>
                  Welcome to {SITE.fullName}. For decades, our college has served students from across Peshawar and Khyber
                  Pakhtunkhwa with rigorous academics in science and humanities, co-curricular activities, and a campus adjacent to
                  historic Shahi Bagh and Arbab Niaz Stadium.
                </p>
                <p>
                  Whether you join us for intermediate, a two-year degree, or a four-year BS programme, our faculty and staff are
                  committed to helping you grow intellectually and personally. Please follow official announcements on the KP HED
                  admission portal and our Facebook page.
                </p>
                <div className="pt-8">
                  <p className="font-serif font-bold text-academy-green text-xl">{SITE.principal}</p>
                  <p className="text-slate-500 italic">Principal, {SITE.shortName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8 md:mb-10">
            <div>
              <span className="text-academy-gold font-bold tracking-widest uppercase text-sm mb-2 block">College life</span>
              <h2 className="text-4xl font-bold text-academy-green">Highlights & events</h2>
              <p className="text-slate-500 mt-2 max-w-2xl">
                Dates below are illustrative; confirm schedules on the college Facebook page and college notice boards.
              </p>
            </div>
            <a
              href={SITE.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-academy-green font-bold flex items-center gap-2 hover:gap-3 transition-all shrink-0"
            >
              See latest on Facebook <ArrowRight size={20} />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 relative group overflow-hidden rounded-2xl shadow-lg bg-black aspect-video w-full sm:min-h-[260px] max-h-[min(70vh,520px)]">
              <video
                className="absolute inset-0 z-0 h-full w-full object-cover"
                controls
                playsInline
                preload="metadata"
                poster={heroImage}
              >
                <source src={INTRO_VIDEO_URL} type="video/mp4" />
              </video>
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-2/5 bg-gradient-to-b from-black/60 to-transparent" />
              <div className="pointer-events-none absolute bottom-14 left-0 z-10 max-w-xl p-8 sm:p-10">
                <span className="bg-academy-gold text-white text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">
                  College introduction
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white group-hover:text-academy-gold-light transition-colors">
                  Welcome to {SITE.shortName}
                </h3>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-academy-green p-8 rounded-2xl text-white shadow-lg hover-lift hover-glow group cursor-pointer">
                <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-academy-gold transition-colors duration-300">
                  <Users size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-academy-gold-light transition-colors">Sports & societies</h3>
                <p className="text-academy-cream/80 text-sm mb-6">
                  The college supports training in sports and student societies alongside academics.
                </p>
                <div className="text-academy-gold-light font-bold text-sm">Follow Facebook for fixtures & results</div>
              </div>

              <div className="bg-slate-100 p-8 rounded-2xl shadow-sm border border-slate-200 hover-lift group cursor-pointer">
                <div className="bg-academy-green/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-academy-green group-hover:text-white transition-colors duration-300">
                  <Calendar size={24} className="text-academy-green group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-academy-green mb-2">Board & semester calendar</h3>
                <p className="text-slate-600 text-sm mb-6">BISE / university schedules are communicated via departments and official notices.</p>
                <div className="text-slate-500 font-bold text-sm">Check notice boards regularly</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-academy-green mb-4">Why students choose {SITE.shortName}</h2>
          <p className="text-slate-500 mb-12 max-w-3xl">
            Established in {SITE.established} near the historic Shahi Bagh, the college
            is widely recognised across Peshawar for intermediate streams and its expanding BS offerings.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Strong science streams',
                desc: 'FSc Pre-Medical, Pre-Engineering, and Computer Science alongside FA programmes.',
                icon: <Microscope />,
              },
              {
                title: 'University pathways',
                desc: 'Degree and BS programmes aligned with University of Peshawar regulations.',
                icon: <GraduationCap />,
              },
              {
                title: 'Dedicated faculty',
                desc: 'Departments across physical sciences, biological sciences, and social sciences & humanities.',
                icon: <Users />,
              },
              {
                title: 'Public mission',
                desc: 'Affordable access to quality higher secondary and undergraduate education in KP.',
                icon: <Award />,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover-lift hover-glow group cursor-default"
              >
                <div className="text-academy-gold mb-6 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-academy-green mb-3 group-hover:text-academy-gold transition-colors">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
