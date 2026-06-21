import { Search, FileText, UserCheck, CreditCard, CheckCircle2, HelpCircle, ChevronDown, ExternalLink, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE } from '../site';

export default function Admissions() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: `Where do I apply for admission to ${SITE.shortName}?`,
      a: 'All online applications for KP public colleges are submitted through the Higher Education Department admission portal when the relevant advertisement opens. Use the official link from this website to reach the correct college profile.',
    },
    {
      q: 'Which programmes are offered?',
      a: 'The college offers intermediate (FSc, FA), two-year BA/BSc degrees, and multiple BS four-year programmes. Exact seat numbers and combinations change each year, so always read the latest HED prospectus PDF.',
    },
    {
      q: 'Is there an entrance test?',
      a: 'Policies vary by programme and academic year. Merit lists, quotas, and any screening tests are announced on the HED portal and college notice boards.',
    },
    {
      q: 'How can I verify fee schedules?',
      a: 'Fee structures for public colleges follow government notifications. Contact the college office on the published phone number or visit during office hours for the current challan format.',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="pt-1 pb-14 md:pt-2 md:pb-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-academy-gold font-bold tracking-widest uppercase text-xs mb-4 block">Admissions</span>
              <h1 className="text-5xl md:text-7xl font-bold text-academy-green mb-8 leading-tight">
                Apply through the <br />
                official KP portal.
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-10">
                {SITE.fullName} admits students according to Government of Khyber Pakhtunkhwa rules. Online registration, merit lists,
                and fee challans are handled through the Higher Education Department systems for each admission cycle.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href={SITE.hedAdmissionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary px-10 py-4 inline-flex items-center gap-2 text-center hover-scale hover-glow"
                >
                  Open HED admission page <ExternalLink size={18} />
                </a>
                <Link to="/contact" className="flex items-center gap-2 text-slate-600 font-bold hover:text-academy-green transition-all hover-scale">
                  Visit college office <ArrowRight size={20} />
                </Link>
              </div>
              <p className="text-sm text-slate-400 mt-6">
                Need a printable checklist? See the &quot;Admission guide&quot; page or speak to the clerk room during working hours.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=80"
                  alt="Students preparing application documents"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-white p-10 rounded-[2rem] shadow-xl border border-slate-100 max-w-xs">
                <div className="text-4xl font-serif font-bold text-academy-green">HED</div>
                <div className="text-slate-500 text-xs uppercase tracking-widest font-bold mt-2">
                  Khyber Pakhtunkhwa Higher Education Department online admissions
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-academy-green mb-4">Typical admission workflow</h2>
            <p className="text-slate-500">Exact steps follow the HED user guide published for each session.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Online profile',
                desc: `Create or log in to the KP college admission portal and select ${SITE.fullName}.`,
                icon: <Search />,
              },
              {
                step: '02',
                title: 'Programme choice',
                desc: 'Choose intermediate, degree, or BS programme codes exactly as listed in the advertisement.',
                icon: <FileText />,
              },
              {
                step: '03',
                title: 'Document verification',
                desc: 'Upload scanned certificates, photographs, and domicile information as per portal instructions.',
                icon: <UserCheck />,
              },
              {
                step: '04',
                title: 'Fee & enrolment',
                desc: 'Pay notified fees through designated banks and complete enrolment at the college after merit display.',
                icon: <CreditCard />,
              },
            ].map((item, idx) => (
              <div key={idx} className="relative group cursor-default">
                <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 h-full hover-lift hover-glow transition-all duration-500">
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-academy-gold text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                    {item.step}
                  </div>
                  <div className="text-academy-green mb-8 bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-academy-green group-hover:text-white transition-all duration-500">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-academy-green mb-4 group-hover:text-academy-gold transition-colors">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold text-academy-green mb-4">Fees & financial policy</h2>
              <p className="text-slate-500 mb-10">
                Government colleges follow notified fee categories, scholarships, and free structures for deserving students. Figures
                change with each finance department circular, so they are not listed on this unofficial showcase site.
              </p>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-10">
                <ul className="space-y-4 text-slate-700">
                  <li className="flex gap-3">
                    <HelpCircle className="text-academy-gold shrink-0" size={22} />
                    <span>
                      Collect the latest fee schedule from the college accounts branch or download the official prospectus from the HED
                      portal when admissions are announced.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <HelpCircle className="text-academy-gold shrink-0" size={22} />
                    <span>Ask about Ehsaas / provincial scholarship schemes at the time of admission.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-academy-cream p-12 rounded-[2.5rem] border border-slate-100 hover-glow transition-all duration-500">
              <div className="flex items-center gap-4 mb-8">
                <CheckCircle2 className="text-academy-green animate-pulse" />
                <h3 className="text-xl font-bold text-academy-green">Documents to keep ready</h3>
              </div>
              <ul className="space-y-6">
                {[
                  { title: 'Academic certificates', desc: 'Matric / intermediate / bachelor transcripts as applicable.' },
                  { title: 'Domicile & CNIC', desc: 'Student and guardian identification as per HED instructions.' },
                  { title: 'Photographs', desc: 'Passport-size images in the format specified on the portal.' },
                  { title: 'Quota proofs', desc: 'Where applicable (disability, Hafiz, employee children, etc.)' },
                ].map((doc, idx) => (
                  <li key={idx} className="flex gap-4 group cursor-default">
                    <div className="mt-1 group-hover:scale-125 transition-transform duration-300">
                      <CheckCircle2 size={16} className="text-academy-gold" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm group-hover:text-academy-green transition-colors">{doc.title}</p>
                      <p className="text-slate-500 text-xs leading-relaxed">{doc.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-12 pt-8 border-t border-slate-200">
                <p className="text-xs text-slate-400 mb-2">College telephone</p>
                <a href={`tel:${SITE.phone.replace(/-/g, '')}`} className="font-bold text-academy-green hover:underline">
                  {SITE.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-academy-green mb-4">Common questions</h2>
            <p className="text-slate-500">General guidance only - official rules prevail.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-8 py-6 flex justify-between items-center text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-slate-800">{faq.q}</span>
                  <ChevronDown className={`text-slate-400 transition-transform shrink-0 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-8 pb-8 text-slate-500 text-sm leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-academy-green-dark text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://images.unsplash.com/photo-1498243691581-b145c3f32578?auto=format&fit=crop&w=1200&q=80"
            alt=""
            className="w-full h-full object-cover grayscale"
          />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to begin?</h2>
          <p className="text-academy-cream/70 text-lg mb-10">
            Start on the KP HED portal, then follow instructions on your merit list SMS and college notice boards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={SITE.hedAdmissionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary px-12 py-5 text-lg inline-flex items-center justify-center gap-2"
            >
              Launch online admission <ExternalLink size={18} />
            </a>
            <Link to="/apply" className="inline-flex items-center justify-center px-12 py-5 text-lg font-bold text-white border border-white/40 rounded-md hover:bg-white/10 transition-colors">
              Local admission guide
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
