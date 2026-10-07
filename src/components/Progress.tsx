export function ProgressBar({ value, label }: { value: number; label: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={v} aria-label={label} className="h-3 w-full overflow-hidden rounded-full bg-surface-2">
      <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${v}%` }} />
    </div>
  );
}

/** Seven dots: filled = completed, ringed = current. */
export function RoundProgress({ completed, current, total = 7, label }: { completed: number; current: number | null; total?: number; label: string }) {
  return (
    <div className="flex items-center justify-center gap-2.5" role="img" aria-label={label}>
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const done = n <= completed;
        const active = n === current;
        return (
          <span
            key={n}
            data-testid={done ? "round-done" : "round-pending"}
            className={`size-5 rounded-full border-2 ${
              done ? "border-primary bg-primary" : active ? "border-accent bg-accent-soft" : "border-line bg-surface"
            }`}
          />
        );
      })}
    </div>
  );
}

export function CircularProgress({ value, size = 120, children }: { value: number; size?: number; children?: React.ReactNode }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--uc-surface-2)" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--uc-primary)" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (v / 100) * c} />
      </svg>
      <div className="relative text-center">{children}</div>
    </div>
  );
}
