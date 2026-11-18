// No results are shown to the architect here — this is a
// facilitator-observation tool, not a self-serve personality report.
// See SPEC_MOVING_MOTIVATORS_ADDENDUM.md §2, Confirmation screen.
export function ConfirmationScreen() {
  return (
    <div className="card bg-white border border-[var(--line)] rounded-2xl p-[18px] shadow-[var(--shadow)] text-center">
      <h2 className="text-[19px] m-0 mb-2">¡Gracias!</h2>
      <p className="text-[var(--mut)]">Tu información fue enviada.</p>
    </div>
  );
}
