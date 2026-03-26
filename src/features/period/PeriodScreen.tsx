import { useState } from 'react'
import { periodStore } from '../../store'
import { NLPanel } from '../../components/ui'
import { useToast } from '../../hooks/useToast'

function IconBack() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6"/>
    </svg>
  )
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--h-surface)',
      borderRadius: 'var(--h-radius-lg)',
      boxShadow: 'var(--h-shadow-sm)',
      border: '1px solid var(--h-border)',
      overflow: 'hidden',
    }}>
      {children}
    </div>
  )
}

function SectionHead({ title }: { title: string }) {
  return (
    <div style={{
      padding: '12px 16px',
      borderBottom: '1px solid var(--h-border)',
    }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--h-text-1)' }}>{title}</span>
    </div>
  )
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

// 해당 월의 날짜 배열 생성
function getDaysInMonth(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month - 1, 1).getDay()
  const totalDays = new Date(year, month, 0).getDate()
  const days: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= totalDays; d++) days.push(d)
  return days
}

// 생리 주기 기반 예측 (단순 28일 주기 기준)
function predictNext(markedDates: string[]): { nextPeriod: string; ovulation: string } | null {
  if (markedDates.length < 2) return null
  const sorted = [...markedDates].sort()
  const last = new Date(sorted[sorted.length - 1] + 'T00:00:00')
  const nextPeriod = new Date(last)
  nextPeriod.setDate(last.getDate() + 28)
  const ovulation = new Date(nextPeriod)
  ovulation.setDate(nextPeriod.getDate() - 14)
  return {
    nextPeriod: nextPeriod.toISOString().slice(0, 10),
    ovulation:  ovulation.toISOString().slice(0, 10),
  }
}

interface PeriodScreenProps {
  date: string
  onBack: () => void
}

