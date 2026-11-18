import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { RecordsModule } from './records/records.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SettingsModule } from './settings/settings.module';
import { ImportExportModule } from './import-export/import-export.module';
import { PublicMotivatorsModule } from './public-motivators/public-motivators.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    RecordsModule,
    DashboardModule,
    SettingsModule,
    ImportExportModule,
    PublicMotivatorsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
