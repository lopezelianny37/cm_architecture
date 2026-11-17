import { IsOptional, IsString } from 'class-validator';

export class UpdateRecordDto {
  @IsOptional()
  @IsString()
  architectName?: string;

  @IsOptional()
  @IsString()
  macrodomain?: string;

  @IsOptional()
  @IsString()
  initiativeName?: string;

  @IsOptional()
  @IsString()
  businessReferent?: string;

  @IsOptional()
  @IsString()
  prepValue?: string;

  @IsOptional()
  @IsString()
  prepBarrier?: string;
}
