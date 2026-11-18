import { IsIn, IsInt, Max, Min } from 'class-validator';
import { MOT } from '@/common/constants/gemba.constants';

const MOT_NAMES = MOT.map((m) => m.name);

export class ImpactItemDto {
  @IsIn(MOT_NAMES)
  motivator: string;

  @IsInt()
  @Min(-4)
  @Max(4)
  impact: number;
}
