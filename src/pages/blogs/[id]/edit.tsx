import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from "next/head";
import dynamic from 'next/dynamic';
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AuthForm from "@/components/AuthForm";
import 'react-quill/dist/quill.snow.css';  // Import Quill styles
import styles from '../../../styles/EditPostPage.module.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface Author {
    name: string;
    designation: string;
    email?: string;
    profile_pic?: string;
}

interface Post {
    _id: string;
    title: string;
    date: Date;
    thumbnail?: string;
    youtube?: string;
    content: string;
    author: Author;
    category?: string;
}

const EditPostPage: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [post, setPost] = useState<Post | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');  // Store the password
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const [youtube, setYoutube] = useState('');
    const [category, setCategory] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [authorDesignation, setAuthorDesignation] = useState('');
    const [authorEmail, setAuthorEmail] = useState('');
    const [authorProfilePic, setAuthorProfilePic] = useState('');
    const [isLoading, setIsLoading] = useState(false);  // Loading state

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
                setContent(data.content);
                setTitle(data.title);
                setThumbnail(data.thumbnail || '');
                setYoutube(data.youtube || '');
                setCategory(data.category || '');
                setAuthorName(data.author.name);
                setAuthorDesignation(data.author.designation);
                setAuthorEmail(data.author.email || '');
                setAuthorProfilePic(data.author.profile_pic || '');
            } else {
                console.error('Failed to fetch post data');
            }
        } catch (error) {
            console.error('Error fetching post data:', error);
        }
    };

    const saveContent = async () => {
        setIsLoading(true);  // Show loader
        const response = await fetch(`/api/posts/edit/${post?._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                content, 
                title, 
                thumbnail, 
                youtube,
                category, 
                author: { 
                    name: authorName, 
                    designation: authorDesignation, 
                    email: authorEmail || null, 
                    profile_pic: authorProfilePic || null 
                }, 
                password 
            }),
        });

        if (response.ok) {
            router.push(`/blogs/${post?._id}`);
        } else {
            console.error('Failed to save content');
            setIsLoading(false);  // Hide loader if save fails
        }
    };

    const handleAuthSuccess = (enteredPassword: string) => {
        setPassword(enteredPassword);  // Store the entered password
        setIsAuthenticated(true);
    };

    if (!post) {
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

    return (
        <>
            <Head>
                <title>Seraphic Advisors - Edit Post</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Nav scroll_func={false} />
            <div className={styles.mainbody}>
                {!isAuthenticated ? (
                    <AuthForm onAuthSuccess={handleAuthSuccess} />
                ) : (
                    <div className={`${styles.blockcontent}`}>
                        <h1 className='mb-2'>Edit Post: {post.title}</h1>
                        <input 
                            type="text" 
                            className="form-control my-2" 
                            placeholder="Title" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                        />
                        <input 
                            type="text" 
                            className="form-control my-2" 
                            placeholder="Thumbnail URL" 
                            value={thumbnail} 
                            onChange={(e) => setThumbnail(e.target.value)} 
                        />
                        <input 
                            type="text" 
                            className="form-control my-2" 
                            placeholder="Youtube URL" 
                            value={youtube} 
                            onChange={(e) => setYoutube(e.target.value)} 
                        />
                        <input 
                            type="text" 
                            className="form-control my-2" 
                            placeholder="Category" 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)} 
                        />
                        <input 
                            type="text" 
                            className="form-control my-2" 
                            placeholder="Author Name" 
                            value={authorName} 
                            onChange={(e) => setAuthorName(e.target.value)} 
                        />
                        <input 
                            type="text" 
                            className="form-control my-2" 
                            placeholder="Author Designation" 
                            value={authorDesignation} 
                            onChange={(e) => setAuthorDesignation(e.target.value)} 
                        />
                        <input 
                            type="email" 
                            className="form-control my-2" 
                            placeholder="Author Email" 
                            value={authorEmail} 
                            onChange={(e) => setAuthorEmail(e.target.value)} 
                        />
                        <input 
                            type="text" 
                            className="form-control my-2" 
                            placeholder="Author Profile Picture URL" 
                            value={authorProfilePic} 
                            onChange={(e) => setAuthorProfilePic(e.target.value)} 
                        />
                        <ReactQuill value={content} onChange={setContent} />
                        <button className='btn btn-primary mt-2' onClick={saveContent}>Save</button>
                    </div>
                )}
            </div>
            {isLoading && (
                <div className={styles.loader}>
                    <div className={styles["three-body"]}>
                        <div className={styles["three-body__dot"]}></div>
                        <div className={styles["three-body__dot"]}></div>
                        <div className={styles["three-body__dot"]}></div>
                    </div>
                </div>
            )}
            <Footer />
        </>
    );
};

export default EditPostPage;
