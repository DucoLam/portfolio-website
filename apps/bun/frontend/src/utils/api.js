const base = '/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const res = await fetch(`${base}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Request failed')
  return data
}

export const api = {
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  register: (username, password, member_token) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ username, password, member_token }) }),

  me: () => request('/auth/me'),

  generateToken: () => request('/admin/tokens', { method: 'POST' }),

  listTokens: () => request('/admin/tokens'),
}
