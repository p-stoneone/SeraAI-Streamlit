import { GetStaticProps } from 'next';
import { MongoClient } from 'mongodb';
import Blog from "@/components/Blog";
import Layout from '@/components/Layout';

interface Post {
    _id: string;
    title: string;
    date: string;
    thumbnail?: string;
    content: string;
    category?: string;
}

interface BlogProps {
    posts: Post[];
}

const Home: React.FC<BlogProps> = ({ posts }) => {
    return (
      <Layout 
        title="Our Blogs | Seraphic Advisors - Insights & Updates on Legal Trends"
        description="Explore our blog for the latest insights and updates on legal trends, industry news, and expert advice from Seraphic Advisors. Stay informed with articles covering a wide range of topics in the legal field."
        keywords="Legal blog, Seraphic Advisors blog, legal insights, legal trends, industry news, expert legal advice, legal articles, law firm blog"
      >
        <Blog posts={posts}/>
      </Layout>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const client = await MongoClient.connect(process.env.MONGODB_URI as string);
    const db = client.db('myDatabase');
    const posts = await db.collection('posts').find().sort({ date: -1 }).toArray();
    client.close();

    return {
        props: {
            posts: JSON.parse(JSON.stringify(posts)),
        },
        revalidate: 86400, // Revalidate every - 2 hours(7200seconds); 24hours - 86400
    };
};

export default Home;
