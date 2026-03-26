import { dietStore, exerciseStore, weightStore, waterStore, fastingStore, suppStore, periodStore } from '../../store'

type Feature = 'diet' | 'exercise' | 'weight' | 'water' | 'fast' | 'period' | 'supp'

// ── SVG 아이콘 ────────────────────────────────────────────────
function IconFork() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
    </svg>
  )
}
function IconRun() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13" cy="4" r="1"/><path d="M7 21l4-4-1-5 4 2 2-5"/><path d="M4 16l4-1 2 3"/><path d="M15 9l2 3 4-1"/>
    </svg>
  )
}
function IconScale() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v1"/><path d="M3 9h18"/><path d="M6 9a6 6 0 0 1 12 0"/><rect x="5" y="9" width="14" height="11" rx="2"/><path d="M9 13h6"/>
    </svg>
  )
}
function IconDroplet() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7z"/>
    </svg>
  )
}
function IconTimer() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M9 2h6"/><path d="M12 2v3"/>
    </svg>
  )
}
function IconFlower() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V3"/><circle cx="12" cy="12" r="3"/><path d="m8 16 1.5-1.5"/><path d="M12 17v4"/><path d="m16 16-1.5-1.5"/>
    </svg>
  )
}
function IconPill() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>
    </svg>
  )
}
function IconChevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  )
}

// ── 카드 공통 스타일 ──────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  background: 'var(--h-surface)',
  borderRadius: 'var(--h-radius-lg)',
  boxShadow: 'var(--h-shadow-sm)',
  border: '1px solid var(--h-border)',
  cursor: 'pointer',
  textAlign: 'left',
  width: '100%',
}

