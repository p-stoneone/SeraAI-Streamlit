import Layout from "@/components/Layout"; 
import Offices from "@/components/Office";

export default function Home() {
    return (
      <Layout 
        title="Our Offices | Seraphic Advisors - Corporate Law Firm Locations"
        description="Find the locations of Seraphic Advisors offices in New Delhi, Gurugram, and Mumbai. Contact us for expert legal services across India."
        keywords="Seraphic Advisors Offices, Law Firm Locations, New Delhi Office, Gurugram Office, Mumbai Office, Contact Seraphic Advisors, Legal Services India"
      >
          <Offices />
      </Layout>
    );
  }