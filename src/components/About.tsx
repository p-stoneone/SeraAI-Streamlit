import React from 'react';
import Image from 'next/image';
import styles from '@/styles/About.module.css';
import leftsvg from '@/assets/gwxvwqwxyhblycyx9i4.svg'
import rightsvg from '@/assets/lwfjgtsvxvlycyvx1t.svg';

const About: React.FC = () => {
    return (
        <div className={`bg-light ${styles.about}`}>
          <h1>About Us</h1>
            <section className={styles['about-add']}>
                <div className={styles['about-section']}>
                    <Image src={leftsvg} alt='Left Element Logo' className={styles.imgsvg} width={150} height={140} />    
                    <div className={styles['about-leftcontent']}>
                        <h3 className='fw-bold'> About Seraphic Advisors</h3>
                        {/* <h3 className='fw-bold'> <span className='fw-bolder'>| </span> About Seraphic Advisors</h3> */}
                        <p className='text-grey my-3 me-2 me-md-5'>
                            Seraphic Advisors is renowned for its strategy in complex deals and disputes. 
                            We believe in organic growth and the Firm facilitates grooming of talent which is our core strength. 
                            Our highly motivated and experienced lawyers have an eye for detail which translates to robust advice for our clients. 
                        </p>
                    </div>
                </div>
                <div className={`${styles['about-section']} py-3`}>
                    <div className={`${styles['about-rightcontent']}`}>
                        <h3>Our Objective</h3>
                        <p className='text-grey my-3 me-2 me-md-0'>
                            Our Firm was established with an aim to make legal services effective, efficient, and hassle-free for our clients. 
                            Our team focuses to provide innovative and goal-oriented legal solutions. 
                            Our vision is to work with our global partners to ease worry on legal issues in India. 
                            Our Firm is known for trust, integrity and personalised attention towards the clients. 
                        </p>
                    </div>
                    <Image src={rightsvg} alt='Right Element Logo' width={320} height={250} />
                </div>
                <div className={`${styles['about-section']} py-3`}>
                    <Image src={leftsvg} alt='Left Element Logo' className={styles.imgsvg} width={150} height={140} />
                    <div className={styles['about-leftcontent']}>
                        <h3>Our Team</h3>
                        <p className='text-grey my-3 me-2 me-md-5'>
                            Seraphic Advisors takes pride to have a team of highly motivated lawyers. 
                            Each professional of our Firm is dedicated towards service delivery and aims to be a thought leader in his area of expertise. 
                            In addition to a degree in law, many of our professionals have dual qualifications and are also recommended in the fields of accounting, investments, company compliances, engineering etc. 
                        </p>
                    </div>
                </div>
                <div className={`${styles['about-section']} py-3`}>
                    <div className={styles['about-rightcontent']}>
                        <h3>Our Strength</h3>
                        <ul className='text-grey my-3 me-2 me-md-0 list-group'>
                            <li>Extensive Experience: Our attorneys have extensive experience in their field of expertise.</li>
                            <li>Cost-effective: Our services are cost-effective as we aim to make our legal services an effective tool for business operations rather than a cost centre.</li>
                            <li>Effective Communication: Communication is the key to achieve maximum success in legal matters.</li>
                            <li>Wide Spectrum of Clients: The Firm takes pride in having a wide range of clients from diverse industries and geographies and work with private businesses and government and public sector authorities.</li>
                            <li>Handling Complex Transactions: Our team of excellent professionals enable us to consistently achieve success in complex disputes and transactions.</li>
                        </ul>
                    </div>
                    <Image src={rightsvg} alt='Right Element Logo' width={320} height={250} />
                </div>
            </section>
        </div>
    );
};

export default About;
