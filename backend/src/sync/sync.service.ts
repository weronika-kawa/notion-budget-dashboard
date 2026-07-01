import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@notionhq/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private notion: Client;

  constructor(private prisma: PrismaService) {
    this.notion = new Client({
      auth: process.env.NOTION_API_KEY,
    });
  }

  // Pobieranie ID źródła danych dla danej bazy
  private async getDataSourceId(databaseId: string): Promise<string> {
    const db = await this.notion.databases.retrieve({
      database_id: databaseId,
    });
    const dataSources = (db as any).data_sources;
    const firstSourceId = dataSources?.[0]?.id;

    if (!firstSourceId) {
      throw new Error(`Nie znaleziono źródła danych dla bazy o ID: ${databaseId}`);
    }

    return firstSourceId;
  }

  // Pobiera wszystkie rekordy (Pagination)
  private async fetchAllPages(dataSourceId: string): Promise<any[]> {
    let hasMore = true;
    let startCursor: string | undefined = undefined;
    const allResults: any[] = [];

    while (hasMore) {
      const response = await this.notion.dataSources.query({
        data_source_id: dataSourceId,
        start_cursor: startCursor,
      });

      allResults.push(...response.results);
      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;
    }

    return allResults;
  }

  // Szukanie nazwy wiersza (title)
  private getPageTitle(properties: any): string {
    for (const key of Object.keys(properties)) {
      if (properties[key]?.type === 'title') {
        return properties[key].title?.[0]?.plain_text || '';
      }
    }
    return '';
  }

  // Pobieranie tekstu z pól typu RichText
  private getRichText(property: any): string {
    if (!property || property.type !== 'rich_text') return '';
    return property.rich_text?.[0]?.plain_text || '';
  }

  // 1. Konta
  async syncAccounts(): Promise<number> {
    const databaseId = process.env.NOTION_DB_ACCOUNTS;
    if (!databaseId) throw new Error('Brak NOTION_DB_ACCOUNTS!');
    
    const dataSourceId = await this.getDataSourceId(databaseId);
    const results = await this.fetchAllPages(dataSourceId);

    let syncedCount = 0;
    for (const page of results) {
      const notionId = page.id;
      const name = this.getPageTitle(page.properties);
      const dateVal = page.properties.Date?.date?.start ? new Date(page.properties.Date.date.start) : null;

      await this.prisma.account.upsert({
        where: { notionId },
        update: { name, date: dateVal },
        create: { notionId, name, date: dateVal },
      });
      syncedCount++;
    }
    return syncedCount;
  }

  // 2. Kategorie Wydatków
  async syncExpenseCategories(): Promise<number> {
    const databaseId = process.env.NOTION_DB_EXP_CATEGORIES;
    if (!databaseId) throw new Error('Brak NOTION_DB_EXP_CATEGORIES!');

    const dataSourceId = await this.getDataSourceId(databaseId);
    const results = await this.fetchAllPages(dataSourceId);

    let syncedCount = 0;
    for (const page of results) {
      const notionId = page.id;
      const name = this.getPageTitle(page.properties);
      if (!name) continue;

      await this.prisma.expenseCategory.upsert({
        where: { notionId },
        update: { name },
        create: { notionId, name },
      });
      syncedCount++;
    }
    return syncedCount;
  }

  // 3. Kategorie Przychodów
  async syncIncomeCategories(): Promise<number> {
    const databaseId = process.env.NOTION_DB_INC_CATEGORIES;
    if (!databaseId) throw new Error('Brak NOTION_DB_INC_CATEGORIES!');

    const dataSourceId = await this.getDataSourceId(databaseId);
    const results = await this.fetchAllPages(dataSourceId);

    let syncedCount = 0;
    for (const page of results) {
      const notionId = page.id;
      const name = this.getPageTitle(page.properties);
      if (!name) continue;

      await this.prisma.incomeCategory.upsert({
        where: { notionId },
        update: { name },
        create: { notionId, name },
      });
      syncedCount++;
    }
    return syncedCount;
  }

  // 4. Miesiące
  async syncMonths(): Promise<number> {
    const databaseId = process.env.NOTION_DB_MONTHS;
    if (!databaseId) throw new Error('Brak NOTION_DB_MONTHS!');

    const dataSourceId = await this.getDataSourceId(databaseId);
    const results = await this.fetchAllPages(dataSourceId);

    let syncedCount = 0;
    for (const page of results) {
      const notionId = page.id;
      const name = this.getPageTitle(page.properties);
      if (!name) continue;

      const number = page.properties.Numer?.number || 1;
      let year = page.properties.Rok?.number;
      if (year === undefined && page.properties.Rok?.type === 'formula') {
        year = page.properties.Rok.formula?.number;
      }
      if (!year) year = new Date().getFullYear();

      let startDate: Date;
      const notionDateStr = page.properties.Date?.date?.start;
      if (notionDateStr) {
        startDate = new Date(notionDateStr);
      } else {
        startDate = new Date(year, number - 1, 1);
      }

      await this.prisma.month.upsert({
        where: { notionId },
        update: { name, number, year, startDate },
        create: { notionId, name, number, year, startDate },
      });
      syncedCount++;
    }
    return syncedCount;
  }

  // 5. Wydatki
  async syncExpenses(): Promise<number> {
    const databaseId = process.env.NOTION_DB_EXPENSES;
    if (!databaseId) throw new Error('Brak NOTION_DB_EXPENSES!');

    const dataSourceId = await this.getDataSourceId(databaseId);
    const results = await this.fetchAllPages(dataSourceId);

    let syncedCount = 0;
    for (const page of results) {
      const notionId = page.id;
      const name = this.getPageTitle(page.properties);
      if (!name) continue;

      const amount = page.properties.Kwota?.number || 0;
      const dateStr = page.properties['Data Wydatku']?.date?.start;
      if (!dateStr) continue;
      const date = new Date(dateStr);

      const notes = this.getRichText(page.properties.Notatki);

      const categoryNotionId = page.properties.Kategoria?.relation?.[0]?.id;
      const accountNotionId = page.properties.Konto?.relation?.[0]?.id;
      const monthNotionId = page.properties.Miesiąc?.relation?.[0]?.id;

      if (!categoryNotionId || !accountNotionId || !monthNotionId) continue;

      const category = await this.prisma.expenseCategory.findUnique({ where: { notionId: categoryNotionId } });
      const account = await this.prisma.account.findUnique({ where: { notionId: accountNotionId } });
      const month = await this.prisma.month.findUnique({ where: { notionId: monthNotionId } });

      if (!category || !account || !month) continue;

      await this.prisma.expense.upsert({
        where: { notionId },
        update: { name, amount, date, notes, categoryId: category.id, accountId: account.id, monthId: month.id },
        create: { notionId, name, amount, date, notes, categoryId: category.id, accountId: account.id, monthId: month.id },
      });
      syncedCount++;
    }
    return syncedCount;
  }

  // 6. Przychody
  async syncIncomes(): Promise<number> {
    const databaseId = process.env.NOTION_DB_INCOMES;
    if (!databaseId) throw new Error('Brak NOTION_DB_INCOMES!');

    const dataSourceId = await this.getDataSourceId(databaseId);
    const results = await this.fetchAllPages(dataSourceId);

    let syncedCount = 0;
    for (const page of results) {
      const notionId = page.id;
      const name = this.getPageTitle(page.properties);
      if (!name) continue;

      const amount = page.properties.Kwota?.number || 0;
      const dateStr = page.properties['Data Przychodu']?.date?.start;
      if (!dateStr) continue;
      const date = new Date(dateStr);

      const notes = this.getRichText(page.properties.Notatki);

      const categoryNotionId = page.properties.Kategoria?.relation?.[0]?.id;
      const accountNotionId = page.properties.Konto?.relation?.[0]?.id;
      const monthNotionId = page.properties.Miesiąc?.relation?.[0]?.id;

      if (!categoryNotionId || !accountNotionId || !monthNotionId) continue;

      const category = await this.prisma.incomeCategory.findUnique({ where: { notionId: categoryNotionId } });
      const account = await this.prisma.account.findUnique({ where: { notionId: accountNotionId } });
      const month = await this.prisma.month.findUnique({ where: { notionId: monthNotionId } });

      if (!category || !account || !month) continue;

      await this.prisma.income.upsert({
        where: { notionId },
        update: { name, amount, date, notes, categoryId: category.id, accountId: account.id, monthId: month.id },
        create: { notionId, name, amount, date, notes, categoryId: category.id, accountId: account.id, monthId: month.id },
      });
      syncedCount++;
    }
    return syncedCount;
  }

  // 7. Plan Przychodów
  async syncIncomePlans(): Promise<number> {
    const databaseId = process.env.NOTION_DB_INC_PLANS;
    if (!databaseId) throw new Error('Brak NOTION_DB_INC_PLANS!');

    const dataSourceId = await this.getDataSourceId(databaseId);
    const results = await this.fetchAllPages(dataSourceId);

    let syncedCount = 0;
    for (const page of results) {
      const notionId = page.id;
      const name = this.getPageTitle(page.properties);
      if (!name) continue;

      const plannedAmount = page.properties.Plan?.number || 0;

      const categoryNotionId = page.properties.Kategoria?.relation?.[0]?.id;
      const monthNotionId = page.properties.Miesiące?.relation?.[0]?.id || page.properties.Miesiąc?.relation?.[0]?.id;

      if (!categoryNotionId || !monthNotionId) continue;

      const category = await this.prisma.incomeCategory.findUnique({ where: { notionId: categoryNotionId } });
      const month = await this.prisma.month.findUnique({ where: { notionId: monthNotionId } });

      if (!category || !month) continue;

      await this.prisma.incomePlan.upsert({
        where: { notionId },
        update: { name, plannedAmount, categoryId: category.id, monthId: month.id },
        create: { notionId, name, plannedAmount, categoryId: category.id, monthId: month.id },
      });
      syncedCount++;
    }
    return syncedCount;
  }

  // 8. Plan Wydatków
  async syncExpensePlans(): Promise<number> {
    const databaseId = process.env.NOTION_DB_EXP_PLANS;
    if (!databaseId) throw new Error('Brak NOTION_DB_EXP_PLANS!');

    const dataSourceId = await this.getDataSourceId(databaseId);
    const results = await this.fetchAllPages(dataSourceId);

    let syncedCount = 0;
    for (const page of results) {
      const notionId = page.id;
      const name = this.getPageTitle(page.properties);
      if (!name) continue;

      const plannedAmount = page.properties.Plan?.number || 0;

      const categoryNotionId = page.properties.Kategoria?.relation?.[0]?.id;
      const monthNotionId = page.properties.Miesiące?.relation?.[0]?.id || page.properties.Miesiąc?.relation?.[0]?.id;

      if (!categoryNotionId || !monthNotionId) continue;

      const category = await this.prisma.expenseCategory.findUnique({ where: { notionId: categoryNotionId } });
      const month = await this.prisma.month.findUnique({ where: { notionId: monthNotionId } });

      if (!category || !month) continue;

      await this.prisma.expensePlan.upsert({
        where: { notionId },
        update: { name, plannedAmount, categoryId: category.id, monthId: month.id },
        create: { notionId, name, plannedAmount, categoryId: category.id, monthId: month.id },
      });
      syncedCount++;
    }
    return syncedCount;
  }

  // GŁÓWNY KOORDYNATOR: Synchronizuje wszystko w idealnej kolejności i loguje wynik do bazy
  async syncAll() {
    this.logger.log('=== ROZPOCZYNAM PEŁNĄ SYNCHRONIZACJĘ BUDŻETU ===');
    const startTime = new Date();
    let totalItems = 0;

    try {
      // 1. Najpierw słowniki niezależne (Konta, Kategorie, Miesiące)
      const months = await this.syncMonths();
      const accounts = await this.syncAccounts();
      const expCats = await this.syncExpenseCategories();
      const incCats = await this.syncIncomeCategories();
      
      // 2. Potem plany budżetowe (zależą od Miesięcy i Kategorii)
      const expPlans = await this.syncExpensePlans();
      const incPlans = await this.syncIncomePlans();

      // 3. Na końcu rzeczywiste transakcje (zależą od Kont, Kategorii i Miesięcy)
      const expenses = await this.syncExpenses();
      const incomes = await this.syncIncomes();

      totalItems = months + accounts + expCats + incCats + expPlans + incPlans + expenses + incomes;

      // Zapisujemy udaną próbę do logów bazy danych
      await this.prisma.syncLog.create({
        data: {
          status: 'SUCCESS',
          itemsSynced: totalItems,
        }
      });

      const durationSec = ((new Date().getTime() - startTime.getTime()) / 1000).toFixed(2);
      this.logger.log(`=== SYNCHRONIZACJA ZAKOŃCZONA SUKCESEM (${totalItems} rekordów w ${durationSec}s) ===`);

      return {
        success: true,
        totalItems,
        durationSeconds: parseFloat(durationSec),
      };

    } catch (error) {
      const err = error as any;
      this.logger.error('=== SYNCHRONIZACJA ZAKOŃCZONA PORAŻKĄ ===', err.stack);
      
      await this.prisma.syncLog.create({
        data: {
          status: 'FAILED',
          itemsSynced: 0,
          error: err.message,
        }
      });

      return {
        success: false,
        error: err.message,
      };
    }
  }

  // Metoda testowa
  async testConnection() {
    const databaseId = process.env.NOTION_DB_ACCOUNTS;
    if (!databaseId) {
      return { success: false, error: 'Brak NOTION_DB_ACCOUNTS!' };
    }
    try {
      const dataSourceId = await this.getDataSourceId(databaseId);
      const results = await this.fetchAllPages(dataSourceId);
      return { success: true, count: results.length };
    } catch (error) {
      return { success: false, error: (error as any).message };
    }
  }
}