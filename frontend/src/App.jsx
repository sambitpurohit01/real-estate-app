import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import AgentChat from './components/AgentChat';
import AppIntro from './components/AppIntro';
import PageTransition from './components/PageTransition';

import Home from './pages/Home';
import PropertyDetail from './pages/PropertyDetail';
import PropertyForm from './pages/PropertyForm';
import Login from './pages/Login';
import Register from './pages/Register';
import MyListings from './pages/MyListings';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import NotFound from './pages/NotFound';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/properties/:id" element={<PageTransition><PropertyDetail /></PageTransition>} />
        <Route
          path="/properties/new"
          element={
            <PrivateRoute>
              <PageTransition><PropertyForm mode="create" /></PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/properties/:id/edit"
          element={
            <PrivateRoute>
              <PageTransition><PropertyForm mode="edit" /></PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/my-listings"
          element={
            <PrivateRoute>
              <PageTransition><MyListings /></PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <PrivateRoute>
              <PageTransition><Favorites /></PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <PageTransition><Profile /></PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <PrivateRoute>
              <PageTransition><Messages /></PageTransition>
            </PrivateRoute>
          }
        />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppIntro />
      <BrowserRouter>
        <Navbar />
        <AnimatedRoutes />
        <Footer />
        <AgentChat />
      </BrowserRouter>
    </AuthProvider>
  );
}
