import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import { CurrentUser, CurrentUserPayload } from '@/auth/decorators/current-user.decorator';
import { AccessToken } from '@/auth/decorators/access-token.decorator';
import { ImportExportService } from './import-export.service';

@Controller('api')
@UseGuards(SupabaseAuthGuard)
export class ImportExportController {
  constructor(private readonly importExportService: ImportExportService) {}

  @Get('export')
  exportAll(@AccessToken() token: string) {
    return this.importExportService.exportAll(token);
  }

  @Get('records/:id/export')
  exportOne(@AccessToken() token: string, @Param('id') id: string) {
    return this.importExportService.exportOne(token, id);
  }

  @Post('import')
  importBackup(
    @AccessToken() token: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: unknown,
  ) {
    return this.importExportService.importBackup(token, user.id, body);
  }
}
