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
  const text = await res.text()
  const data = text ? JSON.parse(text) : {}
  if (!res.ok) throw new Error(data.detail || `Request failed (${res.status})`)
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

  deleteToken: (tokenId) => request(`/admin/tokens/${tokenId}`, { method: 'DELETE' }),

  listMembers: () => request('/admin/members'),

  removeMember: (userId) => request(`/admin/members/${userId}`, { method: 'DELETE' }),

  listEvents: () => request('/agenda/events'),

  listVideos: () => request('/archief/videos'),

  addVideo: (url) => request('/archief/videos', { method: 'POST', body: JSON.stringify({ url }) }),

  deleteVideo: (videoId) => request(`/archief/videos/${videoId}`, { method: 'DELETE' }),

  listPhotos: () => request('/fotos/photos'),
}
