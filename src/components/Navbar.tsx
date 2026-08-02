import React, { useState } from 'react';
import { CloudSun, Search, Sparkles, MapPin, Compass, MessageSquareCode } from 'lucide-react';

interface NavbarProps {
  onSearch: (city: string) => void;
  activeView: 'dashboard' | 'chat';
  setActiveView: (view: 'dashboard' | 'chat') => void;
  loading: boolean;
  currentCity?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSearch,
  activeView,
  setActiveView,
  loading,
  currentCity
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => setActiveView('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <CloudSun className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-sky-300 via-white to-blue-200 bg-clip-text text-transparent">
                Wayfinder AI
              </span>
              <span className="hidden sm:block text-[10px] uppercase font-semibold text-sky-400 tracking-wider">
                Inteligência Meteorológica & Viagens
              </span>
            </div>
          </div>

          {/* Search Input Bar */}
          <form onSubmit={handleSubmit} className="flex-1 max-w-md relative hidden md:block">
            <div className="relative flex items-center">
              <MapPin className="absolute left-3.5 w-4 h-4 text-sky-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Para onde você quer viajar? (ex: Rio, Paris, Gramado)"
                className="w-full bg-slate-800/90 text-slate-100 placeholder-slate-400 text-sm rounded-full pl-10 pr-24 py-2 border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-1 px-3 py-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-medium rounded-full shadow transition-all disabled:opacity-50 flex items-center gap-1"
              >
                {loading ? (
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Buscar</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* View Toggler */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === 'dashboard'
                  ? 'bg-sky-500 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span className="hidden sm:inline">Painel de Viagem</span>
            </button>
            
            <button
              onClick={() => setActiveView('chat')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === 'chat'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Chat IA</span>
            </button>
          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSubmit} className="relative">
            <MapPin className="absolute left-3.5 top-2.5 w-4 h-4 text-sky-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite o nome da cidade (ex: Roma, Tóquio)..."
              className="w-full bg-slate-800 text-slate-100 placeholder-slate-400 text-sm rounded-full pl-10 pr-24 py-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-1 top-1 px-3 py-1 bg-sky-500 hover:bg-sky-400 text-white text-xs font-medium rounded-full shadow disabled:opacity-50"
            >
              Buscar
            </button>
          </form>
        </div>

      </div>
    </header>
  );
};
