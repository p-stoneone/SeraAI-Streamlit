import { useState, useEffect } from 'react';

const useTypingEffect = (text: string, speed: number) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let currentIndex = 0;
        const interval = setInterval(() => {
            setDisplayedText(text.slice(0, currentIndex));
            if (currentIndex < text.length) {
                currentIndex += 1;
            } else {
                clearInterval(interval);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed]);

    return displayedText;
};


export default useTypingEffect;