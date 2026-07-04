import React from 'react';

interface CategoryBreakdown {
  category: {
    id: string;
    name: string;
    notionId: string;
  };
  planned: number;
  actual: number;
  difference: number;
  percentageUsed: number;
}

interface CategoryBreakdownListProps {
  categories: CategoryBreakdown[];
}

export function CategoryBreakdownList({ categories }: CategoryBreakdownListProps) {
  // Formatowanie waluty do standardu PLN
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Określenie koloru paska postępu na podstawie procentu zużycia limitu
  const getProgressBarColor = (pct: number) => {
    if (pct >= 100) return 'bg-rose-500 animate-pulse'; // Przekroczone - pulsujący czerwony
    if (pct >= 85) return 'bg-amber-500';               // Blisko limitu - żółty/pomarańczowy
    return 'bg-indigo-500';                             // Bezpiecznie - fioletowy
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Nagłówek karty */}
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="font-bold tracking-tight text-lg">Wydatki wg Kategorii</h3>
        <p className="text-xs text-slate-500">
          Szczegółowe zestawienie wydatków w porównaniu z planem budżetowym.
        </p>
      </div>

      {/* Zawartość */}
      <div className="p-6 pt-0">
        {categories.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-10">
            Brak zarejestrowanych wydatków w tym miesiącu.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            {categories.map((c) => {
              const hasPlan = c.planned > 0;
              const isOverBudget = c.actual > c.planned && hasPlan;

              return (
                <div 
                  key={c.category.id} 
                  className="space-y-1.5 p-2.5 rounded-lg border border-slate-50 hover:bg-slate-50/50 transition-colors duration-200"
                >
                  {/* Nazwa kategorii i aktualny koszt */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800">
                      {c.category.name}
                    </span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {formatCurrency(c.actual)}
                    </span>
                  </div>

                  {/* Informacja o planie budżetowym (jeśli istnieje w Notion) */}
                  {hasPlan ? (
                    <div className="flex items-center justify-between text-xs font-medium mt-1">
                      <span className="text-slate-400">
                        Plan: {formatCurrency(c.planned)}
                      </span>
                      <span className={isOverBudget ? "text-rose-600 font-bold" : "text-emerald-600"}>
                        {isOverBudget 
                          ? `Przekroczono o ${formatCurrency(Math.abs(c.difference))}`
                          : `Zostało ${formatCurrency(c.difference)}`
                        }
                      </span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 italic">
                      Brak zaplanowanego limitu
                    </div>
                  )}

                  {/* Pasek postępu (tylko jeśli mamy plan do porównania) */}
                  {hasPlan && (
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className={`h-full transition-all duration-500 ${getProgressBarColor(c.percentageUsed)}`}
                        style={{ width: `${Math.min(c.percentageUsed, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}