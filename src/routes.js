import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import RentalList from './pages/RentalList';
import RentalForm from './pages/RentalForm';

const AppRoutes = () => {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute element={<Dashboard />} requiredPermission="view_dashboard" />
          }
        />
        <Route
          path="/rentals"
          element={
            <ProtectedRoute element={<RentalList />} requiredPermission="view_rentals" />
          }
        />
        <Route
          path="/rentals/new"
          element={
            <ProtectedRoute element={<RentalForm />} requiredPermission="create_rental" />
          }
        />
        <Route
          path="/rentals/edit/:id"
          element={
            <ProtectedRoute element={<RentalForm />} requiredPermission="edit_rental" />
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default AppRoutes;