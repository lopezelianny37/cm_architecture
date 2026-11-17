import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';

@Controller('api/records')
export class RecordsController {
  @Get()
  @UseGuards(SupabaseAuthGuard)
  getRecords(@Request() req: ExpressRequest) {
    return {
      records: [],
      total: 0,
      hasMore: false,
      userId: (req.user as any)?.id,
    };
  }
}
