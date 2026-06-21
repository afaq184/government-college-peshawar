import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import Logo from './Logo';
import { SITE } from '../site';

const navLinks = [
  { name: 'Home', path: '/home' },
  { name: 'About', path: '/about' },
  { name: 'Academics', path: '/academics' },
  { name: 'Departments', path: '/faculty' },
  { name: 'Admissions', path: '/admissions' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'News', path: '/news' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-navbar-bg backdrop-blur-sm border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link to="/home" className="flex items-center gap-3 group">
              <div className="bg-white p-1 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                <Logo size={40} className="rounded-lg" />
              </div>
              <span className="text-lg sm:text-2xl font-serif font-bold text-white leading-tight max-w-[200px] sm:max-w-none">
                {SITE.shortName}
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link group ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.name}
                <span
                  className={`absolute bottom-0 left-0 w-full h-0.5 bg-white transform origin-left transition-transform duration-300 ${
                    location.pathname === link.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </Link>
            ))}
            <a
              href={SITE.hedAdmissionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-navbar-bg px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-academy-cream transition-all hover-scale shadow-md"
            >
              Online Admission (HED)
            </a>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2" type="button">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-navbar-bg border-b border-white/10 animate-in slide-in-from-top duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === link.path
                    ? 'text-white bg-white/10'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <a
              href={SITE.hedAdmissionUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center mt-4 bg-white text-navbar-bg py-3 rounded-xl font-bold"
            >
              Online Admission (HED)
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
