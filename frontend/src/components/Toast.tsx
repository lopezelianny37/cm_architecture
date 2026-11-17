interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  return (
    <div
      className="fixed right-[18px] bottom-[18px] bg-[var(--navy)] text-white px-[14px] py-[10px] rounded-lg z-[80] transition-all"
      style={{
        opacity: message ? 1 : 0,
        transform: message ? 'none' : 'translateY(8px)',
      }}
      aria-live="polite"
    >
      {message}
    </div>
  );
}
