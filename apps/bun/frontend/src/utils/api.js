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

  listAlbums: () => request('/fotos/albums'),

  listPhotos: () => request('/fotos/photos'),

  // ── Courses ──
  listCourses: () => request('/courses'),

  getCourse: (id) => request(`/courses/${id}`),

  createCourse: (name, holes) =>
    request('/courses', { method: 'POST', body: JSON.stringify({ name, holes }) }),

  deleteCourse: (id) => request(`/courses/${id}`, { method: 'DELETE' }),

  listPlayers: () => request('/players'),

  // ── Rounds ──
  submitRound: (payload) =>
    request('/rounds', { method: 'POST', body: JSON.stringify(payload) }),

  myRounds: () => request('/rounds/mine'),

  pendingRounds: () => request('/rounds/pending'),

  attestRound: (id, action) =>
    request(`/rounds/${id}/attest`, { method: 'POST', body: JSON.stringify({ action }) }),

  // ── Leaderboard ──
  leaderboard: (metric, scope = 'season', course) => {
    const params = new URLSearchParams({ metric, scope })
    if (course) params.set('course', course)
    return request(`/leaderboard?${params.toString()}`)
  },
}
