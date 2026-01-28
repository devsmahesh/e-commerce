/**
 * Token management utilities
 * Handles storing and retrieving JWT tokens from cookies
 */

import Cookies from 'js-cookie'
import { TOKEN_EXPIRY } from './constants'

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

export const tokenManager = {
  /**
   * Get access token from cookies
   */
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null
    return Cookies.get(ACCESS_TOKEN_KEY) || null
  },

  /**
   * Get refresh token from cookies
   */
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null
    return Cookies.get(REFRESH_TOKEN_KEY) || null
  },

  /**
   * Set access token in cookies (expires in 1 day)
   */
  setAccessToken: (token: string): void => {
    if (typeof window === 'undefined') return
    Cookies.set(ACCESS_TOKEN_KEY, token, {
      expires: TOKEN_EXPIRY.ACCESS_TOKEN,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
  },

  /**
   * Set refresh token in cookies (expires in 7 days)
   */
  setRefreshToken: (token: string): void => {
    if (typeof window === 'undefined') return
    Cookies.set(REFRESH_TOKEN_KEY, token, {
      expires: TOKEN_EXPIRY.REFRESH_TOKEN,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
  },

  /**
   * Set both tokens
   */
  setTokens: (accessToken: string, refreshToken: string): void => {
    tokenManager.setAccessToken(accessToken)
    tokenManager.setRefreshToken(refreshToken)
  },

  /**
   * Remove access token from cookies
   */
  removeAccessToken: (): void => {
    if (typeof window === 'undefined') return
    Cookies.remove(ACCESS_TOKEN_KEY)
  },

  /**
   * Remove refresh token from cookies
   */
  removeRefreshToken: (): void => {
    if (typeof window === 'undefined') return
    Cookies.remove(REFRESH_TOKEN_KEY)
  },

  /**
   * Remove all tokens
   */
  clearTokens: (): void => {
    tokenManager.removeAccessToken()
    tokenManager.removeRefreshToken()
  },

  /**
   * Check if user has valid tokens
   */
  hasTokens: (): boolean => {
    return !!(tokenManager.getAccessToken() && tokenManager.getRefreshToken())
  },
}

