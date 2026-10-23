import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';
import AuthLayout from './components/layout/AuthLayout.jsx';
import DashboardPage from './features/dashboard/DashboardPage.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
import SignupPage from './features/auth/SignupPage.jsx';
import FeaturePlaceholderPage from './pages/FeaturePlaceholderPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { PATHS } from './routes/paths.js';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={PATHS.home} element={<Navigate to={PATHS.dashboard} replace />} />
        <Route path={PATHS.dashboard} element={<DashboardPage />} />
        <Route path={PATHS.trips} element={<FeaturePlaceholderPage feature="trips" />} />
        <Route path="/trips/:tripId" element={<FeaturePlaceholderPage feature="trip" />} />
        <Route path="/trips/:tripId/schedule" element={<FeaturePlaceholderPage feature="schedule" />} />
        <Route path="/trips/:tripId/places" element={<FeaturePlaceholderPage feature="places" />} />
        <Route path="/trips/:tripId/expenses" element={<FeaturePlaceholderPage feature="expenses" />} />
        <Route path="/trips/:tripId/settlement" element={<FeaturePlaceholderPage feature="settlement" />} />
        <Route path="/trips/:tripId/statistics" element={<FeaturePlaceholderPage feature="statistics" />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route path={PATHS.login} element={<LoginPage />} />
        <Route path={PATHS.signup} element={<SignupPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
