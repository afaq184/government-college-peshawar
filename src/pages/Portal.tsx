import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { UserRound, School, ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';
import Logo from '../components/Logo';
import { SITE } from '../site';

export default function Portal() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 15 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1329] via-navbar-bg to-[#122247] flex flex-col justify-between items-center relative overflow-hidden px-4 py-8">
      {/* Decorative background glow circles */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-academy-green/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-academy-gold/10 rounded-full blur-[150px] pointer-events-none" />
      
      {/* Top Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-7xl flex flex-col items-center text-center mt-6 z-10"
      >
        <div className="bg-white p-3 rounded-2xl shadow-2xl border border-white/10 hover-scale mb-4">
          <Logo size={70} />
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white tracking-wide drop-shadow-md">
          {SITE.fullName}
        </h1>
        <p className="text-academy-gold font-sans font-semibold tracking-widest uppercase text-xs sm:text-sm mt-2 opacity-95">
          Estd. {SITE.established} &bull; Peshawar, Khyber Pakhtunkhwa
        </p>
        <div className="h-0.5 w-24 bg-gradient-to-r from-academy-green to-academy-gold mt-4 rounded-full" />
      </motion.div>

      {/* Main Grid Options Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl my-auto py-12 z-10"
      >
        {/* Student Profile Portal Card */}
        <motion.div variants={itemVariants}>
          <Link
            to="/student-profile"
            className="group flex flex-col justify-between bg-white/5 hover:bg-white/10 border border-white/10 hover:border-academy-green/50 p-8 rounded-[2rem] h-[340px] transition-all duration-500 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-xl relative overflow-hidden hover-lift"
          >
            {/* Ambient gold glow on card hover */}
            <div className="absolute -right-16 -top-16 w-36 h-36 bg-academy-green/20 rounded-full blur-3xl group-hover:bg-academy-green/40 transition-all duration-500" />
            
            <div className="space-y-4">
              <div className="bg-academy-green/20 text-academy-green p-4 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-500">
                <UserRound size={36} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-white group-hover:text-academy-gold transition-colors duration-300">
                Student Profile
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-sans text-left">
                Access official student identity credentials, registration status, enrollment details, assigned class, section, and shift timing info.
              </p>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
              <span className="text-xs text-academy-green font-bold tracking-wider uppercase font-sans group-hover:underline">
                View Credentials
              </span>
              <div className="bg-white/5 text-white p-2 rounded-xl group-hover:bg-academy-green group-hover:text-white transition-all duration-300">
                <ArrowRight size={18} />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* College Website / Profile Card */}
        <motion.div variants={itemVariants}>
          <Link
            to="/home"
            className="group flex flex-col justify-between bg-white/5 hover:bg-white/10 border border-white/10 hover:border-academy-gold/50 p-8 rounded-[2rem] h-[340px] transition-all duration-500 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-xl relative overflow-hidden hover-lift"
          >
            {/* Ambient gold glow on card hover */}
            <div className="absolute -right-16 -top-16 w-36 h-36 bg-academy-gold/20 rounded-full blur-3xl group-hover:bg-academy-gold/40 transition-all duration-500" />

            <div className="space-y-4">
              <div className="bg-academy-gold/20 text-academy-gold p-4 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-500">
                <School size={36} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-white group-hover:text-academy-gold transition-colors duration-300">
                College Profile
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-sans text-left">
                Enter the official public website of {SITE.shortName}. Explore various academic departments, admissions criteria, faculty roster, latest news, and campus gallery.
              </p>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
              <span className="text-xs text-academy-gold font-bold tracking-wider uppercase font-sans group-hover:underline">
                Explore Website
              </span>
              <div className="bg-white/5 text-white p-2 rounded-xl group-hover:bg-academy-gold group-hover:text-white transition-all duration-300">
                <ArrowRight size={18} />
              </div>
            </div>
          </Link>
        </motion.div>
      </motion.div>

      {/* Footer Info Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="w-full max-w-7xl flex flex-col sm:flex-row justify-between items-center text-center gap-4 text-xs font-semibold text-slate-400 mt-6 border-t border-white/5 pt-6 z-10"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-academy-gold" />
          <span>Higher Education Department, Government of Khyber Pakhtunkhwa</span>
        </div>
        <div className="flex items-center gap-2">
          <GraduationCap size={14} className="text-academy-green" />
          <span>Affiliated with the University of Peshawar & BISE Peshawar</span>
        </div>
        <div>
          <span>&copy; {new Date().getFullYear()} {SITE.shortName}. All Rights Reserved.</span>
        </div>
      </motion.div>
    </div>
  );
}
