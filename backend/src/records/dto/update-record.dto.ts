import { ArrayMaxSize, ArrayMinSize, IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BehaviorObservationDto } from './behavior-observation.dto';
import { FlowStepDto } from './flow-step.dto';

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
}
