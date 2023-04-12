import React from "react";
import Slider from "react-slick";

interface Props {
  children: JSX.Element[];
  slidesToShow?: number;
  settingsOverride?: Object;
}

const SliderContainer: React.FC<Props> = ({ children, slidesToShow = 5, settingsOverride = {} }) => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 2000,
    autoplaySpeed: 0,
    slidesToShow,
    slidesToScroll: 1,
    autoplay: true,
    easing: "easeInOut",
    pauseOnHover: false,

    responsive: [
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
    ...settingsOverride
  };

  return <Slider {...settings}>{children}</Slider>;
};

export default SliderContainer;
