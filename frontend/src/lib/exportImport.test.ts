import { describe, expect, it } from 'vitest';
import { importBackupFile } from './exportImport';

function fileFrom(content: string): File {
  return new File([content], 'backup.json', { type: 'application/json' });
}

describe('importBackupFile', () => {
  it('throws a clear, actionable error for malformed JSON instead of a raw parser error', async () => {
    const file = fileFrom('esto no es json {{{');

    await expect(importBackupFile(file)).rejects.toThrow('El archivo no es un respaldo válido');
  });

  it('throws the same clear error for an empty file', async () => {
    const file = fileFrom('');

    await expect(importBackupFile(file)).rejects.toThrow('El archivo no es un respaldo válido');
  });
});
