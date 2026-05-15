import { useState } from 'react';
import { ArrowLeft, Search, Plus, Filter, X } from 'lucide-react';
import BottomNav from '../BottomNav';
import PrayerCard from '../ui/PrayerCard';
import { mockUsers } from '../../data/mockData';
import { usePrayerData } from '../../hooks/usePrayerData';
import ImageHero from '../ui/ImageHero';

export default function Discover({ onGo, activeTab, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState('Prayers');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({ tag: 'All', urgency: 'All' });
  const { prayers } = usePrayerData();
  const [localTestimonies] = useState([]);

  const filteredPrayers = prayers.filter((p) => {
    const matchesSearch = searchQuery === '' || p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (p.text && p.text.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const filteredUsers = mockUsers.filter((u) => {
    return searchQuery === '' || u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           u.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
           u.bio.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const allTestimonies = localTestimonies;
  const filteredTestimonies = allTestimonies.filter((t) => {
    return searchQuery === '' || t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (t.text && t.text.toLowerCase().includes(searchQuery.toLowerCase())) ||
           (t.name && t.name.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="cinematic-bg cinematic-texture relative flex h-full flex-col overflow-hidden text-ivory">
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-4">
      <div className="-mx-4">
        <ImageHero scene="community" eyebrow="Explore" title="Find a prayer to carry" subtitle="Search requests, people, and praise reports in a quieter, warmer space." />
      </div>
      <div className="-mt-8 flex items-center justify-end">
        <button onClick={() => onGo("home")} className="relative z-20 rounded-full bg-ivory/12 p-2 text-ivory backdrop-blur">
          <ArrowLeft size={22} />
        </button>
      </div>
      <div className="glass-panel relative z-10 mt-5 flex items-center gap-2 rounded-2xl px-3 py-3">
        <Search size={18} className="text-candle" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-ivory outline-none placeholder:text-ivory/45"
          placeholder="Search requests, people, testimonies..."
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-slate-400">
            <X size={18} />
          </button>
        )}
        <button
          onClick={() => setShowFilterMenu(!showFilterMenu)}
          className={`ml-2 flex h-8 w-8 items-center justify-center rounded-full transition ${showFilterMenu ? 'bg-navy text-white' : 'bg-slate-100 text-slate-600'}`}
        >
          <Filter size={16} />
        </button>
      </div>

      {showFilterMenu && (
        <div className="mt-3 rounded-2xl border border-[#e6ddcf] bg-white/95 p-4 shadow-lg">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Filter by Category</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {['All', 'Family', 'Healing', 'Guidance', 'Provision', 'Missions'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedFilters({ ...selectedFilters, tag })}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${selectedFilters.tag === tag ? 'bg-navy text-white' : 'bg-sand text-slate-600'}`}
              >
                {tag}
              </button>
            ))}
          </div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Filter by Urgency</h3>
          <div className="flex gap-2">
            {['All', 'Urgent', 'Regular'].map((urgency) => (
              <button
                key={urgency}
                onClick={() => setSelectedFilters({ ...selectedFilters, urgency })}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${selectedFilters.urgency === urgency ? 'bg-navy text-white' : 'bg-sand text-slate-600'}`}
              >
                {urgency}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {["Prayers", "People", "Testimonies"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTabFilter(t)}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${activeTabFilter === t ? "bg-candle text-ink" : "bg-ivory/10 text-ivory/65"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTabFilter === 'Prayers' && (
        <>
          <h2 className="mt-6 font-serif text-xl text-ivory">Requests to Pray For</h2>
          <div className="mt-3 space-y-3">
            {filteredPrayers.length === 0 ? (
              <div className="rounded-2xl border border-[#e6ddcf] bg-white/75 p-6 text-center">
                <p className="text-sm text-slate-500">No prayers found matching your search.</p>
              </div>
            ) : (
              filteredPrayers.map((p) => (
                <PrayerCard key={p.id} prayer={p} onPress={() => onGo("detail", { request: p })} />
              ))
            )}
          </div>
        </>
      )}

      {activeTabFilter === 'People' && (
        <>
          <h2 className="mt-6 font-serif text-xl text-ivory">People</h2>
          <div className="mt-3 space-y-2">
            {filteredUsers.length === 0 ? (
              <div className="rounded-2xl border border-[#e6ddcf] bg-white/75 p-6 text-center">
                <p className="text-sm text-slate-500">No people found matching your search.</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-2xl border bg-white/75 p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full" style={{ backgroundColor: user.avatarColor }} />
                    <div>
                      <div className="font-semibold text-slate-800">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.handle}</div>
                    </div>
                  </div>
                  <button className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-white transition hover:bg-[#0a3358]">
                    <Plus size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTabFilter === 'Testimonies' && (
        <>
          <h2 className="mt-6 font-serif text-xl text-ivory">Testimonies</h2>
          <div className="mt-3 space-y-3">
            {filteredTestimonies.length === 0 ? (
              <div className="rounded-2xl border border-[#e6ddcf] bg-white/75 p-6 text-center">
                <p className="text-sm text-slate-500">No testimonies found matching your search.</p>
              </div>
            ) : (
              filteredTestimonies.map((t) => (
                <div key={t.id} className="rounded-2xl border border-[#e6ddcf] bg-white/75 p-4">
                  <div className="font-semibold text-navy">{t.title}</div>
                  <p className="mt-1 text-sm text-slate-600">{t.text}</p>
                  <div className="mt-2 text-xs text-slate-500">{t.name} - {t.time}</div>
                </div>
              ))
            )}
          </div>
        </>
      )}
      </div>
      <BottomNav active={activeTab} onNavigate={onNavigate} />
    </div>
  );
}
