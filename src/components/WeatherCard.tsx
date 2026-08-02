import React from 'react';
import { WeatherData } from '../types';
import { Wind, Droplets, Sun, Calendar, Thermometer, ShieldAlert, CloudRain } from 'lucide-react';

interface WeatherCardProps {
  weather: WeatherData;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather }) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/60 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{weather.conditionIcon}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {weather.city}
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-sky-300 border border-slate-700">
              {weather.country}
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Lat: {weather.latitude.toFixed(2)}°, Lon: {weather.longitude.toFixed(2)}°
          </p>
        </div>

        <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 rounded-full text-sky-300 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span>Previsão em Tempo Real</span>
        </div>
      </div>

      {/* Main Temp & Condition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 items-center relative z-10">
        <div className="flex items-baseline gap-4">
          <div className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-100 to-sky-300">
            {weather.temperature}°C
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-300 flex items-center gap-1">
              <Thermometer className="w-4 h-4 text-amber-400" />
              Sensação: {weather.apparentTemperature}°C
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Max: <span className="text-rose-300 font-bold">{weather.tempMax}°C</span> | Min: <span className="text-sky-300 font-bold">{weather.tempMin}°C</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 backdrop-blur-sm">
          <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-1">Condição Geral</div>
          <div className="text-lg font-bold text-sky-200 flex items-center gap-2">
            <span className="text-2xl">{weather.conditionIcon}</span>
            <span>{weather.conditionText}</span>
          </div>
          {weather.precipitation > 0 && (
            <div className="text-xs text-blue-300 mt-2 flex items-center gap-1 font-medium">
              <CloudRain className="w-3.5 h-3.5" />
              <span>Chuva estimada: {weather.precipitation} mm</span>
            </div>
          )}
        </div>
      </div>

      {/* Weather Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-slate-800 relative z-10">
        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Vento</div>
            <div className="text-sm font-bold text-white">{weather.windSpeed} km/h</div>
          </div>
        </div>

        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Umidade</div>
            <div className="text-sm font-bold text-white">{weather.humidity}%</div>
          </div>
        </div>

        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Índice UV</div>
            <div className="text-sm font-bold text-white">{weather.uvIndex}</div>
          </div>
        </div>

        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Nuvens</div>
            <div className="text-sm font-bold text-white">{weather.cloudCover}%</div>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast Section */}
      {weather.dailyForecast && weather.dailyForecast.length > 0 && (
        <div className="mt-6 relative z-10">
          <div className="flex items-center gap-2 mb-3 text-xs uppercase font-bold text-slate-400 tracking-wider">
            <Calendar className="w-4 h-4 text-sky-400" />
            <span>Previsão para os Próximos 7 Dias</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 overflow-x-auto pb-1">
            {weather.dailyForecast.map((day, idx) => {
              const dateObj = new Date(day.date + 'T00:00:00');
              const dayName = idx === 0 
                ? 'Hoje' 
                : dateObj.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
              const formattedDate = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

              return (
                <div 
                  key={day.date}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    idx === 0 
                      ? 'bg-sky-500/20 border-sky-400/40 text-white shadow-md' 
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold capitalize text-slate-200">{dayName}</div>
                  <div className="text-[10px] text-slate-400">{formattedDate}</div>
                  <div className="text-2xl my-1.5">{day.icon}</div>
                  <div className="text-xs font-semibold">
                    <span className="text-rose-300">{day.tempMax}°</span>{' '}
                    <span className="text-slate-500">|</span>{' '}
                    <span className="text-sky-300">{day.tempMin}°</span>
                  </div>
                  {day.precipitationSum > 0 && (
                    <div className="text-[10px] text-sky-300 mt-1 font-medium">
                      💧 {day.precipitationSum}mm
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
