export const CHARGE_TIMING = {
  runStart: 10, openStart: 66, openEnd: 74, enterStart: 76,
  enterEnd: 100, closeStart: 103, closeEnd: 111,
};

function hermite(a: number, b: number, t: number, frames: number, va: number, vb: number) {
  const u = Math.max(0, Math.min(1, t));
  return (2 * u ** 3 - 3 * u ** 2 + 1) * a + (u ** 3 - 2 * u ** 2 + u) * frames * va
    + (-2 * u ** 3 + 3 * u ** 2) * b + (u ** 3 - u ** 2) * frames * vb;
}

/** Preserve contact frames while sharing a nonzero velocity across the doorway. */
export function chargeRunX(frame: number, approachX: number, insideX: number) {
  const t = CHARGE_TIMING;
  const approachFrames = t.enterStart - t.runStart, enterFrames = t.enterEnd - t.enterStart;
  const approachSpeed = (approachX + 840) / approachFrames;
  const enterSpeed = (insideX - approachX) / enterFrames;
  const contactSpeed = 2 * approachSpeed * enterSpeed / (approachSpeed + enterSpeed);
  return frame <= t.enterStart
    ? hermite(-840, approachX, (frame - t.runStart) / approachFrames, approachFrames, 0, contactSpeed)
    : hermite(approachX, insideX, (frame - t.enterStart) / enterFrames, enterFrames, contactSpeed, enterSpeed);
}
