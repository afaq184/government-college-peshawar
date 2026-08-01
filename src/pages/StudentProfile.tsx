import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  School,
  GraduationCap,
  Calendar,
  User,
  ShieldCheck,
  Phone,
  MapPin,
  Hash,
  Loader2,
  Ban,
} from 'lucide-react';
import Logo from '../components/Logo';
import { SITE } from '../site';
import {
  resolveStudentByToken,
  studentPhotoUrl,
  type Student,
  type StudentResolveResult,
} from '../data/studentsData';

export default function StudentProfile() {
  const { token } = useParams<{ token: string }>();
  const [result, setResult] = useState<StudentResolveResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    setResult(null);
    (async () => {
      const resolved = await resolveStudentByToken(token);
      if (!cancelled) setResult(resolved);
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b1329] via-[#0f1b3a] to-[#122247] flex items-center justify-center">
        <Loader2 className="animate-spin text-white/60" size={36} />
      </div>
    );
  }

  if (result.status === 'deleted') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b1329] via-[#0f1b3a] to-[#122247] flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white/5 border border-white/10 rounded-[2rem] p-10 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-red-500/15 border border-red-400/30 flex items-center justify-center">
            <Ban className="text-red-400" size={32} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mb-3">Profile removed</h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-8">
            This student profile has been deleted by the college administration and is no longer available.
            If you believe this is a mistake, please contact the college office.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-academy-green hover:bg-academy-green-dark text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
          >
            <School size={16} />
            College Website
          </Link>
        </div>
      </div>
    );
  }

  if (result.status === 'not_found') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b1329] via-[#0f1b3a] to-[#122247] flex flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-serif font-bold text-white mb-3">Student Not Found</h2>
        <p className="text-slate-400 text-sm mb-6 text-center max-w-md">
          No student profile matches this URL. Enter a valid student link to view a profile.
        </p>
        <Link
          to="/"
          className="flex items-center gap-2 bg-academy-green hover:bg-academy-green-dark text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
        >
          <School size={16} />
          College Website
        </Link>
      </div>
    );
  }

  const student: Student = result.student;
  const photo = studentPhotoUrl(student);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1329] via-[#0f1b3a] to-[#122247] flex flex-col justify-between items-center relative overflow-hidden px-4 py-8">
      {/* Decorative blurred background shapes */}
      <div className="absolute top-[-20%] left-[-15%] w-[500px] h-[500px] bg-academy-green/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[550px] h-[550px] bg-academy-gold/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl z-10 my-auto">
        
        {/* Navigation / Header Area */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 w-full border-b border-white/10 pb-6"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-xl shadow-md">
              <Logo size={42} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-white leading-tight">
                {SITE.shortName} Portal
              </h2>
              <p className="text-xs text-academy-gold font-sans font-semibold uppercase tracking-wider">
                Student Verification System
              </p>
            </div>
          </div>
          
          <Link 
            to="/" 
            className="flex items-center gap-2 bg-academy-green hover:bg-academy-green-dark text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover-scale shadow-lg hover:shadow-academy-green/20"
          >
            <School size={16} />
            College Website
          </Link>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Interactive ID Card (5 Columns) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 60, damping: 15 }}
            className="lg:col-span-5 flex justify-center"
          >
            {/* The Digital ID Card container */}
            <div className="relative w-full max-w-[360px] bg-gradient-to-tr from-[#152755] to-[#254284] border border-white/20 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden hover-glow">
              {/* Internal decorative holographic grid overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
              
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <div className="bg-white p-1 rounded-lg">
                    <Logo size={28} />
                  </div>
                  <div>
                    <h3 className="text-xs font-serif font-black text-white tracking-wider uppercase leading-none">
                      Govt College
                    </h3>
                    <span className="text-[9px] font-sans font-semibold text-academy-gold uppercase tracking-widest leading-none block mt-0.5">
                      Peshawar
                    </span>
                  </div>
                </div>
                <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-sans text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {student.status}
                </div>
              </div>

              {/* Photo & Primary ID details */}
              <div className="flex flex-col items-center text-center">
                <div className="w-[200px] sm:w-[220px] aspect-[3/4] rounded-2xl overflow-hidden border-2 border-academy-gold/50 shadow-inner relative mb-5 bg-white/5">
                  {photo ? (
                    <img 
                      src={photo} 
                      alt={student.name} 
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/40 text-xs font-bold uppercase tracking-widest">
                      No photo
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-serif font-bold text-white tracking-wide mb-1 leading-snug">
                  {student.name}
                </h2>
                <p className="text-xs font-sans text-academy-gold font-medium tracking-wide mb-2">
                  S/O: {student.fatherName}
                </p>
                <p className="text-xs font-mono text-slate-300 tracking-wide">
                  Roll No: {student.rollNo}
                </p>
              </div>

            </div>
          </motion.div>
          
          {/* Right Side: Detailed Profile Dashboard (7 Columns) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 60, damping: 15 }}
            className="lg:col-span-7 space-y-6"
          >


            {/* Detailed Info Categories */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-6">
              
              {/* Category 1: Academic Status */}
              <div>
                <h3 className="text-sm font-bold text-academy-gold border-b border-white/10 pb-2 mb-4 flex items-center gap-2">
                  <GraduationCap size={16} />
                  Academic Profile
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-sans">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Class/Degree Program</span>
                    <span className="text-white font-medium">{student.class}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Academic Session</span>
                    <span className="text-white font-medium">{student.session}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Admission Number</span>
                    <span className="text-white font-medium font-mono">{student.admissionNo}</span>
                  </div>
                  {student.regNo && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-400">University Reg. Number</span>
                      <span className="text-white font-medium font-mono">{student.regNo}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Category 2: Personal Details */}
              <div>
                <h3 className="text-sm font-bold text-academy-gold border-b border-white/10 pb-2 mb-4 flex items-center gap-2">
                  <User size={16} />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-sans">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Date of Birth</span>
                    <span className="text-white font-medium flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      {student.dob}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Blood Group</span>
                    <span className="text-red-400 font-bold">{student.bloodGroup}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">CNIC / Form-B</span>
                    <span className="text-white font-medium font-mono">{student.cnic}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Enrollment Type</span>
                    <span className="text-white font-medium">{student.enrollmentType}</span>
                  </div>
                </div>
              </div>

              {/* Category 3: Contact & Address */}
              <div>
                <h3 className="text-sm font-bold text-academy-gold border-b border-white/10 pb-2 mb-4 flex items-center gap-2">
                  <Hash size={16} />
                  Contact Credentials
                </h3>
                <div className="space-y-3.5 text-sm font-sans">

                  <div className="flex items-center gap-3">
                    <div className="bg-white/5 p-2 rounded-xl text-slate-400">
                      <Phone size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400">Guardian Contact Number</span>
                      <span className="text-white font-medium font-mono">{student.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-white/5 p-2 rounded-xl text-slate-400">
                      <MapPin size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400">Permanent Address</span>
                      <span className="text-white font-medium">{student.address}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-semibold text-slate-400 mt-8 border-t border-white/5 pt-6 z-10 px-2"
      >
        <span className="flex items-center gap-2 text-center sm:text-left">
          <ShieldCheck size={14} className="text-slate-500 shrink-0" />
          Higher Education Department, Government of Khyber Pakhtunkhwa
        </span>
        <span className="flex items-center gap-2 text-center">
          <GraduationCap size={14} className="text-slate-500 shrink-0" />
          Affiliated with the University of Peshawar &amp; BISE Peshawar
        </span>
        <span className="text-center sm:text-right">
          &copy; 2026 GC Peshawar. All Rights Reserved.
        </span>
      </motion.div>
    </div>
  );
}
