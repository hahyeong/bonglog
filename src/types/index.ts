// ── 공통 ──────────────────────────────────────────────────────
export type DateString = string // "YYYY-MM-DD"

// ── 식단 ──────────────────────────────────────────────────────
export interface DietEntry {
  id: string
  date: DateString
  time: string        // "HH:MM"
  description: string
  kcal: number
  carb: number        // g
  protein: number     // g
  fat: number         // g
}

// ── 운동 ──────────────────────────────────────────────────────
export interface ExerciseEntry {
  id: string
  date: DateString
  time: string
  description: string
  durationMin: number
  kcalBurned: number
  intensity: 'low' | 'mid' | 'high'
}

// ── 체중 ──────────────────────────────────────────────────────
export interface WeightEntry {
  id: string
  date: DateString
  kg: number
}

// ── 음수량 ────────────────────────────────────────────────────
export interface WaterEntry {
  id: string
  date: DateString
  time: string
  ml: number
}

// ── 단식 ──────────────────────────────────────────────────────
export interface FastingSession {
  id: string
  date: DateString
  startTime: string   // "HH:MM"
  endTime: string     // "HH:MM"
  active: boolean
  completedAt?: string
}

// ── 생리 ──────────────────────────────────────────────────────
export interface PeriodEntry {
  id: string
  date: DateString
  type: 'period' | 'spotting'
}

// ── 영양제/약 ─────────────────────────────────────────────────
export interface SupplementDef {
  id: string
  name: string
  dosage: string      // "500mg"
  frequency: string   // "하루 1회"
  timing?: string     // "취침 전"
}

export interface SupplementLog {
  id: string
  date: DateString
  supplementId: string
  takenAt?: string    // "HH:MM"
}

// ── AI ────────────────────────────────────────────────────────
export type AIIntent =
  | { type: 'add';     feature: string; data: Record<string, unknown> }
  | { type: 'edit';    feature: string; targetId: string; changes: Record<string, unknown> }
  | { type: 'delete';  feature: string; targetId: string; changes: Record<string, unknown> }
  | { type: 'unknown'; raw: string }

export interface AIParseResult {
  intent: AIIntent
  confidence: number
  message: string
}