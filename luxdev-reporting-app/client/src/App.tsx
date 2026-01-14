import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';

import Dashboard from './pages/Dashboard';
import Partners from './pages/Partners';
import PartnerDetail from './pages/PartnerDetail';
import SharedEvents from './pages/SharedEvents';
import PartnerDashboard from './pages/PartnerDashboard';
import ReportsAll from './pages/ReportsAll';
import MyProjects from './pages/MyProjects';
import { useAuth } from './context/AuthContext';

const AuthRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Navigate to="/dashboard" replace />;
  return <Navigate to="/partner-dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/" element={
              <AuthRedirect />
            } />

            {/* Admin Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/partners/:id" element={<PartnerDetail />} />

            {/* Common */}
            <Route path="/events" element={<SharedEvents />} />

            {/* Partner Routes */}
            <Route path="/partner-dashboard" element={<PartnerDashboard />} />
            <Route path="/my-projects" element={<MyProjects />} />

            <Route path="/reports-all" element={<ReportsAll />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
