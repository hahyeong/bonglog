import { useState } from 'react'
import { suppStore } from '../../store'
import { Button, Input, NLPanel } from '../../components/ui'
import { useToast } from '../../hooks/useToast'
import type { SupplementDef } from '../../types'

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

// 체크 아이콘
function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  )
}

interface SuppScreenProps {
  date: string
  onBack: () => void
}

export function SuppScreen({ date, onBack }: SuppScreenProps) {
  const { show: toast } = useToast()
  const [defs, setDefs]     = useState<SupplementDef[]>(() => suppStore.getDefs())
  const [logs, setLogs]     = useState(() => suppStore.getLogsByDate(date))
  const [adding, setAdding] = useState(false)
  const [name, setName]     = useState('')
  const [dosage, setDosage] = useState('')
  const [timing, setTiming] = useState('')
  const [nlLoading, setNlLoading] = useState(false)

  const reload = () => {
    setDefs(suppStore.getDefs())
    setLogs(suppStore.getLogsByDate(date))
  }

  const doneCount = defs.filter(d => suppStore.isTaken(date, d.id)).length

  // 등록
  const handleAdd = () => {
    if (!name.trim() || !dosage.trim()) {
      toast('제품명과 용량을 입력해주세요', 'error')
      return
    }
    suppStore.addDef({
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: '하루 1회',
      timing: timing.trim() || undefined,
    })
    reload()
    setName('')
    setDosage('')
    setTiming('')
    setAdding(false)
    toast('영양제가 등록되었습니다', 'success')
  }

  // 복용 토글
  const handleToggle = (defId: string, defName: string) => {
    suppStore.toggleLog(date, defId)
    reload()
    const isTaken = suppStore.isTaken(date, defId)
    toast(isTaken ? `${defName} 복용 완료` : `${defName} 복용 취소`)
  }

  // 삭제
  const handleDelete = (defId: string, defName: string) => {
    suppStore.deleteDef(defId)
    reload()
    toast(`${defName}이(가) 삭제되었습니다`)
  }

  const handleNL = async (command: string) => {
    setNlLoading(true)
    try {
      if (/삭제|제거/.test(command)) {
        const target = defs.find(d => command.includes(d.name))
        if (target) {
          suppStore.deleteDef(target.id)
          reload()
          toast(`${target.name}이(가) 삭제되었습니다`, 'success')
        } else {
          toast('해당 영양제를 찾을 수 없습니다', 'error')
        }
      } else if (/수정|변경/.test(command)) {
        const target = defs.find(d => command.includes(d.name))
        const dosageMatch = command.match(/(\d+mg|\d+g|\d+ml)/)
        if (target && dosageMatch) {
          suppStore.updateDef(target.id, { dosage: dosageMatch[1] })
          reload()
          toast(`${target.name} 용량이 ${dosageMatch[1]}으로 수정되었습니다`, 'success')
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
        <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--h-text-1)' }}>영양제 / 약</span>
      </div>

      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* 오늘 복용 현황 */}
        {defs.length > 0 && (
          <Section>
            <SectionHead
              title="오늘 복용 체크"
              action={
                <span style={{ fontSize: 12, color: 'var(--h-text-3)' }}>
                  {doneCount}/{defs.length} 완료
                </span>
              }
            />
            <div>
              {defs.map((def, i) => {
                const taken = suppStore.isTaken(date, def.id)
                return (
                  <div
                    key={def.id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderBottom: i < defs.length - 1 ? '1px solid var(--h-border)' : 'none',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 500,
                        color: taken ? 'var(--h-text-3)' : 'var(--h-text-1)',
                        textDecoration: taken ? 'line-through' : 'none',
                      }}>
                        {def.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--h-text-3)', marginTop: 2 }}>
                        {def.dosage} · {def.frequency}
                        {def.timing && ` · ${def.timing}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {/* 복용 체크 버튼 */}
                      <button
                        onClick={() => handleToggle(def.id, def.name)}
                        style={{
                          width: 28, height: 28,
                          borderRadius: '50%',
                          border: `2px solid ${taken ? 'var(--h-supp)' : 'var(--h-border-md)'}`,
                          background: taken ? 'var(--h-supp)' : 'transparent',
                          color: taken ? '#fff' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          flexShrink: 0,
                        }}
                      >
                        <IconCheck />
                      </button>
                      {/* 삭제 버튼 */}
                      <button
                        onClick={() => handleDelete(def.id, def.name)}
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
                  </div>
                )
              })}
            </div>
          </Section>
        )}

        {/* 영양제 등록 */}
        <Section>
          <SectionHead
            title="영양제 / 약 등록"
            action={
              <Button
                variant="primary" size="sm"
                accent="var(--h-supp)"
                onClick={() => setAdding(v => !v)}
              >
                + 등록
              </Button>
            }
          />
          {adding && (
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Input
                label="제품명"
                placeholder="예: 비타민C"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <Input
                label="용량"
                placeholder="예: 500mg"
                value={dosage}
                onChange={e => setDosage(e.target.value)}
              />
              <Input
                label="복용 시간 (선택)"
                placeholder="예: 아침 식후, 취침 전"
                value={timing}
                onChange={e => setTiming(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <Button variant="secondary" size="sm" onClick={() => { setAdding(false); setName(''); setDosage(''); setTiming('') }}>
                  취소
                </Button>
                <Button variant="primary" size="sm" accent="var(--h-supp)" onClick={handleAdd}>
                  저장
                </Button>
              </div>
            </div>
          )}
          {!adding && defs.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--h-text-3)', padding: '20px 16px', textAlign: 'center' }}>
              등록된 영양제/약이 없습니다
            </p>
          )}
        </Section>

        {/* 자연어 수정/삭제 */}
        {defs.length > 0 && (
          <NLPanel
            placeholder='"비타민C 500mg → 1000mg으로 수정"'
            chips={['용량 수정', '영양제 삭제']}
            onCommand={handleNL}
            loading={nlLoading}
          />
        )}

      </div>
    </div>
  )
}