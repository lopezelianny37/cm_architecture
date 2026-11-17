import { IsInt, Max, Min } from 'class-validator';

export class UpdateSettingsDto {
  @IsInt()
  @Min(1)
  @Max(500)
  targetScope: number;
}
