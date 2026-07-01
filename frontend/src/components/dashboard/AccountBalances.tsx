import React from 'react';
import { Landmark } from 'lucide-react';

interface AccountBalance {
  id: string;
  name: string;
  notionId: string;
  totalIncomes: number;
  totalExpenses: number;
  balance: number;
  displayString: string;
}

interface AccountBalancesProps {
  balances: AccountBalance[];
}

export function AccountBalances({ balances }: AccountBalancesProps) {
  // Pomocnik do określania koloru tła ikony w zależności od salda
  const getIconBgColor = (balance: number) => {
    return balance >= 0 
      ? 'bg-emerald-50 text-emerald-600' 
      : 'bg-rose-50 text-rose-600';
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Nagłówek karty */}
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="font-bold tracking-tight text-lg flex items-center gap-2">
          <Landmark className="h-5 w-5 text-slate-500" />
          Stan Kont Bankowych
        </h3>
        <p className="text-xs text-slate-500">
          Aktualne salda wyliczone w czasie rzeczywistym na podstawie historii transakcji.
        </p>
      </div>

      {/* Zawartość karty */}
      <div className="p-6 pt-0">
        {balances.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">
            Brak zsynchronizowanych kont bankowych.
          </p>
        ) : (
          <div className="space-y-3.5">
            {balances.map((acc) => {
              const isPositive = acc.balance >= 0;
              return (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50/50 transition-colors duration-200"
                >
                  {/* Lewa strona: Ikona i Nazwa */}
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getIconBgColor(acc.balance)}`}>
                      <Landmark className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                        {acc.name}
                      </p>
                      {/* Małe, czytelne podsumowanie obrotów na koncie */}
                      <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 mt-0.5">
                        <span className="text-emerald-600">
                          +{acc.totalIncomes.toLocaleString('pl-PL', { maximumFractionDigits: 0 })}
                        </span>
                        <span>/</span>
                        <span className="text-rose-500">
                          -{acc.totalExpenses.toLocaleString('pl-PL', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Prawa strona: Saldo końcowe */}
                  <div className="text-right">
                    <span
                      className={`font-bold text-sm tracking-tight ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {acc.balance.toLocaleString('pl-PL', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      PLN
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}