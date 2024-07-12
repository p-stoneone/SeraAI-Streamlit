import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from "next/head";
import Link from 'next/link';
import Image from 'next/image';
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { FaHome } from "react-icons/fa";
import styles from '../../styles/PostPage.module.css';
import myImage from '@/assets/no-thumbnail.jpg';

interface Post {
    _id: string;
    title: string;
    date: Date;
    thumbnail?: string;
    youtube?: string;
    content: string;
    category?: string;
}

const PostPage: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [post, setPost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(true);  // Loading state

    useEffect(() => {
        if (id) {
            fetchPostData(id as string);
        }
    }, [id]);

    const fetchPostData = async (postId: string) => {
        try {
            const response = await fetch(`/api/posts/${postId}`);
            if (response.ok) {
                const data = await response.json();
                setPost(data);
                setIsLoading(false);  // Hide loader
            } else {
                console.error('Failed to fetch post data');
            }
        } catch (error) {
            console.error('Error fetching post data:', error);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.loader}>
                <div className={styles["three-body"]}>
                    <div className={styles["three-body__dot"]}></div>
                    <div className={styles["three-body__dot"]}></div>
                    <div className={styles["three-body__dot"]}></div>
                </div>
            </div>
        );
    }

    if (!post) {
        return <div>Post not found</div>;
    }

    return (
        <>
            <Head>
                <title>Seraphic Advisors</title>
                <meta name="description" content="Seraphic Insights, Blogs of Seraphic Advisors" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Nav scroll_func={false} />
            <div className={styles.mainbody}>
                <div className={`d-flex justify-content-between align-items-center ${styles.bcrumb}`}>
                    <small className="text-muted">
                        <FaHome className="me-2" />
                        <Link href="/" className={`text-reset text-decoration-none me-1 ${styles.link}`}>Home</Link>
                        <span className='me-1'>/</span>
                        <Link href="/blogs" className={`text-reset text-decoration-none me-1 ${styles.link}`}>Blogs</Link>
                        <span className='me-1'>/</span>
                        {post.category || 'Law'}
                    </small>
                    <small className="text-muted">Last Updated: {post.date.toString()}</small>
                </div>
                <div className={`${styles.blockcontent}`}>
                    <div className="row">
                        <h1 className={styles[`post-title`]}>{post.title}</h1>
                        <div className="align-items-center justify-content-center">
                            {post.youtube && post.youtube.trim() !== '' ? (
                                <iframe className='position-relative' width="100%" height="500" src={post.youtube} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen={true}></iframe>
                            ) : (
                                <Image src={post.thumbnail || myImage.src} className={styles.thumbnail} alt={post.title} width={350} height={250} />
                            )}
                        </div>
                        <div className='fs-5 mt-5' dangerouslySetInnerHTML={{ __html: post.content }} />
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default PostPage;