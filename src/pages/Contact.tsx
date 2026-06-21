import { Phone, Clock, Send, Calendar, ChevronRight } from 'lucide-react';
import { SITE } from '../site';

const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(SITE.mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

export default function Contact() {
  return (
    <div className="flex flex-col">
      <section className="pt-1 pb-14 md:pt-2 md:pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-academy-gold font-bold tracking-widest uppercase text-xs mb-4 block">Get in touch</span>
              <h1 className="text-5xl md:text-7xl font-bold text-academy-green mb-8 leading-tight">
                Connect with <br />
                {SITE.shortName}
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
                Visit the college office for admissions, verification, and fee matters. For general queries you may phone or email
                during office hours, and follow the Facebook page for day-to-day announcements.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl relative bg-slate-100">
                <iframe
                  src={mapSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Government College Peshawar map"
                  className="grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
              <div className="absolute -bottom-10 left-10 right-10 bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/20">
                <p className="text-xs font-bold text-academy-gold uppercase tracking-widest mb-2">Campus address</p>
                <p className="text-slate-800 font-bold">
                  {SITE.addressLine}, {SITE.city}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100">
              <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Full name</label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-academy-green/20 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Email address</label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-academy-green/20 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Phone number</label>
                    <input
                      type="tel"
                      placeholder="03XX-XXXXXXX"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-academy-green/20 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Programme of interest</label>
                    <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-academy-green/20 focus:bg-white transition-all appearance-none">
                      <option>Select programme</option>
                      <option>Intermediate (FSc / FA)</option>
                      <option>BA / BSc</option>
                      <option>BS four-year</option>
                      <option>Other / not sure</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Your message</label>
                  <textarea
                    rows={5}
                    placeholder="This demo form does not send email. Contact the college directly using the details on the right."
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-academy-green/20 focus:bg-white transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full btn-primary py-5 rounded-2xl text-lg flex items-center justify-center gap-3 hover-scale hover-glow"
                >
                  Submit (demo only) <Send size={20} />
                </button>
              </form>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover-lift hover-glow group cursor-default">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-academy-green/10 p-4 rounded-2xl group-hover:bg-academy-green group-hover:text-white transition-all duration-500 group-hover:rotate-12">
                    <Phone className="text-academy-green group-hover:text-white" />
                  </div>
                  <h3 className="font-bold text-academy-green group-hover:text-academy-gold transition-colors">Phone & email</h3>
                </div>
                <div className="space-y-4 text-sm">
                  <p className="text-slate-500">
                    Phone:{' '}
                    <a href={`tel:${SITE.phone.replace(/-/g, '')}`} className="text-slate-800 font-bold hover:text-academy-green transition-colors">
                      {SITE.phone}
                    </a>
                  </p>
                  <p className="text-slate-500">
                    Email:{' '}
                    <a href={`mailto:${SITE.email}`} className="text-slate-800 font-bold hover:text-academy-green transition-colors break-all">
                      {SITE.email}
                    </a>
                  </p>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover-lift hover-glow group cursor-default">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-academy-gold/10 p-4 rounded-2xl group-hover:bg-academy-gold group-hover:text-white transition-all duration-500 group-hover:-rotate-12">
                    <Clock className="text-academy-gold group-hover:text-white" />
                  </div>
                  <h3 className="font-bold text-academy-green group-hover:text-academy-gold transition-colors">Office hours</h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mon - Thu:</span>
                    <span className="text-slate-800 font-bold">08:30 - 14:30</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold text-academy-gold">Friday:</span>
                    <span className="text-slate-800 font-bold text-academy-gold">08:30 - 12:30</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sat - Sun:</span>
                    <span className="text-slate-800 font-bold">Closed</span>
                  </div>
                  <p className="text-[10px] text-slate-400 italic mt-4">Hours may change during Ramazan or examinations - confirm by phone.</p>
                </div>
              </div>

              <a
                href={SITE.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-academy-gold/20 p-10 rounded-[2.5rem] border border-academy-gold/20 flex flex-col justify-between group cursor-pointer hover:bg-academy-gold/30 transition-all duration-500 hover-lift hover-glow"
              >
                <div>
                  <div className="bg-academy-gold p-4 rounded-2xl w-fit mb-6 shadow-lg group-hover:rotate-12 transition-transform">
                    <Calendar className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-academy-green mb-2 group-hover:text-academy-gold transition-colors">Facebook updates</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Notices, event albums, and emergency announcements are posted on the official page maintained by the college.
                  </p>
                </div>
                <div className="mt-8 flex justify-end">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md group-hover:translate-x-2 transition-transform">
                    <ChevronRight className="text-academy-gold" />
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
