"use client";

import { useEffect, useState } from "react";
import {
  fetchAllMonths,
  fetchMonthSummary,
  fetchCategoryBreakdown,
  fetchAccountBalances,
  fetchRecentTransactions,
  fetchMonthlyTrend,
  triggerSyncAll,
} from "@/lib/api";

// Import naszych modularnych komponentów
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { AccountBalances } from "@/components/dashboard/AccountBalances";
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart";
import { TrendBarChart } from "@/components/dashboard/TrendBarChart";
import { CategoryBreakdownList } from "@/components/dashboard/CategoryBreakdownList";

// Import gotowych komponentów UI od Shadcn
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw, Calendar, PiggyBank } from "lucide-react";

export default function DashboardPage() {
  const [months, setMonths] = useState<any[]>([]);
  const [selectedMonthId, setSelectedMonthId] = useState<string>("");
  
  const [summary, setSummary] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Wyliczamy czytelną nazwę wybranego miesiąca do wyświetlenia w dropdownie
  const selectedMonthName = months.find((m: any) => m.id === selectedMonthId)?.name || "Wybierz miesiąc";

  // Pobieranie danych, które nie zmieniają się w kontekście wyboru miesiąca (sald kont, trend, transakcje)
  const loadStaticData = async () => {
    try {
      const [accBalances, recent, trend] = await Promise.all([
        fetchAccountBalances(),
        fetchRecentTransactions(),
        fetchMonthlyTrend(),
      ]);
      setBalances(accBalances);
      setRecentTransactions(recent);
      setTrendData(trend);
    } catch (error) {
      console.error("Błąd podczas pobierania danych ogólnych:", error);
    }
  };

  // ŁADOWANIE POCZĄTKOWE: Pobieramy listę miesięcy oraz dane ogólne
  useEffect(() => {
    async function initDashboard() {
      setLoading(true);
      try {
        const fetchedMonths = await fetchAllMonths();
        setMonths(fetchedMonths);
        
        // Dynamicznie szukamy bieżącego miesiąca na podstawie dzisiejszej daty
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonthNumber = today.getMonth() + 1; // getMonth() zwraca 0-11, dodajemy 1

        const currentMonth = fetchedMonths.find(
          (m: any) => m.year === currentYear && m.number === currentMonthNumber
        );

        if (currentMonth) {
          setSelectedMonthId(currentMonth.id); // Ustawiamy ID bieżącego miesiąca (np. Lipiec 2026)
        } else if (fetchedMonths.length > 0) {
          setSelectedMonthId(fetchedMonths[0].id); // Fallback: najnowszy na liście
        }
        
        await loadStaticData();
      } catch (error) {
        console.error("Błąd podczas inicjalizacji dashboardu:", error);
      } finally {
        setLoading(false);
      }
    }
    initDashboard();
  }, []);

  // REAKCJA NA ZMIANĘ WYBRANEGO MIESIĄCA (Pobieramy summary i kategorie)
  useEffect(() => {
    if (!selectedMonthId) return;

    async function loadMonthlyData() {
      try {
        const [sum, catBreakdown] = await Promise.all([
          fetchMonthSummary(selectedMonthId),
          fetchCategoryBreakdown(selectedMonthId),
        ]);
        setSummary(sum);
        setCategories(catBreakdown);
      } catch (error) {
        console.error("Błąd podczas pobierania danych miesięcznych:", error);
      }
    }
    loadMonthlyData();
  }, [selectedMonthId]);

  // AKCJA: Ręczna synchronizacja z Notion API
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const syncResult = await triggerSyncAll();
      if (syncResult.success) {
        alert(`Synchronizacja ukończona! Pomyślnie zsynchronizowano ${syncResult.totalItems} rekordów.`);
        
        // Odświeżamy listę miesięcy (mogły dojść nowe z Notion!)
        // Odświeżamy listę miesięcy
        const fetchedMonths = await fetchAllMonths();
        setMonths(fetchedMonths);
        
        if (!selectedMonthId && fetchedMonths.length > 0) {
          // Szukamy bieżącego miesiąca
          const today = new Date();
          const currentYear = today.getFullYear();
          const currentMonthNumber = today.getMonth() + 1;

          const currentMonth = fetchedMonths.find(
            (m: any) => m.year === currentYear && m.number === currentMonthNumber
          );

          if (currentMonth) {
            setSelectedMonthId(currentMonth.id);
          } else {
            setSelectedMonthId(fetchedMonths[0].id);
          }
        } else if (selectedMonthId) {
          // Odświeżamy dane wybranego obecnie miesiąca
          const [sum, catBreakdown] = await Promise.all([
            fetchMonthSummary(selectedMonthId),
            fetchCategoryBreakdown(selectedMonthId),
          ]);
          setSummary(sum);
          setCategories(catBreakdown);
        }

        // Odświeżamy dane ogólne
        await loadStaticData();
      } else {
        alert(`Błąd podczas synchronizacji: ${syncResult.error}`);
      }
    } catch (error) {
      console.error("Błąd podczas wywołania synchronizacji:", error);
      alert("Wystąpił błąd krytyczny podczas wywoływania synchronizacji z Notion API.");
    } finally {
      setIsSyncing(false);
    }
  };

  // EKRAN ŁADOWANIA (Loader)
  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-slate-50">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm font-semibold text-slate-600">Ładowanie Twojego budżetu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* PASEK NAWIGACYJNY (HEADER) */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-7xl">
          {/* Logo i Nazwa */}
          <div className="flex items-center gap-2">
            <PiggyBank className="h-6 w-6 text-indigo-600" />
            <span className="text-lg font-bold tracking-tight text-slate-800">Notion Budget Dashboard</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Przycisk synchronizacji na żywo */}
            <Button 
              onClick={handleSync} 
              disabled={isSyncing}
              variant="outline"
              className="flex items-center gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Synchronizowanie..." : "Synch z Notion"}
            </Button>
          </div>
        </div>
      </header>

      {/* GŁÓWNA STRONA DASHBOARDU */}
      <main className="container mx-auto px-4 mt-6 max-w-7xl space-y-6">
        
        {/* PASEK FILTROWANIA I WYBORU OKRESU */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              Przegląd Miesięczny
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Wybierz okres, aby zaktualizować dane na wykresach.</p>
          </div>
          
          {/* Dropdown wyboru miesiąca */}
          <div className="w-full sm:w-[220px]">
            {months.length > 0 && (
              <Select value={selectedMonthId} onValueChange={(val) => setSelectedMonthId(val ?? "")}>
                <SelectTrigger className="w-full border-slate-200 bg-white">
                  {/* Wymuszamy, aby wyświetlała się piękna nazwa, a nie ID */}
                  <SelectValue placeholder="Wybierz miesiąc">
                    {selectedMonthName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {months.map((m: any) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* 1. SEKCJA: TRZY KAFELKI PODSUMOWAŃ */}
        <SummaryCards summary={summary} />

        {/* 2. SEKCJA: WYKRESY I STRUKTURA WYDATKÓW */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {/* Kategorie (zajmuje 2/3 szerokości) */}
          <div className="lg:col-span-2"> {/* TUTAJ kontrolujesz szerokość (2/3) */}
            <CategoryBreakdownList categories={categories} />
          </div>
          {/* Wykres kołowy struktury wydatków (zajmuje 1/3 szerokości) */}
          <CategoryPieChart categories={categories} />
        </div>

        {/* 3. SEKCJA: TRANSAKCJE I STAN KONT BANKOWYCH */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {/* Tabela ostatnich transakcji (zajmuje 2/3 szerokości) */}
          <RecentTransactions transactions={recentTransactions} />

          {/* Stan kont bankowych (zajmuje 1/3 szerokości) */}
          <AccountBalances balances={balances} />
        </div>

        {/* 4. SEKCJA: SZCZEGÓŁOWA LISTA KATEGORII (2/3 SZEROKOŚCI) + WSKAZÓWKA (1/3) */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {/* Lista kategorii w dwóch kolumnach (zajmuje 2/3 szerokości) */}
          <div className="lg:col-span-2">
            <CategoryBreakdownList categories={categories} />
          </div>

          {/* Karta na 1/3 szerokości dla zachowania idealnej symetrii layoutu */}
          <div className="col-span-1 rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="font-bold tracking-tight text-lg text-slate-800 flex items-center gap-1.5">
                Wskazówka Budżetowa 💡
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Planowanie to klucz do wolności finansowej. Regularne uzupełnianie limitów w Notion dla każdej kategorii wydatków pozwala aplikacji na automatyczne wyliczanie pozostałych środków i wizualizację postępów w czasie rzeczywistym.
              </p>
            </div>
            
            {/* Informacje o bezpieczeństwie Twojego serwera Proxmox */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Status domowego serwera:</span>
              <span className="text-emerald-600 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Zabezpieczony (Cloudflare OTP)
              </span>
            </div>
          </div>
        </div>
        
        <TrendBarChart trendData={trendData} />

      </main>
    </div>
  );
}