export function PeriodScreen({ date, onBack }: PeriodScreenProps) {
  const { show: toast } = useToast()
  const today = new Date(date + 'T00:00:00')

  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [marked, setMarked] = useState<string[]>(() =>
    periodStore.getByMonth(year, month).map(e => e.date)
  )
  const [nlLoading, setNlLoading] = useState(false)

  const reload = (y = year, m = month) => {
    setMarked(periodStore.getByMonth(y, m).map(e => e.date))
  }

  const changeMonth = (delta: number) => {
    let newMonth = month + delta
    let newYear  = year
    if (newMonth > 12) { newMonth = 1;  newYear++ }
    if (newMonth < 1)  { newMonth = 12; newYear-- }
    setYear(newYear)
    setMonth(newMonth)
    reload(newYear, newMonth)
  }

  const handleDayClick = (day: number) => {
    const d = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    periodStore.toggle(d)
    reload()
    toast(periodStore.isMarked(d) ? '생리가 기록되었습니다' : '생리 기록이 삭제되었습니다')
  }

  const allMarked = periodStore.getByMonth(year, month).map(e => e.date)
  const prediction = predictNext(allMarked)
  const days = getDaysInMonth(year, month)

  const handleNL = async (command: string) => {
    setNlLoading(true)
    try {
      const dateMatch = command.match(/(\d{1,2})월\s*(\d{1,2})일/)
      if (dateMatch) {
        const m = parseInt(dateMatch[1])
        const d = parseInt(dateMatch[2])
        const targetDate = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        if (/삭제|지워|제거/.test(command)) {
          if (periodStore.isMarked(targetDate)) {
            periodStore.toggle(targetDate)
            reload()
            toast(`${m}월 ${d}일 기록이 삭제되었습니다`, 'success')
          } else {
            toast('해당 날짜에 기록이 없습니다', 'error')
          }
        } else if (/기록|추가|시작/.test(command)) {
          if (!periodStore.isMarked(targetDate)) {
            periodStore.toggle(targetDate)
            reload()
            toast(`${m}월 ${d}일 생리가 기록되었습니다`, 'success')
          } else {
            toast('이미 기록된 날짜입니다', 'error')
          }
        } else {
          toast('명령을 이해하지 못했습니다', 'error')
        }
      } else {
        toast('날짜를 인식하지 못했습니다. 예: "3월 24일 삭제"', 'error')
      }
    } catch {
      toast('오류가 발생했습니다', 'error')
    } finally {
      setNlLoading(false)
    }
  }

  return (
    <div>
      {/* 상단 바 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px',
        background: 'var(--h-surface)',
        borderBottom: '1px solid var(--h-border)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 13, color: 'var(--h-text-2)',
            padding: '6px 10px',
            borderRadius: 'var(--h-radius-sm)',
            background: 'var(--h-surface-2)',
          }}
        >
          <IconBack /> 뒤로
        </button>
        <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--h-text-1)' }}>생리</span>
      </div>

      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* 캘린더 */}
        <Section>
          {/* 월 네비게이션 */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--h-border)',
          }}>
            <button
              onClick={() => changeMonth(-1)}
              style={{
                width: 32, height: 32, borderRadius: 'var(--h-radius-sm)',
                background: 'var(--h-surface-2)', color: 'var(--h-text-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
            <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--h-text-1)' }}>
              {year}년 {month}월
            </span>
            <button
              onClick={() => changeMonth(1)}
              style={{
                width: 32, height: 32, borderRadius: 'var(--h-radius-sm)',
                background: 'var(--h-surface-2)', color: 'var(--h-text-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          </div>

          <div style={{ padding: '12px 16px 16px' }}>
            {/* 요일 헤더 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
              {DAYS.map(d => (
                <div key={d} style={{
                  textAlign: 'center', fontSize: 11,
                  fontWeight: 500, color: 'var(--h-text-3)',
                  padding: '4px 0',
                }}>
                  {d}
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {days.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const isPeriod   = periodStore.isMarked(dateStr)
                const isToday    = dateStr === date
                const isNextPeriod  = prediction?.nextPeriod === dateStr
                const isOvulation   = prediction?.ovulation === dateStr

                return (
                  <button
                    key={day}
                    onClick={() => handleDayClick(day)}
                    style={{
                      aspectRatio: '1',
                      borderRadius: 'var(--h-radius-sm)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: isToday ? 600 : 400,
                      border: isToday ? `2px solid var(--h-period)` : 'none',
                      background: isPeriod
                        ? 'var(--h-period)'
                        : isNextPeriod
                        ? 'var(--h-fast-bg)'
                        : isOvulation
                        ? 'var(--h-diet-bg)'
                        : 'transparent',
                      color: isPeriod
                        ? '#fff'
                        : isNextPeriod
                        ? 'var(--h-fast)'
                        : isOvulation
                        ? 'var(--h-diet)'
                        : isToday
                        ? 'var(--h-period)'
                        : 'var(--h-text-1)',
                      cursor: 'pointer',
                    }}
                  >
                    {day}
                  </button>
                )
              })}
            </div>

            {/* 범례 */}
            <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
              {[
                { color: 'var(--h-period)', label: '생리' },
                { color: 'var(--h-fast)',   label: '예측 생리일' },
                { color: 'var(--h-diet)',   label: '배란 예측일' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: item.color,
                  }} />
                  <span style={{ fontSize: 11, color: 'var(--h-text-3)' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* 예측 정보 */}
        {prediction && (
          <Section>
            <SectionHead title="다음 주기 예측" />
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: '다음 생리 예측일', value: prediction.nextPeriod, color: 'var(--h-period)' },
                { label: '배란 예측일',      value: prediction.ovulation,  color: 'var(--h-diet)'   },
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px',
                  background: 'var(--h-surface-2)',
                  borderRadius: 'var(--h-radius-sm)',
                }}>
                  <span style={{ fontSize: 13, color: 'var(--h-text-2)' }}>{item.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: item.color }}>
                    {new Date(item.value + 'T00:00:00').toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                  </span>
                </div>
              ))}
              <p style={{ fontSize: 11, color: 'var(--h-text-3)' }}>
                * 28일 주기 기준 예측입니다. 실제와 다를 수 있습니다.
              </p>
            </div>
          </Section>
        )}

        {/* 자연어 수정/삭제 */}
        <NLPanel
          placeholder='"3월 24일 생리 기록 삭제"'
          chips={['날짜 기록 추가', '날짜 기록 삭제']}
          onCommand={handleNL}
          loading={nlLoading}
        />

      </div>
    </div>
  )
}