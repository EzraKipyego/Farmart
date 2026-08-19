import { Navigate, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import MobileTabBar from './components/layout/MobileTabBar'
import ProtectedRoute from './components/layout/ProtectedRoute'

import AuthPage from './pages/AuthPage'
import BrowsePage from './pages/BrowsePage'
import AnimalDetailPage from './pages/AnimalDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import PaymentPage from './pages/PaymentPage'
import OrdersPage from './pages/OrdersPage'
import ProfilePage from './pages/ProfilePage'
import FarmerListingsPage from './pages/FarmerListingPage'
import AddEditAnimalPage from './pages/AddEditAnimalPage'
import FarmerOrdersPage from './pages/FarmerOrdersPage'

function App() {
  return (
    <div className="min-h-screen bg-[#0d1117]">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<BrowsePage />} />
          <Route path="/search" element={<BrowsePage />} />
          <Route path="/animals/:id" element={<AnimalDetailPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/cart" element={<CartPage />} />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRole="buyer">
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute allowedRole="buyer">
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRole="buyer">
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/farmer/dashboard"
            element={
              <ProtectedRoute allowedRole="farmer">
                <Navigate to="/farmer/listings" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/listings"
            element={
              <ProtectedRoute allowedRole="farmer">
                <FarmerListingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/listings/new"
            element={
              <ProtectedRoute allowedRole="farmer">
                <AddEditAnimalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/listings/:id/edit"
            element={
              <ProtectedRoute allowedRole="farmer">
                <AddEditAnimalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/orders"
            element={
              <ProtectedRoute allowedRole="farmer">
                <FarmerOrdersPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <MobileTabBar />
    </div>
  )
}

export default App
