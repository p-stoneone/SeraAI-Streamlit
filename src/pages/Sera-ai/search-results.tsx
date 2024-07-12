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

interface Article {
  _id: string;
  date: string;
  title: string;
  Respondent: string;
}

const SearchResults = () => {
  const router = useRouter();
  const { q: query } = router.query; // Ensure the query parameter is correctly parsed
  const [displayArticles, setDisplayArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (query) {
      console.log("Query parameter:", query); // Debugging: Check the query parameter
      const fetchSearchResults = async () => {
        setLoading(true);
        setError(null); // Reset error before fetching
        try {
          const response = await fetch(`/api/SeraAI/searchArticles?q=${query}`);
          const data = await response.json();
          console.log("Fetched data:", data); // Debugging: Check the fetched data
          setDisplayArticles(data);
        } catch (error) {
          console.error("Error fetching search results:", error); // Debugging: Log any fetch errors
          setError("Failed to fetch search results");
        } finally {
          setLoading(false);
        }
      };
      fetchSearchResults();
    } else {
      console.log("Query parameter is missing"); // Debugging: Log when query parameter is missing
    }
  }, [query]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.loader}>
          <hr />
          <hr />
          <hr />
        </div>
      );
    }
    if (error) {
      return <div>Error: {error}</div>;
    }
    if (displayArticles.length === 0) {
      return (
        <div>
          <div className={styles.greet}>
            <p className={`${styles.animateFadeIn}`}>
              <span>Ohh! No article found</span>
            </p>
            <p className={`${styles.animateFadeIn} ${styles.animateFadeDelay}`}>No worries, you can explore our archive option.</p>
          </div>
        </div>
      );
    }
    return (
      <div className={styles.chat}>
        <div className={styles.articleContainer}>
          <div className={styles.cards}>
            {displayArticles.map((article, index) => (
              <div key={index} className={styles.card} onClick={() => router.push(`/Sera-ai/${article.date}/${article._id}`)}>
                {/* <p className={styles.truncatetext}>{article.title}</p> */}
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
    );
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/Sera-ai/search-results?q=${searchQuery}`;
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
                {renderContent()}
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

export default SearchResults;
