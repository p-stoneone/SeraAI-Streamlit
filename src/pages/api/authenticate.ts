import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { password } = req.body;

    if (password === process.env.BLOGS_PASSWORD) {
      res.status(200).json({ authorized: true });
    } else {
      res.status(401).json({ authorized: false });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}