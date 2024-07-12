import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from "next/head";
import dynamic from 'next/dynamic';
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AuthForm from "@/components/AuthForm";
import { ObjectId } from 'bson'; // Import ObjectId
import 'react-quill/dist/quill.snow.css';
import styles from '../../styles/EditPostPage.module.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const AddPostPage: React.FC = () => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const [youtube, setYoutube] = useState('');
    const [category, setCategory] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [authorDesignation, setAuthorDesignation] = useState('');
    const [authorEmail, setAuthorEmail] = useState('');
    const [authorProfilePic, setAuthorProfilePic] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const generateObjectId = () => {
        return new ObjectId().toString(); // Generate a valid ObjectId
    };

    const handleSubmit = async () => {
        const postId = generateObjectId();
        const currentDate = new Date().toISOString();

        if (!title || !content) {
            alert('Please fill in all the necessary fields.');
            return;
        }

        const newPost = {
            _id: postId,
            date: currentDate,
            title,
            thumbnail: thumbnail || null,
            youtube: youtube || null,
            category: category || null,
            content,
            author: {
                name: authorName || 'Seraphic Advisors',
                designation: authorDesignation || 'Associate, Seraphic Advisors',
                email: authorEmail || null,
                profile_pic: authorProfilePic || null,
            },
            password,
        };

        setIsLoading(true);

        const response = await fetch(`/api/posts/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPost),
        });

        if (response.ok) {
            router.push(`/blogs/${postId}`);
        } else {
            console.error('Failed to save the new post');
            setIsLoading(false);
        }
    };

    const handleAuthSuccess = (enteredPassword: string) => {
        setPassword(enteredPassword);
        setIsAuthenticated(true);
    };

    return (
        <>
            <Head>
                <title>Seraphic Advisors - Add New Post</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Nav scroll_func={false} />
            <div className={styles.mainbody}>
                {!isAuthenticated ? (
                    <AuthForm onAuthSuccess={handleAuthSuccess} />
                ) : (
                    <div className={`${styles.blockcontent}`}>
                        <h1 className='mb-2'>Add New Post</h1>
                        <input 
                            type="text" 
                            className="form-control my-2" 
                            placeholder="Title" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            required 
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
                        <button className='btn btn-primary mt-2' onClick={handleSubmit}>Save</button>
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

export default AddPostPage;
