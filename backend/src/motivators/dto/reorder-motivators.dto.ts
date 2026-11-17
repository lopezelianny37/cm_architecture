import { ArrayMaxSize, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MotivatorItemDto } from './motivator-item.dto';

export class ReorderMotivatorsDto {
  @ValidateNested({ each: true })
  @Type(() => MotivatorItemDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  items: MotivatorItemDto[];
}
