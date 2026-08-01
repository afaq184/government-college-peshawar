import { motion } from 'motion/react';
import { Bell, FileText, ChevronRight, Download, ExternalLink, Loader2 } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { useNews } from '../hooks/useCms';

export default function News() {
  const SITE = useSite();
  const { items: newsItems, loading } = useNews();

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
                  key={item.id}
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

              {loading && (
                <div className="flex justify-center py-6 text-slate-400">
                  <Loader2 className="animate-spin" size={24} />
                </div>
              )}

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
