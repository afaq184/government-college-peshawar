import { motion } from 'motion/react';
import { useState } from 'react';
import { Filter, ExternalLink, Loader2 } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { useGallery } from '../hooks/useCms';

export default function Gallery() {
  const SITE = useSite();
  const { items: galleryItems, loading } = useGallery();
  const [filter, setFilter] = useState('All');
  const categories = ['All', 'Campus', 'Academics', 'Events'];

  const filteredItems = filter === 'All' ? galleryItems : galleryItems.filter((item) => item.category === filter);

  return (
    <div className="flex flex-col">
      <section className="pt-1 pb-14 md:pt-2 md:pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-academy-gold font-bold tracking-widest uppercase text-xs mb-4 block">Visual stories</span>
          <h1 className="text-5xl md:text-7xl font-bold text-academy-green mb-8 leading-tight max-w-4xl">
            Campus life at <span className="text-academy-gold">{SITE.shortName}</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mb-6">
            Gallery photographs are from college activities, classes, and events. For full albums and day-to-day updates, browse the
            official Facebook photos tab.
          </p>
          <a
            href={SITE.facebookPhotosUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-bold text-academy-green hover:text-academy-gold transition-colors"
          >
            Open Facebook photos <ExternalLink size={18} />
          </a>
        </div>
      </section>

      <section className="pb-12 bg-white sticky top-20 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest shrink-0">
              <Filter size={14} /> Filter
            </div>
            <div className="flex gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilter(cat)}
                  className={`px-6 py-2.5 rounded-full font-bold text-xs transition-all shrink-0 ${
                    filter === cat ? 'bg-academy-green text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={item.id}
                className="group relative aspect-square rounded-3xl overflow-hidden shadow-lg hover-lift cursor-pointer"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className={`w-full h-full transition-all duration-700 group-hover:scale-110 ${item.imgClass || 'object-cover object-center'}`}
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>
            ))}
          </div>

          {loading && (
            <div className="flex justify-center py-6 text-slate-400">
              <Loader2 className="animate-spin" size={24} />
            </div>
          )}

          <div className="mt-20 text-center space-y-4">
            <a
              href={SITE.facebookPhotosUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-academy-green text-white px-10 py-4 rounded-2xl font-bold inline-flex items-center gap-2 hover:bg-academy-green-dark transition-colors"
            >
              More photos on Facebook <ExternalLink size={18} />
            </a>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Showing {filteredItems.length} of {galleryItems.length} gallery images
            </p>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-academy-green mb-4">Share your moments</h2>
              <p className="text-slate-500">
                Student societies and sports teams regularly tag the college Facebook page. If you manage communications for {SITE.shortName},
                keep albums organised by session so visitors can browse everything in one place.
              </p>
            </div>
            <div className="flex justify-start lg:justify-end">
              <a
                href={SITE.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-academy-green text-white px-8 py-4 rounded-xl text-sm font-bold hover:bg-academy-green-dark transition-all hover-scale shadow-lg hover:shadow-academy-green/20"
              >
                Follow on Facebook
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
