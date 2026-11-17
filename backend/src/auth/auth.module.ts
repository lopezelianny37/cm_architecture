import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseAuthGuard } from './supabase-auth.guard';

@Module({
  imports: [DatabaseModule],
  providers: [AuthService, SupabaseAuthGuard],
  controllers: [AuthController],
  exports: [SupabaseAuthGuard],
})
export class AuthModule {}
