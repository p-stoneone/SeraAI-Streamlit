import Layout from "@/components/Layout"; 
import Intern from "@/components/Intern";

export default function Home() {
    return (
      <Layout 
        title="Login | Seraphic Advisors - Intern Portal"
        description="Access your Seraphic Advisors intern portal. Login to manage your account, access dashboard services, and communicate with your clients cases. Access your work updates and internship tasks"
        keywords="Seraphic Advisors Intern Login, Intern Portal, Legal Services Intern Login, Account Access, Manage Intern Account, virtual dashboard services, Intern dashboard"
      >
          <Intern />
      </Layout>
    );
  }