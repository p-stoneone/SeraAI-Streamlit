import Link from "next/link";
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router';
import { FaHome } from "react-icons/fa";
import Layout from "@/components/Layout";
import styles from '../../../styles/Whatwedo.module.css';

export default function Page() {
    const router = useRouter();
    const { id } = router.query;
    const [cards, setCards] = useState<{ title: string, description: string, whyUs: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/industries.txt')
            .then(response => response.text())
            .then(data => {
                const cardTexts = data.split('===').map(text => text.trim()).filter(Boolean);
                const cards = cardTexts.map(text => {
                    const [titleAndDescription, whyUs] = text.split('+++').map(part => part.trim());
                    const [title, description] = titleAndDescription.split('---').map(part => part.trim());
                    return { title, description, whyUs };
                });
                setCards(cards);
                setIsLoading(false);
            });
    }, []);

    const index = parseInt(id as string, 10) - 1;

    if (isLoading) {
        return (
            <div className="loader">
                <div className="three-body">
                    <div className="three-body__dot"></div>
                    <div className="three-body__dot"></div>
                    <div className="three-body__dot"></div>
                </div>
            </div>
        );
    }
    const card = cards[index];

    return (
        <Layout 
            title={card.title ? `${card.title} | Seraphic Advisors - Best Advertising and Product Liability Law Firms in India` : 'Seraphic Advisors - Best Advertising and Product Liability Law Firms in India'}
            description="Looking for Best Advertising and Product Liability Law Firms in India? visit Seraphic Advisors - Top Products Liability Lawyers and Advocates in Delhi, handle all legal matters related to Advertising and Product"
            keywords="Best Advertising and Product Liability Law Firms in Delhi, Top Products Liability Lawyers Delhi, India"
        >
            <div className={`bg-light ${styles.about}`}>
                <div className={`align-items-center ${styles.bcrumb}`}>
                    <small className="text-muted">
                        <FaHome className="me-2"/>
                        <Link href="/" className={`text-reset text-decoration-none me-1 ${styles.link}`}>Home</Link>
                         <span className='me-1'>/</span> 
                         <Link href="/expertise" className={`text-reset text-decoration-none me-1 ${styles.link}`}>Industries</Link>
                        <span className='me-1'>/</span> 
                        {card ? card.title : ''}
                    </small>
                </div>
                <h1>Our Expertise</h1>
                <section className={styles.aboutadd}>
                    <div>
                        <h3 className='fw-bold'> <span className='fw-bolder uppercase-text'>| </span> {card ? card.title : ''}</h3>
                        <p className='text-grey my-3 me-5'>
                            {card ? card.description : ''}
                        </p>
                    </div>
                    <div className='py-3'>
                        <h3>{card ? card.whyUs ? 'Why us' : '' : ''}</h3>
                        <p className='text-grey my-3 me-5'>
                            {card ? card.whyUs : ''}
                        </p>
                    </div>
                </section>
            </div>
        </Layout>
    );
}
