import { http, HttpResponse } from 'msw'
import { describe, it, expect } from 'vitest'

import { server } from '../mocks/server'

describe('MSW setup', () => {
  it('intercepts gemini-proxy requests', async () => {
    const response = await fetch('http://localhost/gemini-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'election process' }),
    })
    const data = await response.json() as { response: string }
    expect(data.response).toContain('Nomination filing')
  })

  it('allows overriding handlers per test', async () => {
    server.use(
      http.post('*/gemini-proxy', () =>
        HttpResponse.json({ response: 'custom override' })
      )
    )
    const response = await fetch('http://localhost/gemini-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'anything' }),
    })
    const data = await response.json() as { response: string }
    expect(data.response).toBe('custom override')
  })
})