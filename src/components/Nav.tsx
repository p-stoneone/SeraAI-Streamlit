import Link from 'next/link';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Image from 'next/image';
import LogoSvg from '@/assets/Logo/seraphic-logo-text.svg'
import styles from '@/styles/Nav.module.css';
import SideSearch from "@/components/SideSearch";
import { useEffect, useState } from 'react';

type OffcanvasExampleProps = {
  scroll_func: boolean;
};

function OffcanvasExample({ scroll_func }: OffcanvasExampleProps) {
  const [isTabletOrSmaller, setIsTabletOrSmaller] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsTabletOrSmaller(window.innerWidth <= 992); // setting strict condition under screen size of 992px
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    // Set custom property for navbar height
    const navbar = document.querySelector('.navbar') as HTMLElement;
    if (navbar) {
      document.documentElement.style.setProperty('--navbar-height', `${navbar.offsetHeight}px`);
    }
  }, []);

  return (
    <>
      {['lg'].map((expand) => (
        <Navbar key={expand} expand={expand} className={`px-2 pt-4 ${styles['nav-bg']}`}>
          <Container fluid>
            <Navbar.Brand href="#"></Navbar.Brand>
            <div className={styles.navbarBrand}>
              <Link href={"/"}>
                <Image src={LogoSvg.src} priority={true} alt="Law Firm Logo" className='img-fluid' width="220" height="40"/>
              </Link>
            </div>
            <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${expand}`} />
            {isTabletOrSmaller && (
              <Navbar.Offcanvas
                id={`offcanvasNavbar-expand-${expand}`}
                aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`}
                placement="start"
              >
                <Offcanvas.Header closeButton>
                  <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${expand}`}>
                  </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                  <Nav className={`justify-content-center flex-grow-1 ${styles.navitem}`}>
                    <Nav.Link className={styles['nav-link']} href="/">HOME</Nav.Link>
                    <Nav.Link className={styles['nav-link']} href="/about-us">ABOUT US</Nav.Link>
                    <Nav.Link className={styles['nav-link']} href="/expertise">WHAT WE DO</Nav.Link>
                    <Nav.Link className={styles['nav-link']} href="/blogs">INSIGHTS</Nav.Link>
                    <Nav.Link className={styles['nav-link']} href="/Sera-ai">SERA<sup>AI</sup></Nav.Link>
                    <NavDropdown className={styles['nav-link']} title="LOGIN" id="basic-nav-dropdown">
                      <NavDropdown.Item href="/login" className='text-uppercase'>
                        Associate Login
                      </NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item href="/client-login" className='text-uppercase'>
                        Client Login
                      </NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item href="/intern-login" className='text-uppercase'>
                        Intern Login
                      </NavDropdown.Item>
                    </NavDropdown>
                  </Nav>
                  <Form className="d-flex">
                    <SideSearch scroll={false} />
                  </Form>
                </Offcanvas.Body>
              </Navbar.Offcanvas>
            )}
            {!isTabletOrSmaller && (
              <>
                <Nav className={`justify-content-left flex-grow-1 ${styles.navitem}`}>
                  <Nav.Link className={styles['nav-link']} href="/">HOME</Nav.Link>
                  <Nav.Link className={styles['nav-link']} href="/about-us">ABOUT US</Nav.Link>
                  <Nav.Link className={styles['nav-link']} href="/expertise">WHAT WE DO</Nav.Link>
                  <Nav.Link className={styles['nav-link']} href="/blogs">INSIGHTS</Nav.Link>
                  <Nav.Link className={styles['nav-link']} href="/Sera-ai">SERA<sup>AI</sup></Nav.Link>
                  <NavDropdown className={styles['nav-link']} title="LOGIN" id="basic-nav-dropdown">
                    <NavDropdown.Item href="/login" className='text-uppercase px-2'>
                      Associate Login
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="/client-login" className='text-uppercase px-2'>
                      Client Login
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="/intern-login" className='text-uppercase px-2'>
                      Intern Login
                    </NavDropdown.Item>
                  </NavDropdown>
                </Nav>
                <Form className="d-flex">
                  <SideSearch scroll={scroll_func} />
                </Form>
              </>
            )}
          </Container>
        </Navbar>
      ))}
    </>
  );
}

export default OffcanvasExample;
