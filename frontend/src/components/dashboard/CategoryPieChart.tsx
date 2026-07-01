import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface CategoryBreakdown {
  category: {
    id: string;
    name: string;
  };
  planned: number;
  actual: number;
  difference: number;
  percentageUsed: number;
}

interface CategoryPieChartProps {
  categories: CategoryBreakdown[];
}

// Elegancka paleta pastelowo-biznesowych barw
const COLORS = [
  '#6366f1', // indygo
  '#f43f5e', // różowy/różany
  '#10b981', // szmaragdowy
  '#f59e0b', // bursztynowy
  '#8b5cf6', // fioletowy
  '#06b6d4', // błękitny/cyjan
  '#ec4899', // róż fuksja
  '#14b8a6', // morski
];

export function CategoryPieChart({ categories }: CategoryPieChartProps) {
  // Przygotowujemy dane w formacie czytelnym dla biblioteki Recharts
  const data = categories.map(c => ({
    name: c.category.name,
    actual: c.actual,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Customowy styl dymku podpowiedzi (Tooltip) po najechaniu myszką
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-lg text-xs">
          <p className="font-bold text-slate-800">{payload[0].name}</p>
          <p className="text-rose-600 font-bold mt-0.5">
            Kwota: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm hover:shadow-md transition-shadow duration-300 col-span-1">
      {/* Nagłówek wykresu */}
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="font-bold tracking-tight text-lg">Struktura Wydatków</h3>
        <p className="text-xs text-slate-500">
          Procentowy podział rzeczywistych wydatków poniesionych w wybranym okresie.
        </p>
      </div>

      {/* Wykres */}
      <div className="p-6 pt-0">
        {data.length === 0 ? (
          <div className="h-[260px] flex items-center justify-center">
            <p className="text-sm text-slate-500 text-center">
              Brak zarejestrowanych wydatków w wybranym miesiącu.
            </p>
          </div>
        ) : (
          <div className="h-[260px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60} // 'Donut' (dziurka) zamiast klasycznego koła – wygląda o wiele lepiej!
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="actual"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  iconType="circle"
                  iconSize={8}
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}