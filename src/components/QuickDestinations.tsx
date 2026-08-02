import React from 'react';
import { POPULAR_CITIES } from '../data/popularCities';
import { Compass, Sparkles } from 'lucide-react';

interface QuickDestinationsProps {
  onSelectCity: (cityName: string) => void;
  loading: boolean;
}

export const QuickDestinations: React.FC<QuickDestinationsProps> = ({ onSelectCity, loading }) => {
  return (
    <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-800 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-sky-400">
        <Compass className="w-4 h-4" />
        <span>Destinos Populares em Destaque</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {POPULAR_CITIES.map((city) => (
          <button
            key={city.name}
            disabled={loading}
            onClick={() => onSelectCity(city.name)}
            className="group relative h-32 rounded-2xl overflow-hidden border border-slate-700/60 hover:border-sky-400/80 text-left transition-all shadow-md hover:shadow-sky-500/10 hover:-translate-y-0.5 disabled:opacity-50"
          >
            <img
              src={city.image}
              alt={city.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            
            <div className="absolute bottom-2.5 left-2.5 right-2.5">
              <div className="text-[10px] font-semibold text-sky-300 flex items-center gap-1">
                <span>{city.flag}</span>
                <span>{city.country}</span>
              </div>
              <div className="font-bold text-white text-xs truncate group-hover:text-sky-200 transition-colors">
                {city.name}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
