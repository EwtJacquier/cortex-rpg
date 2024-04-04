'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import { AppProvider } from '../context/app-context';
import { Montserrat, Saira_Condensed } from 'next/font/google';
import theme from './theme';
import './globals.css'

const montserrat = Saira_Condensed({
  subsets: ['latin'],
  weight: ['200','300','400','500','600','700','900'],
  display: 'swap',
  variable: '--font-montserrat'
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <script src="/js/cannon.min.js"></script>
        <script src="/js/three.min.js"></script>
        <script src="/js/teal.js"></script>
        <script src="/js/dice.js"></script>
        <script src="/js/dice_custom.js"></script>
      </head>
      <body className={montserrat.variable}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <AppProvider>
              {children}
            </AppProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
