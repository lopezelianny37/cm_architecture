import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import { CurrentUser, CurrentUserPayload } from '@/auth/decorators/current-user.decorator';
import { AccessToken } from '@/auth/decorators/access-token.decorator';
import { RecordsService } from './records.service';
import { QueryRecordsDto } from './dto/query-records.dto';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';

@Controller('api/records')
@UseGuards(SupabaseAuthGuard)
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get()
  getRecords(@AccessToken() token: string, @Query() query: QueryRecordsDto) {
    return this.recordsService.findAll(token, query);
  }

  @Get(':id')
  getRecord(@AccessToken() token: string, @Param('id') id: string) {
    return this.recordsService.findOne(token, id);
  }

  @Post()
  createRecord(
    @AccessToken() token: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: CreateRecordDto,
  ) {
    return this.recordsService.create(token, user.id, body);
  }

  @Patch(':id')
  updateRecord(
    @AccessToken() token: string,
    @Param('id') id: string,
    @Body() body: UpdateRecordDto,
  ) {
    return this.recordsService.update(token, id, body);
  }
}
