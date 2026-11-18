import { API_BASE_URL } from './apiClient';

export interface PriorityEntry {
  motivator: string;
  priorityOrder: number;
}

export interface ImpactEntry {
  motivator: string;
  impact: number;
}

export interface SubmitMotivatorsPayload {
  name: string;
  email: string;
  macrodomain: string;
  priorities: PriorityEntry[];
  impacts: ImpactEntry[];
  confirmReplace?: boolean;
}

export interface ExistingSubmission {
  name: string;
  email: string;
  submittedAt: string;
}

export interface SubmitSuccess {
  submittedAt: string;
}

export interface SubmitDuplicate {
  duplicate: true;
  existing: ExistingSubmission;
}

export type SubmitResult = SubmitSuccess | SubmitDuplicate;

export function isDuplicateResult(result: SubmitResult): result is SubmitDuplicate {
  return 'duplicate' in result;
}

/**
 * Plain fetch, not the authenticated apiClient — this is a public,
 * login-free endpoint with no Authorization header to attach. Still needs
 * API_BASE_URL: in production the public wizard is served as part of the
 * same static frontend build but the backend lives on a different origin,
 * so a bare relative path would hit the frontend's own origin instead.
 */
export async function submitMotivators(payload: SubmitMotivatorsPayload): Promise<SubmitResult> {
  const response = await fetch(`${API_BASE_URL}/api/public/moving-motivators`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));

  if (response.status === 409) {
    return body as SubmitDuplicate;
  }

  if (!response.ok) {
    const message = Array.isArray(body.message) ? body.message[0] : body.message;
    throw new Error(message || 'No se pudo enviar la información. Intentá de nuevo.');
  }

  return body as SubmitSuccess;
}
