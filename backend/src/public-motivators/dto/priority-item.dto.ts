import { IsIn, IsInt, Max, Min } from 'class-validator';
import { MOT } from '@/common/constants/gemba.constants';

const MOT_NAMES = MOT.map((m) => m.name);

export class PriorityItemDto {
  @IsIn(MOT_NAMES)
  motivator: string;

  @IsInt()
  @Min(1)
  @Max(10)
  priorityOrder: number;
}
