import { IsIn, IsOptional, IsString } from 'class-validator';
import { TYPES } from '@/common/constants/gemba.constants';

const TYPE_NAMES = [...TYPES];

export class GapDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsIn(TYPE_NAMES)
  type?: string;

  @IsOptional()
  @IsString()
  evidence?: string;

  @IsOptional()
  @IsString()
  condition?: string;
}
