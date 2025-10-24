import { createBrowserRouter } from "react-router-dom";
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import App from '@/App';
import { HomePage } from '@/pages/HomePage';
import { InventoryLogPage } from '@/pages/InventoryLogPage';
import { SummaryPage } from '@/pages/SummaryPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { LoginPage } from '@/pages/LoginPage';
import { CakeStatusPage } from '@/pages/CakeStatusPage';
import { LiveOperationsPage } from '@/pages/LiveOperationsPage';
import { DocumentationPage } from '@/pages/DocumentationPage';
export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "log",
        element: <InventoryLogPage />,
      },
      {
        path: "summary",
        element: <SummaryPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "cake-status",
        element: <CakeStatusPage />,
      },
      {
        path: "live-operations",
        element: <LiveOperationsPage />,
      },
      {
        path: "documentation",
        element: <DocumentationPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
]);