import Head from "next/head";
import { ReactNode } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ConsentPopup from "@/components/ConsentPopup";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
  scroll_func?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = "Seraphic Advisors",
  description = "Looking for Legal Services in India? Visit Seraphic Advisors - Best Corporate Law Firm in Delhi.",
  keywords = "Best Corporate Law Firms in Delhi, Top Lawyers in Delhi, Best Lawyers in Delhi, Best Advocates in Delhi, Top Advocates in Delhi, Legal Consultant in Delhi, Legal Firm in Delhi, Best Attorney in India, Seraphic Advisors, Seraphic India, Seraphic Law Firm",
  scroll_func = false,
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content={keywords} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content="https://www.seraphicadvisors.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Seraphic Advisors",
            "url": "https://www.seraphicadvisors.com",
            "logo": "https://www.seraphicadvisors.com/logo.png",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+91-9810579180",
              "contactType": "Customer Service"
            }
          }
        `}
        </script>
      </Head>
      <Nav scroll_func={scroll_func} /> 
      <main>{children}</main>
      <Footer />
      <ConsentPopup />
    </>
  );
};

export default Layout;
