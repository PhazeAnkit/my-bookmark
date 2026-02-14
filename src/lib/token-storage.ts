type ProviderTokens = {
  accessToken: string
  refreshToken: string | null
}

const KEY = "google_oauth_tokens"

export function saveProviderTokens(tokens: ProviderTokens) {
  localStorage.setItem(KEY, JSON.stringify(tokens))
}

export function getProviderTokens(): ProviderTokens | null {
  const raw = localStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : null
}

export function clearProviderTokens() {
  localStorage.removeItem(KEY)
}
