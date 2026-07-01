import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SyncModule } from './sync/sync.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [PrismaModule, SyncModule, DashboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
