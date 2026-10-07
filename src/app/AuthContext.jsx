import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getCurrentUser, loginUser, registerUser } from '../api/auth'

const TOKEN_KEY = 'farmdirect_access_token'
const AuthContext = createContext(null)

function getApiError(error, fallback) {
  if (!error.response) return 'The FarmDirect server is unavailable. Please try again.'
  if (error.response.status === 401) return 'Invalid email or password.'
  if (error.response.status === 409) return 'An account with this email already exists.'
  if (error.response.status === 422) return 'Please check the information you entered.'
  return fallback
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }

    getCurrentUser()
      .then(setCurrentUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setCurrentUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const register = async (user) => {
    if (!['customer', 'farmer'].includes(user.role)) {
      throw new Error('Choose a valid account type.')
    }
    try {
      return await registerUser(user)
    } catch (error) {
      throw new Error(getApiError(error, 'We could not create your account.'))
    }
  }

  const login = async (email, password, expectedRole) => {
    try {
      const response = await loginUser(email, password)
      if (expectedRole && response.user.role !== expectedRole) {
        throw new Error(
          expectedRole === 'farmer'
            ? 'This account is not registered as a farmer.'
            : 'This account is not registered as a customer.',
        )
      }
      localStorage.setItem(TOKEN_KEY, response.access_token)
      setCurrentUser(response.user)
      return response.user
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY)
      setCurrentUser(null)
      if (error.message.includes('not registered')) throw error
      throw new Error(getApiError(error, 'We could not sign you in.'))
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setCurrentUser(null)
  }

  const updateUser = (changes) => setCurrentUser((user) => (user ? { ...user, ...changes } : user))

  const value = useMemo(() => ({
    currentUser,
    token: localStorage.getItem(TOKEN_KEY),
    isAuthenticated: Boolean(currentUser),
    loading,
    register,
    login,
    logout,
    updateUser,
  }), [currentUser, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
