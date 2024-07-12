import React, { useState } from 'react';
import Image from 'next/image';
import { Card, Button, Pagination } from 'react-bootstrap';
import { BsArrowRight } from 'react-icons/bs';
import Link from 'next/link';
import NoThumbnail from '@/assets/no-thumbnail.jpg';
import styles from '@/styles/BlogScroll.module.css';

interface Post {
    _id: string;
    title: string;
    date: string;
    thumbnail?: string;
    content: string;
    category?: string;
}

interface BlogProps {
    posts: Post[];
}

const Blog: React.FC<BlogProps> = ({ posts }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 6; // Set the number of posts per page
    const colors = ['bg-info', 'bg-purple', 'bg-pink'];

    // Calculate the indices for the posts to display on the current page
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

    const handleClick = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className={`bg-light py-5 ${styles.bloghead}`}>
            <div className="container">
                <div className="text-center">
                    <h1>Seraphic Insights</h1>
                    <h4 className='mb-5 fst-italic'>Our Latest Blogs</h4>
                </div>
                <section className='row'>
                    {currentPosts.map((post, index) => (
                        <div className="col-md-4 mb-4" key={post._id}>
                            <div className="card h-100">
                                <div className="card-header p-0">
                                    <Link href={`/blogs/${post._id}`} target='_blank'>
                                        <Image src={post.thumbnail || NoThumbnail.src} alt={post.title} className="img-fluid" width={750} height={422} />
                                    </Link>
                                </div>
                                <div className="card-body text-justify">
                                    <span className={`badge ${colors[index % colors.length]} text-light`}>{post.category || 'Law'}</span>
                                    <h4 className="card-title mt-2 truncate-text">{post.title}</h4>
                                    <div className="card-text truncate-text mb-2" dangerouslySetInnerHTML={{ __html: post.content }}/>
                                </div>
                                <div className="">
                                    <Card.Footer className="d-flex justify-content-center align-items-center text-center">
                                        <Button variant="link" size="sm" className='text-reset text-decoration-none' href={`/blogs/${post._id}`} target='_blank'>
                                            Read more <BsArrowRight className='mx-2' />
                                        </Button>
                                    </Card.Footer>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
                <Pagination className="d-flex justify-content-center">
                    {Array.from({ length: Math.ceil(posts.length / postsPerPage) }, (_, index) => (
                        <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => handleClick(index + 1)}>
                            {index + 1}
                        </Pagination.Item>
                    ))}
                </Pagination>
            </div>
        </div>
    );
};

export default Blog;