import CircleBunny from "./CircleBunny";
import HandsIcon from "./HandsIcon";
import ProductDisplay from "./ProductDisplay";
import RightArrowIcon from "./SVGIcons/RightArrowIcon";
import PointyBunny from "./pointyBunny";

export default function ProductsSection() {
  return (
    <section className="mt-44 p-8 w-screen xl:max-w-[1800px] xl:mx-auto">
      <div className="flex smmd:flex-row flex-col items-start">

        <div className="flex flex-row items-center gap-x-4 md:mr-48 smmd:mr-12 mb-12 smmd:mb-0">
          <p className="w-max">Our Products</p>
          <RightArrowIcon color="645F4B" />
        </div>

        <div className="flex flex-col grow w-[100%]">
          <ProductDisplay
            number="01"
            title="Sweet Vaults"
            description="Automated asset startegies that earn yield on your single asset deposits."
            url="/sweet-vaults"
            image={(color) => <CircleBunny color={color} />}
            animateColor="#C391FF"
            textColorClassname="text-[#C391FF]"
          />
          <ProductDisplay
            number="02"
            title="Vaults For Good"
            description="Vaults that fund public goods with the yield generated from its asset strategies."
            url=""
            image={(color) => <PointyBunny color={color} />}
            animateColor="#FA5A6E"
            textColorClassname="text-[#FA5A6E]"
          />
          <ProductDisplay
            number="03"
            title="POP Staking"
            description="Stake your POP for vlPOP to vote in PopcornDAO."
            url="staking"
            image={(color) => <HandsIcon color={color} />}
            animateColor="#FFE650"
            textColorClassname="text-[#FFE650]"
          />
        </div>

      </div>
    </section>
  )
}