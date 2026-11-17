import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ImportMetaDto {
  @IsOptional() @IsString() arch?: string;
  @IsOptional() @IsString() macro?: string;
  @IsOptional() @IsString() init?: string;
  @IsOptional() @IsString() business?: string;
}

export class ImportMotivatorDto {
  @IsString() name: string;
  @IsOptional() @IsString() desc?: string;
  @IsOptional() @IsNumber() impact?: number;
  @IsOptional() @IsNumber() order?: number;
}

export class ImportPrepDto {
  @IsOptional() @IsString() value?: string;
  @IsOptional() @IsString() barrier?: string;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportMotivatorDto)
  mot?: ImportMotivatorDto[];
}

export class ImportBehaviorDto {
  @IsOptional() @IsString() s?: string;
  @IsOptional() @IsString() fact?: string;
  @IsOptional() @IsString() artifact?: string;
}

export class ImportFlowDto {
  @IsOptional() @IsString() step?: string;
  @IsOptional() @IsString() objective?: string;
  @IsOptional() @IsString() with?: string;
  @IsOptional() @IsString() out?: string;
  @IsOptional() @IsString() waste?: string;
}

export class ImportRun1Dto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportBehaviorDto)
  beh?: ImportBehaviorDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportFlowDto)
  flow?: ImportFlowDto[];
}

export class ImportGapDto {
  @IsOptional() @IsString() text?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() evidence?: string;
  @IsOptional() @IsString() condition?: string;
}

export class ImportConditionDto {
  @IsOptional() @IsString() s?: string;
  @IsOptional() @IsString() evidence?: string;
}

export class ImportDiagDto {
  @IsOptional() @IsString() strength?: string;
  @IsOptional() @IsString() selfgap?: string;
  @IsOptional() @IsString() block?: string;
  @IsOptional() @IsString() try?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  flowq?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportGapDto)
  gaps?: ImportGapDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportConditionDto)
  conditions?: ImportConditionDto[];
}

export class ImportCsatDto {
  @IsOptional() score?: string | number;
  @IsOptional() @IsString() comment?: string;
}

export class ImportRecordDto {
  @IsOptional() @ValidateNested() @Type(() => ImportMetaDto) meta?: ImportMetaDto;
  @IsOptional() @ValidateNested() @Type(() => ImportPrepDto) prep?: ImportPrepDto;
  @IsOptional() @ValidateNested() @Type(() => ImportRun1Dto) run1?: ImportRun1Dto;
  @IsOptional() @ValidateNested() @Type(() => ImportDiagDto) diag?: ImportDiagDto;
  @IsOptional() @ValidateNested() @Type(() => ImportCsatDto) csat?: ImportCsatDto;
}
