import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Send, Sparkles, Bot, User, Code2, AlertCircle, RefreshCw } from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  loading: boolean;
  onSelectCity: (city: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  loading,
  onSelectCity
}) => {
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const samplePrompts = [
    "Qual a previsão e o que levar na mala para o Rio de Janeiro?",
    "Vou para Gramado neste fim de semana. Me dê um roteiro e dicas de roupas!",
    "Como está o tempo em Paris hoje? O que devo colocar na mala?",
    "Vou viajar para Tóquio. Crie um roteiro de 3 passeios adaptado ao clima!"
  ];

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-800 flex flex-col h-[650px]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              Wayfinder AI Assistant
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold px-2 py-0.5 rounded-full">
                Gemini 3.6
              </span>
            </h3>
            <p className="text-slate-400 text-xs">
              Conectado às APIs de geolocalização e previsão meteorológica em tempo real
            </p>
          </div>
        </div>

        <button 
          onClick={() => onSendMessage("Olá, como você pode me ajudar no planejamento de viagem?")}
          className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all text-xs flex items-center gap-1"
          title="Reiniciar chat"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 mt-1 shadow">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-tr-none shadow-md'
                  : msg.isError
                  ? 'bg-rose-950/80 text-rose-200 border border-rose-800 rounded-tl-none'
                  : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-none shadow'
              }`}
            >
              {/* Transparency Badge if function calls executed */}
              {msg.functionCalls && msg.functionCalls.length > 0 && (
                <div className="mb-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-[11px] font-mono text-sky-300 space-y-1">
                  <div className="flex items-center gap-1 font-sans text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    <Code2 className="w-3 h-3 text-amber-400" />
                    <span>Funções Executadas Server-Side:</span>
                  </div>
                  {msg.functionCalls.map((fc, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 text-slate-300 bg-slate-950/60 p-1.5 rounded border border-slate-800">
                      <span className="text-amber-300 font-semibold">⚡ {fc.functionName}</span>
                      <span className="text-slate-400 text-[10px] truncate max-w-[180px]">
                        {JSON.stringify(fc.args)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="whitespace-pre-wrap font-sans">
                {msg.text}
              </div>

              {/* Timestamp */}
              <div
                className={`text-[10px] mt-2 font-medium ${
                  msg.sender === 'user' ? 'text-sky-100 text-right' : 'text-slate-400'
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center shrink-0 mt-1 shadow">
                <User className="w-4 h-4 text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            </div>
            <div className="bg-slate-800 p-3.5 rounded-2xl rounded-tl-none border border-slate-700 text-xs text-sky-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span>Consultando geolocalização e previsão do tempo em tempo real...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="py-2 border-t border-slate-800">
        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Exemplos de Pergunta Rápidas:</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              disabled={loading}
              onClick={() => onSendMessage(prompt)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg whitespace-nowrap border border-slate-700 transition-all shrink-0 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="pt-2 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite um destino ou dúvida de viagem..."
          disabled={loading}
          className="flex-1 bg-slate-800 text-white placeholder-slate-400 text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl font-medium text-xs flex items-center gap-2 shadow transition-all disabled:opacity-50"
        >
          <span>Enviar</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );
};
