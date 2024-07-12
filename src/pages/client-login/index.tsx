import Layout from "@/components/Layout"; 
import Client from "@/components/Client";

export default function Home() {
    return (
      <Layout 
        title="Login | Seraphic Advisors - Client Portal"
        description="Access your Seraphic Advisors client portal. Login to manage your account, view case updates, and communicate with our legal team."
        keywords="Seraphic Advisors Client Login, Client Portal, Legal Services Login, Account Access, Manage Legal Account, Law Firm Client Portal, Case Updates"
      >
          <Client />
      </Layout>
    );
  }