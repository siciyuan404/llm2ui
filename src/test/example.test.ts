import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

describe('Test Setup Verification', () => {
  it('should run basic tests', () => {
    expect(1 + 1).toBe(2)
  })

  it('should support fast-check property testing', () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => {
        return a + b === b + a // Commutative property
      }),
      { numRuns: 100 }
    )
  })
})
