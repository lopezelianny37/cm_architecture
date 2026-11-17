import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import { CurrentUser, CurrentUserPayload } from '@/auth/decorators/current-user.decorator';
import { AccessToken } from '@/auth/decorators/access-token.decorator';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Controller('api/settings')
@UseGuards(SupabaseAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings(
    @AccessToken() token: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.settingsService.getSettings(token, user.id);
  }

  @Patch()
  updateSettings(
    @AccessToken() token: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: UpdateSettingsDto,
  ) {
    return this.settingsService.upsertTargetScope(token, user.id, body.targetScope);
  }
}
