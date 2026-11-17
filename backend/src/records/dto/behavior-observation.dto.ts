import { IsIn, IsOptional, IsString } from 'class-validator';

export class BehaviorObservationDto {
  @IsIn(['si', 'par', 'no', 'na'])
  state: 'si' | 'par' | 'no' | 'na';

  @IsOptional()
  @IsString()
  fact?: string;

  @IsOptional()
  @IsString()
  artifact?: string;
}
