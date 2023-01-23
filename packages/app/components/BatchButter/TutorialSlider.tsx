import React, { useRef, useState } from "react";
import Slider from "react-slick";

let activeDot = "bg-white";
let inactiveDot = "bg-white bg-opacity-50";

const TutorialSlider = ({ isThreeX }: { isThreeX: boolean }) => {
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
    <div className="relative">
      <Slider {...settings} ref={(slider) => (customSlider.current = slider)}>
        {tutorialSteps.map((step, index) => (
          <div className="" key={index}>
            <div className="bg-customPurple rounded-lg h-110 p-8 flex flex-col justify-between text-white">
              <h6>How It Works</h6>

              <div className="py-24">
                <h3 className="font-medium text-2xl">{step.title}</h3>
                <p>{step.content}</p>
              </div>

              <div className="flex justify-end pt-6 gap-5 md:gap-0 md:space-x-5">
                {tutorialSteps.map((steps, index) => (
                  <div
                    className={`${currentSlide == index ? activeDot : inactiveDot} rounded-full h-3 w-3 transition-all`}
                    onClick={() => gotoSlide(index)}
                    key={index}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default TutorialSlider;
