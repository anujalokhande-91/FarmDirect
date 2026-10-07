import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { FarmerShell } from '../components/farmer/FarmerShell'
import { useAuth } from './AuthContext'
import Home from '../pages/Home'
import Shop from '../pages/Shop'
import ProductDetail from '../pages/ProductDetail'
import Cart from '../pages/Cart'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Account from '../pages/Account'
import FarmerLogin from '../pages/FarmerLogin'
import FarmerRegister from '../pages/FarmerRegister'
import FarmerDashboard from '../pages/FarmerDashboard'
import FarmerProducts from '../pages/FarmerProducts'
import FarmerProductForm from '../pages/FarmerProductForm'
import FarmerOrders from '../pages/FarmerOrders'
import FarmerProfile from '../pages/FarmerProfile'

function ProtectedAccount() {
  const { currentUser, isAuthenticated } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return currentUser.role === 'customer' ? <Account /> : <Navigate to="/" replace />
}

function ProtectedFarmerLayout() {
  const { currentUser, loading } = useAuth()
  const location = useLocation()
  if (loading) return null
  if (!currentUser) return <Navigate to="/farmer/login" replace state={{ from: location.pathname }} />
  return currentUser.role === 'farmer' ? <FarmerShell><Outlet /></FarmerShell> : <Navigate to="/farmer/login" replace />
}

function CustomerRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Shop />} />
        <Route path="/products/:productId" element={<ProductDetail />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account" element={<ProtectedAccount />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </AppShell>
  )
}

function FarmerRoutes() {
  return (
    <Routes>
      <Route path="/farmer/login" element={<FarmerLogin />} />
      <Route path="/farmer/register" element={<FarmerRegister />} />
      <Route element={<ProtectedFarmerLayout />}>
        <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
        <Route path="/farmer/products" element={<FarmerProducts />} />
        <Route path="/farmer/products/add" element={<FarmerProductForm />} />
        <Route path="/farmer/products/edit/:id" element={<FarmerProductForm />} />
        <Route path="/farmer/orders" element={<FarmerOrders />} />
        <Route path="/farmer/profile" element={<FarmerProfile />} />
      </Route>
      <Route path="*" element={<Navigate to="/farmer/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  const location = useLocation()
  const { loading } = useAuth()
  if (loading) return <div className="grid min-h-screen place-items-center bg-oat text-sm font-bold text-leaf">Loading FarmDirect...</div>
  return location.pathname.startsWith('/farmer') ? <FarmerRoutes /> : <CustomerRoutes />
}
