import { Routes, Route } from 'react-router-dom';

import SchedulePage from '../pages/schedule/SchedulePage';
import HomePage from '../pages/home/HomePage';
import NewsPage from '../pages/news/NewsPage';

import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import PrivateRoute from '../PrivateRoute';
import LoginWrapper from '../pages/auth/Login';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={
        <AuthLayout>
          <LoginWrapper />
        </AuthLayout>
      } />

      {/* Private routes */}
      <Route path="/" element={
        <PrivateRoute>
          <MainLayout>
            <HomePage />
          </MainLayout>
        </PrivateRoute>
      } />

      <Route path="/news" element={
        <PrivateRoute>
          <MainLayout>
            <NewsPage />
          </MainLayout>
        </PrivateRoute>
      } />

      <Route path="/schedules" element={
        <PrivateRoute>
          <MainLayout>
            <SchedulePage />
          </MainLayout>
        </PrivateRoute>
      } />
    </Routes>
  );
};

export default AppRoutes;
