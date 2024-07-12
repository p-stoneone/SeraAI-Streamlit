import { GetStaticProps } from 'next';
import { MongoClient } from 'mongodb';
import BlogScroll from "@/components/BlogScroll";
import SlideShow from "@/components/SlideShow";
import Layout from "@/components/Layout";

interface Post {
  _id: string;
  title: string;
  date: string;
  thumbnail?: string;
  content: string;
  category?: string;
}

interface HomeProps {
  posts: Post[];
}

const Home: React.FC<HomeProps> = ({ posts }) => {
  return (
    <Layout 
      title="Seraphic Advisors | Best Corporate Law Firm in Delhi, Top Lawyers and Advocates in Delhi, India"
      scroll_func={true} 
    >
      <SlideShow />
      <BlogScroll posts={posts} />
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const client = await MongoClient.connect(process.env.MONGODB_URI as string);
  const db = client.db('myDatabase');
  const posts = await db.collection('posts').find().sort({ date: -1 }).limit(6).toArray();

  client.close();

  return {
    props: {
      posts: JSON.parse(JSON.stringify(posts)),
    },
    revalidate: 86400, // Revalidate every 24 hours
  };
};

export default Home;
