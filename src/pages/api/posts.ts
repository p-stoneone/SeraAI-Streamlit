import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const client = await clientPromise;
      const db = client.db('myDatabase');
      const posts = await db
        .collection('posts')
        .find()
        .sort({ date: -1 }) // Sorting by date in descending order
        .toArray();
      res.json(posts);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  };
  
  export default handler;
