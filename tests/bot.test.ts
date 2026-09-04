import test from 'node:test';
import assert from 'node:assert';

// Keep-alive jitter interval generator
export function calculateNextInterval(baseSeconds: number = 60, jitterPercent: number = 0.2): number {
  const min = baseSeconds * (1 - jitterPercent);
  const max = baseSeconds * (1 + jitterPercent);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Micro-movement delta calculator
export function calculateMicroMovement(currentX: number, currentY: number, step: number = 2): { x: number; y: number } {
  const deltaX = Math.random() > 0.5 ? step : -step;
  const deltaY = Math.random() > 0.5 ? step : -step;
  return { x: currentX + deltaX, y: currentY + deltaY };
}

test('Keep-alive interval calculation with jitter', () => {
  const base = 60;
  for (let i = 0; i < 50; i++) {
    const interval = calculateNextInterval(base, 0.2);
    assert.ok(interval >= 48, `Interval ${interval} should be >= 48`);
    assert.ok(interval <= 72, `Interval ${interval} should be <= 72`);
  }
});

test('Micro-movement delta coordinates calculation', () => {
  const origin = { x: 500, y: 500 };
  const target = calculateMicroMovement(origin.x, origin.y, 2);
  const dist = Math.sqrt(Math.pow(target.x - origin.x, 2) + Math.pow(target.y - origin.y, 2));
  assert.ok(dist > 0 && dist < 5, 'Movement must be within micro-range (<5 pixels)');
});
