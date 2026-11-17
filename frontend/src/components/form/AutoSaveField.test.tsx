import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AutoSaveField } from './AutoSaveField';

describe('AutoSaveField + useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('flushes a pending save on unmount instead of losing the edit (regression for tab-switch data loss)', () => {
    const onSave = vi.fn();
    const { unmount } = render(
      <AutoSaveField label="Valor" initialValue="" onSave={onSave} />,
    );

    const textarea = screen.getByLabelText('Valor');
    fireEvent.change(textarea, { target: { value: 'Si logramos X' } });

    // Unmount (e.g. switching tabs in FormView) well before the 500ms
    // debounce would normally fire.
    vi.advanceTimersByTime(100);
    unmount();

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('Si logramos X');
  });

  it('does not flush on unmount if the value was never edited (only the loaded baseline)', () => {
    const onSave = vi.fn();
    const { unmount } = render(
      <AutoSaveField label="Valor" initialValue="cargado desde la API" onSave={onSave} />,
    );

    unmount();

    expect(onSave).not.toHaveBeenCalled();
  });

  it('still debounces normally when the component stays mounted', () => {
    const onSave = vi.fn();
    render(<AutoSaveField label="Valor" initialValue="" onSave={onSave} />);

    const textarea = screen.getByLabelText('Valor');
    fireEvent.change(textarea, { target: { value: 'a' } });
    vi.advanceTimersByTime(200);
    fireEvent.change(textarea, { target: { value: 'ab' } });
    vi.advanceTimersByTime(200);

    // Intermediate value 'a' should never have been saved — only the final
    // one, once 500ms pass without further edits.
    expect(onSave).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('ab');
  });
});
