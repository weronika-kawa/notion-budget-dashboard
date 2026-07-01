import { Controller, Get, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary/:monthId') // Endpoint: GET /dashboard/summary/TUTAJ_ID_MIESIACA
  async getSummary(@Param('monthId') monthId: string) {
    return await this.dashboardService.getMonthSummary(monthId);
  }

  @Get('categories/:monthId') // Endpoint: GET /dashboard/categories/TUTAJ_ID_MIESIACA
  async getCategories(@Param('monthId') monthId: string) {
    return await this.dashboardService.getCategoryBreakdown(monthId);
  }

  @Get('accounts') // Endpoint: GET /dashboard/accounts
  async getAccounts() {
    return await this.dashboardService.getAccountBalances();
  }

  @Get('recent') // Endpoint: GET /dashboard/recent
  async getRecent() {
    return await this.dashboardService.getRecentTransactions(10);
  }

  @Get('trend') // Endpoint: GET /dashboard/trend
  async getTrend() {
    return await this.dashboardService.getMonthlyTrend();
  }

  @Get('months') // Endpoint: GET /dashboard/months
  async getMonths() {
    return await this.dashboardService.getAllMonths();
  }

  @Get('forecast') // Endpoint: GET /dashboard/forecast
  async getForecast() {
    return await this.dashboardService.getFutureForecast(6);
  }
}
