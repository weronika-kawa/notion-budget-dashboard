import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface SummaryCardsProps {
  summary: {
    actual: {
      totalIncomes: number;
      totalExpenses: number;
      netBalance: number;
    };
    planned: {
      totalPlannedIncomes: number;
      totalPlannedExpenses: number;
      plannedNetBalance: number;
    };
    stats: {
      expenseLimitUsagePct: number;
      incomeGoalRealizationPct: number;
    };
  } | null;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  if (!summary) return null;

  const { actual, planned, stats } = summary;

  // Formatowanie liczb do czytelnego standardu PLN (np. 12 345,67 zł)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const isNetPositive = actual.netBalance >= 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* 1. KARTA: PRZYCHODY */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Przychody (Zarobki)</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">
            {formatCurrency(actual.totalIncomes)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Cel planowany: {formatCurrency(planned.totalPlannedIncomes)}
          </p>
          {/* Pasek postępu realizacji celu */}
          <div className="mt-3 w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(stats.incomeGoalRealizationPct, 100)}%` }}
            />
          </div>
          <div className="text-xs text-right text-muted-foreground mt-1 font-medium">
            {stats.incomeGoalRealizationPct}% realizacji celu
          </div>
        </CardContent>
      </Card>

      {/* 2. KARTA: WYDATKI */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Wydatki (Koszty)</CardTitle>
          <TrendingDown className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-600">
            {formatCurrency(actual.totalExpenses)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Limit planowany: {formatCurrency(planned.totalPlannedExpenses)}
          </p>
          {/* Pasek postępu wykorzystania budżetu */}
          <div className="mt-3 w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                stats.expenseLimitUsagePct > 100 ? "bg-destructive animate-pulse" : "bg-rose-500"
              }`}
              style={{ width: `${Math.min(stats.expenseLimitUsagePct, 100)}%` }}
            />
          </div>
          <div className="text-xs text-right text-muted-foreground mt-1 font-medium">
            {stats.expenseLimitUsagePct}% wykorzystania budżetu
          </div>
        </CardContent>
      </Card>

      {/* 3. KARTA: BILANS NETTO */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bilans (Oszczędności)</CardTitle>
          <Wallet className={`h-4 w-4 ${isNetPositive ? "text-emerald-500" : "text-rose-500"}`} />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              isNetPositive ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {formatCurrency(actual.netBalance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Planowany bilans: {formatCurrency(planned.plannedNetBalance)}
          </p>
          <div className="mt-4 text-xs text-muted-foreground font-medium">
            {isNetPositive ? (
              <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                Twój budżet w tym miesiącu rośnie! 🎉
              </span>
            ) : (
              <span className="text-rose-600 bg-rose-50 px-2 py-1 rounded">
                Wydałaś więcej niż zarobiłaś. ⚠️
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}