import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from '@/database/database.module';
import { PublicMotivatorsController } from './public-motivators.controller';
import { PublicMotivatorsService } from './public-motivators.service';

@Module({
  imports: [
    DatabaseModule,
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60 * 60 * 1000, limit: 5 }],
    }),
  ],
  controllers: [PublicMotivatorsController],
  providers: [PublicMotivatorsService],
})
export class PublicMotivatorsModule {}
