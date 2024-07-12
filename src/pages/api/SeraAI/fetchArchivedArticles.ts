    import { NextApiRequest, NextApiResponse } from 'next';
    import clientPromise from '../../../lib/mongodb';

    const fetchArchivedArticles = async (req: NextApiRequest, res: NextApiResponse) => {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and end date are required' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('myDatabase');
            const articles = await db.collection('SeraAI').find({
                date: {
                    $gte: startDate,
                    $lte: endDate
                }
            }).toArray();
            res.status(200).json(articles);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching archived articles' });
        }
    };

    export default fetchArchivedArticles;