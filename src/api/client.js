const BASE_URL = '/api'

async function request(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }

  const res = await fetch(`${BASE_URL}${url}`, { ...options, headers, credentials: 'include' })
  const json = await res.json()

  if (!res.ok) throw new Error(json.message || 'Error del servidor')
  return json.data
}

export function get(url) { return request(url) }
export function post(url, body) { return request(url, { method: 'POST', body: JSON.stringify(body) }) }
export function patch(url, body) { return request(url, { method: 'PATCH', body: JSON.stringify(body) }) }
export function del(url) { return request(url, { method: 'DELETE' }) }
