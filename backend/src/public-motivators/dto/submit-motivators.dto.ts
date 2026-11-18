import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PUBLIC_MACRODOMAINS } from '@/common/constants/gemba.constants';
import { PriorityItemDto } from './priority-item.dto';
import { ImpactItemDto } from './impact-item.dto';

export class SubmitMotivatorsDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsIn(PUBLIC_MACRODOMAINS)
  macrodomain: string;

  @IsArray()
  @ArrayMinSize(10)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => PriorityItemDto)
  priorities: PriorityItemDto[];

  @IsArray()
  @ArrayMinSize(10)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => ImpactItemDto)
  impacts: ImpactItemDto[];

  @IsOptional()
  @IsBoolean()
  confirmReplace?: boolean;
}
