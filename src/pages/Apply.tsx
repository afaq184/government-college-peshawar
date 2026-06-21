import { motion } from 'motion/react';
import { ExternalLink, CheckCircle2, MapPin, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SITE } from '../site';

export default function Apply() {
  const navigate = useNavigate();

  return (
    <div className="flex-grow bg-slate-50 pt-1 pb-10 md:pt-2 md:pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-academy-green mb-4">Admission guide</h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            {SITE.fullName} participates in the centralized admissions system operated by the Government of Khyber Pakhtunkhwa. The
            multi-step demo form that previously lived on this template has been removed so families are not confused with an
            unofficial application.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-xl border border-slate-100 space-y-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-academy-gold mb-2">Official portal</p>
              <h2 className="text-2xl font-bold text-academy-green">Apply on the KP HED website</h2>
              <p className="text-slate-500 mt-2">
                Create your applicant profile, choose {SITE.shortName}, upload documents, and track merit lists online.
              </p>
            </div>
            <a
              href={SITE.hedAdmissionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary px-8 py-4 inline-flex items-center justify-center gap-2 shrink-0"
            >
              Start online admission <ExternalLink size={18} />
            </a>
                </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              'Read the advertisement PDF carefully before selecting programme codes.',
              'Prepare high-resolution scans of academic certificates, CNIC / Form-B, and domicile.',
              'Use an active mobile number. OTP and merit SMS messages are sent to this number.',
              'After securing a seat, visit the college with original documents for verification.',
            ].map((tip) => (
              <div key={tip} className="flex gap-3 text-slate-700 text-sm leading-relaxed">
                <CheckCircle2 className="text-academy-green shrink-0 mt-0.5" size={20} />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-academy-green-dark text-white rounded-[2rem] p-10 space-y-4">
            <h3 className="text-xl font-bold">Need the campus?</h3>
            <div className="flex gap-3 text-sm text-white/85">
              <MapPin className="shrink-0 text-academy-gold-light" />
              <span>
                {SITE.addressLine}
                <br />
                {SITE.city}
              </span>
                      </div>
            <div className="flex gap-3 text-sm">
              <Phone className="shrink-0 text-academy-gold-light" />
              <a className="font-bold hover:underline" href={`tel:${SITE.phone.replace(/-/g, '')}`}>
                {SITE.phone}
              </a>
                      </div>
            <div className="flex gap-3 text-sm">
              <Mail className="shrink-0 text-academy-gold-light" />
              <a className="font-bold hover:underline break-all" href={`mailto:${SITE.email}`}>
                {SITE.email}
              </a>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
              <h3 className="text-xl font-bold text-academy-green mb-3">Facebook resources</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Download banners, principal photographs, and event albums directly from the official page when building print or web
                materials.
              </p>
            </div>
            <a
              href={SITE.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 font-bold text-academy-green hover:border-academy-green transition-colors"
            >
              facebook.com/gcpeshawar01 <ExternalLink size={16} />
            </a>
              </div>
            </div>

        <div className="rounded-[2rem] overflow-hidden border border-slate-200 shadow-lg h-72 md:h-96">
              <iframe
            title="Campus map"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(SITE.mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
          />
              </div>

        <div className="text-center">
          <button type="button" onClick={() => navigate('/')} className="btn-secondary px-10 py-4 rounded-xl">
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
