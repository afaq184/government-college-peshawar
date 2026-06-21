import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, GraduationCap, ChevronRight, User } from 'lucide-react';
import { DEPARTMENTS, FACULTY_MEMBERS } from '../data/facultyData';

export default function FacultyList() {
  const { deptId } = useParams<{ deptId: string }>();

  // Find corresponding department
  const department = DEPARTMENTS.find((d) => d.id === deptId);
  
  if (!department) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-slate-50">
        <h2 className="text-3xl font-bold text-academy-green mb-4">Department Not Found</h2>
        <p className="text-slate-600 mb-8 max-w-md">
          The department you are looking for does not exist or has been restructured.
        </p>
        <Link to="/faculty" className="btn-primary inline-flex items-center gap-2 hover-scale">
          <ArrowLeft size={18} /> Back to Departments
        </Link>
      </div>
    );
  }

  // Filter faculty members of this department
  const members = FACULTY_MEMBERS.filter((m) => m.deptId === department.id);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80 } }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header and Breadcrumbs */}
      <section className="bg-white border-b border-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-4 uppercase tracking-widest">
            <Link to="/home" className="hover:text-academy-green transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/faculty" className="hover:text-academy-green transition-colors">Departments</Link>
            <ChevronRight size={12} />
            <span className="text-slate-600 font-bold">{department.name}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="text-academy-gold font-bold tracking-widest uppercase text-xs mb-2 block">Faculty Roster</span>
              <h1 className="text-4xl md:text-5xl font-bold text-academy-green">
                {department.name} <span className="text-slate-400 font-serif">Faculty</span>
              </h1>
            </div>
            <Link to="/faculty" className="inline-flex items-center gap-2 text-academy-green font-bold hover:underline self-start md:self-auto hover-scale">
              <ArrowLeft size={18} /> Other Departments
            </Link>
          </div>
        </div>
      </section>

      {/* Faculty Members Grid */}
      <section className="py-16 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {members.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
            >
              {members.map((member) => (
                <motion.div
                  variants={cardVariants}
                  key={member.id}
                  className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm hover-lift hover-glow flex flex-col justify-between"
                >
                  <div className="p-8">
                    {/* Faculty Photo Container */}
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-slate-100 relative shadow-inner group">
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          // Fallback to styled SVG representation if image fails to load
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      {/* Overlay indicator */}
                      <div className="absolute top-4 right-4 bg-academy-green text-white p-2 rounded-xl shadow-md">
                        <GraduationCap size={18} />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-academy-green leading-snug">
                        {member.name}
                      </h3>
                      <p className="text-sm font-bold text-academy-gold uppercase tracking-wider">
                        {member.designation}
                      </p>
                      
                      <div className="pt-2 space-y-2 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Research Area</span>
                          <span className="text-slate-700 text-sm font-medium">{member.specialization}</span>
                        </div>
                        
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Email Address</span>
                          <a
                            href={`mailto:${member.email}`}
                            className="text-slate-500 hover:text-academy-green text-xs font-semibold break-all flex items-center gap-1.5 mt-0.5"
                          >
                            <Mail size={14} className="shrink-0" />
                            {member.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-8 pb-8 pt-4">
                    <Link
                      to={`/faculty-profile/${member.id}`}
                      className="btn-primary w-full text-center block text-sm py-3.5 hover-scale hover-glow"
                    >
                      View Profile
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16 bg-white border border-slate-100 rounded-[2.5rem] p-10 max-w-2xl mx-auto shadow-sm">
              <User className="mx-auto text-slate-300 mb-6" size={48} />
              <h3 className="text-xl font-bold text-academy-green mb-2">No Faculty Registered</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Teaching assignments and faculty lists are currently being updated for the upcoming session. Please check back later.
              </p>
              <Link to="/faculty" className="btn-secondary text-sm px-8 py-3.5 inline-flex items-center gap-2 hover-scale">
                Go to Departments
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
