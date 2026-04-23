import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AppLayout } from '@/components/common/AppLayout'
import { LoginPage } from '@/features/auth/LoginPage'
import { BoardPage } from '@/features/board/BoardPage'
import { MetricsPage } from '@/features/metrics/MetricsPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <BoardPage />,
      },
      {
        path: 'board',
        element: <BoardPage />,
      },
      {
        path: 'board/:ticketId',
        element: <BoardPage />,
      },
      {
        path: 'metrics',
        element: <MetricsPage />,
      },
    ],
  },
])
