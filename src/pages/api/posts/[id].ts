import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { id } = req.query;

    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI as string);
        const db = client.db('myDatabase');

        const post = await db.collection('posts').findOne({ _id: new ObjectId(id as string) }, {
            projection: {
                title: 1,
                thumbnail: 1,
                content: 1,
                author: 1,
                category: 1,
                youtube: 1,
                date: {
                    $dateToString: {
                        format: "%d %B %Y",
                        date: "$date",
                        timezone: "Asia/Kolkata"
                    }
                }
            }
        });

        client.close();

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        return res.status(200).json(post);
    } catch (error) {
        console.error("Error fetching post:", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}