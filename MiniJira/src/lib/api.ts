import { queryClient } from './queryClient'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getAccessToken(): string | null {
  return sessionStorage.getItem('access_token')
}

function setAccessToken(token: string) {
  sessionStorage.setItem('access_token', token)
}

function clearSession() {
  sessionStorage.removeItem('access_token')
  queryClient.clear()
}

// ── Refresh token ─────────────────────────────────────────────────────────────

let isRefreshing = false
let refreshQueue: Array<(token: string | null) => void> = []

async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise(resolve => {
      refreshQueue.push(resolve)
    })
  }

  isRefreshing = true

  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // httpOnly refresh cookie
    })

    if (!res.ok) {
      refreshQueue.forEach(cb => cb(null))
      refreshQueue = []
      return null
    }

    const data = await res.json() as { accessToken: string }
    setAccessToken(data.accessToken)
    refreshQueue.forEach(cb => cb(data.accessToken))
    refreshQueue = []
    return data.accessToken
  } catch {
    refreshQueue.forEach(cb => cb(null))
    refreshQueue = []
    return null
  } finally {
    isRefreshing = false
  }
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

interface RequestOptions extends RequestInit {
  skipAuth?: boolean
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, ...init } = options

  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')

  if (!skipAuth) {
    const token = getAccessToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  let res = await fetch(url, { ...init, headers })

  // Attempt token refresh on 401
  if (res.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken()

    if (!newToken) {
      clearSession()
      window.location.href = '/login'
      throw new ApiError(401, 'Sesión expirada')
    }

    headers.set('Authorization', `Bearer ${newToken}`)
    res = await fetch(url, { ...init, headers })
  }

  if (!res.ok) {
    let message = 'Ocurrió un error. Intenta de nuevo.'
    try {
      const body = await res.json() as { message?: string }
      if (body.message) message = body.message
    } catch {
      // ignore parse error
    }
    throw new ApiError(res.status, message)
  }

  // 204 No Content
  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

// ── Public API ────────────────────────────────────────────────────────────────

export const api = {
  get: <T>(url: string, options?: RequestOptions) =>
    request<T>(url, { method: 'GET', ...options }),

  post: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    request<T>(url, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),

  patch: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    request<T>(url, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),

  delete: <T>(url: string, options?: RequestOptions) =>
    request<T>(url, { method: 'DELETE', ...options }),
}

export { getAccessToken, setAccessToken, clearSession }