// ── 아이콘 박스 ───────────────────────────────────────────────
function IconBox({ icon, bg, color }: { icon: React.ReactNode; bg: string; color: string }) {
  return (
    <div style={{
      width: 30, height: 30,
      borderRadius: 'var(--h-radius-sm)',
      background: bg,
      color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {icon}
    </div>
  )
}

// ── 와이드 카드 (식단) ────────────────────────────────────────
function DietCard({ date, onClick }: { date: string; onClick: () => void }) {
  const entries = dietStore.getByDate(date)
  const totalKcal    = entries.reduce((s, e) => s + e.kcal, 0)
  const totalCarb    = entries.reduce((s, e) => s + e.carb, 0)
  const totalProtein = entries.reduce((s, e) => s + e.protein, 0)
  const totalFat     = entries.reduce((s, e) => s + e.fat, 0)

  return (
    <button onClick={onClick} style={{ ...cardStyle, padding: 16 }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconBox icon={<IconFork />} bg="var(--h-diet-bg)" color="var(--h-diet)" />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--h-text-2)' }}>식단</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {totalKcal > 0 && (
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--h-diet)' }}>
              {totalKcal} kcal
            </span>
          )}
          <span style={{ color: 'var(--h-text-3)' }}><IconChevron /></span>
        </div>
      </div>

      {/* 식사 태그 */}
      {entries.length > 0 ? (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
          {entries.slice(0, 3).map(e => (
            <span key={e.id} style={{
              fontSize: 11, padding: '3px 8px',
              borderRadius: 'var(--h-radius-sm)',
              background: 'var(--h-surface-2)',
              color: 'var(--h-text-2)',
            }}>
              {e.time} {e.description}
            </span>
          ))}
          {entries.length > 3 && (
            <span style={{
              fontSize: 11, padding: '3px 8px',
              borderRadius: 'var(--h-radius-sm)',
              background: 'var(--h-surface-2)',
              color: 'var(--h-text-3)',
            }}>
              +{entries.length - 3}개
            </span>
          )}
        </div>
      ) : (
        <p style={{ fontSize: 13, color: 'var(--h-text-3)', marginBottom: 10 }}>
          오늘 식단 기록이 없습니다
        </p>
      )}

      {/* 영양소 요약 */}
      {totalKcal > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {[
            { label: '탄수화물', value: `${totalCarb}g` },
            { label: '단백질',   value: `${totalProtein}g` },
            { label: '지방',     value: `${totalFat}g` },
            { label: '칼로리',   value: `${totalKcal}`, color: 'var(--h-diet)' },
          ].map(item => (
            <div key={item.label} style={{
              background: 'var(--h-surface-2)',
              borderRadius: 'var(--h-radius-sm)',
              padding: '6px 4px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 10, color: 'var(--h-text-3)', marginBottom: 2 }}>
                {item.label}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: item.color ?? 'var(--h-text-1)' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </button>
  )
}

// ── 정사각형 카드 ─────────────────────────────────────────────
interface SqCardProps {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  badge?: React.ReactNode
  onClick: () => void
}

function SqCard({ icon, iconBg, iconColor, label, value, sub, badge, onClick }: SqCardProps) {
  return (
    <button onClick={onClick} style={{
      ...cardStyle,
      padding: 14,
      minHeight: 130,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <IconBox icon={icon} bg={iconBg} color={iconColor} />
        <span style={{ color: 'var(--h-text-3)' }}><IconChevron /></span>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--h-text-3)', marginBottom: 3 }}>
          {label}
        </div>
        <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--h-text-1)', lineHeight: 1.2 }}>
          {value}
        </div>
        {sub && (
          <div style={{ fontSize: 11, color: 'var(--h-text-3)', marginTop: 3 }}>{sub}</div>
        )}
        {badge && <div style={{ marginTop: 5 }}>{badge}</div>}
      </div>
    </button>
  )
}

// ── Badge ─────────────────────────────────────────────────────
function Badge({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }) {
  return (
    <span style={{
      display: 'inline-block',
      fontSize: 10, fontWeight: 500,
      padding: '2px 7px', borderRadius: 20,
      background: bg, color,
    }}>
      {children}
    </span>
  )
}

// ── HomeScreen ────────────────────────────────────────────────
interface HomeScreenProps {
  date: string
  onNavigate: (feature: Feature) => void
}

export function HomeScreen({ date, onNavigate }: HomeScreenProps) {
  const exercises  = exerciseStore.getByDate(date)
  const exKcal     = exercises.reduce((s, e) => s + e.kcalBurned, 0)
  const weight     = weightStore.getByDate(date)
  const waterTotal = waterStore.getTotalByDate(date)
  const waterPct   = Math.min(Math.round((waterTotal / 2000) * 100), 100)
  const fasting    = fastingStore.getByDate(date)
  const suppDefs   = suppStore.getDefs()
  const suppDone   = suppDefs.filter(d => suppStore.isTaken(date, d.id)).length

  return (
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* 식단 와이드 카드 */}
      <DietCard date={date} onClick={() => onNavigate('diet')} />

      {/* 2열 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>

        {/* 체중 */}
        <SqCard
          icon={<IconScale />}
          iconBg="var(--h-weight-bg)" iconColor="var(--h-weight)"
          label="체중"
          value={weight
            ? <>{weight.kg}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--h-text-3)' }}>kg</span></>
            : <span style={{ fontSize: 14, color: 'var(--h-text-3)' }}>미기록</span>
          }
          sub={weight ? undefined : '탭하여 기록'}
          onClick={() => onNavigate('weight')}
        />

        {/* 운동 */}
        <SqCard
          icon={<IconRun />}
          iconBg="var(--h-exercise-bg)" iconColor="var(--h-exercise)"
          label="운동"
          value={exKcal > 0
            ? <>{exKcal}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--h-text-3)' }}>kcal</span></>
            : <span style={{ fontSize: 14, color: 'var(--h-text-3)' }}>미기록</span>
          }
          sub={exercises.length > 0 ? exercises.map(e => e.description).join(' · ') : undefined}
          onClick={() => onNavigate('exercise')}
        />

        {/* 음수량 */}
        <SqCard
          icon={<IconDroplet />}
          iconBg="var(--h-water-bg)" iconColor="var(--h-water)"
          label="음수량"
          value={<>{waterTotal}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--h-text-3)' }}>ml</span></>}
          sub={
            <div>
              <div style={{
                height: 4, background: 'var(--h-surface-2)',
                borderRadius: 2, margin: '4px 0 2px',
              }}>
                <div style={{
                  height: '100%', width: `${waterPct}%`,
                  background: 'var(--h-water)', borderRadius: 2,
                  transition: 'width 0.3s',
                }} />
              </div>
              목표 2,000ml · {waterPct}%
            </div>
          }
          onClick={() => onNavigate('water')}
        />

        {/* 단식 */}
        <SqCard
          icon={<IconTimer />}
          iconBg="var(--h-fast-bg)" iconColor="var(--h-fast)"
          label="단식"
          value={
            fasting?.active
              ? <span style={{ fontSize: 16 }}>진행 중</span>
              : fasting
              ? <span style={{ fontSize: 14, color: 'var(--h-text-3)' }}>완료</span>
              : <span style={{ fontSize: 14, color: 'var(--h-text-3)' }}>미시작</span>
          }
          sub={fasting ? `${fasting.startTime} ~ ${fasting.endTime}` : undefined}
          badge={fasting?.active
            ? <Badge bg="var(--h-fast-bg)" color="var(--h-fast)">진행 중</Badge>
            : undefined
          }
          onClick={() => onNavigate('fast')}
        />

        {/* 생리 */}
        <SqCard
          icon={<IconFlower />}
          iconBg="var(--h-period-bg)" iconColor="var(--h-period)"
          label="생리"
          value={
            periodStore.isMarked(date)
              ? <span style={{ fontSize: 16 }}>기록됨</span>
              : <span style={{ fontSize: 14, color: 'var(--h-text-3)' }}>기록 없음</span>
          }
          sub="다음 예측 4월 2일"
          onClick={() => onNavigate('period')}
        />

        {/* 영양제/약 */}
        <SqCard
          icon={<IconPill />}
          iconBg="var(--h-supp-bg)" iconColor="var(--h-supp)"
          label="영양제 / 약"
          value={suppDefs.length > 0
            ? <>{suppDone}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--h-text-3)' }}>/{suppDefs.length}</span></>
            : <span style={{ fontSize: 14, color: 'var(--h-text-3)' }}>미등록</span>
          }
          sub={suppDefs.length > 0 ? '오늘 복용 완료' : '탭하여 등록'}
          onClick={() => onNavigate('supp')}
        />

      </div>
    </div>
  )
}