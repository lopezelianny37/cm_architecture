import { IsIn, IsOptional, IsString } from 'class-validator';

const WASTE_TYPES = ['', 'Retrabajo', 'Supuesto', 'Espera', 'Oportunidad'];

export class FlowStepDto {
  @IsOptional()
  @IsString()
  step?: string;

  @IsOptional()
  @IsString()
  objective?: string;

  @IsOptional()
  @IsString()
  with?: string;

  @IsOptional()
  @IsString()
  out?: string;

  @IsOptional()
  @IsIn(WASTE_TYPES)
  waste?: string;
}
