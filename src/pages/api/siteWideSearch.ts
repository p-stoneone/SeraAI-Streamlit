import { NextApiRequest, NextApiResponse } from 'next';

const sitePages = [
  { keyword: 'about us, our company, team, seraphic', link: '/about-us', title: 'About Seraphic Advisors'},
  { keyword: 'blogs, articles, posts, news, insights', link: '/blogs', title: 'Blogs'},
  { keyword: 'careers, jobs, job, opportunities, vacancy, vacancies, recruitments, employment,work with us, hire, hiring', link: '/careers', title: 'Careers'},
  { keyword: 'client login, client access, client portal', link: '/client-login', title: 'Client Login'},
  { keyword: 'contact us, reach us, get in touch, support, hire, hiring, call, phone, email', link: '/contact-us', title: 'Contact Us'},
  { keyword: 'expertises, what we do, services, specialties', link: '/expertise', title: 'Our Expertise'},
  { keyword: 'intern login, intern access, intern portal', link: '/intern-login', title: 'Intern Login'},
  { keyword: 'login, sign in, access, associate login, associate access, associate portal', link: '/login', title: 'Assosciate Login'},
  { keyword: 'offices, locations, office locations, locate us, reach out, contact us, get in touch', link: '/offices', title: 'Our Offices'},
  { keyword: 'privacy policy, privacy, cookie policy, cookies policy, cookies', link: '/privacy-and-cookies/privacy', title: 'Privacy Policy'},
  { keyword: 'cookies policy, cookies, cookie policy, privacy policy, privacy', link: '/privacy-and-cookies/cookies', title: 'Cookies Policy'},
  { keyword: 'sera ai, serai, seraai, ai platform, article, summarizer ', link: '/Sera-ai', title: 'SeraAI'},
  { keyword: 'alumni login, alumni portal, alumni access', link: '/login', title: 'Alumni Login'},
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    return res.status(400).json([]);
  }
  
  const searchTerms = (q as string).toLowerCase().split(/\s+/);

  const results = sitePages.filter(page => {
    const pageKeywords = page.keyword.toLowerCase().split(/,\s*/);
    return searchTerms.some(term => 
      pageKeywords.some(keyword => keyword.includes(term))
    );
  });

  res.status(200).json(results);
}