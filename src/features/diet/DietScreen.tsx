import { useState } from 'react'
import { dietStore } from '../../store'
import { parseDietInput, parseNLCommand } from '../../lib/ai'
import { Button, Textarea, Stat, NLPanel, Spinner } from '../../components/ui'
import { useToast } from '../../hooks/useToast'
import type { DietEntry } from '../../types'

// ── 뒤로가기 아이콘 ───────────────────────────────────────────
function IconBack() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6"/>
    </svg>
  )
}

// ── 상단 바 ───────────────────────────────────────────────────
function TopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 16px',
      background: 'var(--h-surface)',
      borderBottom: '1px solid var(--h-border)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
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
      <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--h-text-1)' }}>
        {title}
      </span>
    </div>
  )
}

// ── 섹션 카드 ─────────────────────────────────────────────────
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
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--h-text-1)' }}>
        {title}
      </span>
      {action}
    </div>
  )
}

// ── DietScreen ────────────────────────────────────────────────
interface DietScreenProps {
  date: string
  onBack: () => void
}

export function DietScreen({ date, onBack }: DietScreenProps) {
  const { show: toast } = useToast()
  const [entries, setEntries] = useState<DietEntry[]>(() => dietStore.getByDate(date))
  const [adding, setAdding]   = useState(false)
  const [input, setInput]     = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [nlLoading, setNlLoading] = useState(false)

  const reload = () => setEntries(dietStore.getByDate(date))

  const totalKcal    = entries.reduce((s, e) => s + e.kcal, 0)
  const totalCarb    = entries.reduce((s, e) => s + e.carb, 0)
  const totalProtein = entries.reduce((s, e) => s + e.protein, 0)
  const totalFat     = entries.reduce((s, e) => s + e.fat, 0)

  // 식단 추가
  const handleAdd = async () => {
    if (!input.trim()) return
    setAiLoading(true)
    try {
      const parsed = await parseDietInput(input)
      dietStore.add({ date, ...parsed })
      reload()
      setInput('')
      setAdding(false)
      toast('식단이 기록되었습니다', 'success')
    } catch {
      toast('분석 중 오류가 발생했습니다', 'error')
    } finally {
      setAiLoading(false)
    }
  }

  // 삭제
  const handleDelete = (id: string) => {
    dietStore.delete(id)
    reload()
    toast('삭제되었습니다')
  }

  // 자연어 명령
  const handleNL = async (command: string) => {
    setNlLoading(true)
    try {
      const result = await parseNLCommand(command, JSON.stringify(entries))
      const { intent } = result
      if (intent.type === 'delete' && 'targetId' in intent) {
        dietStore.delete(intent.targetId)
        reload()
        toast(result.message, 'success')
      } else if (intent.type === 'edit' && 'targetId' in intent) {
        dietStore.update(intent.targetId, intent.changes as Partial<DietEntry>)
        reload()
        toast(result.message, 'success')
      } else {
        toast(result.message, 'error')
      }
    } catch {
      toast('오류가 발생했습니다', 'error')
    } finally {
      setNlLoading(false)
    }
  }

  return (
    <div>
      <TopBar title="식단" onBack={onBack} />

      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* 기록 목록 */}
        <Section>
          <SectionHead
            title="오늘 식사 기록"
            action={
              <Button
                variant="primary"
                size="sm"
                accent="var(--h-diet)"
                onClick={() => setAdding(v => !v)}
              >
                + 추가
              </Button>
            }
          />

          {/* 입력창 */}
          {adding && (
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--h-border)' }}>
              <Textarea
                placeholder="예: 저녁 오리고기 150g, 쌈채소 한 접시"
                value={input}
                onChange={e => setInput(e.target.value)}
                hint="AI가 칼로리·영양소를 자동 분석하고 시간을 기록합니다"
                rows={2}
              />
              <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'flex-end' }}>
                <Button variant="secondary" size="sm" onClick={() => { setAdding(false); setInput('') }}>
                  취소
                </Button>
                <Button
                  variant="primary" size="sm"
                  accent="var(--h-diet)"
                  onClick={handleAdd}
                  disabled={aiLoading}
                >
                  {aiLoading ? <><Spinner size={13} /> 분석 중...</> : '저장'}
                </Button>
              </div>
            </div>
          )}

          {/* 항목 리스트 */}
          <div>
            {entries.length === 0 ? (
              <p style={{
                fontSize: 13, color: 'var(--h-text-3)',
                padding: '20px 16px', textAlign: 'center',
              }}>
                오늘 식단 기록이 없습니다
              </p>
            ) : entries.map((entry, i) => (
              <div
                key={entry.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '10px 16px',
                  borderBottom: i < entries.length - 1 ? '1px solid var(--h-border)' : 'none',
                }}
              >
                <span style={{ fontSize: 11, color: 'var(--h-text-3)', minWidth: 36, paddingTop: 2, flexShrink: 0 }}>
                  {entry.time}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--h-text-1)' }}>
                    {entry.description}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--h-text-3)', marginTop: 2 }}>
                    {entry.kcal}kcal · 탄 {entry.carb}g · 단 {entry.protein}g · 지 {entry.fat}g
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  style={{
                    fontSize: 11, padding: '3px 8px',
                    borderRadius: 5,
                    background: 'var(--h-surface-2)',
                    color: 'var(--h-text-3)',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </Section>

        {/* 영양소 요약 */}
        {totalKcal > 0 && (
          <div style={{ display: 'flex', gap: 6 }}>
            <Stat label="칼로리"   value={totalKcal}        color="var(--h-diet)" />
            <Stat label="탄수화물" value={`${totalCarb}g`}    />
            <Stat label="단백질"   value={`${totalProtein}g`} />
            <Stat label="지방"     value={`${totalFat}g`}     />
          </div>
        )}

        {/* 자연어 수정/삭제 */}
        {entries.length > 0 && (
          <NLPanel
            placeholder='"아침 연어초밥 5개 → 3개로 수정"'
            chips={['수량 변경', '항목 삭제', '시간 수정']}
            onCommand={handleNL}
            loading={nlLoading}
          />
        )}

      </div>
    </div>
  )
}