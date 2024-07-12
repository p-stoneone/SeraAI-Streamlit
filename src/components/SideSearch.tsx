import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Form from 'react-bootstrap/Form';
import styles from '@/styles/SideSearch.module.css';
import CloseButton from 'react-bootstrap/CloseButton';
import Link from 'next/link';
import { useRouter } from 'next/router';

type SideSearchProps = {
  scroll: boolean;
};

function SideSearch({ scroll }: SideSearchProps) {
  const [showing, setShowing] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [query, setQuery] = useState('');

  const CH = () => setShowing(false);
  const SH = () => setShowing(true);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search-results?q=${encodeURIComponent(query.trim())}`);
      CH();
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (scroll) {
        setScrollPosition(window.pageYOffset);
      }
    };

    if (scroll) {
      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scroll) {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [scroll]);

  useEffect(() => {
    if (scroll) {
      if (scrollPosition > 0) {
        CH();
      } else {
        SH();
      }
    } else {
      CH();
    }
  }, [scroll, scrollPosition]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (showing && !document.getElementById('side-search-offcanvas')?.contains(event.target as Node)) {
        CH();
      }
    };

    if (showing) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showing]);

  return (
    <>
      <Button variant="outline-black" onClick={SH}>
        Search
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search mx-2 my-1" viewBox="0 0 16 16">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
        </svg>
      </Button>

      <Offcanvas id="side-search-offcanvas" show={showing} onHide={CH} scroll={true} className={`${styles.customOffcanvas}`} placement='end'>
        <Offcanvas.Header className={`bg-black text-white my-50x d-flex justify-content-end`}>
          <div data-bs-theme="dark" className='bg-black p-2 end-0'>
            <CloseButton onClick={CH} />
          </div>
          <Offcanvas.Title></Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className={`bg-black text-white py-5 ${styles.centercontent} ${showing ? styles.moveleft : ''}`}>
          <div className='overflow-hidden side-height'>
            <div className={`mt-5 pb-2`}>
              I am looking for:
            </div>
            <div className="position-relative">
              <Form onSubmit={handleSearch}>
                <Form.Control
                  type="search"
                  placeholder=""
                  className="me-2 border-0 border-bottom border-light bg-transparent text-white w-100"
                  aria-label="Search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </Form>
            </div>
            <div className='mt-3'>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                <li className='mb-2'>
                  <Link href="/Sera-ai" className='text-reset text-decoration-none'>
                    Sera<sup>ai</sup>
                  </Link>
                </li>
                <li className='mb-2'>
                  <Link href="/offices" className='text-reset text-decoration-none'>
                    Locate Us
                  </Link>
                </li>
                <li className='mb-2'>
                  <Link href="/contact-us" className='text-reset text-decoration-none'>
                    Reach-Out
                  </Link>
                </li>
                <li className='mb-2'>
                  <Link href="/careers" className='text-reset text-decoration-none'>
                    Work With Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default SideSearch;
