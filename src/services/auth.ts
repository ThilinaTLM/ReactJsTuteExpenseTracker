import { api } from './api'
import type { AuthResponse, User } from '@/types'

interface LoginInput {
  email: string
  password: string
}

interface RegisterInput {
  email: string
  password: string
  name: string
}

export const authService = {
  /**
   * Login with email and password
   */
  async login(data: LoginInput): Promise<AuthResponse> {
    return api.post<AuthResponse>('/login', data)
  },

  /**
   * Register a new user
   */
  async register(data: RegisterInput): Promise<AuthResponse> {
    return api.post<AuthResponse>('/register', data)
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    return api.get<User>('/users/1') // In a real app, use the current user's ID
  },

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    return api.patch<User>('/users/1', data)
  },
}
