import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryRecordsDto {
  @IsOptional()
  @IsString()
  macrodomain?: string;

  @IsOptional()
  @IsIn(['all', 'complete', 'open'])
  status?: 'all' | 'complete' | 'open';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
