import './App.css';
import 'remixicon/fonts/remixicon.css'
import MainLayout from './layout/MainLayout';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { lazy, Suspense, useState, useEffect } from 'react';
import DashboardLayout from './layout/DashboardLayout';
import Login from './pages/login/Login'; // Import for redirect
import Rentout from './pages/rentout/Rentout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Function to decode JWT token
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (e) {
    return null;
  }
}

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/home/Home'));
const Vehicles = lazy(() => import('./pages/vehicles/Vehicles'));
const About = lazy(() => import('./pages/about/About'));
const VehicleDetails = lazy(() => import('./pages/vehicle-details/VehicleDetails'));
const Wishlist = lazy(() => import('./pages/wishlist/Wishlist'));
const Contact = lazy(() => import('./pages/contact/Contact'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const AddVehicle = lazy(() => import('./pages/add-vehicle/AddVehicle'));
const History = lazy(() => import('./pages/history/History'));
const Register = lazy(() => import('./pages/register/Register'));
const ForgetPassword = lazy(() => import('./pages/forget-password/ForgetPassword'));
const MyVehicle = lazy(() => import('./pages/my-vehicle/MyVehicle'));
const PurchaseDevice = lazy(() => import('./pages/purchase-device/PurchaseDevice'));

const Dashboard = lazy(() => import('./pages/admin-dashboard/dashboard/Dashboard'));
const ManageVehicles = lazy(() => import('./pages/admin-dashboard/vehicles/ManageVehicles'));
const ManageUsers = lazy(() => import('./pages/admin-dashboard/users/ManageUsers'));
const ManageBookings = lazy(() => import('./pages/admin-dashboard/bookings/ManageBookings'));
const Reports = lazy(() => import('./pages/admin-dashboard/reports/Reports'));
const Settings = lazy(() => import('./pages/admin-dashboard/settings/Settings'));
const AdminAddVehicle = lazy(() => import('./pages/admin-dashboard/vehicles/AddVehicleAdmin'));
const AdminAddUser = lazy(() => import('./pages/admin-dashboard/users/AddUserAdmin'));
const ManageVehicleType = lazy(() => import('./pages/admin-dashboard/vehicle-type/ManageVehicleType'));
const AddVehicleType = lazy(() => import('./pages/admin-dashboard/vehicle-type/AddVehicleType'));
const DevicePurchaseManage = lazy(() => import('./pages/admin-dashboard/device-purchase/DevicePurchaseManage'));

// Payment components
const PaymentSuccess = lazy(() => import('./pages/payment/PaymentSuccess'));
const PaymentCancel = lazy(() => import('./pages/payment/PaymentCancel'));

// Loading component
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    minHeight: '60vh',
    fontSize: '18px',
    color: '#711400'
  }}>
    <div>Loading...</div>
  </div>
);

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const decoded = decodeToken(token);
  if (!decoded || !allowedRoles.includes(decoded.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppContent() {
  const { pathname } = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        setIsAuthenticated(true);
        setUserRole(decoded.role);
      }
    }
  }, []);

  return (
    <>
      {!pathname.startsWith('/admin') ? (
        <MainLayout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/about" element={<About />} />
              <Route path="/vehicle/:slug" element={<VehicleDetails />} />
              <Route path="/vehicle/:id" element={<VehicleDetails />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/profile" element={
                <ProtectedRoute allowedRoles={['user', 'admin']}>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/tracking-device" element={
                <ProtectedRoute allowedRoles={['user', 'admin']}>
                  <PurchaseDevice />
                </ProtectedRoute>
              } />
              <Route path="/rent-out" element={
                <ProtectedRoute allowedRoles={['user', 'admin']}>
                  <Rentout />
                </ProtectedRoute>
              } />
              <Route path="/add-vehicle" element={
                <ProtectedRoute allowedRoles={['user', 'admin']}>
                  <AddVehicle />
                </ProtectedRoute>
              } />
              <Route path="/rental-history" element={
                <ProtectedRoute allowedRoles={['user', 'admin']}>
                  <History />
                </ProtectedRoute>
              } />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgetPassword />} />
              <Route path="/my-vehicles" element={
                <ProtectedRoute allowedRoles={['user', 'admin']}>
                  <MyVehicle />
                </ProtectedRoute>
              } />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/cancel" element={<PaymentCancel />} />
            </Routes>
          </Suspense>
        </MainLayout>
      ) : (
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/vehicles" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageVehicles />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageUsers />
                </ProtectedRoute>
              } />
              <Route path="/admin/bookings" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageBookings />
                </ProtectedRoute>
              } />
              <Route path="/admin/reports" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/admin/add-vehicle" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAddVehicle />
                </ProtectedRoute>
              } />
              <Route path="/admin/add-user" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAddUser />
                </ProtectedRoute>
              } />
              <Route path="/admin/vehicle-types" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageVehicleType />
                </ProtectedRoute>
              } />
              <Route path="/admin/add-vehicle-type" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AddVehicleType />
                </ProtectedRoute>
              } />
              <Route path="/admin/device-purchase" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DevicePurchaseManage />
                </ProtectedRoute>
              } />
            </Routes>
          </Suspense>
        </DashboardLayout>
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  );
}

export default App;
