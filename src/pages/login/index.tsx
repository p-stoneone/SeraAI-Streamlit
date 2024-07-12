import Layout from "@/components/Layout"; 
import SignIn from "@/components/SignIn";

export default function Home() {
    return (
      <Layout 
        title="Login | Seraphic Advisors - Associate Portal"
        description="Access your Seraphic Advisors associate portal. Login to manage your account, access dashboard services, and communicate with your clients cases."
        keywords="Seraphic Advisors Login, Associate Portal, Legal Services Login, Account Access, Manage Legal Account, Law Firm Portal, virtual dashboard services"
      >
          <SignIn />
      </Layout>
    );
  }