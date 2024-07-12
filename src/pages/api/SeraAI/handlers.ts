// api/SeraAI/handlers.ts
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Server-side cache
const serverCache: { [key: string]: { data: any; timestamp: number } } = {};

const fetchFromDB = async (key: string, dbQuery: () => Promise<any>) => {
  // console.log(`Cache miss for ${key}, fetching data from DB`);
  const data = await dbQuery();
  serverCache[key] = { data, timestamp: Date.now() };
  return data;
};

export const fetchRecentDates = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const client = await clientPromise;
    const db = client.db('myDatabase');

    const cacheKey = 'recentDates';
    let data;

    if (serverCache[cacheKey] && Date.now() - serverCache[cacheKey].timestamp < CACHE_DURATION) {
      // console.log(`Server cache hit for ${cacheKey}`);
      data = serverCache[cacheKey].data;
    } else {
      data = await fetchFromDB(cacheKey, async () => {
        const uniqueDates = await db.collection('SeraAI').aggregate([
          { $group: { _id: "$date" } },
          { $sort: { _id: -1 } },
          { $limit: 6 }
        ]).toArray();
        return uniqueDates.map(item => item._id.split('T')[0]);
      });
    }

    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({ data, timestamp: Date.now() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch recent dates' });
  }
};

export const fetchRecentArticles = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const limit = parseInt(req.query.limit as string) || 1;
    const client = await clientPromise;
    const db = client.db('myDatabase');

    const cacheKey = `recentArticles-${limit}`;
    let data;

    if (serverCache[cacheKey] && Date.now() - serverCache[cacheKey].timestamp < CACHE_DURATION) {
      // console.log(`Server cache hit for ${cacheKey}`);
      data = serverCache[cacheKey].data;
    } else {
      data = await fetchFromDB(cacheKey, async () => {
        return await db.collection('SeraAI').find({})
          .sort({ date: -1 })
          .limit(limit)
          .toArray();
      });
    }

    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({ data, timestamp: Date.now() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching recent articles' });
  }
};