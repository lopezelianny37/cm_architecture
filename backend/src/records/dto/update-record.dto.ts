import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { BehaviorObservationDto } from './behavior-observation.dto';
import { FlowStepDto } from './flow-step.dto';
import { GapDto } from './gap.dto';
import { ConditionStatusDto } from './condition-status.dto';

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

  /**
   * Free text for now — no fixed options yet (explicitly requested as
   * plain text, to be revisited later).
   */
  @IsOptional()
  @IsString()
  initiativeStatus?: string;

  @IsOptional()
  @IsString()
  businessReferent?: string;

  /**
   * Join key to moving_motivator_submissions (see
   * SPEC_MOVING_MOTIVATORS_ADDENDUM.md §3.2) — the facilitator enters the
   * architect's own email here so the public wizard's submission can be
   * matched back to this record. Empty string allowed (not yet filled in);
   * anything non-empty must be a valid email format.
   */
  @IsOptional()
  @ValidateIf((o) => o.architectEmail !== '')
  @IsEmail()
  architectEmail?: string;

  @IsOptional()
  @IsString()
  prepValue?: string;

  @IsOptional()
  @IsString()
  prepBarrier?: string;

  /**
   * A behaviors array from a legacy export (back when BEH had 8 items) is
   * silently truncated to the current 7 instead of being rejected — no
   * real data has this shape anymore (BEH was reduced before any record
   * existed with the old shape), but this keeps a future stray import
   * tolerant rather than crashing.
   */
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value.slice(0, 7) : value))
  @IsArray()
  @ArrayMinSize(7)
  @ArrayMaxSize(7)
  @ValidateNested({ each: true })
  @Type(() => BehaviorObservationDto)
  behaviors?: BehaviorObservationDto[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => FlowStepDto)
  flowSteps?: FlowStepDto[];

  @IsOptional()
  @IsString()
  debriefStrength?: string;

  @IsOptional()
  @IsString()
  debriefSelfgap?: string;

  @IsOptional()
  @IsString()
  debriefBlock?: string;

  @IsOptional()
  @IsString()
  debriefTry?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @IsString({ each: true })
  flowQa?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GapDto)
  gaps?: GapDto[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(7)
  @ArrayMaxSize(7)
  @ValidateNested({ each: true })
  @Type(() => ConditionStatusDto)
  conditions?: ConditionStatusDto[];

  @IsOptional()
  @ValidateIf((o) => o.csatScore !== null)
  @IsInt()
  @Min(1)
  @Max(5)
  csatScore?: number | null;

  @IsOptional()
  @IsString()
  csatComment?: string;
}
