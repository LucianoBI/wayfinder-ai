/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TripPlan, ChatMessage } from './types';
import { Navbar } from './components/Navbar';
import { WeatherCard } from './components/WeatherCard';
import { PackingChecklist } from './components/PackingChecklist';
import { ItineraryView } from './components/ItineraryView';
import { ChatInterface } from './components/ChatInterface';
import { QuickDestinations } from './components/QuickDestinations';
import { CloudSun, Sparkles, AlertCircle, Compass, RefreshCw, PlaneTakeoff, Info } from 'lucide-react';

export default function App() {
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'chat'>('dashboard');

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: '👋 Olá! Sou o Wayfinder AI, seu assistente especialista em inteligência meteorológica e planejamento de viagens.\n\nPara qual cidade ou destino você pretende viajar? Vou buscar a previsão do tempo em tempo real e montar a mala e o roteiro perfeitos para você!',
      timestamp: new Date().toISOString()
    }
  ]);

  // Load initial city on startup
  useEffect(() => {
    fetchCityPlan('Rio de Janeiro');
  }, []);

  const fetchCityPlan = async (city: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Não foi possível obter dados para este destino.');
      }

      setTripPlan(data);

      // Construct structured summary for chat history
      const formattedChatResponse = `✨ **Planejamento de Viagem para ${data.city}, ${data.country}** ✨\n\n` +
        `🌡️ **Resumo do Clima:**\n` +
        `• Temperatura Atual: ${data.weather.temperature}°C (Sensação: ${data.weather.apparentTemperature}°C)\n` +
        `• Condição: ${data.weather.conditionIcon} ${data.weather.conditionText}\n` +
        `• Vento: ${data.weather.windSpeed} km/h | Umidade: ${data.weather.humidity}%\n\n` +
        `🎒 **Dicas de Mala:**\n` +
        data.packingTips.slice(0, 5).map((p: any) => `• ${p.text} (${p.reason})`).join('\n') + `\n\n` +
        `🗺️ **Roteiro Sugerido:**\n` +
        data.suggestedItinerary.map((a: any) => `• **${a.timeOfDay}**: ${a.title} - *${a.location}* (${a.weatherNote})`).join('\n');

      setChatMessages(prev => [
        ...prev,
        {
          id: `plan-${Date.now()}`,
          sender: 'assistant',
          text: formattedChatResponse,
          tripPlan: data,
          functionCalls: [
            { functionName: 'obter_coordenadas', args: { cidade: city }, result: { lat: data.latitude, lon: data.longitude } },
            { functionName: 'obter_previsao_tempo', args: { latitude: data.latitude, longitude: data.longitude }, result: { temp: data.weather.temperature, cond: data.weather.conditionText } }
          ],
          timestamp: new Date().toISOString()
        }
      ]);

    } catch (err: any) {
      console.error("Erro ao buscar plano:", err);
      setError(err.message || 'Erro ao carregar planejamento do destino.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (userText: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toISOString()
    };

    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro na resposta do assistente.');
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.text,
        functionCalls: data.functionCalls,
        timestamp: new Date().toISOString()
      };

      setChatMessages(prev => [...prev, aiMsg]);

      // If a city function call was executed, automatically sync the Dashboard view
      if (data.functionCalls && data.functionCalls.length > 0) {
        const coordCall = data.functionCalls.find((fc: any) => fc.functionName === 'obter_coordenadas');
        if (coordCall && coordCall.args && coordCall.args.cidade) {
          fetchCityPlan(coordCall.args.cidade);
        }
      }

    } catch (err: any) {
      setChatMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ Erro: ${err.message || 'Desculpe, ocorreu um problema ao processar sua solicitação.'}`,
          isError: true,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        onSearch={fetchCityPlan}
        activeView={activeView}
        setActiveView={setActiveView}
        loading={loading}
        currentCity={tripPlan?.city}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Error Banner */}
        {error && (
          <div className="bg-rose-950/80 border border-rose-800 text-rose-200 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span className="text-xs sm:text-sm">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs font-semibold px-3 py-1 bg-rose-900 hover:bg-rose-800 rounded-lg text-white"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Quick Popular Destinations Bar */}
        <QuickDestinations onSelectCity={fetchCityPlan} loading={loading} />

        {/* View Content Switching */}
        {activeView === 'dashboard' ? (
          <>
            {loading && !tripPlan && (
              <div className="py-20 text-center space-y-4">
                <div className="inline-block p-4 bg-sky-500/10 rounded-full border border-sky-500/20 animate-bounce">
                  <CloudSun className="w-10 h-10 text-sky-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Buscando inteligência meteorológica...</h3>
                <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
                  Consultando coordenadas geográficas e executando previsão em tempo real via Open-Meteo API
                </p>
              </div>
            )}

            {tripPlan && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* 1. Live Weather Overview Card */}
                <WeatherCard weather={tripPlan.weather} />

                {/* 2. Packing List & Suggested Itinerary Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  
                  {/* Packing Checklist */}
                  <PackingChecklist
                    items={tripPlan.packingTips}
                    cityName={tripPlan.city}
                  />

                  {/* AI Advice Summary Box */}
                  <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" />
                      <span>Análise Climatológica de Viagem</span>
                    </div>

                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      {tripPlan.summary.overallAdvice}
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sensação Térmica</span>
                        <span className="text-base font-bold text-sky-300">{tripPlan.summary.temperatureText}</span>
                      </div>
                      <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ventos Locais</span>
                        <span className="text-base font-bold text-sky-300">{tripPlan.summary.windText}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => setActiveView('chat')}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Fazer Perguntas Personalizadas no Chat IA</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* 3. Weather-adapted Itinerary View */}
                <ItineraryView
                  activities={tripPlan.suggestedItinerary}
                  cityName={tripPlan.city}
                />

              </div>
            )}
          </>
        ) : (
          /* Chat View */
          <div className="max-w-4xl mx-auto">
            <ChatInterface
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              loading={loading}
              onSelectCity={fetchCityPlan}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CloudSun className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-slate-400">Wayfinder AI</span>
            <span>— Inteligência Meteorológica para Viagens Perfeitas</span>
          </div>
          <div>
            Desenvolvido com Open-Meteo & Gemini 3.6 Flash
          </div>
        </div>
      </footer>

    </div>
  );
}
