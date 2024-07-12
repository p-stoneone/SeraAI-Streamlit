import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const client = await clientPromise;
        const db = client.db('myDatabase');
        const collection = db.collection('posts');

        const query = req.query.q as string;

        const searchResults = await collection.aggregate([
            {
                $search: {
                    index: "blogs_search",
                    text: {
                        query: query,
                        path: ["title", "content"]
                    }
                }
            },  
            {
                $limit: 9
            }
        ]).toArray();

        res.status(200).json(searchResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export default handler;
