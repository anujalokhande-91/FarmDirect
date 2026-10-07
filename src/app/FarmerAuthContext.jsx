import { createContext, useContext, useMemo } from 'react'
import { useAuth } from './AuthContext'

const FarmerAuthContext = createContext(null)

export function FarmerAuthProvider({ children }) {
  const { currentUser, loading, login, logout, register, updateUser } = useAuth()

  const value = useMemo(() => ({
    currentFarmer: currentUser?.role === 'farmer' ? currentUser : null,
    isFarmerAuthenticated: currentUser?.role === 'farmer',
    loading,
    farmerRegister: (farmer) => register({
      name: farmer.name,
      email: farmer.email,
      password: farmer.password,
      role: 'farmer',
      phone: farmer.phone || null,
    }),
    farmerLogin: (email, password) => login(email, password, 'farmer'),
    farmerLogout: logout,
    updateFarmer: updateUser,
  }), [currentUser, loading, login, logout, register, updateUser])

  return <FarmerAuthContext.Provider value={value}>{children}</FarmerAuthContext.Provider>
}

export const useFarmerAuth = () => useContext(FarmerAuthContext)
