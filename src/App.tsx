// 📁 src/App.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ThemeWrapper from './component/chat/ThemeWrapper';
import ChatComponent from './component/chat/chatComponent';
import Home from './page/Home/home';

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
        path: '',
        element: <UsersList />,
      },
      {
        path: 'dashboard',
        element: <AdminDashboard />,
      }
    ]
  }
]);

function App() {
  return (
    <ThemeWrapper>
      <RouterProvider router={router} />
    </ThemeWrapper>
  );
}

export default App;
