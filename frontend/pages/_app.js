import '../styles/globals.css';
import { useEffect } from 'react';
import { useAuthStore } from '../context/store';
import { ThemeProvider } from '../context/ThemeContext';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }) {
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    initAuth();
  }, []);

  return (
    <ThemeProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#282828',
            color:      '#fff',
            border:     '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}