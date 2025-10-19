import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import '../index.css';
import { AuthProvider } from './context/AuthContext';
import { VehicleProvider } from './context/VehicleContext';
import { FilterProvider } from './context/FilterContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      refetchOnWindowFocus: true,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      networkMode: 'online',
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <FilterProvider>
              <VehicleProvider>
                <App />
              </VehicleProvider>
            </FilterProvider>
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>>
  </React.StrictMode>
);