import { Module } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module';
import { DatabaseModule } from '@/database/database.module';
import { MotivatorsController } from './motivators.controller';
import { MotivatorsService } from './motivators.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [MotivatorsController],
  providers: [MotivatorsService],
  exports: [MotivatorsService],
})
export class MotivatorsModule {}
