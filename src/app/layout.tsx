import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import AntdProvider from '@/components/AntdProvider';
import { ThemeProvider } from '@/context/ThemeContext';
import { VocationalProvider } from '@/context/VocationalContext';
import { getUICopy } from '@/lib/ui-copy';
import './globals.css';

const initThemeScript = `(function(){
  var key = 'vocatai-theme';
  var root = document.documentElement;
  var saved = null;
  try {
    saved = window.localStorage.getItem(key);
  } catch (e) {
    saved = null;
  }
  var theme = saved === 'dark' || saved === 'light' ? saved : 'light';
  root.setAttribute('data-theme', theme);
})();`;

const stripExtensionAttrsScript = `(function(){
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
})();`;

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const uiCopy = getUICopy('es');

export const metadata: Metadata = {
  title: uiCopy.layoutMetadataTitle,
  description: uiCopy.layoutMetadataDescription,
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
      <head>
        <script
          id="init-theme"
          dangerouslySetInnerHTML={{ __html: initThemeScript }}
        />
        <script
          id="strip-extension-dom-attrs"
          dangerouslySetInnerHTML={{ __html: stripExtensionAttrsScript }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <VocationalProvider>
            <AntdProvider>{children}</AntdProvider>
          </VocationalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
