import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '@/styles/expertise.module.css';

import SideImage from '../assets/gabriel-ramos-zNiGprYuvXA-unsplash.jpg'
import Link from 'next/link';

const Expertise = () => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const [practicesOptions, setPractice] = useState<{ title: string, description: string, whyUs: string }[]>([]);

    useEffect(() => {
        fetch('/practices.txt')
            .then(response => response.text())
            .then(data => {
                const practiceTexts = data.split('===').map(text => text.trim()).filter(Boolean);
                const practicesOptions = practiceTexts.map(text => {
                    const [titleAndDescription, whyUs] = text.split('+++').map(part => part.trim());
                    const [title, description] = titleAndDescription.split('---').map(part => part.trim());
                    return { title, description, whyUs };
                });
                setPractice(practicesOptions);
            });
    }, []);
    
    const [industriesOptions, setIndustry] = useState<{ title: string, description: string, whyUs: string }[]>([]);

    useEffect(() => {
        fetch('/industries.txt')
            .then(response => response.text())
            .then(data => {
                const industryTexts = data.split('===').map(text => text.trim()).filter(Boolean);
                const industriesOptions = industryTexts.map(text => {
                    const [titleAndDescription, whyUs] = text.split('+++').map(part => part.trim());
                    const [title, description] = titleAndDescription.split('---').map(part => part.trim());
                    return { title, description, whyUs };
                });
                setIndustry(industriesOptions);
            });
    }, []);

    const handleOptionClick = (option: string) => {
        setSelectedOption(option);
    };

    const handleCategoryClick = () => {
        setSelectedOption(null);
    };


    return (
        <div className={`${styles.container} row`}>
            <div className={`${styles.expertise} col-md-8`}>
                <div className={`display-2 mb-1 ${styles.title}`}>
                    What We Do
                </div>
                <div className={`display-6 ${styles.subtitle}`}>
                    We share your expectation for the exceptional
                </div>
                <section className={`${styles.section}`}>
                    <div className={`${styles.buttons}`}>
                        {selectedOption === null && (
                            <>
                                <div>
                                    <button className={`btn p-0 ${styles.secondaryBtn} ${styles.effty}`}>BROWSE BY</button>
                                </div>
                                <button className={`btn ${styles.primaryBtn} fs-5`} onClick={() => handleOptionClick('practices')}>Practices</button>
                                <button className={`btn ${styles.primaryBtn} fs-5`} onClick={() => handleOptionClick('industries')}>Industries</button>
                            </>
                        )}
                        {selectedOption !== null && (
                            <>
                                <button className={`btn p-0 ${styles.secondaryBtn}`} onClick={handleCategoryClick}>CATEGORIES + |</button>
                                <button className={`btn ${styles.secondaryBtn}`}>{selectedOption.toUpperCase()}</button>
                            </>
                        )}
                        <div className={styles.options}>
                            {selectedOption === 'practices' && practicesOptions.map((practice, index) => (
                                <Link key={index} href={`/expertise/practice/${index + 1}`}>
                                    <button key={index} className={`btn p-3 ${styles.tertiaryBtn}`}>{practice.title}</button>
                                </Link>
                            ))}
                            {selectedOption === 'industries' && industriesOptions.map((industry, index) => (
                                <Link key={index} href={`/expertise/industry/${index + 1}`}>
                                    <button key={index} className={`btn ${styles.tertiaryBtn}`}>{industry.title}</button>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
            <div className={`col-md-4 ${styles.Img}`}>
                <Image className='img-fluid' src={SideImage.src} alt="Image Description" width={500} height={450}
                />
            </div>
        </div>
    );
};

export default Expertise;
