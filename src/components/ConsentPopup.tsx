import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiAlertCircle } from "react-icons/fi";
import Cookies from 'js-cookie';
import styles from '../styles/Consent.module.css';

const ConsentPopup = () => {
  const [show, setShow] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!Cookies.get('consent')) {
      setShow(true);
      document.body.style.overflow = 'hidden';
    }
  }, []);

  const handleAgree = () => {
    Cookies.set('consent', 'true', { expires: 2 });
    setShow(false);
    document.body.style.overflow = 'auto';
  };

  const handleDisagree = () => {
    window.location.href = 'https://www.google.com';
  };

  const handleClickOutside = (event: React.MouseEvent) => {
    if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
      dialogRef.current.style.animation = `${styles.grow} 0.5s forwards`;
      setTimeout(() => {
        if (dialogRef.current) {
          dialogRef.current.style.animation = 'none';
        }
      }, 500);
    }
  };

  return (
    show && (
      <div className={styles.overlay} onClick={handleClickOutside}>
        <div className={styles['cookies-card']} ref={dialogRef}>
          <h3 className={styles["cookie-heading"]}>Disclaimer</h3>
          <div className={styles["cookie-para"]}>
            <p>
              As per the rules of the Bar Council of India, we are not permitted to solicit work and advertise. By clicking on the “I AGREE” button below, you acknowledge the following:
            </p>
            <ul>
              <li>There has been no advertisement, personal communication, solicitation, invitation, or inducement of any sort whatsoever from us or any of our members to solicit any work through this website;</li>
              <li>You wish to gain more information about us for your own information and use;</li>
              <li>The information about us is provided to you on your specific request and any information obtained or materials downloaded from this website is complete of your own volition and any transmission, receipt, or use of this site does not create any lawyer-client relationship; and</li>
              <li>We are not liable for any consequence of any action taken by you relying on the material/information provided on this website.</li>
            </ul>
            <p>
              If you have any legal issues, in all cases, kindly seek independent legal advice.
            </p>
          </div>
          <div className={styles["button-wrapper"]}>
            <button className={`${styles["cookie-button"]} ${styles.accept}`} onClick={handleAgree}>Accept</button>
            <button className={`${styles["cookie-button"]} ${styles.reject}`} onClick={handleDisagree}>Reject</button>
          </div>
          <button className={`${styles["exit-button"]}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 162 162" className={styles["svgIconCross"]}>
              <path stroke-linecap="round" stroke-width="35" stroke="black" d="M9.01074 8.98926L153.021 153"></path>
              <path stroke-linecap="round" stroke-width="35" stroke="black" d="M9.01074 153L153.021 8.98926"></path>
            </svg>
          </button>
        </div>
      </div>
    )
  );
};

export default ConsentPopup;
