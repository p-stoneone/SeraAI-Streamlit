import Carousel from 'react-bootstrap/Carousel';


function SlideShow() {
  return (
    <Carousel data-bs-theme="dark" controls={false} keyboard={true} className='my-lg-2'>
      <Carousel.Item className='bg-white' interval={5000}>
        <iframe src="https://player.vimeo.com/video/949052898?background=1&amp;title=0&amp;byline=0&amp;portrait=0&amp;player_id=iframe26880" className="d-block slideshow-slide" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen></iframe>
      </Carousel.Item>
      <Carousel.Item className='bg-white' interval={10000}>
        <iframe src="https://player.vimeo.com/video/949060846?background=1&amp;title=0&amp;byline=0&amp;portrait=0&amp;player_id=iframe26880" className="d-block slideshow-slide" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen></iframe>
      </Carousel.Item>
      <Carousel.Item className='bg-white'>
        <iframe src="https://player.vimeo.com/video/949614643?background=1&amp;title=0&amp;byline=0&amp;portrait=0&amp;player_id=iframe26880" className="d-block slideshow-slide" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen></iframe>
      </Carousel.Item>
      <Carousel.Item className='bg-white'>
        <iframe src="https://player.vimeo.com/video/963472104?background=1&amp;title=0&amp;byline=0&amp;portrait=0&amp;player_id=iframe26880" className="d-block slideshow-slide" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen></iframe>
      </Carousel.Item>
    </Carousel>
  );
}

export default SlideShow;