import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import CeoDashboard from './components/dashboards/ceo/CeoDashboard';
import OperationalDashboard from './components/dashboards/operational/OperationalDashboard';
import CfoDashboard from './components/dashboards/cfo/CfoDashboard';
import CouncillorDashboard from './components/dashboards/councillor/CouncillorDashboard';
import Bee2WasteDashboard from './components/dashboards/bee2waste/Bee2WasteDashboard';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/desempenho" replace />} />
        <Route path="desempenho" element={<CeoDashboard />} />
        <Route path="operacional" element={<OperationalDashboard />} />
        <Route path="financeiro" element={<CfoDashboard />} />
        <Route path="territorial" element={<CouncillorDashboard />} />
        <Route path="rastreabilidade" element={<Bee2WasteDashboard />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
