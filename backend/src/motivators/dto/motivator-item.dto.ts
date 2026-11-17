import { IsIn, IsInt, IsString, Max, Min } from 'class-validator';
import { MOT } from '@/common/constants/gemba.constants';

const MOT_NAMES = MOT.map((m) => m.name);

export class MotivatorItemDto {
  @IsString()
  @IsIn(MOT_NAMES)
  name: string;

  @IsInt()
  @Min(0)
  @Max(9)
  order: number;

  @IsInt()
  @Min(-2)
  @Max(2)
  impact: number;
}
