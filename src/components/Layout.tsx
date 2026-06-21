import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch (e) {
      console.warn('scrollTo failed', e);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main key={location.pathname} className="flex-grow flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
