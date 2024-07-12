import About from "@/components/About";
import Layout from "@/components/Layout"; 

  export default function Home() {
    return (
      <Layout 
        title="About Us | Seraphic Advisors - Leading Corporate Law Firm in Delh"
        description="Seraphic Advisors is a multi-specialised corporate law firm in India providing practical legal solutions to their domestic and international clients. Learn more about Seraphic Advisors, the leading corporate law firm in Delhi. Discover our mission, values, and the expertise of our legal team."
        keywords="Seraphic Advisors, About Seraphic Advisors, Corporate Law Firm in Delhi, Best Lawyers in Delhi, Law Firm Mission, Legal Team Delhi, Legal Team India"
      >
          <About />
      </Layout>
    );
  }