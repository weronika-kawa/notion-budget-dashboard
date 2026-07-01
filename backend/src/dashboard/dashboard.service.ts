import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private prisma: PrismaService) {}

  // 1. GŁÓWNE PODSUMOWANIE MIESIĄCA (Zaktualizowane o zaokrąglenia kwot)
  async getMonthSummary(monthId: string) {
    this.logger.log(`Pobieranie podsumowania dla miesiąca o ID: ${monthId}`);

    const month = await this.prisma.month.findUnique({
      where: { id: monthId },
    });

    if (!month) {
      throw new NotFoundException('Nie znaleziono wskazanego miesiąca w bazie!');
    }

    const expenseAggregate = await this.prisma.expense.aggregate({
      where: { monthId },
      _sum: { amount: true },
    });
    const totalExpenses = parseFloat((expenseAggregate._sum.amount || 0).toFixed(2));

    const incomeAggregate = await this.prisma.income.aggregate({
      where: { monthId },
      _sum: { amount: true },
    });
    const totalIncomes = parseFloat((incomeAggregate._sum.amount || 0).toFixed(2));

    const expensePlanAggregate = await this.prisma.expensePlan.aggregate({
      where: { monthId },
      _sum: { plannedAmount: true },
    });
    const totalPlannedExpenses = parseFloat((expensePlanAggregate._sum.plannedAmount || 0).toFixed(2));

    const incomePlanAggregate = await this.prisma.incomePlan.aggregate({
      where: { monthId },
      _sum: { plannedAmount: true },
    });
    const totalPlannedIncomes = parseFloat((incomePlanAggregate._sum.plannedAmount || 0).toFixed(2));

    const netBalance = parseFloat((totalIncomes - totalExpenses).toFixed(2));
    const plannedNetBalance = parseFloat((totalPlannedIncomes - totalPlannedExpenses).toFixed(2));

    const expenseLimitUsagePct = totalPlannedExpenses > 0 
      ? parseFloat(((totalExpenses / totalPlannedExpenses) * 100).toFixed(2)) 
      : 0;

    const incomeGoalRealizationPct = totalPlannedIncomes > 0 
      ? parseFloat(((totalIncomes / totalPlannedIncomes) * 100).toFixed(2)) 
      : 0;

    return {
      month: {
        id: month.id,
        name: month.name,
        year: month.year,
        number: month.number,
      },
      actual: {
        totalIncomes,
        totalExpenses,
        netBalance,
      },
      planned: {
        totalPlannedIncomes,
        totalPlannedExpenses,
        plannedNetBalance,
      },
      stats: {
        expenseLimitUsagePct,
        incomeGoalRealizationPct,
      }
    };
  }

  // 2. PODZIAŁ WYDATKÓW NA KATEGORIE VS PLAN
  async getCategoryBreakdown(monthId: string) {
    this.logger.log(`Pobieranie podziału na kategorie dla miesiąca o ID: ${monthId}`);

    // Pobieramy wszystkie kategorie wydatków z bazy
    const categories = await this.prisma.expenseCategory.findMany();

    // Pobieramy zaplanowane limity wydatków dla tego miesiąca
    const plans = await this.prisma.expensePlan.findMany({
      where: { monthId },
    });

    // Pobieramy rzeczywiste wydatki pogrupowane po kategoriach w tym miesiącu
    const actualExpenses = await this.prisma.expense.groupBy({
      by: ['categoryId'],
      where: { monthId },
      _sum: { amount: true },
    });

    // Tworzymy słowniki w pamięci (Map) dla szybkiego wyszukiwania O(1)
    const planMap = new Map(plans.map(p => [p.categoryId, p.plannedAmount]));
    const actualMap = new Map(actualExpenses.map(ae => [ae.categoryId, ae._sum.amount || 0]));

    // Mapujemy wszystkie kategorie, łącząc plan z rzeczywistym wykonaniem
    const breakdown = categories.map(category => {
      const planned = planMap.get(category.id) || 0;
      const actual = actualMap.get(category.id) || 0;

      // Zaokrąglenia i obliczenia różnic
      const roundedPlanned = parseFloat(planned.toFixed(2));
      const roundedActual = parseFloat(actual.toFixed(2));
      const difference = parseFloat((roundedPlanned - roundedActual).toFixed(2));

      const percentageUsed = roundedPlanned > 0
        ? parseFloat(((roundedActual / roundedPlanned) * 100).toFixed(2))
        : 0;

      return {
        category: {
          id: category.id,
          name: category.name,
          notionId: category.notionId,
        },
        planned: roundedPlanned,
        actual: roundedActual,
        difference,         // Kwota, jaka została do limitu (dodatnia) lub przekroczenie (ujemna)
        percentageUsed,     // Procent wykorzystania limitu, np. 75.3%
      };
    });

    // Odrzucamy kategorie, które w tym miesiącu nie mają ani zaplanowanego budżetu, ani żadnego wydatku
    const activeBreakdown = breakdown.filter(b => b.planned > 0 || b.actual > 0);

    // Sortujemy od kategorii, na które poszło najwięcej rzeczywistych pieniędzy (idealne pod wykres)
    return activeBreakdown.sort((a, b) => b.actual - a.actual);
  }

  // 3. DYNAMICZNE SALDA (STAN) KONT BANKOWYCH
  // 3. DYNAMICZNE SALDA (STAN) KONT BANKOWYCH
  async getAccountBalances() {
    this.logger.log('Pobieranie aktualnych sald wszystkich kont bankowych...');

    // A. Pobieramy wszystkie konta z bazy danych
    const accounts = await this.prisma.account.findMany();

    // B. Prosimy PostgreSQL o zsumowanie wszystkich rzeczywistych przychodów, pogrupowanych po ID konta
    const incomeSums = await this.prisma.income.groupBy({
      by: ['accountId'],
      _sum: { amount: true },
    });

    // C. Prosimy PostgreSQL o zsumowanie wszystkich rzeczywistych wydatków, pogrupowanych po ID konta
    const expenseSums = await this.prisma.expense.groupBy({
      by: ['accountId'],
      _sum: { amount: true },
    });

    // Tworzymy słowniki Map dla natychmiastowego wyszukiwania O(1)
    const incomeMap = new Map(incomeSums.map(i => [i.accountId, i._sum.amount || 0]));
    const expenseMap = new Map(expenseSums.map(e => [e.accountId, e._sum.amount || 0]));

    // Budujemy raport dla każdego konta
    const balances = accounts.map(account => {
      const totalIncomes = incomeMap.get(account.id) || 0;
      const totalExpenses = expenseMap.get(account.id) || 0;

      // Zaokrąglenia i wyliczenie ostatecznego salda
      const roundedIncomes = parseFloat(totalIncomes.toFixed(2));
      const roundedExpenses = parseFloat(totalExpenses.toFixed(2));
      const balance = parseFloat((roundedIncomes - roundedExpenses).toFixed(2));

      return {
        id: account.id,
        name: account.name,
        notionId: account.notionId,
        totalIncomes: roundedIncomes,
        totalExpenses: roundedExpenses,
        balance, // Aktualne saldo konta (Przychody - Wydatki)
        displayString: `Stan: ${balance.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN`,
      };
    });

    // Sortujemy konta: te z największą ilością środków lądują na samej górze
    return balances.sort((a, b) => b.balance - a.balance);
  }

  // 4. FEED OSTATNICH TRANSAKCJI (Miks przychodów i wydatków)
  async getRecentTransactions(limit = 10) {
    this.logger.log(`Pobieranie ostatnich ${limit} transakcji...`);

    // A. Pobieramy najnowsze wydatki (wraz z kategoriami i kontami)
    const expenses = await this.prisma.expense.findMany({
      take: limit,
      orderBy: { date: 'desc' },
      include: {
        category: { select: { name: true } },
        account: { select: { name: true } },
      }
    });

    // B. Pobieramy najnowsze przychody (wraz z kategoriami i kontami)
    const incomes = await this.prisma.income.findMany({
      take: limit,
      orderBy: { date: 'desc' },
      include: {
        category: { select: { name: true } },
        account: { select: { name: true } },
      }
    });

    // C. Łączymy obie listy i mapujemy na jednolity obiekt transakcji
    const combined = [
      ...expenses.map(e => ({
        id: e.id,
        name: e.name,
        amount: e.amount,
        date: e.date,
        notes: e.notes,
        type: 'EXPENSE' as const,
        categoryName: e.category.name,
        accountName: e.account.name,
      })),
      ...incomes.map(i => ({
        id: i.id,
        name: i.name,
        amount: i.amount,
        date: i.date,
        notes: i.notes,
        type: 'INCOME' as const,
        categoryName: i.category.name,
        accountName: i.account.name,
      })),
    ];

    // D. Sortujemy całą połączoną listę od najnowszych transakcji i przycinamy do wybranego limitu
    return combined
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

// 5. TREND FINANSOWY (Ostatnie 6 miesięcy do wykresu - tylko do bieżącego miesiąca wstecz)
  async getMonthlyTrend() {
    this.logger.log('Pobieranie trendu finansowego z ostatnich 6 miesięcy...');

    const today = new Date();

    // Pobieramy 6 miesięcy, których data rozpoczęcia jest mniejsza lub równa dzisiaj (lte)
    const lastSixMonths = await this.prisma.month.findMany({
      where: {
        startDate: {
          lte: today, // lte = less than or equal (mniejsze bądź równe)
        },
      },
      orderBy: { startDate: 'desc' },
      take: 6,
    });

    // Odwracamy tablicę, aby zachować porządek chronologiczny (od najstarszego do najnowszego)
    const chronologicalMonths = lastSixMonths.reverse();

    const trendData: any[] = [];

    // Dla każdego miesiąca wyliczamy sumy przychodów i wydatków
    for (const month of chronologicalMonths) {
      const expenseAggregate = await this.prisma.expense.aggregate({
        where: { monthId: month.id },
        _sum: { amount: true },
      });

      const incomeAggregate = await this.prisma.income.aggregate({
        where: { monthId: month.id },
        _sum: { amount: true },
      });

      const totalExpenses = parseFloat((expenseAggregate._sum.amount || 0).toFixed(2));
      const totalIncomes = parseFloat((incomeAggregate._sum.amount || 0).toFixed(2));
      const net = parseFloat((totalIncomes - totalExpenses).toFixed(2));

      trendData.push({
        monthId: month.id,
        name: month.name,
        income: totalIncomes,
        expense: totalExpenses,
        net,
      });
    }

    return trendData;
  }

  // 6. LISTA WSZYSTKICH MIESIĘCY (Niezbędna do dropdownu na frontendzie)
  async getAllMonths() {
    this.logger.log('Pobieranie listy wszystkich miesięcy...');
    return await this.prisma.month.findMany({
      orderBy: { startDate: 'desc' }, // najnowsze miesiące na samej górze
      select: {
        id: true,
        name: true,
        year: true,
        number: true,
      }
    });
  }

  // 7. PROGNOZA PLANÓW NA PRZYSZŁOŚĆ (Bieżący miesiąc i kolejne w przyszłość)
  async getFutureForecast(monthsCount = 6) {
    this.logger.log(`Pobieranie prognozy planów na kolejne ${monthsCount} miesięcy...`);
    const today = new Date();

    // Pobieramy miesiące zaczynające się od 1 dnia bieżącego miesiąca w górę (gte)
    const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const futureMonths = await this.prisma.month.findMany({
      where: {
        startDate: {
          gte: firstDayOfCurrentMonth, // gte = greater than or equal (większe bądź równe)
        }
      },
      orderBy: { startDate: 'asc' }, // sortujemy rosnąco (chronologicznie w przyszłość)
      take: monthsCount,
    });

    const forecastData: any[] = [];

    // Dla każdego przyszłego miesiąca sumujemy zaplanowane kwoty
    for (const month of futureMonths) {
      const expensePlanAggregate = await this.prisma.expensePlan.aggregate({
        where: { monthId: month.id },
        _sum: { plannedAmount: true },
      });

      const incomePlanAggregate = await this.prisma.incomePlan.aggregate({
        where: { monthId: month.id },
        _sum: { plannedAmount: true },
      });

      const totalPlannedExpenses = parseFloat((expensePlanAggregate._sum.plannedAmount || 0).toFixed(2));
      const totalPlannedIncomes = parseFloat((incomePlanAggregate._sum.plannedAmount || 0).toFixed(2));
      const plannedNet = parseFloat((totalPlannedIncomes - totalPlannedExpenses).toFixed(2));

      forecastData.push({
        monthId: month.id,
        name: month.name,
        plannedIncome: totalPlannedIncomes,
        plannedExpense: totalPlannedExpenses,
        plannedNet,
      });
    }

    return forecastData;
  }
}