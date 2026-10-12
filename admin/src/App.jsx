import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout, RequireArea } from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Plans from './pages/Plans';
import Subscriptions from './pages/Subscriptions';
import Team from './pages/Team';
import Audit from './pages/Audit';
import Enquiries from './pages/Enquiries';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route
          path="sellers"
          element={
            <RequireArea area="users">
              <Users key="sellers" pendingOnly />
            </RequireArea>
          }
        />
        <Route
          path="users"
          element={
            <RequireArea area="users">
              <Users key="users" />
            </RequireArea>
          }
        />
        <Route
          path="enquiries"
          element={
            <RequireArea area="users">
              <Enquiries />
            </RequireArea>
          }
        />
        <Route
          path="plans"
          element={
            <RequireArea area="billing">
              <Plans />
            </RequireArea>
          }
        />
        <Route
          path="subscriptions"
          element={
            <RequireArea area="billing">
              <Subscriptions />
            </RequireArea>
          }
        />
        <Route
          path="team"
          element={
            <RequireArea area="team">
              <Team />
            </RequireArea>
          }
        />
        <Route
          path="audit"
          element={
            <RequireArea area="team">
              <Audit />
            </RequireArea>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
