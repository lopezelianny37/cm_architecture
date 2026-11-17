import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateRecordDto {
  @IsString()
  @MinLength(1)
  architectName: string;

  @IsOptional()
  @IsString()
  macrodomain?: string;

  @IsOptional()
  @IsString()
  initiativeName?: string;

  @IsOptional()
  @IsString()
  businessReferent?: string;
}
