import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, GraduationCap, BookOpen, Bookmark, Globe, Linkedin } from 'lucide-react';
import { FACULTY_MEMBERS, DEPARTMENTS } from '../data/facultyData';

export default function FacultyProfile() {
  const { memberId } = useParams<{ memberId: string }>();

  // Find faculty member
  const member = FACULTY_MEMBERS.find((m) => m.id === memberId);

  if (!member) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-slate-50">
        <h2 className="text-3xl font-bold text-academy-green mb-4">Faculty Member Not Found</h2>
        <p className="text-slate-600 mb-8 max-w-md">
          The profile you are trying to view does not exist or has been updated.
        </p>
        <Link to="/faculty" className="btn-primary inline-flex items-center gap-2 hover-scale">
          <ArrowLeft size={18} /> Back to Departments
        </Link>
      </div>
    );
  }

  // Find department name for breadcrumbs
  const department = DEPARTMENTS.find((d) => d.id === member.deptId);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">

      {/* Main Profile Layout */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Photo & Contact Info Card (4 Columns) */}
            <div className="lg:col-span-4 space-y-8 sticky top-28">
              
              {/* Photo & Identity Card */}
              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm text-center">
                <div className="aspect-square rounded-3xl overflow-hidden mb-6 bg-slate-100 shadow-inner max-w-[260px] mx-auto relative border border-slate-100">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                
                <h1 className="text-3xl font-bold text-academy-green leading-snug mb-2">
                  {member.name}
                </h1>
                <p className="text-sm font-bold text-academy-gold uppercase tracking-wider mb-6">
                  {member.designation}
                </p>
                {department && (
                  <Link
                    to={`/departments/${department.id}/faculty`}
                    className="inline-block text-xs font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-2 px-4 rounded-xl transition-all hover-scale"
                  >
                    {department.name}
                  </Link>
                )}
              </div>

              {/* Contact details & External links card */}
              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-academy-green border-b border-slate-100 pb-3 flex items-center gap-2">
                  <GraduationCap size={20} className="text-academy-gold" />
                  Contact Information
                </h3>

                <div className="space-y-4 text-sm">
                  {/* Email */}
                  <div className="flex gap-4 items-start">
                    <div className="bg-academy-green/10 p-2.5 rounded-xl text-academy-green shrink-0">
                      <Mail size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Email Address</span>
                      <a href={`mailto:${member.email}`} className="text-slate-700 hover:text-academy-green font-semibold break-all">
                        {member.email}
                      </a>
                    </div>
                  </div>

                  {/* Office / Location */}
                  <div className="flex gap-4 items-start">
                    <div className="bg-academy-green/10 p-2.5 rounded-xl text-academy-green shrink-0">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Office Location</span>
                      <p className="text-slate-700 font-semibold">{member.contactInfo}</p>
                    </div>
                  </div>
                </div>

                {/* Social Links buttons */}
                {(member.googleScholar || member.linkedin) && (
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    {member.googleScholar && (
                      <a
                        href={member.googleScholar}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-all hover-scale"
                      >
                        <Globe size={16} className="text-slate-500" />
                        Google Scholar Profile
                      </a>
                    )}
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0077B5] hover:bg-[#006297] text-white font-semibold text-xs transition-all hover-scale"
                      >
                        <Linkedin size={16} />
                        LinkedIn Profile
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation CTA */}
              {department && (
                <Link
                  to={`/departments/${department.id}/faculty`}
                  className="bg-slate-100 hover:bg-slate-200 text-academy-green w-full text-center py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover-scale"
                >
                  <ArrowLeft size={16} />
                  Back to {department.name}
                </Link>
              )}

            </div>

            {/* Right Column: Detailed Sections (8 Columns) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Profile details block */}
              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 md:p-12 shadow-sm space-y-10">
                
                {/* Biography & Intro */}
                <div>
                  <h2 className="text-2xl font-bold text-academy-green border-b border-slate-100 pb-4 mb-4 flex items-center gap-3">
                    <BookOpen size={24} className="text-academy-gold" />
                    Biography
                  </h2>
                  <p className="text-slate-600 leading-relaxed text-justify text-base">
                    {member.biography}
                  </p>
                </div>

                {/* Academic Qualification */}
                <div>
                  <h2 className="text-2xl font-bold text-academy-green border-b border-slate-100 pb-4 mb-4 flex items-center gap-3">
                    <GraduationCap size={24} className="text-academy-gold" />
                    Qualifications
                  </h2>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-slate-700 font-semibold text-base leading-relaxed">
                      {member.qualification}
                    </p>
                  </div>
                </div>

                {/* Research Interests */}
                <div>
                  <h2 className="text-2xl font-bold text-academy-green border-b border-slate-100 pb-4 mb-5 flex items-center gap-3">
                    <Bookmark size={24} className="text-academy-gold" />
                    Research Interests
                  </h2>
                  <div className="flex flex-wrap gap-2.5">
                    {member.researchInterests.map((interest, index) => (
                      <span
                        key={index}
                        className="bg-academy-green/5 border border-academy-green/10 text-academy-green text-sm font-semibold px-4 py-2 rounded-xl"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Publications */}
                <div>
                  <h2 className="text-2xl font-bold text-academy-green border-b border-slate-100 pb-4 mb-5 flex items-center gap-3">
                    <BookOpen size={24} className="text-academy-gold" />
                    Representative Publications
                  </h2>
                  {member.publications.length > 0 ? (
                    <ul className="space-y-4">
                      {member.publications.map((pub, index) => (
                        <li
                          key={index}
                          className="flex gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl items-start hover:bg-academy-cream transition-colors duration-300"
                        >
                          <div className="bg-academy-green text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm">
                            {index + 1}
                          </div>
                          <p className="text-slate-700 font-medium text-sm leading-relaxed">
                            {pub}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic text-sm">
                      Publications registry is currently being indexed by the HED databases.
                    </p>
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
