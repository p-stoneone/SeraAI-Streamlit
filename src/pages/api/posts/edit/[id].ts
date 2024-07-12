import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'PUT') {
        const { id } = req.query;
        const { title, thumbnail, youtube, category, author, content, password } = req.body;

        if (password !== process.env.BLOGS_PASSWORD) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const client = await MongoClient.connect(process.env.MONGODB_URI as string);
        const db = client.db('myDatabase');

        await db.collection('posts').updateOne(
            { _id: new ObjectId(id as string) },
            { $set: { title, thumbnail, youtube, category, author, content } }
        );

        client.close();

        res.status(200).json({ message: 'Post updated successfully' });
    } else {
        res.setHeader('Allow', ['PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
