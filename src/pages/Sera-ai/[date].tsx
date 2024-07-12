import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import ReturnSeraphic from '@/components/buttons/ReturnSeraphic';
import styles from "@/styles/SeraAI.module.css";
import balance_icon from "@/assets/icon/balance_icon.png";
import bulb_icon from "@/assets/icon/bulb_icon.png";
import collar_icon from "@/assets/icon/collar_icon.png";
import gavel_icon from "@/assets/icon/gavel_icon.png";
import send_icon from "@/assets/icon/send_icon.png";

const DatePage = () => {
    const router = useRouter();
    const { date } = router.query;
    const [displayArticles, setDisplayArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (date) {
            const fetchArticlesByDate = async () => {
                setLoading(true);
                const response = await fetch(`/api/SeraAI/fetchArchivedArticles?startDate=${date}&endDate=${date}`);
                const data = await response.json();
                if (data.length === 0) {
                    router.push(`/Sera-ai/404?date=${date}`);
                } else {
                    setDisplayArticles(data);
                }
                setLoading(false);
            };
            fetchArticlesByDate();
        }
    },  [date, router]); 

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
        <div className="d-flex flex-row vh-100">
            <Sidebar />
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
                    {loading ? (
                        <div className={styles.loader}>
                            <hr />
                            <hr />
                            <hr />
                        </div>
                    ) : (
                        <div className={styles.chat}>
                            <div className={styles.articleContainer}>
                                <div className={styles.cards}>
                                    {displayArticles.map((article, index) => (
                                        <div key={index} className={styles.card} onClick={() => router.push(`/Sera-ai/${date}/${article._id}`)}>
                                            <p className={styles.truncatetext}>{article.Respondent}</p>
                                            <span className={styles.articleDate}>{formatDate(article.date)}</span>
                                            <Image src={
                                                [gavel_icon.src, collar_icon.src, balance_icon.src, bulb_icon.src][index % 4]
                                            } alt="" width={35} height={35} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
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
        </div>
    );
};

export default DatePage;