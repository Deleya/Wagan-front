// 📁 src/App.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ThemeWrapper from './component/chat/ThemeWrapper';
import ChatComponent from './component/chat/chatComponent';
import Home from './page/Home/home';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './page/hooks/hooks';
import { fetchUserProfile, logout } from './page/auth/authSlice';

import Login from './page/auth/Login';
import Register from './page/auth/Register';
import ForgotPassword from './page/auth/ForgotPassword';
import ResetPasswordConfirm from './page/auth/ResetPasswordConfirm';
import GoogleCallback from './page/auth/GoogleCallback';
import RequireAdmin from './component/auth/RequireAdmin';
import UsersList from './page/admin/UsersList';

import AdminDashboard from './page/admin/AdminDashboard';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/chat',
    element: <ChatComponent />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password/:uid/:token',
    element: <ResetPasswordConfirm />,
  },
  {
    path: '/auth/google',
    element: <GoogleCallback />,
  },
  // Routes protégées pour l'Admin
  {
    path: '/admin',
    element: <RequireAdmin />,
    children: [
      {
        path: '',           // /admin → Dashboard CRM (page par défaut)
        element: <AdminDashboard />,
      },
      {
        path: 'dashboard',  // /admin/dashboard → Alias pour compatibilité
        element: <AdminDashboard />,
      },
      {
        path: 'users',      // /admin/users → Liste des inscrits Wagan
        element: <UsersList />,
      },
    ]
  }
]);

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, status } = useAppSelector(s => s.auth);

  useEffect(() => {
    if (isAuthenticated && !user && status !== 'loading') {
      dispatch(fetchUserProfile()).unwrap().catch(() => {
        dispatch(logout());
      });
    }
  }, [isAuthenticated, user, status, dispatch]);

  return (
    <ThemeWrapper>
      <RouterProvider router={router} />
    </ThemeWrapper>
  );
}

export default App;
