import { useRef } from 'react';

/** Six separate boxes; supports paste of the whole code. */
export function OtpInput({ value, onChange, disabled }) {
  const refs = useRef([]);
  const digits = value.padEnd(6, ' ').slice(0, 6).split('');

  const setAt = (i, d) => {
    const next = digits.slice();
    next[i] = d;
    onChange(next.join('').trimEnd());
  };

  const handleChange = (i, e) => {
    const v = e.target.value.replace(/\D/g, '');
    if (!v) return;
    if (v.length > 1) {
      onChange(v.slice(0, 6));
      refs.current[Math.min(v.length, 5)]?.focus();
      return;
    }
    setAt(i, v);
    if (i < 5) refs.current[i + 1]?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[i].trim()) setAt(i, ' ');
      else if (i > 0) {
        setAt(i - 1, ' ');
        refs.current[i - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const v = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (v) {
      e.preventDefault();
      onChange(v);
      refs.current[Math.min(v.length, 5)]?.focus();
    }
  };

  return (
    <div className="flex justify-between gap-2" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={d.trim()}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={6}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          className="h-14 w-full min-w-0 rounded-xl border border-slate-300 bg-white text-center font-display text-2xl font-semibold text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
        />
      ))}
    </div>
  );
}
