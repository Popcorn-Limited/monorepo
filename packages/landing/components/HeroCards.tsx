
interface HeroCardProps {
  title: string;
  color: string;
  description: string;
  imgUri: string;
  textColor?: string;
}
export default function HeroCards({ title, description, imgUri, color, textColor }: HeroCardProps) {
  return (
    <div className={`w-full h-full flex flex-col cursor-normal select-none rounded-xl ${color + ' ' + textColor} p-8`}>
      <p className="text-4xl mb-4">{title}</p>
      <p className="w-[65%] text-lg">{description}</p>
      <div className="h-full w-full flex flex-col justify-end items-end">
        <img src={imgUri} className="w-[30%] h-fit" />
      </div>
    </div>
  )
}