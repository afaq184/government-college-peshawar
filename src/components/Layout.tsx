import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { SiteProvider } from '../context/SiteContext';

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
    <SiteProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main key={location.pathname} className="flex-grow flex flex-col">
          <Outlet />
        </main>
        <Footer />
      </div>
    </SiteProvider>
  );
}
