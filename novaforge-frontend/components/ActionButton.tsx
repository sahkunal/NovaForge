'use client'
import { ActionStatus } from '@/lib/hooks/useAnchorActions'

interface Props {
  label: string
  loadingLabel?: string
  successLabel?: string
  status: ActionStatus
  onClick: () => void
  variant?: 'primary' | 'teal' | 'ghost' | 'danger'
  disabled?: boolean
  className?: string
}

export default function ActionButton({ label, loadingLabel, successLabel, status, onClick, variant = 'primary', disabled, className = '' }: Props) {
  const isLoading = status === 'pending'
  const isSuccess = status === 'success'
  const isError = status === 'error'

  const base = variant === 'teal' ? 'btn-teal' : variant === 'ghost' ? 'btn-ghost' : variant === 'danger'
    ? 'btn-primary' : 'btn-primary'

  const style = variant === 'danger'
    ? { background:'linear-gradient(135deg,#991b1b,#7f1d1d)', borderColor:'rgba(239,68,68,0.4)' }
    : isSuccess ? { background:'linear-gradient(135deg,#15803d,#14532d)', borderColor:'rgba(74,222,128,0.4)' }
    : isError ? { background:'linear-gradient(135deg,#991b1b,#7f1d1d)', borderColor:'rgba(239,68,68,0.4)' }
    : {}

  return (
    <button onClick={onClick} disabled={disabled || isLoading}
      className={`${base} w-full flex items-center justify-center gap-2 ${disabled || isLoading ? 'btn-disabled' : ''} ${className}`}
      style={style}>
      {isLoading && (
        <svg className="animate-spin" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20" strokeDashoffset="10"/>
        </svg>
      )}
      {isLoading ? (loadingLabel || 'Processing...') : isSuccess ? (successLabel || '✓ Done!') : isError ? '✕ Failed' : label}
    </button>
  )
}
