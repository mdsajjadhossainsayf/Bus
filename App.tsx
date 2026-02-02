
import React, { useState, useEffect } from 'react';
import { RouteSuggestion, BusDetail } from './types';
import { getAIBusSuggestions } from './services/geminiService';

// --- Icons (inlined for simplicity) ---
const ICONS = {
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  MapPin: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  Bus: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="17" cy="18" r="2"/></svg>,
  Home: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  History: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>,
};

// --- Translations ---
const TRANSLATIONS = {
  bn: {
    title: "বাস রুট",
    subtitle: "সহজ ও সঠিক ভ্রমণ",
    fromPlaceholder: "কোথা থেকে?",
    toPlaceholder: "কোথায় যাবেন?",
    findBus: "বাস খুঁজুন",
    searching: "খোঁজা হচ্ছে...",
    fare: "ভাড়া",
    time: "সময়",
    distance: "দূরত্ব", // Added distance translation
    recentSearches: "সাম্প্রতিক সার্চ",
    langToggle: "EN",
    routeStarts: "শুরু:",
    routeEnds: "শেষ:",
    hide: "লুকান",
    routeRange: "রুটের বিস্তারিত",
  },
  en: {
    title: "Bus Route",
    subtitle: "Simple and Accurate Travel",
    fromPlaceholder: "From where?",
    toPlaceholder: "Where to go?",
    findBus: "Find Bus",
    searching: "Searching...",
    fare: "Fare",
    time: "Time",
    distance: "Distance", // Added distance translation
    recentSearches: "Recent Searches",
    langToggle: "বাংলা",
    routeStarts: "Starts:",
    routeEnds: "Ends:",
    hide: "Hide",
    routeRange: "Route Details",
  }
};

const App: React.FC = () => {
  const [lang, setLang] = useState<'bn' | 'en'>('bn'); // Default to Bengali
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [suggestion, setSuggestion] = useState<RouteSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<RouteSuggestion[]>([]);
  const [expandedBus, setExpandedBus] = useState<string | null>(null);

  const t = TRANSLATIONS[lang]; // Get current language translations

  useEffect(() => {
    // Load history from local storage
    const savedHistory = localStorage.getItem('busRouteHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    // Save history to local storage whenever it changes
    localStorage.setItem('busRouteHistory', JSON.stringify(history));
  }, [history]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchFrom || !searchTo) return;
    setLoading(true);
    setSuggestion(null); // Clear previous suggestion

    const result = await getAIBusSuggestions(searchFrom, searchTo, lang);
    if (result) {
      const newEntry = { ...result, timestamp: Date.now() };
      setSuggestion(newEntry);
      
      // Update history, keeping only unique recent searches
      const updatedHistory = [
        newEntry, 
        ...history.filter(h => !(h.from === searchFrom && h.to === searchTo))
      ].slice(0, 10); // Keep last 10 unique searches
      setHistory(updatedHistory);
    }
    setLoading(false);
  };

  const toggleLang = () => {
    setLang(prev => prev === 'bn' ? 'en' : 'bn');
  };

  const handleHistoryClick = (h: RouteSuggestion) => {
    setSearchFrom(h.from);
    setSearchTo(h.to);
    // Automatically trigger search for history items
    handleSearch({ preventDefault: () => {} } as React.FormEvent); 
  };

  return (
    <div className="max-w-md mx-auto min-h-screen pb-24 px-4 pt-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">{t.title}</h1>
          <p className="text-slate-500 text-sm">{t.subtitle}</p>
        </div>
        <button 
          onClick={toggleLang}
          className="px-3 py-1 glass-card rounded-full text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
        >
          {t.langToggle}
        </button>
      </header>

      <div className="space-y-6">
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="relative">
              <div className="absolute left-3 top-3.5 text-slate-400"><ICONS.MapPin /></div>
              <input 
                type="text" placeholder={t.fromPlaceholder} value={searchFrom} onChange={(e) => setSearchFrom(e.target.value)}
                className="w-full bg-white/50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="relative">
              <div className="absolute left-3 top-3.5 text-slate-400"><ICONS.MapPin /></div>
              <input 
                type="text" placeholder={t.toPlaceholder} value={searchTo} onChange={(e) => setSearchTo(e.target.value)}
                className="w-full bg-white/50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button 
              type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-blue-200"
            >
              {loading ? t.searching : <><ICONS.Search /> {t.findBus}</>}
            </button>
          </form>
        </div>

        {suggestion && (
          <div className="glass-card rounded-3xl p-6 animate-slide-up border-l-4 border-l-blue-500">
            <h3 className="font-bold text-xl mb-4">{suggestion.from} → {suggestion.to}</h3>
            <div className="grid grid-cols-3 gap-3 mb-6 text-center text-sm"> {/* Changed to grid-cols-3 */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-tighter">{t.fare}</span>
                <span className="font-bold text-sm text-blue-700">{suggestion.estimatedFare}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-tighter">{t.time}</span>
                <span className="font-bold text-sm text-blue-700">{suggestion.travelTime}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-tighter">{t.distance}</span> {/* Added Distance display */}
                <span className="font-bold text-sm text-blue-700">{suggestion.distance}</span>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              {suggestion.suggestedBuses.length > 0 ? (
                suggestion.suggestedBuses.map((bus, i) => (
                  <div key={i} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                    <button 
                      onClick={() => setExpandedBus(expandedBus === bus.name ? null : bus.name)}
                      className="w-full text-left p-3 bg-white hover:bg-blue-50 flex justify-between items-center transition-colors group"
                    >
                      <span className="font-bold text-blue-700 flex items-center gap-2">
                        <ICONS.Bus /> {bus.name}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold group-hover:text-blue-600 transition-colors">
                        {expandedBus === bus.name ? t.hide : t.routeRange}
                      </span>
                    </button>
                    {expandedBus === bus.name && (
                      <div className="p-3 bg-blue-50/50 text-xs border-t border-slate-100 animate-slide-up">
                        <p className="mb-1 text-slate-500">{t.routeStarts} <span className="text-slate-800 font-bold">{bus.startPoint}</span></p>
                        <p className="text-slate-500">{t.routeEnds} <span className="text-slate-800 font-bold">{bus.endPoint}</span></p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-4">কোনো বাস রুট পাওয়া যায়নি।</p>
              )}
            </div>

            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-800 leading-relaxed italic">"{suggestion.tips}"</p>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="space-y-4 pt-4">
            <h2 className="font-bold text-lg flex items-center gap-2 text-slate-700 px-1">
              <ICONS.History /> {t.recentSearches}
            </h2>
            <div className="space-y-3">
              {history.map((h, i) => (
                <div 
                  key={i} 
                  className="glass-card p-4 rounded-2xl flex justify-between items-center cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50/50 group active:scale-[0.98]"
                  onClick={() => handleHistoryClick(h)}
                >
                  <div className="flex-1">
                    <p className="font-bold text-sm group-hover:text-blue-600 transition-colors">{h.from} → {h.to}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(h.timestamp || 0).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-blue-500 bg-white shadow-sm border border-blue-100 p-2 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ICONS.Search />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;