import { Facebook, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { SITE } from '../site';

export default function Footer() {
  return (
    <footer className="bg-slate-50 pt-16 pb-8 border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <Logo size={44} className="rounded-lg" />
              <h3 className="text-xl font-serif font-bold text-academy-green">{SITE.shortName}</h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              {SITE.fullName}, public sector intermediate, degree, and BS programmes. Established in {SITE.established}; located at Zaryab Colony, Faqirabad.
            </p>
            <div className="flex space-x-4">
              <a
                href={SITE.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-academy-green transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href={SITE.hedAdmissionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-academy-green text-sm"
                >
                  KP Online Admission Portal
                </a>
              </li>
              <li>
                <a
                  href={SITE.hedCollegeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-academy-green text-sm"
                >
                  HED College Profile
                </a>
              </li>
              <li>
                <Link to="/admissions" className="text-slate-600 hover:text-academy-green text-sm">
                  Admissions Information
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-slate-600 hover:text-academy-green text-sm">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-600 hover:text-academy-green text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-slate-600 text-sm">
                <MapPin size={18} className="text-academy-green shrink-0 mt-0.5" />
                <span>
                  {SITE.addressLine}
                  <br />
                  {SITE.city}
                </span>
              </li>
              <li className="flex items-center space-x-3 text-slate-600 text-sm">
                <Phone size={18} className="text-academy-green shrink-0" />
                <a href={`tel:${SITE.phone.replace(/-/g, '')}`} className="hover:text-academy-green">
                  {SITE.phone}
                </a>
              </li>
              <li className="flex items-center space-x-3 text-slate-600 text-sm">
                <Mail size={18} className="text-academy-green shrink-0" />
                <a href={`mailto:${SITE.email}`} className="hover:text-academy-green break-all">
                  {SITE.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Stay connected</h4>
            <p className="text-slate-600 text-sm mb-4">
              Official notices, events, and campus photographs are published on the college Facebook page.
            </p>
            <a
              href={SITE.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full bg-academy-green text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-academy-green-dark transition-colors"
            >
              Open Facebook Page
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200">
          <p className="text-slate-500 text-sm font-medium text-center">
            © {new Date().getFullYear()} Government College Peshawar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
