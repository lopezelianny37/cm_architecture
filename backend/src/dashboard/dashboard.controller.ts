import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import { AccessToken } from '@/auth/decorators/access-token.decorator';
import { DashboardService } from './dashboard.service';
import { QueryDashboardDto } from './dto/query-dashboard.dto';

@Controller('api/dashboard')
@UseGuards(SupabaseAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  getMetrics(@AccessToken() token: string, @Query() query: QueryDashboardDto) {
    return this.dashboardService.getMetrics(token, query.macrodomain);
  }

  @Get('radars')
  getRadars(@AccessToken() token: string, @Query() query: QueryDashboardDto) {
    return this.dashboardService.getRadars(token, query.macrodomain);
  }

  @Get('motivators-summary')
  getMotivatorsSummary(@Query() query: QueryDashboardDto) {
    return this.dashboardService.getMotivatorsSummary(query.macrodomain);
  }

  @Get('scope-progress')
  getScopeProgress(@AccessToken() token: string) {
    return this.dashboardService.getScopeProgress(token);
  }
}
