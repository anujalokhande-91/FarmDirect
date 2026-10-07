import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './app/App'
import { CartProvider } from './app/CartContext'
import { AuthProvider } from './app/AuthContext'
import { FarmerAuthProvider } from './app/FarmerAuthContext'
import { FarmerDataProvider } from './app/FarmerDataContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FarmerAuthProvider>
          <FarmerDataProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </FarmerDataProvider>
        </FarmerAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)