import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import { AccessToken } from '@/auth/decorators/access-token.decorator';
import { MotivatorsService } from './motivators.service';
import { ReorderMotivatorsDto } from './dto/reorder-motivators.dto';

@Controller('api/records/:recordId/motivators')
@UseGuards(SupabaseAuthGuard)
export class MotivatorsController {
  constructor(private readonly motivatorsService: MotivatorsService) {}

  @Get()
  getMotivators(@AccessToken() token: string, @Param('recordId') recordId: string) {
    return this.motivatorsService.findByRecord(token, recordId);
  }

  @Patch()
  reorderMotivators(
    @AccessToken() token: string,
    @Param('recordId') recordId: string,
    @Body() body: ReorderMotivatorsDto,
  ) {
    return this.motivatorsService.reorder(token, recordId, body.items);
  }
}
