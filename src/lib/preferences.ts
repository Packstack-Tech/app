/** Per-browser UI preferences. localStorage can throw (private mode, blocked
 * storage), so every access is guarded and falls back to the default. */

const HIDE_CALORIES_KEY = 'inventory.hideCalories'

export function getHideCalories(): boolean {
  try {
    return localStorage.getItem(HIDE_CALORIES_KEY) === '1'
  } catch {
    return false
  }
}

export function setHideCalories(hidden: boolean): void {
  try {
    localStorage.setItem(HIDE_CALORIES_KEY, hidden ? '1' : '0')
  } catch {
    /* preference just doesn't persist */
  }
}
