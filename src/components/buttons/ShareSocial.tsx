import React from 'react';
import {
  FacebookShareButton,
  FacebookIcon,
  RedditShareButton,
  RedditIcon,
  TelegramShareButton,
  TelegramIcon,
  TwitterShareButton,
  TwitterIcon,
  WhatsappShareButton,
  WhatsappIcon,
  LinkedinShareButton,
  LinkedinIcon,
} from 'next-share';
import { Share2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';

interface ShareSocialProps {
  url: string;
  title: string;
}

const ShareSocial: React.FC<ShareSocialProps> = ({ url, title }) => {
  const quote = `Read this interesting article summary I found on SeraAI: ${title}`;
  const hashtags = ['SeraphicAdvisors', 'SeraAI'];

  const handleShareClick = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: quote,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing', error);
      toast.error('Error sharing URL. Please try again.');
    }
  };

  return (
    <div className="flex items-center">
      <span className="me-2 fw-bold">Share:</span>
      <FacebookShareButton url={url} quote={quote} hashtag={hashtags[0]}>
          <FacebookIcon size={32} round />
      </FacebookShareButton>
      <span className="me-1"></span>

      <WhatsappShareButton url={url} title={title} separator=" - ">
        <WhatsappIcon size={32} round />
      </WhatsappShareButton>
      <span className="me-1"></span>

      <LinkedinShareButton url={url} title={title} summary={quote} source="SeraAI">
        <LinkedinIcon size={32} round iconFillColor="white"/>
      </LinkedinShareButton>
      <span className="me-1"></span>

      <TwitterShareButton url={url} title={quote} hashtags={hashtags}>
        <TwitterIcon size={32} round iconFillColor="white"/>
      </TwitterShareButton>
      <span className="me-1"></span>

      <RedditShareButton url={url} title={title}>
        <RedditIcon size={32} round />
      </RedditShareButton>
      <span className="me-1"></span>

      <TelegramShareButton url={url} title={title}>
        <TelegramIcon size={32} round />
      </TelegramShareButton>
      <span className="me-1"></span>


      <button onClick={handleShareClick} className="bg-transparent p-1 rounded-full border-0 rounded-circle">
        <Share2 size={24}/>
      </button>
      <span className="me-1"></span>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default ShareSocial;