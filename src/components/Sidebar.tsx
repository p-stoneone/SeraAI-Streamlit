import React, { useState, useEffect } from 'react';
import { fetchWithCache } from '../utils/clientCache';
import { useRouter } from 'next/router';
import Image from "next/image";
import DatePicker from "react-datepicker";
import Button from 'react-bootstrap/Button';
import "react-datepicker/dist/react-datepicker.css";
import styles from "@/styles/sidebar.module.css";
import menu_icon from '@/assets/icon/menu_icon.png';
import plus_icon from '@/assets/icon/plus_icon.png';
import message_icon from '@/assets/icon/message_icon.png';
import question_icon from '@/assets/icon/question_icon.png';
import history_icon from '@/assets/icon/history_icon.png';
import report_icon from '@/assets/icon/report_icon.png';

const Sidebar: React.FC = () => {
    const [extended, setExtended] = useState(false);
    const [dates, setDates] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchDates = async () => {
          const { data } = await fetchWithCache('/api/SeraAI/SeraAIRecentDates');
          setDates(data);
        };
        fetchDates();
    }, []);

    const handleActivityClick = () => {
        setMobileMenuOpen(false);
        setShowModal(true);
    };

    const handleDateChange = (date: Date | null) => {
        setSelectedDate(date);
    };

    const handleModalOk = () => {
        setShowModal(false);
        if (selectedDate) {
            const formattedDate = new Date(selectedDate);
            formattedDate.setDate(formattedDate.getDate() + 1);
            const formattedDateString = formattedDate.toISOString().split('T')[0];
            router.push(`/Sera-ai/${formattedDateString}`);
            setMobileMenuOpen(false);
        }
    };

    const handleRecentDateClick = (date: string) => {
        router.push(`/Sera-ai/${date}`);
        setMobileMenuOpen(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const formatDate = (date: string) => {
        const [year, month, day] = date.split('-');
        return `${day}-${month}-${year}`;
    };

    return (
        <>
            <Button variant="outline-black" className={styles.mobileMenuButton} onClick={() => { setMobileMenuOpen(prevState => !prevState); }}>
                <Image src={menu_icon} alt="menu icon" width={20} height={20} />
            </Button>
            <div className={`${styles.sidebar} ${extended ? styles.extended : ''} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
                <div className={styles.top}>
                    <Image src={menu_icon} alt="menu icon" width={20} height={20} className={styles.menu} onClick={() => { setExtended(prev => !prev); }} />
                    <div className={styles.newChat} onClick={() => router.push('/Sera-ai')}>
                        <Image src={plus_icon.src} alt="" width={20} height={30} />
                        {(extended || mobileMenuOpen) ? <p className={`${styles.newChatText} ${styles.fadeIn}`}>New Chat</p> : null}
                    </div>
                    <div className={styles.recent}>
                        {(extended || mobileMenuOpen) ? <p className={styles.recentTitle}>Recent</p> : null}
                        {dates.map(date => (
                            (extended || mobileMenuOpen) ? 
                            <div key={date} className={`${styles.recentEntry} align-items-center`} onClick={() => handleRecentDateClick(date)}>
                                <Image src={message_icon.src} alt="" width={24} height={24} />
                                <p className={`${styles.recentFadeIn} m-0`}>{formatDate(date)}</p>
                            </div>
                        : null ))}
                    </div>
                </div>
                <div className={styles.bottom}>
                    <div className={`${styles.bottomItem} ${styles.recentEntry}`} onClick={handleActivityClick}>
                        <Image src={history_icon.src} alt="" width={20} height={20} />
                        {(extended || mobileMenuOpen) ? <p>Archive</p> : null}
                    </div>
                    <div className={`${styles.bottomItem} ${styles.recentEntry}`}>
                        <Image src={question_icon.src} alt="" width={20} height={20} />
                        {(extended || mobileMenuOpen) ? <p>Terms of Use</p> : null}
                    </div>
                    <div className={`${styles.bottomItem} ${styles.recentEntry}`}>
                        <Image src={report_icon.src} alt="" width={20} height={20} />
                        {(extended || mobileMenuOpen) ? <p>Report an Issue</p> : null}
                    </div>
                </div>
                {showModal && (
                    <div className={`${styles.modal} ${styles.recentFadeIn}`}>
                        <div className={styles.modalContent}>
                            <h2>Select Date</h2>
                            <DatePicker title='Select Date'
                                selected={selectedDate}
                                onChange={handleDateChange}
                                inline
                            />
                            <div className={`${styles.modalButtons} d-flex justify-content-end`}>
                                <button onClick={handleModalOk}>OK</button>
                                <button onClick={handleCloseModal}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Sidebar;