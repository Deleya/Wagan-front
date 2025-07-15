// 📁 src/App.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ThemeWrapper from './component/chat/ThemeWrapper';
import ChatComponent from './component/chat/chatComponent';
import Home from './page/Home/home';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/chat',
    element: <ChatComponent />,
  },
]);

function App() {
  return (
    <ThemeWrapper>
      <RouterProvider router={router} />
    </ThemeWrapper>
  );
}

export default App;
