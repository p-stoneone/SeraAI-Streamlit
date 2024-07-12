import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { fetchWithCache } from '../utils/clientCache';
import Image from "next/image";
import Link from "next/link";
import ReturnSeraphic from './buttons/ReturnSeraphic';
import styles from '@/styles/SeraAI.module.css';
import send_icon from "@/assets/icon/send_icon.png";
import gavel_icon from "@/assets/icon/gavel_icon.png";
import collar_icon from "@/assets/icon/collar_icon.png";
import balance_icon from "@/assets/icon/balance_icon.png";
import bulb_icon from "@/assets/icon/bulb_icon.png";

interface Article {
    _id: string;
    date: string;
    title: string;
    Respondent: string;
}

const SeraAI: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isTabletOrMobile, setIsTabletOrMobile] = useState(false);
    const [isSmallMobile, setIsSmallMobile] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchRecentArticles = async (limit: number) => {
            const { data } = await fetchWithCache(`/api/SeraAI/recentArticles?limit=${limit}`);
            setArticles(data);
        };

        const handleResize = () => {
            setIsTabletOrMobile(window.innerWidth <= 1024);
            setIsSmallMobile(window.innerWidth <= 556);

            const limit = window.innerWidth <= 556 ? 2 : (window.innerWidth <= 1024 ? 8 : 4);
            fetchRecentArticles(limit);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleCardClick = (article: Article) => {
        const date = new Date(article.date).toISOString().split('T')[0];
        router.push(`/Sera-ai/${date}/${article._id}`); 
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/Sera-ai/search-results?q=${searchQuery}`);
        } else {
            console.error("Search query is empty");
        }
    };

    const formatDate = (date: string) => {
        const [year, month, day] = date.split('-');
        return `${day}-${month}-${year}`;
    };

    return (
        <div className={styles.main}>
            <div className={styles.nav}>
                <p className='mt-0'>
                    <Link href="/Sera-ai" className='text-reset text-decoration-none'>
                        Sera <sup>ai</sup>
                    </Link>
                </p>
                <div className='d-flex'>
                    <ReturnSeraphic />
                </div>
            </div>
            <div className={styles.mainContainer}>
                <div className={styles.mainTop}>
                    <div className={styles.greet}>
                        <p className={`${styles.animateFadeIn}`}>
                            <span>Welcome to Ser<span data-title="a">ai</span></span>
                        </p>
                        <p className={`${styles.animateFadeIn} ${styles.animateFadeDelay}`}>How Can We Assist You Today?</p>
                    </div>
                    <div className={`${styles.cards} ${styles.animateFadeIn} ${styles.animateFadeDelay}`}>
                        {articles.map((article, index) => (
                            <div key={index} className={`${styles.card}`} onClick={() => handleCardClick(article)}>
                                <p className={styles.truncatetext}>{article.Respondent}</p>
                                <span className={styles.articleDate}>{formatDate(article.date)}</span>
                                <Image src={
                                    [gavel_icon.src, collar_icon.src, balance_icon.src, bulb_icon.src][index % 4]
                                } alt="" width={35} height={35} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.mainBottom}>
                    <form onSubmit={handleSearch}>
                        <div className={`${styles.searchBox} ${styles.growOnFocus} ${styles.animateFadeIn} ${styles.animateFadeDelay}`}>
                            <input
                                type="text"
                                placeholder="Enter your prompt here"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div>
                                <button type='submit' className='border-0 bg-transparent'>
                                    <Image src={send_icon.src} alt="" width={25} height={25} />
                                </button>
                            </div>
                        </div>
                    </form>
                    <div className={styles.bottomInfo}>
                        <p>
                            Sera<sup>ai</sup> may display inaccurate info, including about people or hearing, so double-check its responses.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeraAI;