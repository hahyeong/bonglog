import type { AIParseResult } from '../types'

// ── 설정 ──────────────────────────────────────────────────────
// .env.local 에 아래 추가:
//   VITE_ANTHROPIC_API_KEY=sk-ant-...
//   VITE_AI_MOCK=true   ← 키 없을 때 mock 모드

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env = (import.meta as any).env ?? {}
const IS_MOCK = env.VITE_AI_MOCK === 'true' || !env.VITE_ANTHROPIC_API_KEY
const API_KEY = env.VITE_ANTHROPIC_API_KEY ?? ''
const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL   = 'claude-sonnet-4-20250514'

if (IS_MOCK) {
  console.info('[ai] mock 모드 — API 없이 가짜 데이터 반환')
}

// ── 공통 호출 ─────────────────────────────────────────────────
async function ask(prompt: string): Promise<string> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return (data.content?.[0]?.text ?? '').replace(/```json|```/g, '').trim()
}

// ── 타입 ──────────────────────────────────────────────────────
export interface ParsedDiet {
  description: string
  kcal: number
  carb: number
  protein: number
  fat: number
  time: string  // "HH:MM"
}

export interface ParsedExercise {
  description: string
  durationMin: number
  kcalBurned: number
  intensity: 'low' | 'mid' | 'high'
  time: string
}

// ── Mock 헬퍼 ─────────────────────────────────────────────────
const delay = (ms = 600) => new Promise(r => setTimeout(r, ms))

const DIET_MAP: Record<string, Partial<ParsedDiet>> = {
  '연어':     { kcal: 180, carb: 5,  protein: 20, fat: 9  },
  '초밥':     { kcal: 55,  carb: 11, protein: 3,  fat: 1  },
  '닭가슴살': { kcal: 165, carb: 0,  protein: 31, fat: 4  },
  '샐러드':   { kcal: 80,  carb: 10, protein: 3,  fat: 3  },
  '밥':       { kcal: 130, carb: 28, protein: 3,  fat: 0  },
  '오리고기': { kcal: 220, carb: 0,  protein: 23, fat: 14 },
  '스테이크': { kcal: 270, carb: 0,  protein: 26, fat: 18 },
  '피자':     { kcal: 285, carb: 36, protein: 12, fat: 10 },
  '라면':     { kcal: 500, carb: 70, protein: 12, fat: 18 },
  '김밥':     { kcal: 320, carb: 55, protein: 10, fat: 7  },
}

function mockDiet(text: string): ParsedDiet {
  const now = new Date().toTimeString().slice(0, 5)
  let kcal = 350, carb = 40, protein = 20, fat = 10

  for (const [key, val] of Object.entries(DIET_MAP)) {
    if (text.includes(key)) {
      kcal = val.kcal ?? kcal
      carb = val.carb ?? carb
      protein = val.protein ?? protein
      fat = val.fat ?? fat
      break
    }
  }

  const countMatch = text.match(/(\d+)\s*개/)
  if (countMatch) {
    const n = parseInt(countMatch[1])
    kcal    = Math.round(kcal * n * 0.5)
    carb    = Math.round(carb * n * 0.5)
    protein = Math.round(protein * n * 0.5)
    fat     = Math.round(fat * n * 0.5)
  }

  let time = now
  if (text.includes('아침') || text.includes('조식')) time = '08:00'
  else if (text.includes('점심') || text.includes('중식')) time = '12:30'
  else if (text.includes('저녁') || text.includes('석식')) time = '18:30'

  return {
    description: text.replace(/\(.*?\)/g, '').trim().slice(0, 40),
    kcal, carb, protein, fat, time,
  }
}

const EXERCISE_MAP: Record<string, Partial<ParsedExercise>> = {
  '필라테스': { kcalBurned: 250, intensity: 'mid' },
  '요가':     { kcalBurned: 180, intensity: 'low' },
  '런닝':     { kcalBurned: 400, intensity: 'high' },
  '달리기':   { kcalBurned: 400, intensity: 'high' },
  '걷기':     { kcalBurned: 150, intensity: 'low' },
  '수영':     { kcalBurned: 360, intensity: 'high' },
  '자전거':   { kcalBurned: 300, intensity: 'mid' },
  '스쿼트':   { kcalBurned: 200, intensity: 'mid' },
  '헬스':     { kcalBurned: 300, intensity: 'mid' },
}

