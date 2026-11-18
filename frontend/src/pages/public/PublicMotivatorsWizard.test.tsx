import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PublicMotivatorsWizard } from './PublicMotivatorsWizard';
import { PUBLIC_MACRODOMAINS } from '../../constants/gemba.constants';

describe('PublicMotivatorsWizard', () => {
  it('renders Step 0 (Identificación) by default, with no authenticated-app header/nav chrome', () => {
    render(<PublicMotivatorsWizard />);

    expect(screen.getByText('Paso 0 · Identificación')).toBeInTheDocument();
    // The authenticated app's header has "Salir", "Descargar información",
    // "Cargar información" — none of that belongs on a public, login-free page.
    expect(screen.queryByText('Salir')).not.toBeInTheDocument();
    expect(screen.queryByText('Descargar información')).not.toBeInTheDocument();
    expect(screen.queryByText('Cargar información')).not.toBeInTheDocument();
  });

  it('advances to the Step 1 placeholder once Step 0 is valid and "Siguiente" is clicked', () => {
    render(<PublicMotivatorsWizard />);

    fireEvent.change(screen.getByPlaceholderText('Tu nombre completo'), {
      target: { value: 'Ana Pérez' },
    });
    fireEvent.change(screen.getByPlaceholderText('tu.correo@empresa.com'), {
      target: { value: 'ana@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Macrodominio'), {
      target: { value: PUBLIC_MACRODOMAINS[0] },
    });

    fireEvent.click(screen.getByText('Siguiente'));

    expect(screen.getByText('Paso 1 — próximamente.')).toBeInTheDocument();
    expect(screen.queryByText('Paso 0 · Identificación')).not.toBeInTheDocument();
  });
});
