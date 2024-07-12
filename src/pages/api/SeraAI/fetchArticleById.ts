import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

const fetchArticleById = async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: 'Article ID is required' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('myDatabase');
        const article = await db.collection('SeraAI').findOne({ _id: new ObjectId(id as string) });

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        res.status(200).json(article);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching article' });
    }
};

export default fetchArticleById;
