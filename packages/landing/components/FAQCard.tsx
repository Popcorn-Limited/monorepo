import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

interface FaqCardProps {
  title: string;
  description: string;
}
export default function FaqCard({ title, description }: FaqCardProps) {

  const [visible, setVisible] = useState(false);

  return (
    <div onClick={() => setVisible(!visible)} onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)} className={`grow flex-col flex border-[#555555]`}>
      <div className="flex-row flex smmd:py-10 py-6 items-center justify-between">
        <div className="flex flex-col justify-start gap-y-4 w-[70%]">
          <p className="text-2xl smmd:text-3xl leading-none">{title}</p>
          <p className={`smmd:text-lg text-[#737373] ${visible === true ? 'flex' : 'hidden'}`}>{description}</p>
        </div>
        <div onClick={() => { }} className="w-12 h-12 rounded-full border-[#645F4B] border-[1px] flex flex-col justify-center items-center cursor-pointer">
          <ChevronDownIcon color="#645F4B" width={20} height={20} />
        </div>
      </div>
    </div>
  )
}