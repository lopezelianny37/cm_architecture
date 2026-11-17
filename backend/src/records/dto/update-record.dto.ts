import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
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

  @IsOptional()
  @IsString()
  businessReferent?: string;

  @IsOptional()
  @IsString()
  prepValue?: string;

  @IsOptional()
  @IsString()
  prepBarrier?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(8)
  @ArrayMaxSize(8)
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
