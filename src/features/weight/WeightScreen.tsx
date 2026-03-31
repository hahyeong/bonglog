import { useState } from 'react'
import { weightStore } from '../../store'
import { Button, Input, Stat, NLPanel } from '../../components/ui'
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

function SectionHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px',
      borderBottom: '1px solid var(--h-border)',
    }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--h-text-1)' }}>{title}</span>
      {action}
    </div>
  )
}

interface WeightScreenProps {
  date: string
  onBack: () => void
}

export function WeightScreen({ date, onBack }: WeightScreenProps) {
  const { show: toast } = useToast()
  const [entry, setEntry]     = useState(() => weightStore.getByDate(date))
  const [last7, setLast7]     = useState(() => weightStore.getLast7())
  const [input, setInput]     = useState('')
  const [adding, setAdding]   = useState(false)
  const [nlLoading, setNlLoading] = useState(false)

  const reload = () => {
    setEntry(weightStore.getByDate(date))
    setLast7(weightStore.getLast7())
  }

  // 어제 체중
  const yesterday = (() => {
    const d = new Date(date + 'T00:00:00')
    d.setDate(d.getDate() - 1)
    const yStr = d.toISOString().slice(0, 10)
    return weightStore.getByDate(yStr)
  })()

  const diff = entry && yesterday
    ? Math.round((entry.kg - yesterday.kg) * 10) / 10
    : null

  const handleSave = () => {
    const kg = parseFloat(input)
    if (isNaN(kg) || kg <= 0) { toast('올바른 체중을 입력해주세요', 'error'); return }
    weightStore.set(date, kg)
    reload()
    setInput('')
    setAdding(false)
    toast('체중이 기록되었습니다', 'success')
  }

  const handleDelete = () => {
    weightStore.delete(date)
    reload()
    toast('삭제되었습니다')
  }

  const handleNL = async (command: string) => {
    setNlLoading(true)
    try {
      const kg = parseFloat(command.match(/[\d.]+/)?.[0] ?? '')
      if (!isNaN(kg) && kg > 0) {
        weightStore.set(date, kg)
        reload()
        toast(`체중이 ${kg}kg으로 수정되었습니다`, 'success')
      } else if (/삭제|지워|제거/.test(command)) {
        weightStore.delete(date)
        reload()
        toast('체중 기록이 삭제되었습니다', 'success')
      } else {
        toast('명령을 이해하지 못했습니다', 'error')
      }
    } catch {
      toast('오류가 발생했습니다', 'error')
    } finally {
      setNlLoading(false)
    }
  }

  // 바 차트 데이터
  const chartData = last7
  const minKg = chartData.length > 0 ? Math.min(...chartData.map(e => e.kg)) : 0
  const maxKg = chartData.length > 0 ? Math.max(...chartData.map(e => e.kg)) : 0
  const range = maxKg - minKg || 0.5

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
        <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--h-text-1)' }}>체중</span>
      </div>

      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* 오늘 기록 */}
        <Section>
          <SectionHead
            title="오늘 체중"
            action={
              entry
                ? <Button variant="danger" size="sm" onClick={handleDelete}>삭제</Button>
                : <Button variant="primary" size="sm" accent="var(--h-weight)" onClick={() => setAdding(v => !v)}>+ 기록</Button>
            }
          />
          <div style={{ padding: '16px' }}>
            {entry ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 48, fontWeight: 600, color: 'var(--h-text-1)', lineHeight: 1 }}>
                    {entry.kg}
                  </span>
                  <span style={{ fontSize: 16, color: 'var(--h-text-3)' }}>kg</span>
                  {diff !== null && (
                    <span style={{
                      fontSize: 13, fontWeight: 500,
                      padding: '2px 8px', borderRadius: 20,
                      background: diff <= 0 ? '#EAF4EE' : '#FAECF2',
                      color: diff <= 0 ? 'var(--h-diet)' : 'var(--h-period)',
                      marginLeft: 4,
                    }}>
                      {diff > 0 ? '+' : ''}{diff}kg
                    </span>
                  )}
                </div>
                {yesterday && (
                  <p style={{ fontSize: 12, color: 'var(--h-text-3)', marginTop: 6 }}>
                    어제 {yesterday.kg}kg 대비 {diff === 0 ? '변화 없음' : diff! > 0 ? '증가' : '감소'}
                  </p>
                )}
              </div>
            ) : adding ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Input
                  placeholder="예: 72.4"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                  hint="kg 단위로 입력하세요"
                  type="number"
                  step="0.1"
                />
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <Button variant="secondary" size="sm" onClick={() => { setAdding(false); setInput('') }}>취소</Button>
                  <Button variant="primary" size="sm" accent="var(--h-weight)" onClick={handleSave}>저장</Button>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--h-text-3)', textAlign: 'center', padding: '8px 0' }}>
                오늘 체중 기록이 없습니다
              </p>
            )}
          </div>
        </Section>

        {/* 최근 7일 차트 */}
        {chartData.length > 0 && (
          <Section>
            <SectionHead title="최근 7일" />
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
                {chartData.map((w, _i) => {
                  const barH = Math.round(((w.kg - minKg) / range) * 50 + 12)
                  const isToday = w.date === date
                  const d = new Date(w.date + 'T00:00:00')
                  const dayLabel = ['일','월','화','수','목','금','토'][d.getDay()]
                  return (
                    <div key={w.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 10, color: isToday ? 'var(--h-weight)' : 'var(--h-text-3)' }}>
                        {w.kg}
                      </span>
                      <div style={{
                        width: '100%', height: barH,
                        background: isToday ? 'var(--h-weight)' : 'var(--h-weight-bg)',
                        borderRadius: '3px 3px 0 0',
                      }} />
                      <span style={{ fontSize: 10, fontWeight: isToday ? 600 : 400, color: isToday ? 'var(--h-weight)' : 'var(--h-text-3)' }}>
                        {isToday ? '오늘' : dayLabel}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </Section>
        )}

        {/* 요약 */}
        {chartData.length > 0 && (
          <div style={{ display: 'flex', gap: 6 }}>
            <Stat label="최저" value={`${minKg}kg`} />
            <Stat label="최고" value={`${maxKg}kg`} />
            <Stat label="평균" value={`${Math.round(chartData.reduce((s, e) => s + e.kg, 0) / chartData.length * 10) / 10}kg`} color="var(--h-weight)" />
          </div>
        )}

        {/* 자연어 수정/삭제 */}
        {entry && (
          <NLPanel
            placeholder='"오늘 체중 72.0kg으로 수정"'
            chips={['체중 수정', '체중 삭제']}
            onCommand={handleNL}
            loading={nlLoading}
          />
        )}

      </div>
    </div>
  )
}