import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import AntdProvider from '@/components/AntdProvider';
import { VocationalProvider } from '@/context/VocationalContext';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'VocatAI — Orientación Vocacional Inteligente',
  description:
    'Plataforma híbrida de orientación vocacional impulsada por IA. Descubre tu perfil RIASEC de forma interactiva.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <Script
          id="strip-extension-dom-attrs"
          strategy="beforeInteractive"
        >
          {`(function(){
    var ATTR = 'bis_skin_checked';
    function clean(){
      var nodes = document.querySelectorAll('[' + ATTR + ']');
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].removeAttribute(ATTR);
      }
    }
    clean();
    var observer = new MutationObserver(function(mutations){
      for (var i = 0; i < mutations.length; i++) {
        var mutation = mutations[i];
        if (mutation.type === 'attributes' && mutation.attributeName === ATTR && mutation.target) {
          mutation.target.removeAttribute(ATTR);
        }
      }
    });
    observer.observe(document.documentElement, {
      subtree: true,
      attributes: true,
      attributeFilter: [ATTR],
    });
    window.addEventListener('load', function(){
      observer.disconnect();
    }, { once: true });
  })();`}
        </Script>
        <VocationalProvider>
          <AntdProvider>{children}</AntdProvider>
        </VocationalProvider>
      </body>
    </html>
  );
}
