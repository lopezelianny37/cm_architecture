import { Module } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module';
import { RecordsController } from './records.controller';

@Module({
  imports: [AuthModule],
  controllers: [RecordsController],
})
export class RecordsModule {}
