import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface TrendItem {
  monthId: string;
  name: string;
  income: number;
  expense: number;
  net: number;
}

interface TrendBarChartProps {
  trendData: TrendItem[];
}

export function TrendBarChart({ trendData }: TrendBarChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Customowy styl podpowiedzi po najechaniu myszką
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isNetPositive = data.net >= 0;

      return (
        <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-lg text-xs space-y-1">
          <p className="font-bold text-slate-800 mb-1">{data.name}</p>
          <p className="text-emerald-600 font-semibold">
            Przychody: {formatCurrency(data.income)}
          </p>
          <p className="text-rose-600 font-semibold">
            Wydatki: {formatCurrency(data.expense)}
          </p>
          <div className="border-t border-slate-100 pt-1 mt-1 flex justify-between gap-4">
            <span className="text-slate-500 font-medium">Bilans netto:</span>
            <span className={`font-bold ${isNetPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatCurrency(data.net)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm hover:shadow-md transition-shadow duration-300 col-span-1 lg:col-span-2">
      {/* Nagłówek wykresu */}
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="font-bold tracking-tight text-lg">Trend Budżetowy</h3>
        <p className="text-xs text-slate-500">
          Porównanie przychodów i wydatków z ostatnich 6 miesięcy na osi czasu.
        </p>
      </div>

      {/* Wykres */}
      <div className="p-6 pt-0">
        {trendData.length === 0 ? (
          <div className="h-[260px] flex items-center justify-center">
            <p className="text-sm text-slate-500 text-center">
              Brak wystarczającej ilości danych do wygenerowania trendu.
            </p>
          </div>
        ) : (
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                {/* Linie pomocnicze (tylko poziome, bardzo delikatny kolor) */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  // Skracamy np. 5000 do 5k, 10000 do 10k dla czystości osi
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  dx={-10}
                />
                
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                
                <Legend 
                  iconType="circle"
                  iconSize={8}
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '15px' }}
                />
                
                <Bar 
                  name="Przychody"
                  dataKey="income" 
                  fill="#10b981" // szmaragdowy
                  radius={[4, 4, 0, 0]} // Zaokrąglone górne rogi
                  maxBarSize={25}
                />
                
                <Bar 
                  name="Wydatki"
                  dataKey="expense" 
                  fill="#f43f5e" // różany
                  radius={[4, 4, 0, 0]} // Zaokrąglone górne rogi
                  maxBarSize={25}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}