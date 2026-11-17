import { Module } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module';
import { DatabaseModule } from '@/database/database.module';
import { MotivatorsModule } from '@/motivators/motivators.module';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';

@Module({
  imports: [AuthModule, DatabaseModule, MotivatorsModule],
  controllers: [RecordsController],
  providers: [RecordsService],
})
export class RecordsModule {}
