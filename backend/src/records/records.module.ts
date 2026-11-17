import { Module } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module';
import { DatabaseModule } from '@/database/database.module';
import { RecordsController } from './records.controller';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [RecordsController],
})
export class RecordsModule {}
