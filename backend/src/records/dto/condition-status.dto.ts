import { IsIn, IsOptional, IsString } from 'class-validator';

export class ConditionStatusDto {
  @IsOptional()
  @IsIn(['', 'si', 'par', 'no'])
  status?: '' | 'si' | 'par' | 'no';

  @IsOptional()
  @IsString()
  evidence?: string;
}
