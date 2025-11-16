import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/tiptap/styles.css';
import '../styles/globals.css';

import React, { Suspense } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import GlobalLoadingOverlay from '@/components/GlobalLoading';
import { theme } from '../theme';

export const metadata = {
  title: 'Admin | Birokan',
  description: 'I am using Mantine with Next.js!',
  icons: {
    icon: 'favicon.ico',
  },
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <Notifications position="top-center" />
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
            <Suspense>{children}</Suspense>
          </GoogleOAuthProvider>
          <GlobalLoadingOverlay />
        </MantineProvider>
      </body>
    </html>
  );
}
