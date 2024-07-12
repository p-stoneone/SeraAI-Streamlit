import Layout from "@/components/Layout"; 
import Expertise from "@/components/Expertise";

export default function Home() {
    return (
      <Layout 
        title="What We Do | Seraphic Advisors - Corporate Legal Services in Delhi, India"
        description="Discover the areas of expertise at Seraphic Advisors. We provide comprehensive corporate legal services in Delhi, ensuring top-notch legal solutions for our clients."
        keywords="Seraphic Advisors Expertise, Corporate Legal Services, Legal Expertise Delhi, Corporate Law Firm Services, Best Legal Solutions, Top Lawyers in Delhi"
      >
        <Expertise />      
      </Layout>
    );
  }