import "@/styles/styles.scss";
import type { AppProps } from "next/app";
import Script from "next/script";
import '@/styles/About.module.css';
import '@/styles/BlogScroll.module.css';
import '@/styles/CardDesign.module.css';
import '@/styles/Careers.module.css';
import '@/styles/Consent.module.css';
import '@/styles/Contact.module.css';
import '@/styles/EditPostPage.module.css';
import '@/styles/expertise.module.css';
import '@/styles/Nav.module.css';
import '@/styles/Newsletter.module.css'
import '@/styles/PostPage.module.css';
import '@/styles/SeraAI.module.css';
import '@/styles/sidebar.module.css';
import '@/styles/SideSearch.module.css';
import '@/styles/Whatwedo.module.css'
import './App.css';


export default function App({ Component, pageProps }: AppProps) {
  return(
    <>
      <Script strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-S5J66J312X" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-S5J66J312X');
        `}
      </Script>
      <Component {...pageProps} />
    </>
  ); 
}
