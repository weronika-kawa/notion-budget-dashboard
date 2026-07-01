import { Controller, Get } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('test')
  async testNotionConnection() {
    return await this.syncService.testConnection();
  }

  @Get('accounts')
  async syncAccounts() {
    const count = await this.syncService.syncAccounts();
    return { message: 'Synchronizacja kont bankowych zakończona sukcesem!', syncedRecords: count };
  }

  @Get('categories')
  async syncCategories() {
    const expenseCount = await this.syncService.syncExpenseCategories();
    const incomeCount = await this.syncService.syncIncomeCategories();
    return { message: 'Synchronizacja kategorii zakończona sukcesem!', expenseCategoriesSynced: expenseCount, incomeCategoriesSynced: incomeCount };
  }

  @Get('months')
  async syncMonths() {
    const count = await this.syncService.syncMonths();
    return { message: 'Synchronizacja miesięcy zakończona sukcesem!', syncedRecords: count };
  }

  @Get('transactions')
  async syncTransactions() {
    const expenseCount = await this.syncService.syncExpenses();
    const incomeCount = await this.syncService.syncIncomes();
    return { message: 'Synchronizacja transakcji zakończona sukcesem!', expensesSynced: expenseCount, incomesSynced: incomeCount };
  }

  @Get('all') // TEN JEDYNY ENDPOINT DO WSZYSTKIEGO: GET /sync/all
  async syncAll() {
    return await this.syncService.syncAll();
  }
}