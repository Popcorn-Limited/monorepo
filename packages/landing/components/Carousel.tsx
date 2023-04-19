import React, { useState } from 'react';

const Carousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const [touchStart, setTouchStart] = React.useState(0);
  const [touchEnd, setTouchEnd] = React.useState(0);

  function handleTouchStart(e) {
    setTouchStart(e.targetTouches[0].clientX);
  }

  function handleTouchMove(e) {
    setTouchEnd(e.targetTouches[0].clientX);
  }

  function handleTouchEnd() {
    if (touchStart - touchEnd > 150) {
      setActiveIndex(activeIndex === 2 ? 0 : activeIndex + 1);
    }

    if (touchStart - touchEnd < -150) {
      setActiveIndex(activeIndex === 0 ? 2 : activeIndex - 1);
    }
  }

  return (
    <div className="relative w-full">
      <div
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="carousel box-border grow w-fit flex transition-transform ease-in duration-300"
        style={{ transform: `translateX(-${activeIndex * 100}vw)` }}
      >
        {/* Render your carousel items here */}
        <div className="w-screen px-6 flex-col flex box-border">
          <div className="w-[100%] pb-[100%] relative box-border flex flex-col justify-center items-center rounded-lg bg-[#FA5A6E] mb-6">
            <img src="/images/icons/blocksec-logo.png" className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' />
          </div>
          <p className="text-4xl mb-4">BlockSec</p>
          <p className="text-xl">Zokyo is an end-to-end security resource that provides distinguishable security auditing and penetration testing services alongside prominent vulnerability assessments.</p>
        </div>
        <div className="w-screen px-6 flex-col flex w-screen">

          <div className="w-[100%] pb-[100%] relative flex flex-col justify-center items-center rounded-lg bg-[#9B55FF] mb-6">
            <img src="/images/icons/c4-logo.png" className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' />
          </div>
          <p className="text-4xl mb-4">Code4rena</p>
          <p>Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.</p>
        </div>

        <div className="w-screen px-6 flex-col flex w-screen">

          <div className="w-[100%] pb-[100%] relative flex flex-col justify-center items-center rounded-lg bg-[#05BE64] mb-6">
            <img src="/images/icons/immunifi-logo.png" className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' />
          </div>
          <p className="text-4xl mb-4">Immunefi</p>
          <p>Immunefi is the leading bug bounty platform for Web3.</p>

        </div>
      </div>
      <div className="carousel-controls flex justify-center items-center mb-4 mt-12">
        <div className="carousel-indicators flex mt-auto mb-auto gap-x-6">
          <button
            className={`carousel-indicator w-5 h-5 rounded-full mx-1 border-2 border-black ${activeIndex === 0 ? 'bg-black' : ''
              }`}
            onClick={() => setActiveIndex(0)}
          ></button>
          <button
            className={`carousel-indicator w-5 h-5 rounded-full mx-1 border-2 border-black ${activeIndex === 1 ? 'bg-black' : ''
              }`}
            onClick={() => setActiveIndex(1)}
          ></button>
          <button
            className={`carousel-indicator w-5 h-5 rounded-full mx-1 border-2 border-black ${activeIndex === 2 ? 'bg-black' : ''
              }`}
            onClick={() => setActiveIndex(2)}
          ></button>
        </div>
      </div>
    </div>
  );
};

export default Carousel;