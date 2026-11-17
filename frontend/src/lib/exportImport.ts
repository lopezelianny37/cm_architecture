import { apiClient } from './apiClient';

interface BackupShape {
  target?: number;
  records: unknown[];
}

function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function exportAllRecords(): Promise<void> {
  const backup = await apiClient.get<BackupShape>('/api/export');
  downloadJson(`respaldo_gemba_arquitectura_ib_${todayStamp()}.json`, backup);
}

export async function exportOneRecord(recordId: string): Promise<void> {
  const record = await apiClient.get<unknown>(`/api/records/${recordId}/export`);
  // Wrapped in { records: [...] } so any exported file — whole backup or a
  // single record — can be fed back into the same import flow.
  downloadJson(`respaldo_gemba_${recordId}_${todayStamp()}.json`, { records: [record] });
}

export async function importBackupFile(file: File): Promise<{ imported: number }> {
  const text = await file.text();
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('El archivo no es un respaldo válido');
  }

  return apiClient.post<{ imported: number }>('/api/import', parsed);
}
