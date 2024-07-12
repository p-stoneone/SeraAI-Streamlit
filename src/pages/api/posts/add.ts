import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { _id, date, title, thumbnail, youtube, category, content, author, password } = req.body;

        if (password !== process.env.BLOGS_PASSWORD) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const client = await MongoClient.connect(process.env.MONGODB_URI as string);
        const db = client.db('myDatabase');

        await db.collection('posts').insertOne({
            _id: new ObjectId(_id), // Convert to ObjectId
            date: new Date(date),
            title,
            thumbnail,
            youtube,
            category,
            content,
            author,
        });

        client.close();

        res.status(200).json({ message: 'Post added successfully' });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
