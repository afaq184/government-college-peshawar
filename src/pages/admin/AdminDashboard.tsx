import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Images, Newspaper, Settings, Database, Loader2, CheckCircle2, Users } from 'lucide-react';
import { saveSiteSettings, fetchSiteSettings } from '../../services/cmsService';
import { getDefaultSiteSettings } from '../../data/cmsDefaults';
import { adminPath } from '../../lib/adminGate';

export default function AdminDashboard() {
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState('');

  const handleSeed = async () => {
    setSeeding(true);
    setMessage('');
    try {
      const existing = await fetchSiteSettings();
      if (!existing) {
        await saveSiteSettings(getDefaultSiteSettings());
        setMessage('Site settings saved. Gallery and News originals stay on the site; use Gallery/News to add new items only.');
      } else {
        setMessage('Site settings already exist. Gallery and News keep their original content; new items you add appear on top.');
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Could not save settings. Please try again.');
    } finally {
      setSeeding(false);
    }
  };

  const cards = [
    { to: adminPath('gallery'), icon: Images, title: 'Gallery', desc: 'Add new campus photos. Originals stay on the site.' },
    { to: adminPath('news'), icon: Newspaper, title: 'News', desc: 'Add new notices. Existing notifications stay; new ones appear too.' },
    { to: adminPath('students'), icon: Users, title: 'Students', desc: 'View student profiles by category and remove access when needed.' },
    { to: adminPath('site'), icon: Settings, title: 'Site settings', desc: 'Update college name, contact, and key images.' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-academy-green mb-2">Dashboard</h1>
      <p className="text-slate-500 mb-10">
        Original Gallery photos and News notices always stay on the website. Anything you add here is shown in addition to them.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-academy-green/20 transition-all"
          >
            <c.icon className="text-academy-green mb-4" size={28} />
            <h2 className="font-bold text-lg text-slate-800 mb-1">{c.title}</h2>
            <p className="text-sm text-slate-500">{c.desc}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="bg-academy-gold/10 p-3 rounded-xl">
            <Database className="text-academy-gold" size={24} />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg text-slate-800 mb-1">Save site settings</h2>
            <p className="text-sm text-slate-500 mb-6">
              Optional first-time setup for contact and branding fields. Does not remove or replace Gallery or News content.
            </p>
            <button
              type="button"
              onClick={handleSeed}
              disabled={seeding}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
            >
              {seeding ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} />}
              {seeding ? 'Saving…' : 'Save site settings'}
            </button>
            {message && (
              <p className="mt-4 text-sm flex items-start gap-2 text-slate-600">
                <CheckCircle2 size={16} className="text-academy-green shrink-0 mt-0.5" />
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
