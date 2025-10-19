import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import MainLayout from './components/MainLayout';
import ScrollToTop from './components/ScrollToTop';
import AuthHandler from './components/AuthHandler';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import DashboardLayout from './components/DashboardLayout';
import AdminRoute from './components/AdminRoute';
import RedirectManager from './components/RedirectManager';
import LeadSourceHandler from './components/LeadSourceHandler';
// VehicleProvider moved to main.tsx to avoid duplication

const HomePage = lazy(() => import('./pages/HomePage'));
const VehicleDetailPage = lazy(() => import('./pages/VehicleDetailPage'));
const VehicleListPage = lazy(() => import('./pages/VehicleListPage'));
const ResponsiveInventoryPage = lazy(() => import('./pages/ResponsiveInventoryPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
// Removed: DashboardInventoryPage - using VehicleListPage for all inventory views
const Application = lazy(() => import('./pages/Application'));
const UserApplicationsPage = lazy(() => import('./pages/UserApplicationsPage'));
const SeguimientoPage = lazy(() => import('./pages/SeguimientoPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PerfilacionBancariaPage = lazy(() => import('./pages/PerfilacionBancariaPage'));
const BetaPollPage = lazy(() => import('./pages/BetaPollPage'));
const AdminInspectionPage = lazy(() => import('./pages/AdminInspectionPage'));
const FaqPage = lazy(() => import('./pages/faqs'));
const PromotionsPage = lazy(() => import('./pages/PromotionsPage'));
const MarketingCategoryPage = lazy(() => import('./pages/MarketingCategoryPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const AdminInspectionsListPage = lazy(() => import('./pages/AdminInspectionsListPage'));
const VisitasPage = lazy(() => import('./pages/VisitasPage'));
const SurveyPage = lazy(() => import('./pages/SurveyPage'));
const KitTrefaPage = lazy(() => import('./pages/KitTrefaPage'));
const CarStudioPage = lazy(() => import('./pages/CarStudioPage'));
const AdminLeadsDashboardPage = lazy(() => import('./pages/AdminLeadsDashboardPage'));
const AdminClientProfilePage = lazy(() => import('./pages/AdminClientProfilePage'));
const AdminAirtableConfigPage = lazy(() => import('./pages/AdminAirtableConfigPage'));
const VacanciesListPage = lazy(() => import('./pages/VacanciesListPage'));
const VacancyDetailPage = lazy(() => import('./pages/VacancyDetailPage'));
const AdminVacanciesPage = lazy(() => import('./pages/AdminVacanciesPage'));
const AdminCandidatesPage = lazy(() => import('./pages/AdminCandidatesPage'));
const GetAQuotePage = lazy(() => import('./pages/GetAQuotePage'));
const SellMyCarPage = lazy(() => import('./pages/SellMyCarPage'));
const AsesorProfilePage = lazy(() => import('./pages/AsesorProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App(): React.JSX.Element {
  const loadingSpinner = (
    <div className="flex justify-center items-center h-screen w-full bg-gray-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <LeadSourceHandler />
      <AuthHandler />
      <RedirectManager />
      <ScrollToTop />
      <Suspense fallback={loadingSpinner}>
        <Routes>
          {/* Routes with MainLayout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="autos" element={<VehicleListPage />} />
            <Route path="explorar" element={<ResponsiveInventoryPage />} />
            <Route path="autos/:slug" element={<VehicleDetailPage />} />
            <Route path="vender-mi-auto" element={<GetAQuotePage />} />
            <Route path="promociones" element={<PromotionsPage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="kit-trefa" element={<KitTrefaPage />} />
            <Route path="politica-de-privacidad" element={<PrivacyPolicyPage />} />
            <Route path="vacantes" element={<VacanciesListPage />} />
            <Route path="vacantes/:id" element={<VacancyDetailPage />} />
            <Route path="asesor/:id" element={<AsesorProfilePage />} />
            <Route path="marcas/:marca" element={<MarketingCategoryPage />} />
            <Route path="carroceria/:carroceria" element={<MarketingCategoryPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Public routes that redirect if logged in */}
          <Route element={<PublicRoute />}>
            <Route path="/acceder" element={<AuthPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
          </Route>

          {/* Protected routes */}
          <Route path="/escritorio" element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="perfilacion-bancaria" element={<PerfilacionBancariaPage />} />
              <Route path="aplicacion" element={<Application />} />
              <Route path="aplicacion/:id" element={<Application />} />
              <Route path="seguimiento" element={<SeguimientoPage />} />
              <Route path="seguimiento/:id" element={<Application />} />
              <Route path="favoritos" element={<FavoritesPage />} />
              <Route path="beta-v.0.1" element={<BetaPollPage />} />
              <Route path="encuesta" element={<SurveyPage />} />
              <Route path="citas" element={<VisitasPage />} />
              <Route path="autos" element={<VehicleListPage />} />
              <Route path="mis-aplicaciones" element={<UserApplicationsPage />} />
              <Route path="vende-tu-auto" element={<SellMyCarPage />} />
              
              {/* Admin-only routes nested under protected dashboard */}
              <Route element={<AdminRoute />}>
                <Route path="admin/leads" element={<AdminLeadsDashboardPage />} />
                <Route path="admin/client/:id" element={<AdminClientProfilePage />} />
                <Route path="admin/airtable" element={<AdminAirtableConfigPage />} />
                <Route path="admin/inspections" element={<AdminInspectionsListPage />} />
                <Route path="admin/inspections/:id" element={<AdminInspectionPage />} />
                <Route path="admin/vacantes" element={<AdminVacanciesPage />} />
                <Route path="admin/vacantes/:id/candidatos" element={<AdminCandidatesPage />} />
                <Route path="car-studio" element={<CarStudioPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;