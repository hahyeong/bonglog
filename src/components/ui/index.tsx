import { useState } from 'react'

// ── Button ────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  accent?: string
}

export function Button({
  children, variant = 'secondary', size = 'md', accent, style, ...props
}: ButtonProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    fontWeight: 500,
    borderRadius: 'var(--h-radius-sm)',
    fontSize: size === 'sm' ? 12 : 14,
    padding: size === 'sm' ? '5px 10px' : '9px 16px',
    lineHeight: 1,
    border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  }

  const variants: Record<string, React.CSSProperties> = {
    primary:   { background: accent ?? 'var(--h-text-1)', color: '#fff' },
    secondary: { background: 'var(--h-surface-2)', color: 'var(--h-text-2)' },
    ghost:     { background: 'transparent', color: 'var(--h-text-2)' },
    danger:    { background: '#FEE2E2', color: '#B91C1C' },
  }

  return (
    <button style={{ ...base, ...variants[variant], ...style }} {...props}>
      {children}
    </button>
  )
}

// ── Input ─────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
}

export function Input({ label, hint, style, ...props }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width: '100%' }}>
      {label && (
        <label style={{ fontSize: 12, color: 'var(--h-text-2)', fontWeight: 500 }}>
          {label}
        </label>
      )}
      <input
        style={{
          width: '100%',
          padding: '10px 12px',
          background: 'var(--h-surface-2)',
          borderRadius: 'var(--h-radius-sm)',
          fontSize: 14,
          color: 'var(--h-text-1)',
          ...style,
        }}
        {...props}
      />
      {hint && (
        <span style={{ fontSize: 11, color: 'var(--h-text-3)' }}>{hint}</span>
      )}
    </div>
  )
}

// ── Textarea ──────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
}

export function Textarea({ label, hint, style, ...props }: TextareaProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width: '100%' }}>
      {label && (
        <label style={{ fontSize: 12, color: 'var(--h-text-2)', fontWeight: 500 }}>
          {label}
        </label>
      )}
      <textarea
        rows={3}
        style={{
          width: '100%',
          padding: '10px 12px',
          background: 'var(--h-surface-2)',
          borderRadius: 'var(--h-radius-sm)',
          fontSize: 14,
          color: 'var(--h-text-1)',
          resize: 'vertical',
          lineHeight: 1.5,
          ...style,
        }}
        {...props}
      />
      {hint && (
        <span style={{ fontSize: 11, color: 'var(--h-text-3)' }}>{hint}</span>
      )}
    </div>
  )
}

// ── Stat ──────────────────────────────────────────────────────
interface StatProps {
  label: string
  value: React.ReactNode
  color?: string
}

export function Stat({ label, value, color }: StatProps) {
  return (
    <div style={{
      flex: 1,
      background: 'var(--h-surface-2)',
      borderRadius: 'var(--h-radius-sm)',
      padding: '8px 6px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 10, color: 'var(--h-text-3)', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 500, color: color ?? 'var(--h-text-1)' }}>
        {value}
      </div>
    </div>
  )
}

// ── Divider ───────────────────────────────────────────────────
export function Divider() {
  return (
    <div style={{ height: 1, background: 'var(--h-border)', margin: '4px 0' }} />
  )
}

// ── Spinner ───────────────────────────────────────────────────
export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" opacity={0.25} />
      <path d="M12 2v4" />
    </svg>
  )
}

// ── NLPanel ───────────────────────────────────────────────────
interface NLPanelProps {
  placeholder: string
  chips?: string[]
  onCommand: (text: string) => Promise<void>
  loading?: boolean
}

export function NLPanel({ placeholder, chips = [], onCommand, loading = false }: NLPanelProps) {
  const [value, setValue] = useState('')

  const handleSubmit = async () => {
    if (!value.trim() || loading) return
    await onCommand(value.trim())
    setValue('')
  }

  return (
    <div style={{
      background: 'var(--h-surface-2)',
      borderRadius: 'var(--h-radius-md)',
      padding: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <p style={{ fontSize: 11, color: 'var(--h-text-3)', fontWeight: 500 }}>
        자연어 수정 · 삭제
      </p>
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder={placeholder}
          style={{
            flex: 1,
            padding: '9px 12px',
            background: 'var(--h-surface)',
            borderRadius: 'var(--h-radius-sm)',
            fontSize: 13,
            color: 'var(--h-text-1)',
          }}
        />
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <Spinner size={13} /> : '실행'}
        </Button>
      </div>
      {chips.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {chips.map(chip => (
            <button
              key={chip}
              onClick={() => setValue(chip)}
              style={{
                fontSize: 11,
                padding: '3px 9px',
                borderRadius: 20,
                background: 'var(--h-surface)',
                border: '1px solid var(--h-border-md)',
                color: 'var(--h-text-2)',
                cursor: 'pointer',
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}