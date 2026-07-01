import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  notes: string;
  type: "INCOME" | "EXPENSE";
  categoryName: string;
  accountName: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  // Formatowanie waluty do standardu PLN
  const formatCurrency = (value: number, type: "INCOME" | "EXPENSE") => {
    const formatted = new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      minimumFractionDigits: 2,
    }).format(value);

    return type === "INCOME" ? `+ ${formatted}` : `- ${formatted}`;
  };

  // Formatowanie daty (np. 22.06.2026)
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Card className="col-span-1 lg:col-span-2 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Ostatnie Transakcje</CardTitle>
        <CardDescription>
          Najnowsze operacje finansowe zsynchronizowane automatycznie z Notion.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Brak ostatnich transakcji w bazie danych.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[45%]">Transakcja</TableHead>
                  <TableHead className="w-[20%]">Kategoria</TableHead>
                  {/* Ta kolumna ukrywa się na telefonach (hidden) i pojawia na średnich ekranach (md:table-cell) */}
                  <TableHead className="hidden md:table-cell w-[20%]">Konto</TableHead>
                  <TableHead className="text-right w-[15%]">Kwota</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const isIncome = tx.type === "INCOME";
                  return (
                    <TableRow key={tx.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <div className="font-semibold text-slate-800 line-clamp-1">
                          {tx.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(tx.date)}
                          {tx.notes && ` • ${tx.notes}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                          {tx.categoryName}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-slate-600 text-sm">
                        {tx.accountName}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        <span
                          className={`inline-flex items-center gap-0.5 ${
                            isIncome ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDownRight className="h-3.5 w-3.5" />
                          )}
                          {formatCurrency(tx.amount, tx.type)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}