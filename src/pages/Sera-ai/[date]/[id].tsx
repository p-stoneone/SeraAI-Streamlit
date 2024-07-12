import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import ReturnSeraphic from '@/components/buttons/ReturnSeraphic';
import ShareSocial from '@/components/buttons/ShareSocial';
import useTypingEffect from '@/components/useTypingEffect';
import styles from "@/styles/SeraAI.module.css";
import send_icon from "@/assets/icon/send_icon.png";

const ArticlePage = () => {
    const router = useRouter();
    const { date, id } = router.query;
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (id) {
            const fetchArticleById = async () => {
                setLoading(true);
                const response = await fetch(`/api/SeraAI/fetchArticleById?id=${id}`);
                const data = await response.json();
                setArticle(data);
                setLoading(false);
            };
            fetchArticleById();
        }
    }, [id]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/Sera-ai/search-results?q=${searchQuery}`);
        } else {
          console.error("Search query is empty");
        }
    };

    const typingSpeed = 10;

    const title = useTypingEffect(article?.title || '', typingSpeed);
    const CA = useTypingEffect(article?.CA || '', typingSpeed);
    const Respondent = useTypingEffect(article?.Respondent || '', typingSpeed);
    const background = useTypingEffect(article?.background || '', typingSpeed);
    const chronology = useTypingEffect(article?.chronology.join('\n') || '', typingSpeed);
    const keyPoints = useTypingEffect(article?.key_points.join('\n') || '', typingSpeed);
    const conclusion = useTypingEffect(article?.conclusion.join('\n') || '', typingSpeed);
    const Judgment_By = useTypingEffect(article?.Judgment_By.join('\n') || '', typingSpeed);

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

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
                        <div className={`${styles.chat} px-2`}>
                            <div className={styles.articleContainer}>
                                {article && (
                                    <>
                                        <div className={styles.userPrompt}>
                                            <p className='fw-bold fs-3'>{title}</p>
                                        </div>
                                        <div className={styles.saiResponse}>
                                            <p><strong>Case Number</strong> {CA}</p>
                                            <p><strong>Petitioner / Respondent:</strong> {Respondent}</p>
                                            <p><strong>Background:</strong> {background}</p>
                                            <p><strong>Chronology of Events:</strong></p>
                                            <ul>
                                                {chronology.split('\n').map((event: string, index: number) => (
                                                    <li key={index}>{event}</li>
                                                ))}
                                            </ul>
                                            <p><strong>Key Legal Points:</strong></p>
                                            <ul>
                                                {keyPoints.split('\n').map((point: string, index: number) => (
                                                    <li key={index}>{point}</li>
                                                ))}
                                            </ul>
                                            <p><strong>Conclusion:</strong></p>
                                            <div>
                                                {conclusion.split('\n').map((point: string, index: number) => (
                                                    <p key={index}>{point}</p>
                                                ))}
                                            </div>
                                            <p><strong>Bench:</strong></p>
                                            <ul>
                                                {Judgment_By.split('\n').map((point: string, index: number) => (
                                                    <li key={index}>{point}</li>
                                                ))}
                                            </ul>
                                            <div className="mt-4">
                                                <ShareSocial url={shareUrl} title={article.title} />
                                            </div>
                                        </div>
                                    </>
                                )}
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

export default ArticlePage;
