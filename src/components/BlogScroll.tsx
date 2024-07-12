import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Container, Row, Col } from 'react-bootstrap';
import { motion, useTransform, useScroll } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import styles from '@/styles/BlogScroll.module.css';
import NoThumbnail from '@/assets/no-thumbnail.jpg';

import { FaArrowRight } from 'react-icons/fa';

interface Post {
  _id: string;
  title: string;
  date: string;
  thumbnail?: string;
  content: string;
  category?: string;
}

interface BlogScrollProps {
  posts: Post[];
}

const BlogScroll: React.FC<BlogScrollProps> = ({ posts }) => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const isMobile = useMediaQuery({ maxWidth: 767 });

  const x = useTransform(scrollYProgress, isMobile ? [0, 1] : [0, 0.8, 1], isMobile ? ["400%","-100%"] : ["100%", "80%", "-30%"]);

  return (
    <div className={styles.container} ref={targetRef}>
      {posts.slice(0, 1).map((post, index) => (
        <div className={styles.section} key={index}>
        <h2 className={`text-center display-3 mt-lg-2 mb-lg-1 ${styles.heading}`}>Sera<sup>ai</sup></h2>
        <Container className={styles.post}>
          <Row>
            <Col md={12} lg={6} className={`${styles.textCol} px-2 mt-md-5 mt-lg-0`}>
              <h4 className='mt-lg-5'>🆕Introducing Sera<sup>ai</sup></h4>
              <h3 className={`${styles.title} display-5`}>Your personal Judgements Summarizer</h3>
              <iframe src="https://player.vimeo.com/video/974544039?background=1&amp;title=0&amp;byline=0&amp;portrait=0&amp;player_id=iframe26880" className="d-block d-lg-none" width={550} height={400} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen></iframe>
              <div className={`${styles.content} ${styles.truncatetext}`}>
                  <p>SeraAI is a cutting-edge AI chatbot designed to provide concise and accurate summaries of daily Supreme Court judgements. Leveraging advanced natural language processing techniques, Sera<sup>ai</sup> offers legal professionals, students, and enthusiasts a unique tool to stay updated with the latest legal developments. With its intuitive interface and reliable performance, SeraAI sets a new standard in legal information dissemination.</p>
              </div>
              <Link href={`/Sera-ai`} className={`${styles.readMore} fs-6 mb-3`}>
                Try Out Now <span className={styles.arrow}>→</span>
              </Link>
            </Col>
            <Col md={12} lg={6} className={`${styles.videoCol} d-none d-lg-block`}>
                <iframe src="https://player.vimeo.com/video/974544039?background=1&amp;title=0&amp;byline=0&amp;portrait=0&amp;player_id=iframe26880" className="d-block" width={550} height={400} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen></iframe>
            </Col>
          </Row>
        </Container>
      </div>
      ))}
      {posts.slice(0, 3).map((post, index) => (
        <div className={styles.section} key={index}>
          <h2 className={`text-center display-3 mt-lg-5 ${styles.heading}`}>Insights</h2>
          <h5 className='text-center mb-lg-5 mt-1'>Our Latest Blogs</h5>
          <Container className={styles.post}>
            <Row>
              <Col md={12} lg={6} className={styles.imageCol}>
                <Link href={`/blogs/${post._id}`}>
                  <Image src={post.thumbnail || NoThumbnail.src} alt="Blog Image" width={500} height={300} className={styles.image} />
                </Link>
              </Col>
              <Col md={12} lg={6} className={`${styles.textCol} mt-md-5 mt-lg-0`}>
                <h3 className={styles.title}>{post.title}</h3>
                <div className={`${styles.content} ${styles.truncatetext}`} dangerouslySetInnerHTML={{ __html: post.content }} />
                <Link href={`/blogs/${post._id}`} className={`${styles.readMore} fs-6`}>
                  Read More <span className={styles.arrow}>→</span>
                </Link>
              </Col>
            </Row>
          </Container>
        </div>
      ))}
      {posts.length > 3 && (
        <div className={styles.section} style={{ height: '150vh' }}>
          <h2 className={`text-center display-3 mt-lg-5 ${styles.heading}`}>Insights</h2>
          <h5 className='text-center mb-lg-5 mt-1'>Our Latest Blogs</h5>
          <Container className={styles.post}>
            <div className="position-sticky top-0 d-flex vh-100 align-items-center overflow-hidden">
              <motion.div style={{ x }} transition={{ duration: 0.5, ease: "easeOut" }} className="d-flex gap-4 align-items-center">
                {posts.slice(3, 6).map((post, index) => (
                  <article className={`${styles.nqv_card} ${styles[`nqv_card${post._id}`]}`} key={index}>
                    <div className={styles.nqv_card__infoHover}>
                      <svg className={styles.nqv_card__like} viewBox="0 0 24 24">
                        <path fill="#000000" d="M12.1,18.55L12,18.65L11.89,18.55C7.14,14.24 4,11.39 4,8.5C4,6.5 5.5,5 7.5,5C9.04,5 10.54,6 11.07,7.36H12.93C13.46,6 14.96,5 16.5,5C18.5,5 20,6.5 20,8.5C20,11.39 16.86,14.24 12.1,18.55M16.5,3C14.76,3 13.09,3.81 12,5.08C10.91,3.81 9.24,3 7.5,3C4.42,3 2,5.41 2,8.5C2,12.27 5.4,15.36 10.55,20.03L12,21.35L13.45,20.03C18.6,15.36 22,12.27 22,8.5C22,5.41 19.58,3 16.5,3Z" />
                      </svg>
                      <div className={styles.nqv_card__clockInfo}>
                        <svg className={styles.nqv_card__clock} viewBox="0 0 24 24">
                          <path d="M12,20A7,7 0 0,1 5,13A7,7 0 0,1 12,6A7,7 0 0,1 19,13A7,7 0 0,1 12,20M19.03,7.39L20.45,5.97C20,5.46 19.55,5 19.04,4.56L17.62,6C16.07,4.74 14.12,4 12,4A9,9 0 0,0 3,13A9,9 0 0,0 12,22C17,22 21,17.97 21,13C21,10.88 20.26,8.93 19.03,7.39M11,14H13V8H11M15,1H9V3H15V1Z" />
                        </svg>
                        <span className={styles.nqv_card__time}>4min</span>
                      </div>
                    </div>
                    <div className={styles.nqv_card__img} style={{ backgroundImage: `url(${post.thumbnail ? post.thumbnail : NoThumbnail.src})` }}></div>
                    <Link href={`/blogs/${post._id}`} className={styles.nqv_card_link}>
                      <div className={styles.nqv_card__imgHover} style={{ backgroundImage: `url(${post.thumbnail ? post.thumbnail : NoThumbnail.src})` }}></div>
                    </Link>
                    <div className={styles.nqv_card__info}>
                      <span className={styles.nqv_card__category}>{post.category ? post.category : 'Legal'}</span>
                      <h3 className={`${styles.nqv_card__title} ${styles.ttext}`}>{post.title}</h3>
                    </div>
                  </article>
                ))}
                <div className="d-flex align-items-center justify-content-center">
                  <Link className="btn btn-outline-dark btn-lg align-items-center justify-content-center" href="/blogs">
                    <FaArrowRight />
                  </Link>
                </div>
              </motion.div>
            </div>
          </Container>
        </div>
      )}
    </div>
  );
};

export default BlogScroll;
