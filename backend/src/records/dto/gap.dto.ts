import { IsOptional, IsString } from 'class-validator';

/**
 * `type` is intentionally NOT restricted to an enum here. The list of gap
 * types (TYPES in gemba.constants.ts) is a UI concern — it drives the
 * dropdown options — and has already changed once during this project. If
 * we validated against it here, a PATCH that merely resends an existing gap
 * untouched (because some other field changed) would get rejected with a
 * 400 the moment that gap's `type` falls outside the current list, even
 * though the user never tried to use the removed type. The dashboard's
 * gapsByType aggregation already tolerates arbitrary type strings
 * gracefully (see dashboard.service.spec.ts).
 */
export class GapDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  evidence?: string;

  @IsOptional()
  @IsString()
  condition?: string;
}
