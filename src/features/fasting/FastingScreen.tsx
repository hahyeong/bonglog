import { useState, useEffect, useRef } from 'react'
import { fastingStore } from '../../store'
import { Button, NLPanel } from '../../components/ui'
import { useToast } from '../../hooks/useToast'
import type { FastingSession } from '../../types'

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

// 시간 문자열 → 분 변환
function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

// 분 → "H시간 M분" 포맷
function formatRemain(min: number): string {
  if (min <= 0) return '종료'
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}분`
  if (m === 0) return `${h}시간`
  return `${h}시간 ${m}분`
}

// 현재 시각 "HH:MM"
function nowTime(): string {
  return new Date().toTimeString().slice(0, 5)
}

interface FastingScreenProps {
  date: string
  onBack: () => void
}

export function FastingScreen({ date, onBack }: FastingScreenProps) {
  const { show: toast } = useToast()
  const [session, setSession] = useState<FastingSession | undefined>(
    () => fastingStore.getByDate(date)
  )
  const [startTime, setStartTime] = useState(nowTime)
  const [endTime, setEndTime]     = useState(() => {
    const d = new Date()
    d.setHours(d.getHours() + 16)
    return d.toTimeString().slice(0, 5)
  })
  const [remain, setRemain] = useState(0)
  const [nlLoading, setNlLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const reload = () => setSession(fastingStore.getByDate(date))

  // 남은 시간 계산 타이머
  useEffect(() => {
    const calc = () => {
      if (!session?.active) { setRemain(0); return }
      const now  = timeToMin(nowTime())
      const end  = timeToMin(session.endTime)
      setRemain(Math.max(end - now, 0))
    }
    calc()
    timerRef.current = setInterval(calc, 30000) // 30초마다 갱신
    return () => clearInterval(timerRef.current)
  }, [session])

  // 단식 시작
  const handleStart = () => {
    const s = fastingStore.start(date, startTime, endTime)
    setSession(s)
    toast('단식이 시작되었습니다', 'success')
  }

  // 단식 종료
  const handleStop = () => {
    if (!session) return
    fastingStore.stop(session.id)
    reload()
    toast('단식이 종료되었습니다')
  }

  // 단식 삭제
  const handleDelete = () => {
    if (!session) return
    fastingStore.delete(session.id)
    reload()
    toast('단식 기록이 삭제되었습니다')
  }

  // 시간 수정 저장
  const handleTimeUpdate = () => {
    if (!session) return
    fastingStore.save({ ...session, startTime, endTime })
    reload()
    toast('시간이 수정되었습니다', 'success')
  }

  const handleNL = async (command: string) => {
    setNlLoading(true)
    try {
      const timeMatch = command.match(/(\d{1,2}):(\d{2})/)
      if (timeMatch && session) {
        const newTime = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`
        if (/종료|끝|마감/.test(command)) {
          fastingStore.save({ ...session, endTime: newTime })
        } else if (/시작|개시/.test(command)) {
          fastingStore.save({ ...session, startTime: newTime })
        }
        reload()
        toast('시간이 수정되었습니다', 'success')
      } else if (/삭제|취소|제거/.test(command)) {
        handleDelete()
      } else {
        toast('명령을 이해하지 못했습니다', 'error')
      }
    } catch {
      toast('오류가 발생했습니다', 'error')
    } finally {
      setNlLoading(false)
    }
  }

  // 진행률 계산
  const progressPct = (() => {
    if (!session) return 0
    const total = timeToMin(session.endTime) - timeToMin(session.startTime)
    const elapsed = total - remain
    return Math.min(Math.max(Math.round((elapsed / total) * 100), 0), 100)
  })()

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
        <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--h-text-1)' }}>단식</span>
      </div>

      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* 상태 카드 */}
        <Section>
          <div style={{ padding: 20 }}>
            {session ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* 상태 표시 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: session.active ? 'var(--h-diet)' : 'var(--h-text-3)',
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--h-text-1)' }}>
                    {session.active ? '단식 진행 중' : '단식 완료'}
                  </span>
                </div>

                {/* 남은 시간 */}
                {session.active && (
                  <div>
                    <div style={{ fontSize: 42, fontWeight: 600, color: 'var(--h-fast)', lineHeight: 1 }}>
                      {formatRemain(remain)}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--h-text-3)', marginTop: 4 }}>
                      남은 시간
                    </div>
                  </div>
                )}

                {/* 프로그레스 바 */}
                <div>
                  <div style={{
                    height: 8, background: 'var(--h-surface-2)',
                    borderRadius: 4, overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', width: `${progressPct}%`,
                      background: 'var(--h-fast)',
                      borderRadius: 4,
                      transition: 'width 0.4s',
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--h-text-3)' }}>
                      {session.startTime} 시작
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--h-text-3)' }}>
                      {session.endTime} 종료 예정
                    </span>
                  </div>
                </div>

                {/* 버튼 */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {session.active && (
                    <Button
                      variant="primary"
                      accent="var(--h-fast)"
                      onClick={handleStop}
                      style={{ flex: 1 }}
                    >
                      단식 종료
                    </Button>
                  )}
                  <Button variant="danger" onClick={handleDelete} style={{ flex: 1 }}>
                    기록 삭제
                  </Button>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--h-text-3)', textAlign: 'center', padding: '8px 0' }}>
                오늘 단식 기록이 없습니다
              </p>
            )}
          </div>
        </Section>

        {/* 시간 설정 */}
        <Section>
          <SectionHead title={session ? '시간 수정' : '단식 시작'} />
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--h-text-3)', marginBottom: 5 }}>시작 시간</div>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px',
                    background: 'var(--h-surface-2)',
                    borderRadius: 'var(--h-radius-sm)',
                    fontSize: 14, color: 'var(--h-text-1)',
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--h-text-3)', marginBottom: 5 }}>종료 시간</div>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px',
                    background: 'var(--h-surface-2)',
                    borderRadius: 'var(--h-radius-sm)',
                    fontSize: 14, color: 'var(--h-text-1)',
                  }}
                />
              </div>
            </div>
            <Button
              variant="primary"
              accent="var(--h-fast)"
              onClick={session ? handleTimeUpdate : handleStart}
            >
              {session ? '시간 저장' : '단식 시작'}
            </Button>
          </div>
        </Section>

        {/* 자연어 수정/삭제 */}
        {session && (
          <NLPanel
            placeholder='"단식 종료 시간 15:00으로 변경"'
            chips={['종료 시간 변경', '시작 시간 변경', '단식 취소']}
            onCommand={handleNL}
            loading={nlLoading}
          />
        )}

      </div>
    </div>
  )
}