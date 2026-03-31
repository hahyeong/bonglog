import type { AIParseResult } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const API_URL = import.meta.env.DEV
  ? '/api/anthropic/v1/messages'
  : '/api/anthropic'
const MODEL   = 'claude-sonnet-4-20250514'

// ── 공통 호출 ─────────────────────────────────────────────────
async function ask(system: string, user: string): Promise<string> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2048,
      system,
      messages: [{ role: 'user', content: user }],
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
  time: string
}

export interface ParsedExercise {
  description: string
  durationMin: number
  kcalBurned: number
  intensity: 'low' | 'mid' | 'high'
  time: string
}

// ── 식단 파싱 ─────────────────────────────────────────────────
export async function parseDietInput(text: string): Promise<ParsedDiet> {
  const now = new Date().toTimeString().slice(0, 5)

  const system = `당신은 한국 식품 영양 분석 전문가입니다. 사용자가 먹은 음식을 자연어로 설명하면 각 재료를 정밀하게 분석해서 정확한 영양소를 계산합니다.

## 분석 절차
1. 사용자 입력에서 모든 재료와 양을 빠짐없이 추출합니다
2. 각 재료를 개별적으로 분석하고 영양소를 계산합니다
3. 모든 재료의 영양소를 합산해서 최종 결과를 냅니다

## 영양소 계산 기준
- 기본 식재료: 한국 식품안전처 식품영양성분 데이터베이스 기준
- 가공식품 및 브랜드 제품: 반드시 해당 제품의 실제 영양성분표 기준으로 계산합니다. 절대로 일반 식재료 데이터로 대체하지 않습니다
  - 예: 다향 훈제오리는 100g당 약 370~400kcal로 일반 오리고기(100g당 약 200kcal)와 전혀 다릅니다
  - 예: 서울우유 더 진한 그릭요거트는 100g당 약 90kcal입니다
  - 예: 참치캔(동원, 오뚜기 등)은 기름 제거 시 100g당 약 100~120kcal입니다
- 브랜드 제품 영양성분을 정확히 모를 경우: 동일 카테고리 제품 중 가장 높은 수치를 기준으로 계산합니다 (과소 계산 방지)

## 조리 방법 반영
- 찌기: 수분이 증가하고 기름이 거의 빠지지 않으므로 칼로리 변화 거의 없음 (±5% 이내)
- 굽기: 수분 감소로 중량이 줄지만 칼로리 밀도는 높아짐
- 볶기: 기름 흡수로 칼로리 증가
- 삶기: 수용성 영양소 일부 손실, 칼로리 변화 거의 없음
- 기름 제거(참치캔 등): 지방 칼로리 대폭 감소

## 단위 기준
- 한 줌 = 30~40g (채소류 기준)
- 한 큰술(큰숟가락) = 15g (액체류 13ml)
- 한 티스푼(작은숟가락) = 5g
- 계란 중란 1개 = 60g (흰자 35g, 노른자 17g)
- 깻잎 1장 = 3g
- 김 1장(전장) = 2.5g
- 참치캔 소형 = 총중량 100g, 기름 제거 후 순중량 약 65~70g
- 사과 중간 크기 1개 = 200g
- 꿀 1티스푼 = 7g (21kcal)
- 땅콩버터 1큰술 = 16g (95kcal, 단백질 4g, 지방 8g, 탄수 3g)

## 출력 규칙
- 반드시 JSON만 반환합니다
- 설명, 주석, 마크다운 코드블록 등 JSON 외의 텍스트는 절대 포함하지 않습니다
- 모든 영양소 수치는 정수로 반올림합니다
- description은 핵심 음식명만 간결하게 명사형으로 작성합니다 (문장 형태 금지)
  - 좋은 예: "훈제오리 알배추찜 + 스리라차소스"
  - 나쁜 예: "훈제오리와 알배추를 쪄서 스리라차 소스와 함께 먹었습니다"`

  const user = `현재 시각: ${now}
사용자 입력: "${text}"

아래 형식의 JSON만 반환하세요:
{
  "description": "핵심 음식명만 간결하게 명사형으로 요약",
  "kcal": 숫자,
  "carb": 숫자,
  "protein": 숫자,
  "fat": 숫자,
  "time": "HH:MM (입력에 시간 언급 있으면 그 시간, 없으면 현재 시각)"
}`

  const json = await ask(system, user)
  return JSON.parse(json) as ParsedDiet
}

// ── 운동 파싱 ─────────────────────────────────────────────────
export async function parseExerciseInput(text: string): Promise<ParsedExercise> {
  const now = new Date().toTimeString().slice(0, 5)

  const system = `당신은 스포츠 영양 전문가입니다. 사용자가 한 운동을 자연어로 설명하면 정확한 운동 데이터를 분석합니다.

## 분석 절차
1. 운동 종류, 시간, 강도를 정확히 파악합니다
2. 소모 칼로리는 MET(대사당량) 기반으로 체중 60kg 기준으로 계산합니다
3. MET 공식: 칼로리 = MET × 체중(kg) × 시간(h)

## MET 기준값
- 걷기(보통 속도): 3.5
- 빠르게 걷기: 4.5
- 조깅: 7.0
- 달리기: 9.0
- 자전거(보통): 6.0
- 수영: 7.0
- 필라테스: 3.0
- 요가: 2.5
- HIIT: 8.0
- 헬스(웨이트): 5.0
- 등산: 6.0
- 줄넘기: 10.0

## 강도 기준
- low: 걷기, 스트레칭, 요가 등 심박수 크게 오르지 않는 운동
- mid: 필라테스, 조깅, 자전거 등 중간 강도
- high: HIIT, 달리기, 줄넘기 등 고강도

## 출력 규칙
- 반드시 JSON만 반환합니다
- 설명, 주석, 마크다운 코드블록 등 JSON 외의 텍스트는 절대 포함하지 않습니다
- 모든 수치는 정수로 반올림합니다`

  const user = `현재 시각: ${now}
사용자 입력: "${text}"

아래 형식의 JSON만 반환하세요:
{
  "description": "운동명 간결하게 (예: 필라테스, 런닝)",
  "durationMin": 숫자,
  "kcalBurned": 숫자,
  "intensity": "low" | "mid" | "high",
  "time": "HH:MM (입력에 시간 언급 있으면 그 시간, 없으면 현재 시각)"
}`

  const json = await ask(system, user)
  return JSON.parse(json) as ParsedExercise
}

// ── 자연어 수정·삭제 명령 파싱 ───────────────────────────────
export async function parseNLCommand(
  command: string,
  context: string,
): Promise<AIParseResult> {
  const system = `당신은 헬스케어 앱의 데이터 관리 도우미입니다. 사용자의 자연어 명령을 분석해서 수행할 작업을 JSON으로 반환합니다.

## 출력 규칙
- 반드시 JSON만 반환합니다
- 설명, 주석, 마크다운 코드블록 등 JSON 외의 텍스트는 절대 포함하지 않습니다`

  const user = `사용자 명령: "${command}"

현재 데이터:
${context}

아래 형식의 JSON만 반환하세요:
{
  "intent": {
    "type": "edit" | "delete" | "add" | "unknown",
    "feature": "diet" | "exercise" | "weight" | "water" | "fasting" | "period" | "supplement",
    "targetId": "항목 id (edit/delete 시)",
    "changes": { "변경할 필드": "새 값" }
  },
  "confidence": 0~1,
  "message": "한국어 확인 메시지"
}`

  const json = await ask(system, user)
  return JSON.parse(json) as AIParseResult
}