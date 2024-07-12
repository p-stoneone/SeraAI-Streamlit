import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Head from "next/head";
import Link from 'next/link';
import Image from 'next/image';
import { Button, Card, FormControl, InputGroup, Container } from 'react-bootstrap';
import Layout from '@/components/Layout';
import { BsArrowRight } from 'react-icons/bs';
import styles from '@/styles/PostPage.module.css';

interface BlogPost {
  _id: string;
  thumbnail: string;
  title: string;
  content: string;
  category: string;
}

interface SitePage {
  keyword: string;
  link: string;
  title: string;
}

const SearchResults = () => {
  const router = useRouter();
  const { q } = router.query;
  const [query, setQuery] = useState<string>(q as string || '');
  const [blogResults, setBlogResults] = useState<BlogPost[]>([]);
  const [siteWideResults, setSiteWideResults] = useState<SitePage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const colors = ['bg-info', 'bg-purple', 'bg-pink'];

  useEffect(() => {
    if (q) {
      fetchResults(q as string);
    }
  }, [q]);

  const fetchResults = async (searchQuery: string) => {
    try {
      setLoading(true);
      const [blogsRes, siteWideRes] = await Promise.all([
        axios.get(`/api/posts/searchblogs?q=${encodeURIComponent(searchQuery)}`),
        axios.get(`/api/siteWideSearch?q=${encodeURIComponent(searchQuery)}`)
      ]);

      setBlogResults(blogsRes.data);
      setSiteWideResults(siteWideRes.data);
    } catch (error) {
      setError('An error occurred while fetching the search results.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    router.push(`/search-results?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
        <Layout 
            title="Search Results"
            description="Search Result"
            keywords="Seraphic Advisors, Search Results"
        >
          <Container as="main" className={`${styles.fetchresults} mt-5`}>
              <form onSubmit={handleSearch}>
                  <h5>RESULTS FOR:</h5>
                  <InputGroup className='mb-4'>
                    <FormControl
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search..."
                      aria-label="Search"
                      autoFocus
                    />
                  </InputGroup>
              </form>
              {loading && <div className={styles.loader}>
                  <div className={styles["three-body"]}>
                      <div className={styles["three-body__dot"]}></div>
                      <div className={styles["three-body__dot"]}></div>
                      <div className={styles["three-body__dot"]}></div>
                  </div>
              </div>}
              {error && <p className="text-danger">{error}</p>}
              {!loading && !error && blogResults.length === 0 && siteWideResults.length === 0 && <p>No data found.</p>}
              {!loading && !error && (
                  <>
                    {blogResults.length > 0 && (
                        <section className='row'>
                            <h4 className='text-uppercase mb-2'>Blog Posts</h4>
                            {blogResults.map((post, index) => (
                                <div className="col-md-4 mb-4" key={post._id}>
                                    <div className="card h-100">
                                        <div className="card-header p-0">
                                            <Link href={`/blogs/${post._id}`} target='_blank'>
                                                <Image src={post.thumbnail || '/default-thumbnail.jpg'} alt={post.title} className="img-fluid" width={750} height={422} />
                                            </Link>
                                        </div>
                                        <div className="card-body text-justify">
                                            <span className={`badge ${colors[index % colors.length]} text-light`}>{post.category || 'General'}</span>
                                            <h4 className="card-title mt-2 truncate-text">{post.title}</h4>
                                            <div className="card-text truncate-text mb-2" dangerouslySetInnerHTML={{ __html: post.content }} />
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
                    )}
                    {siteWideResults.length > 0 && (
                        <section className='mb-4'>
                            <small className='text-uppercase fs-6'>Site Results</small>
                            {siteWideResults.map((page, index) => (
                                <div key={index} className='mb-3'>
                                    <h3><Link href={page.link} className={`text-reset text-decoration-none ${styles['results-title']}`}>- {page.title}</Link></h3>
                                </div>
                            ))}
                        </section>
                    )}
                  </>
              )}
          </Container>
        </Layout>
    </>
  );
};

export default SearchResults;