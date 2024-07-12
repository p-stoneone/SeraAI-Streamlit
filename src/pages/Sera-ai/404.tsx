import { useEffect, useState } from 'react';
import Head from "next/head";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Sidebar from "@/components/Sidebar";
import ReturnSeraphic from '@/components/buttons/ReturnSeraphic';
import styles from '@/styles/SeraAI.module.css';
import send_icon from "@/assets/icon/send_icon.png";

const NoArticleFound = () => {
    const router = useRouter();
    const { date } = router.query;
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/Sera-ai/search-results?q=${searchQuery}`);
        } else {
            console.error("Search query is empty");
        }
    };

    console.log("Date:", date);

  return (
    <>
      <Head>
        <title>Seraᵃᶦ - 404 No Article Found | Seraphic Advisors</title>
        <meta name="description" content="SeraAI provides succinct summaries of Supreme Court daily judgments. Stay updated with concise legal insights with our Seraᵃᶦ. Try SeraAI today!" />
        <meta name="keywords" content="SeraAI, Error 404 Page, Supreme Court daily judgments, Supreme Court judgments, SeraAI chatbot, Sera ai seraphic advisors" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
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
            <div className={styles.mainTop}>
              <div className={styles.greet}>
                  <p className={`${styles.animateFadeIn}`}>
                  <span>Ohh! No article found on {date}</span>
                  </p>
                  <p className={`${styles.animateFadeIn} ${styles.animateFadeDelay}`}>No worries, you can still explore some in recent articles.</p>
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
      </div>
    </>
  );
};

export default NoArticleFound;