import type {
  DietEntry, ExerciseEntry, WeightEntry,
  WaterEntry, FastingSession, PeriodEntry,
  SupplementDef, SupplementLog,
} from '../types'

// ── 키 ────────────────────────────────────────────────────────
const KEYS = {
  diet:     'bonglog:diet',
  exercise: 'bonglog:exercise',
  weight:   'bonglog:weight',
  water:    'bonglog:water',
  fasting:  'bonglog:fasting',
  period:   'bonglog:period',
  suppDefs: 'bonglog:supp_defs',
  suppLogs: 'bonglog:supp_logs',
} as const

// ── 공통 헬퍼 ─────────────────────────────────────────────────
function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

// ── 식단 ──────────────────────────────────────────────────────
export const dietStore = {
  getByDate: (date: string) =>
    load<DietEntry>(KEYS.diet).filter(e => e.date === date),
  add: (entry: Omit<DietEntry, 'id'>) => {
    const all = load<DietEntry>(KEYS.diet)
    const next = { ...entry, id: genId() }
    save(KEYS.diet, [...all, next])
    return next
  },
  update: (id: string, changes: Partial<DietEntry>) => {
    save(KEYS.diet,
      load<DietEntry>(KEYS.diet).map(e => e.id === id ? { ...e, ...changes } : e)
    )
  },
  delete: (id: string) => {
    save(KEYS.diet, load<DietEntry>(KEYS.diet).filter(e => e.id !== id))
  },
}

// ── 운동 ──────────────────────────────────────────────────────
export const exerciseStore = {
  getByDate: (date: string) =>
    load<ExerciseEntry>(KEYS.exercise).filter(e => e.date === date),
  add: (entry: Omit<ExerciseEntry, 'id'>) => {
    const all = load<ExerciseEntry>(KEYS.exercise)
    const next = { ...entry, id: genId() }
    save(KEYS.exercise, [...all, next])
    return next
  },
  update: (id: string, changes: Partial<ExerciseEntry>) => {
    save(KEYS.exercise,
      load<ExerciseEntry>(KEYS.exercise).map(e => e.id === id ? { ...e, ...changes } : e)
    )
  },
  delete: (id: string) => {
    save(KEYS.exercise, load<ExerciseEntry>(KEYS.exercise).filter(e => e.id !== id))
  },
}

// ── 체중 ──────────────────────────────────────────────────────
export const weightStore = {
  getByDate: (date: string) =>
    load<WeightEntry>(KEYS.weight).find(e => e.date === date),
  getLast7: () =>
    load<WeightEntry>(KEYS.weight)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7),
  set: (date: string, kg: number) => {
    const all = load<WeightEntry>(KEYS.weight).filter(e => e.date !== date)
    save(KEYS.weight, [...all, { id: genId(), date, kg }])
  },
  delete: (date: string) => {
    save(KEYS.weight, load<WeightEntry>(KEYS.weight).filter(e => e.date !== date))
  },
}

// ── 음수량 ────────────────────────────────────────────────────
export const waterStore = {
  getByDate: (date: string) =>
    load<WaterEntry>(KEYS.water).filter(e => e.date === date),
  getTotalByDate: (date: string) =>
    load<WaterEntry>(KEYS.water)
      .filter(e => e.date === date)
      .reduce((s, e) => s + e.ml, 0),
  add: (entry: Omit<WaterEntry, 'id'>) => {
    const all = load<WaterEntry>(KEYS.water)
    const next = { ...entry, id: genId() }
    save(KEYS.water, [...all, next])
    return next
  },
  delete: (id: string) => {
    save(KEYS.water, load<WaterEntry>(KEYS.water).filter(e => e.id !== id))
  },
}

// ── 단식 ──────────────────────────────────────────────────────
export const fastingStore = {
  getByDate: (date: string) =>
    load<FastingSession>(KEYS.fasting).find(e => e.date === date),
  save: (session: FastingSession) => {
    const all = load<FastingSession>(KEYS.fasting).filter(e => e.id !== session.id)
    save(KEYS.fasting, [...all, session])
  },
  start: (date: string, startTime: string, endTime: string): FastingSession => {
    const existing = load<FastingSession>(KEYS.fasting).find(e => e.date === date)
    if (existing) {
      const updated = { ...existing, startTime, endTime, active: true }
      fastingStore.save(updated)
      return updated
    }
    const next: FastingSession = { id: genId(), date, startTime, endTime, active: true }
    fastingStore.save(next)
    return next
  },
  stop: (id: string) => {
    const all = load<FastingSession>(KEYS.fasting).map(e =>
      e.id === id
        ? { ...e, active: false, completedAt: new Date().toTimeString().slice(0, 5) }
        : e
    )
    save(KEYS.fasting, all)
  },
  delete: (id: string) => {
    save(KEYS.fasting, load<FastingSession>(KEYS.fasting).filter(e => e.id !== id))
  },
}

// ── 생리 ──────────────────────────────────────────────────────
export const periodStore = {
  getByMonth: (year: number, month: number) => {
    const prefix = `${year}-${String(month).padStart(2, '0')}`
    return load<PeriodEntry>(KEYS.period).filter(e => e.date.startsWith(prefix))
  },
  toggle: (date: string) => {
    const all = load<PeriodEntry>(KEYS.period)
    const exists = all.find(e => e.date === date)
    if (exists) {
      save(KEYS.period, all.filter(e => e.date !== date))
    } else {
      save(KEYS.period, [...all, { id: genId(), date, type: 'period' }])
    }
  },
  isMarked: (date: string) =>
    load<PeriodEntry>(KEYS.period).some(e => e.date === date),
}

// ── 영양제/약 ─────────────────────────────────────────────────
export const suppStore = {
  getDefs: () => load<SupplementDef>(KEYS.suppDefs),
  addDef: (def: Omit<SupplementDef, 'id'>) => {
    const all = load<SupplementDef>(KEYS.suppDefs)
    const next = { ...def, id: genId() }
    save(KEYS.suppDefs, [...all, next])
    return next
  },
  updateDef: (id: string, changes: Partial<SupplementDef>) => {
    save(KEYS.suppDefs,
      load<SupplementDef>(KEYS.suppDefs).map(d => d.id === id ? { ...d, ...changes } : d)
    )
  },
  deleteDef: (id: string) => {
    save(KEYS.suppDefs, load<SupplementDef>(KEYS.suppDefs).filter(d => d.id !== id))
    save(KEYS.suppLogs, load<SupplementLog>(KEYS.suppLogs).filter(l => l.supplementId !== id))
  },
  getLogsByDate: (date: string) =>
    load<SupplementLog>(KEYS.suppLogs).filter(l => l.date === date),
  toggleLog: (date: string, supplementId: string) => {
    const all = load<SupplementLog>(KEYS.suppLogs)
    const exists = all.find(l => l.date === date && l.supplementId === supplementId)
    if (exists) {
      save(KEYS.suppLogs, all.filter(l => l.id !== exists.id))
    } else {
      save(KEYS.suppLogs, [...all, {
        id: genId(), date, supplementId,
        takenAt: new Date().toTimeString().slice(0, 5),
      }])
    }
  },
  isTaken: (date: string, supplementId: string) =>
    load<SupplementLog>(KEYS.suppLogs).some(l => l.date === date && l.supplementId === supplementId),
}

// ── 유틸 ──────────────────────────────────────────────────────
export function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}