import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { MOT } from '@/common/constants/gemba.constants';
import { SubmitMotivatorsDto } from './dto/submit-motivators.dto';

interface SubmissionMatch {
  id: string;
  name: string;
  email: string;
  submitted_at: string;
}

const MOT_NAMES = MOT.map((m) => m.name);

@Injectable()
export class PublicMotivatorsService {
  constructor(private readonly db: DatabaseService) {}

  private assertCompleteAndUnique(
    items: Array<{ motivator: string }>,
    field: string,
  ): void {
    const names = items.map((i) => i.motivator);
    const uniqueNames = new Set(names);

    if (uniqueNames.size !== names.length) {
      throw new BadRequestException(`${field} contiene motivadores duplicados`);
    }

    const missing = MOT_NAMES.filter((name) => !uniqueNames.has(name));
    if (missing.length > 0) {
      throw new BadRequestException(
        `${field} debe incluir los 10 motivadores (faltan: ${missing.join(', ')})`,
      );
    }
  }

  async submit(dto: SubmitMotivatorsDto) {
    this.assertCompleteAndUnique(dto.priorities, 'priorities');
    this.assertCompleteAndUnique(dto.impacts, 'impacts');

    const client = this.db.getServiceRoleClient();
    const trimmedEmail = dto.email.trim();
    const trimmedName = dto.name.trim();

    // Two separate .ilike() queries (not a single .or() string built from
    // user input) so arbitrary characters in name/email can never alter the
    // filter's meaning — supabase-js parameterizes each call independently.
    const [byEmailRes, byNameRes] = await Promise.all([
      client
        .from('moving_motivator_submissions')
        .select('id, name, email, submitted_at')
        .ilike('email', trimmedEmail),
      client
        .from('moving_motivator_submissions')
        .select('id, name, email, submitted_at')
        .ilike('name', trimmedName),
    ]);

    if (byEmailRes.error) throw new Error(byEmailRes.error.message);
    if (byNameRes.error) throw new Error(byNameRes.error.message);

    const matchesById = new Map<string, SubmissionMatch>();
    [...(byEmailRes.data ?? []), ...(byNameRes.data ?? [])].forEach((row) =>
      matchesById.set(row.id, row),
    );
    const matches = [...matchesById.values()];

    if (matches.length > 0 && !dto.confirmReplace) {
      const existing = matches[0];
      throw new HttpException(
        {
          duplicate: true,
          existing: {
            name: existing.name,
            email: existing.email,
            submittedAt: existing.submitted_at,
          },
        },
        HttpStatus.CONFLICT,
      );
    }

    if (matches.length > 0 && dto.confirmReplace) {
      const { error: deleteError } = await client
        .from('moving_motivator_submissions')
        .delete()
        .in('id', matches.map((m) => m.id));

      if (deleteError) throw new Error(deleteError.message);
    }

    const { data: inserted, error: insertError } = await client
      .from('moving_motivator_submissions')
      .insert({
        email: trimmedEmail,
        name: trimmedName,
        macrodomain: dto.macrodomain,
        priorities: dto.priorities,
        impacts: dto.impacts,
      })
      .select('submitted_at')
      .single();

    if (insertError) throw new Error(insertError.message);

    return { submittedAt: inserted.submitted_at };
  }
}