function mockExercise(text: string): ParsedExercise {
  const now = new Date().toTimeString().slice(0, 5)
  let kcalBurned = 250
  let intensity: 'low' | 'mid' | 'high' = 'mid'
  let description = text.trim().slice(0, 40)

  for (const [key, val] of Object.entries(EXERCISE_MAP)) {
    if (text.includes(key)) {
      kcalBurned  = val.kcalBurned ?? kcalBurned
      intensity   = val.intensity ?? intensity
      description = key
      break
    }
  }

  const minMatch = text.match(/(\d+)\s*분/)
  const durationMin = minMatch ? parseInt(minMatch[1]) : 30
  kcalBurned = Math.round(kcalBurned * (durationMin / 30))

  return { description, durationMin, kcalBurned, intensity, time: now }
}

function mockNL(command: string, context: string): AIParseResult {
  const entries = (() => { try { return JSON.parse(context) } catch { return [] } })()
  const isDelete = /삭제|지워|제거/.test(command)
  const isEdit   = /수정|변경|바꿔|→/.test(command)

  if ((isDelete || isEdit) && entries.length > 0) {
    const target = entries[0]
    if (isDelete) {
      return {
        intent: { type: 'delete', feature: 'diet', targetId: target.id, changes: {} },
        confidence: 0.9,
        message: `"${target.description}" 항목을 삭제했습니다.`,
      }
    }
    const numMatch = command.match(/→\s*(\d+)/)
    const changes = numMatch
      ? { description: target.description.replace(/\d+/, numMatch[1]) }
      : {}
    return {
      intent: { type: 'edit', feature: 'diet', targetId: target.id, changes },
      confidence: 0.85,
      message: '수정이 완료되었습니다.',
    }
  }

  return {
    intent: { type: 'unknown', raw: command },
    confidence: 0.3,
    message: '명령을 이해하지 못했습니다. 다시 입력해주세요.',
  }
}

// ── Public API ────────────────────────────────────────────────
export async function parseDietInput(text: string): Promise<ParsedDiet> {
  if (IS_MOCK) { await delay(); return mockDiet(text) }

  const now = new Date().toTimeString().slice(0, 5)
  const json = await ask(`사용자가 식단을 입력했습니다: "${text}"
현재 시각: ${now}

아래 JSON만 반환하세요 (다른 텍스트 없이):
{
  "description": "정제된 음식 설명",
  "kcal": 숫자,
  "carb": 숫자,
  "protein": 숫자,
  "fat": 숫자,
  "time": "HH:MM"
}

기준:
- 칼로리·영양소: 일반 식품 데이터 기반 추정 정수
- time: 언급 없으면 현재 시각, 아침→08:00, 점심→12:30, 저녁→18:30`)

  return JSON.parse(json) as ParsedDiet
}

export async function parseExerciseInput(text: string): Promise<ParsedExercise> {
  if (IS_MOCK) { await delay(); return mockExercise(text) }

  const now = new Date().toTimeString().slice(0, 5)
  const json = await ask(`사용자가 운동을 입력했습니다: "${text}"
현재 시각: ${now}

아래 JSON만 반환하세요:
{
  "description": "운동 설명",
  "durationMin": 숫자,
  "kcalBurned": 숫자,
  "intensity": "low" | "mid" | "high",
  "time": "HH:MM"
}

기준:
- kcalBurned: 성인 65kg MET값 기반 정수
- intensity: low=걷기·스트레칭, mid=필라테스·조깅, high=HIIT·달리기
- time: 언급 없으면 현재 시각`)

  return JSON.parse(json) as ParsedExercise
}

export async function parseNLCommand(
  command: string,
  context: string,
): Promise<AIParseResult> {
  if (IS_MOCK) { await delay(400); return mockNL(command, context) }

  const json = await ask(`사용자 명령: "${command}"

현재 데이터:
${context}

아래 JSON만 반환하세요:
{
  "intent": {
    "type": "edit" | "delete" | "add" | "unknown",
    "feature": "diet" | "exercise" | "weight" | "water" | "fasting" | "period" | "supplement",
    "targetId": "항목 id (edit/delete 시)",
    "changes": { "변경할 필드": "새 값" }
  },
  "confidence": 0~1,
  "message": "한국어 확인 메시지"
}`)

  return JSON.parse(json) as AIParseResult
}