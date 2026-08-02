import React from 'react';
import { Activity } from '../types';
import { MapPin, SunMedium, Umbrella, Utensils, Landmark, Compass, ExternalLink, Clock } from 'lucide-react';

interface ItineraryViewProps {
  activities: Activity[];
  cityName: string;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({ activities, cityName }) => {
  const getCategoryBadge = (cat: Activity['category']) => {
    switch (cat) {
      case 'indoor':
        return {
          label: 'Ambiente Coberto',
          bg: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: <Umbrella className="w-3.5 h-3.5 text-amber-600" />
        };
      case 'outdoor':
        return {
          label: 'Ao Ar Livre',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: <SunMedium className="w-3.5 h-3.5 text-emerald-600" />
        };
      case 'cultural':
        return {
          label: 'Cultural & Histórico',
          bg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          icon: <Landmark className="w-3.5 h-3.5 text-indigo-600" />
        };
      case 'gastronomia':
        return {
          label: 'Gastronomia Local',
          bg: 'bg-rose-100 text-rose-800 border-rose-200',
          icon: <Utensils className="w-3.5 h-3.5 text-rose-600" />
        };
      default:
        return {
          label: 'Lazer & Passeio',
          bg: 'bg-sky-100 text-sky-800 border-sky-200',
          icon: <Compass className="w-3.5 h-3.5 text-sky-600" />
        };
    }
  };

  const getTimeOfDayColor = (time: Activity['timeOfDay']) => {
    switch (time) {
      case 'Manhã':
        return 'from-amber-500 to-orange-500 text-white';
      case 'Tarde':
        return 'from-sky-500 to-blue-600 text-white';
      case 'Noite':
        return 'from-indigo-600 to-purple-800 text-white';
      default:
        return 'from-slate-700 to-slate-900 text-white';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 text-slate-800">
      
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-6">
        <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
          <Compass className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            🗺️ Roteiro Sugerido Adaptado ao Clima
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm">
            3 atividades selecionadas estrategicamente para as condições de tempo de {cityName}
          </p>
        </div>
      </div>

      {/* Activity Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activities.map((act, index) => {
          const badge = getCategoryBadge(act.category);
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${act.title} ${act.location} ${cityName}`)}`;

          return (
            <div
              key={act.id || `act-${index}`}
              className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 hover:border-sky-300 hover:shadow-lg transition-all flex flex-col justify-between relative group"
            >
              <div>
                {/* Time Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getTimeOfDayColor(act.timeOfDay)} shadow-sm`}>
                    <Clock className="w-3 h-3" />
                    <span>{act.timeOfDay}</span>
                  </span>

                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.bg}`}>
                    {badge.icon}
                    <span>{badge.label}</span>
                  </span>
                </div>

                {/* Title */}
                <h4 className="font-bold text-slate-900 text-base mb-2 group-hover:text-sky-600 transition-colors">
                  {act.title}
                </h4>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-3">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">{act.location}</span>
                </div>

                {/* Description */}
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                  {act.description}
                </p>
              </div>

              {/* Weather suitability note & Map link */}
              <div>
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-sky-900 text-xs mb-4">
                  <span className="font-bold block text-sky-700 mb-0.5">☁️ Adaptação ao Clima:</span>
                  <span>{act.weatherNote}</span>
                </div>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <MapPin className="w-3.5 h-3.5 text-sky-500" />
                  <span>Ver no Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
