import { TextEncoder, TextDecoder } from 'node:util'

if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder
  globalThis.TextDecoder = TextDecoder
}

import '@testing-library/jest-dom'
