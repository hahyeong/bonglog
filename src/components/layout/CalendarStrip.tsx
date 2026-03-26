import { useRef, useEffect, useMemo } from 'react'
import { formatDate } from '../../store'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

interface CalendarStripProps {
  selectedDate: string     // "YYYY-MM-DD"
  onSelect: (date: string) => void
  markedDates?: string[]   // 기록 있는 날짜
}

export function CalendarStrip({
  selectedDate,
  onSelect,
  markedDates = [],
}: CalendarStripProps) {
  const today = new Date()
  const todayStr = formatDate(today)
  const scrollRef = useRef<HTMLDivElement>(null)

  const dates = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - 10 + i)
      return d
    })
  }, [])

  // 오늘 날짜로 스크롤
  useEffect(() => {
    const el = scrollRef.current?.querySelector('[data-today="true"]') as HTMLElement | null
    el?.scrollIntoView({ inline: 'center', behavior: 'smooth' })
  }, [])

  return (
    <div
      ref={scrollRef}
      style={{
        display: 'flex',
        gap: 3,
        overflowX: 'auto',
        padding: '0 16px 12px',
        scrollbarWidth: 'none',
      }}
    >
      {dates.map(date => {
        const str = formatDate(date)
        const isToday    = str === todayStr
        const isSelected = str === selectedDate
        const hasData    = markedDates.includes(str)

        return (
          <button
            key={str}
            data-today={isToday}
            onClick={() => onSelect(str)}
            style={{
              flexShrink: 0,
              width: 42,
              height: 56,
              borderRadius: 'var(--h-radius-md)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.15s',
              background: isSelected
                ? 'var(--h-text-1)'
                : isToday
                ? 'var(--h-surface-3)'
                : 'transparent',
            }}
          >
            {/* 요일 */}
            <span style={{
              fontSize: 10,
              fontWeight: 500,
              color: isSelected
                ? 'rgba(255,255,255,0.5)'
                : 'var(--h-text-3)',
            }}>
              {DAYS[date.getDay()]}
            </span>

            {/* 날짜 */}
            <span style={{
              fontSize: 15,
              fontWeight: isSelected || isToday ? 600 : 400,
              color: isSelected
                ? '#FFFFFF'
                : isToday
                ? 'var(--h-text-1)'
                : 'var(--h-text-2)',
            }}>
              {date.getDate()}
            </span>

            {/* 기록 dot */}
            <div style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: hasData
                ? isSelected
                  ? 'rgba(255,255,255,0.5)'
                  : 'var(--h-diet)'
                : 'transparent',
            }} />
          </button>
        )
      })}
    </div>
  )
}