import { ArrayMinSize, IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ImportRecordDto } from './import-record.dto';

export class ImportPayloadDto {
  @IsOptional()
  @IsNumber()
  target?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportRecordDto)
  records: ImportRecordDto[];
}
