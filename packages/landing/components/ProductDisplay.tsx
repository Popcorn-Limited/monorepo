import Link from "next/link";
import { useEffect, useState } from "react";

interface ProductDisplayProps {
  number: string;
  title: string;
  description: string;
  url: string;
  image: (color: string) => JSX.Element;
  animateColor: string;
  textColorClassname: string;
}
export default function ProductDisplay({ number, title, description, url, image, animateColor, textColorClassname }: ProductDisplayProps) {

  const [logoColor, setLogoColour] = useState('black');

  function expandAndAnimate() {
    setLogoColour(animateColor);
  }

  useEffect(() => {
    if (window?.screen.availWidth < 700) setLogoColour(animateColor);
  }, [])

  return (
    <Link href={`https://app.pop.network/${url}`} passHref>
      <div
        onMouseEnter={expandAndAnimate}
        onMouseLeave={() => setLogoColour('black')}
        className={`cursor-pointer grow flex-col flex border-[#555555] ${number === '03' ? 'smmd:border-y-[1px]' : 'border-0 smmd:border-1 border-y-[1px] smmd:border-b-0 border-b-1 border-t-0 smmd:border-t-1 smmd:border-y-[1px]'}`}
      >
        <div className="flex-row flex smmd:py-10 py-6 items-start">
          <p className={`smmd:mr-24 md:mr-48 mr-4 text-lg smmd:text-black ${textColorClassname}`}>{number}</p>
          <div className="flex flex-col justify-start gap-y-4 grow">
            <p className="smmd:text-6xl text-2xl leading-none">{title}</p>
            <p className={`smmd:text-lg text-[#737373] flex ${logoColor === 'black' ? 'md:hidden' : 'md:flex'}`}>{description}</p>
          </div>
          <div className="smmd:grow smmd:grow-0 flex flex-row justify-end smmd:items-center items-start smmd:h-full h-8 w-8 smmd:w-16 smmd:h-16 smmd:self-center -mt-3 smmd:mt-0">
            {image(logoColor)}
          </div>
        </div>
      </div>
    </Link>
  )
}