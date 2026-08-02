import React, { useState } from 'react';
import { PackingItem } from '../types';
import { Backpack, CheckSquare, Plus, Shirt, Footprints, Sparkles, Shield, RefreshCw } from 'lucide-react';

interface PackingChecklistProps {
  items: PackingItem[];
  cityName: string;
}

export const PackingChecklist: React.FC<PackingChecklistProps> = ({ items: initialItems, cityName }) => {
  const [items, setItems] = useState<PackingItem[]>(initialItems);
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'roupas' | 'calcados' | 'acessorios' | 'essenciais'>('roupas');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  // Keep internal list updated if parent props change
  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const toggleCheck = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const newItem: PackingItem = {
      id: `custom-${Date.now()}`,
      text: newItemText.trim(),
      category: newItemCategory,
      checked: false,
      reason: 'Adicionado manualmente por você'
    };
    setItems(prev => [...prev, newItem]);
    setNewItemText('');
  };

  const resetAll = () => {
    setItems(prev => prev.map(item => ({ ...item, checked: false })));
  };

  const filteredItems = activeCategoryFilter === 'all' 
    ? items 
    : items.filter(i => i.category === activeCategoryFilter);

  const completedCount = items.filter(i => i.checked).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const categoryIcons = {
    roupas: <Shirt className="w-4 h-4 text-sky-500" />,
    calcados: <Footprints className="w-4 h-4 text-emerald-500" />,
    acessorios: <Sparkles className="w-4 h-4 text-amber-500" />,
    essenciais: <Shield className="w-4 h-4 text-indigo-500" />
  };

  const categoryLabels = {
    roupas: 'Roupas',
    calcados: 'Calçados',
    acessorios: 'Acessórios',
    essenciais: 'Essenciais'
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 text-slate-800">
      
      {/* Title & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 shadow-sm">
            <Backpack className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              🎒 Dicas de Mala para {cityName}
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm">
              Itens recomendados sob medida para as condições do clima atual
            </p>
          </div>
        </div>

        {totalCount > 0 && (
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
            title="Desmarcar todos"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reiniciar Checklist</span>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="my-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
          <span>Progresso da Mala</span>
          <span className="text-sky-600 font-bold">{completedCount} de {totalCount} itens prontos ({progressPercent}%)</span>
        </div>
        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-sky-500 to-indigo-600 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeCategoryFilter === 'all'
              ? 'bg-slate-900 text-white font-semibold shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Todos ({items.length})
        </button>
        {(['roupas', 'calcados', 'acessorios', 'essenciais'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategoryFilter(cat)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeCategoryFilter === cat
                ? 'bg-sky-500 text-white font-semibold shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {categoryIcons[cat]}
            <span>{categoryLabels[cat]}</span>
          </button>
        ))}
      </div>

      {/* Packing Checklist Items */}
      <div className="space-y-2.5 mb-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm italic">
            Nenhum item nesta categoria.
          </div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                item.checked
                  ? 'bg-emerald-50/60 border-emerald-200/80 text-slate-500'
                  : 'bg-slate-50/80 border-slate-200/70 hover:border-sky-300 hover:bg-sky-50/30'
              }`}
            >
              <div className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                item.checked
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-slate-300 bg-white'
              }`}>
                {item.checked && <CheckSquare className="w-3.5 h-3.5" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${item.checked ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {item.text}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-bold">
                    {categoryLabels[item.category]}
                  </span>
                </div>
                {item.reason && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    💡 {item.reason}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Custom Item Form */}
      <form onSubmit={addItem} className="pt-4 border-t border-slate-100 flex flex-wrap gap-2">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Adicionar item personalizado à mala..."
          className="flex-1 min-w-[200px] text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <select
          value={newItemCategory}
          onChange={(e) => setNewItemCategory(e.target.value as any)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="roupas">Roupas</option>
          <option value="calcados">Calçados</option>
          <option value="acessorios">Acessórios</option>
          <option value="essenciais">Essenciais</option>
        </select>
        <button
          type="submit"
          disabled={!newItemText.trim()}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow transition-all disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar</span>
        </button>
      </form>

    </div>
  );
};
