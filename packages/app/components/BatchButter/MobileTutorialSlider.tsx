import { ChevronLeftIcon } from "@heroicons/react/outline";
import React, { useRef, useState } from "react";
import Slider from "react-slick";

let inactiveDot = "bg-black bg-opacity-25";
let activeDot = "bg-black";

const MobileTutorialSlider = ({ onCloseMenu, isThreeX }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const customSlider = useRef(null);

  const gotoSlide = (id) => {
    setCurrentSlide(id);
    customSlider.current.slickGoTo(id);
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    easing: "easeInOut",
    pauseOnHover: false,
    beforeChange: (oldIndex: number, newIndex: number) => {
      setCurrentSlide(newIndex);
    },
  };
  const tutorialSteps: Array<{ title: string; content: string }> = [
    {
      title: "Step 1 - Begin the Minting Process",
      content:
        "First connect your wallet. Then select the token you would like to deposit from the dropdown, enter the deposit amount and click ‘Mint’. If you are depositing for the first time, you’ll need to approve the contract.",
    },
    {
      title: "Step 2 – Wait for the batch to process",
      content: `Your deposits will be held in ${
        isThreeX ? "3X" : "Butter"
      }’s batch processing queue. Note: To minimise gas fees, deposits are processed approximately every 24 hours. You are able to withdraw your deposits during this phase.`,
    },
    {
      title: `Step 3 – Claim your minted ${isThreeX ? "3X" : "Butter"}!`,
      content: `Once the batch has been processed, you will be able to claim the new minted ${
        isThreeX ? "3X" : "Butter"
      } tokens!`,
    },
  ];

  return (
    <div className="h-screen px-6 py-12 bg-white">
      <div className="relative">
        <ChevronLeftIcon
          className="text-black h-10 w-10 absolute left-0 transform -translate-y-1/2 top-1/2"
          onClick={onCloseMenu}
        />
        <p className="text-black text-center font-medium">How It Works</p>
      </div>
      <div className="mt-20 mobileTutorialSlider">
        <Slider {...settings} ref={(slider) => (customSlider.current = slider)}>
          {tutorialSteps.map((step, index) => (
            <div>
              <div className="px-2 flex flex-col justify-between h-112">
                <div>
                  <h1 className="text-black text-5xl leading-11">{step.title}</h1>
                  <p className=" text-black leading-5 mt-4">{step.content}</p>
                </div>

                <div className="flex justify-center pt-6 gap-5">
                  {tutorialSteps.map((steps, index) => (
                    <div
                      className={`${
                        currentSlide == index ? activeDot : inactiveDot
                      } rounded-full h-3 w-3 transition-all`}
                      onClick={() => gotoSlide(index)}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default MobileTutorialSlider;
