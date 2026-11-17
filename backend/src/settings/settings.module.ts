import { Module } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module';
import { DatabaseModule } from '@/database/database.module';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
