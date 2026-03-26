import { useState } from 'react'
import { waterStore } from '../../store'
import { Button, Input, NLPanel } from '../../components/ui'
import { useToast } from '../../hooks/useToast'
import type { WaterEntry } from '../../types'

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

const QUICK_ML = [100, 200, 300, 400, 500]
const GOAL_ML  = 2000

interface WaterScreenProps {
  date: string
  onBack: () => void
}

export function WaterScreen({ date, onBack }: WaterScreenProps) {
  const { show: toast } = useToast()
  const [entries, setEntries] = useState<WaterEntry[]>(() => waterStore.getByDate(date))
  const [custom, setCustom]   = useState('')
  const [nlLoading, setNlLoading] = useState(false)

  const reload = () => setEntries(waterStore.getByDate(date))
  const total  = entries.reduce((s, e) => s + e.ml, 0)
  const pct    = Math.min(Math.round((total / GOAL_ML) * 100), 100)

  const addWater = (ml: number) => {
    const time = new Date().toTimeString().slice(0, 5)
    waterStore.add({ date, time, ml })
    reload()
    toast(`${ml}ml 추가됨 · 총 ${total + ml}ml`, 'success')
  }

  const handleCustom = () => {
    const ml = parseInt(custom)
    if (isNaN(ml) || ml <= 0) { toast('올바른 용량을 입력해주세요', 'error'); return }
    addWater(ml)
    setCustom('')
  }

  const handleDelete = (id: string, ml: number) => {
    waterStore.delete(id)
    reload()
    toast(`${ml}ml 삭제되었습니다`)
  }

  const handleNL = async (command: string) => {
    setNlLoading(true)
    try {
      const mlMatch = command.match(/(\d+)\s*ml/)
      const ml = mlMatch ? parseInt(mlMatch[1]) : null

      if (/삭제|지워|제거/.test(command) && ml) {
        const target = [...entries].reverse().find(e => e.ml === ml)
        if (target) {
          waterStore.delete(target.id)
          reload()
          toast(`${ml}ml 삭제되었습니다`, 'success')
        } else {
          toast(`${ml}ml 기록을 찾을 수 없습니다`, 'error')
        }
      } else if (/수정|변경|바꿔|→/.test(command)) {
        const nums = command.match(/(\d+)\s*ml.*?(\d+)\s*ml/)
        if (nums) {
          const from = parseInt(nums[1])
          const to   = parseInt(nums[2])
          const target = [...entries].reverse().find(e => e.ml === from)
          if (target) {
            waterStore.delete(target.id)
            const time = new Date().toTimeString().slice(0, 5)
            waterStore.add({ date, time, ml: to })
            reload()
            toast(`${from}ml → ${to}ml 수정되었습니다`, 'success')
          } else {
            toast(`${from}ml 기록을 찾을 수 없습니다`, 'error')
          }
        } else {
          toast('명령을 이해하지 못했습니다', 'error')
        }
      } else {
        toast('명령을 이해하지 못했습니다', 'error')
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
        <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--h-text-1)' }}>음수량</span>
      </div>

      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* 오늘 총량 + 프로그레스 */}
        <Section>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
              <span style={{ fontSize: 48, fontWeight: 600, color: 'var(--h-water)', lineHeight: 1 }}>
                {total}
              </span>
              <span style={{ fontSize: 16, color: 'var(--h-text-3)' }}>ml</span>
              <span style={{ fontSize: 13, color: 'var(--h-text-3)', marginLeft: 4 }}>
                / 목표 {GOAL_ML}ml
              </span>
            </div>
            {/* 프로그레스 바 */}
            <div style={{
              height: 8, background: 'var(--h-surface-2)',
              borderRadius: 4, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${pct}%`,
                background: 'var(--h-water)',
                borderRadius: 4,
                transition: 'width 0.4s',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--h-text-3)' }}>{pct}% 달성</span>
              <span style={{ fontSize: 12, color: 'var(--h-text-3)' }}>
                {Math.max(GOAL_ML - total, 0)}ml 남음
              </span>
            </div>
          </div>
        </Section>

        {/* 빠른 추가 */}
        <Section>
          <SectionHead title="빠른 추가" />
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {QUICK_ML.map(ml => (
                <button
                  key={ml}
                  onClick={() => addWater(ml)}
                  style={{
                    fontSize: 13, fontWeight: 500,
                    padding: '8px 14px',
                    borderRadius: 'var(--h-radius-sm)',
                    background: 'var(--h-water-bg)',
                    color: 'var(--h-water)',
                    border: 'none', cursor: 'pointer',
                    transition: 'opacity 0.15s',
                  }}
                >
                  {ml}ml
                </button>
              ))}
            </div>
            {/* 직접 입력 */}
            <div style={{ display: 'flex', gap: 6 }}>
              <Input
                placeholder="직접 입력 (ml)"
                value={custom}
                onChange={e => setCustom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCustom()}
                type="number"
                style={{ flex: 1 }}
              />
              <Button
                variant="primary"
                size="sm"
                accent="var(--h-water)"
                onClick={handleCustom}
              >
                추가
              </Button>
            </div>
          </div>
        </Section>

        {/* 기록 목록 */}
        {entries.length > 0 && (
          <Section>
            <SectionHead title="오늘 기록" />
            <div>
              {entries.map((entry, i) => (
                <div
                  key={entry.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 16px',
                    borderBottom: i < entries.length - 1 ? '1px solid var(--h-border)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, color: 'var(--h-text-3)', minWidth: 36 }}>
                      {entry.time}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--h-text-1)' }}>
                      {entry.ml}ml
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id, entry.ml)}
                    style={{
                      fontSize: 11, padding: '3px 8px',
                      borderRadius: 5,
                      background: 'var(--h-surface-2)',
                      color: 'var(--h-text-3)',
                      cursor: 'pointer',
                    }}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 자연어 수정/삭제 */}
        {entries.length > 0 && (
          <NLPanel
            placeholder='"200ml 삭제" 또는 "300ml → 400ml로 수정"'
            chips={['200ml 삭제', '300ml → 400ml 수정', '전체 삭제']}
            onCommand={handleNL}
            loading={nlLoading}
          />
        )}

      </div>
    </div>
  )
}