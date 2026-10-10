/**
 * Peek-reveal: briefly show the answer (200ms), then clear it so the user types from memory.
 * Reusable across dictation, gap-fill games, typing practice, etc.
 *
 * @param setAnswer — setState for the input value
 * @param setRevealed — setState for revealed flag (true while peeking)
 * @param answer — the correct answer to flash
 * @param peekMs — how long to show the answer (default 200ms)
 * @returns cleanup function to cancel the timer
 */
export function peekReveal(
  setAnswer: (val: string) => void,
  setRevealed: (val: boolean) => void,
  answer: string,
  peekMs = 200,
): () => void {
  setAnswer(answer)
  setRevealed(true)
  const timer = setTimeout(() => {
    setAnswer('')
    setRevealed(false)
  }, peekMs)
  return () => clearTimeout(timer)
}
