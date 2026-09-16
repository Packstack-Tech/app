import { getTripAiReview } from '@/lib/api'
import { Trip } from '@/types/trip'

/**
 * Prompt prepended to the AI-review markdown so the user can paste straight
 * into an assistant without writing anything. The same text lives in the
 * public site (CopyForAI.tsx) and mobile (lib/share.ts) — keep them in sync.
 */
export const AI_SHAKEDOWN_PROMPT = `Please give this backpacking gear list a shakedown. Review it against the trip details below and tell me:

1. Anything that looks too heavy for its job, and lighter alternatives worth considering
2. Redundant or unnecessary items I could leave behind
3. Gear that seems to be missing for these conditions — especially safety items (navigation, first aid, shelter, insulation, water, fire, light, sun, repair, emergency)
4. Whether the sleep system, shelter and clothing look right for the forecast temperature range and terrain
5. Anything else you'd flag before I head out

Ask me about anything you need to know that isn't listed (budget, experience, non-negotiables, resupply, water sources).

---

`

/** Fetch the trip's AI-review markdown with the shakedown prompt on top. */
export async function tripAiReviewText(trip: Trip): Promise<string> {
  const res = await getTripAiReview(trip.uuid || trip.id)
  return AI_SHAKEDOWN_PROMPT + res.data
}
