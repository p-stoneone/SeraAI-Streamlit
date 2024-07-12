import Head from "next/head";
import Sidebar from "@/components/Sidebar";
import SeraAI from '@/components/SeraAI';

const Home = () => {
  return (
    <>
      <Head>
        <title>Seraᵃᶦ - Supreme Court Daily Judgment Summaries | Seraphic Advisors</title>
        <meta name="description" content="SeraAI provides succinct summaries of Supreme Court daily judgments. Stay updated with concise legal insights with our Seraᵃᶦ. Try SeraAI today!" />
        <meta name="keywords" content="SeraAI, Supreme Court daily judgments, Supreme Court judgments, legal insights, legal summaries, Legal judgment insights, legal updates, legal news, legal blog, legal articles, legal research, legal technology, legal tech, Seraphic Advisors, AI powered legal chatbot, Concise legal updates, Daily court decisions, Legal case briefs, SeraAI chatbot, Sera ai seraphic advisors, Court rulings in brief" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="d-flex flex-row vh-100">
        <Sidebar />
        <SeraAI />
      </div>
    </>
  );
};

export default Home;
