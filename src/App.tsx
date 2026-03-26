import { useState, useEffect } from 'react'
import { ToastProvider } from './hooks/useToast'
import { CalendarStrip } from './components/layout/CalendarStrip'
import { HomeScreen } from './features/home/HomeScreen'
import { DietScreen } from './features/diet/DietScreen'
import { ExerciseScreen } from './features/exercise/ExerciseScreen'
import { WeightScreen } from './features/weight/WeightScreen'
import { WaterScreen } from './features/water/WaterScreen'
import { FastingScreen } from './features/fasting/FastingScreen'
import { PeriodScreen } from './features/period/PeriodScreen'
import { SuppScreen } from './features/supplements/SuppScreen'
import { todayString } from './store'

type Feature = 'diet' | 'exercise' | 'weight' | 'water' | 'fast' | 'period' | 'supp'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

function IconSun() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  )
}

function IconMoon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
  )
}

export default function App() {
  const [date, setDate] = useState(todayString)
  const [screen, setScreen] = useState<Feature | null>(null)

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('bonglog:theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('bonglog:theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const d = new Date(date + 'T00:00:00')
  const dateLabel = `${d.getMonth() + 1}월 ${d.getDate()}일 ${DAYS[d.getDay()]}요일`

  return (
    <ToastProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>

        {/* 헤더 + 캘린더 — 홈 화면일 때만 */}
        {screen === null && (
          <div style={{
            background: 'var(--h-surface)',
            borderBottom: '1px solid var(--h-border)',
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 16px 10px',
            }}>
              <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--h-text-1)' }}>
                오늘의 기록
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--h-text-3)' }}>
                  {dateLabel}
                </span>
                <button
                  onClick={() => setIsDark(v => !v)}
                  style={{
                    width: 32, height: 32,
                    borderRadius: 'var(--h-radius-sm)',
                    background: 'var(--h-surface-2)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--h-text-2)',
                    flexShrink: 0,
                  }}
                >
                  {isDark ? <IconSun /> : <IconMoon />}
                </button>
              </div>
            </div>
            <CalendarStrip selectedDate={date} onSelect={setDate} />
          </div>
        )}

        {/* 콘텐츠 */}
        <div style={{ flex: 1 }}>
          {screen === null && (
            <HomeScreen date={date} onNavigate={setScreen} />
          )}
          {screen === 'diet' && (
            <DietScreen date={date} onBack={() => setScreen(null)} />
          )}
          {screen === 'exercise' && (
            <ExerciseScreen date={date} onBack={() => setScreen(null)} />
          )}
          {screen === 'weight' && (
            <WeightScreen date={date} onBack={() => setScreen(null)} />
          )}
          {screen === 'water' && (
            <WaterScreen date={date} onBack={() => setScreen(null)} />
          )}
          {screen === 'fast' && (
            <FastingScreen date={date} onBack={() => setScreen(null)} />
          )}
          {screen === 'period' && (
            <PeriodScreen date={date} onBack={() => setScreen(null)} />
          )}
          {screen === 'supp' && (
            <SuppScreen date={date} onBack={() => setScreen(null)} />
          )}
        </div>

      </div>
    </ToastProvider>
  )
}