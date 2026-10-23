const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function request (path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}

export const getPosts = (page = 1) => request(`/posts?page=${page}&limit=20`)

export const createPost = payload =>
  request('/posts', {
    method: 'POST',
    body: JSON.stringify(payload)
  })

export const toggleLike = postId =>
  request(`/posts/${postId}/like`, {
    method: 'POST'
  })
