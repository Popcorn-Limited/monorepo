import Link from "next/link";
import SecondaryActionButton from "./Common/SecondaryActionButton";
import FaqCard from "./FAQCard";
import DiscordIcon from "./SVGIcons/DiscordIcon";
import TwitterIcon from "./SVGIcons/TwitterIcon";

export default function FinalSection() {

  return (
    <section className="px-8 bg-[#F7F7F7] smmd:py-36 py-18 flex flex-col w-screen">
      <div className="2xl:max-w-[1800px] 2xl:mx-auto">
        <div className="flex smmd:flex-row flex-col-reverse w-full h-fit">
          <div className="flex-col smmd:w-1/2 w-full mt-18 smmd:mt-0">
            <p className="text-lg mb-2">Frequently Asked Questions</p>
            <p className="smmd:text-7xl text-4xl leading-none">Empower Your Investments and Create Positive Change</p>
          </div>

          <div className="flex-col flex smmd:w-1/2 w-full items-end">

            <Link
              href="https://discord.gg/w9zeRTSZsq"
              passHref
              className="cursor-pointer flex flex-row bg-[#FEE25D] py-3 items-center justify-center w-full smmd:w-[70%] rounded-[4px]">
              <p className="">Join us on discord </p>
              <div className="h-fit mt-2 ml-2">
                <DiscordIcon color="black" size="24" />
              </div>
            </Link>

            <div className="flex flex-col mt-18 w-full smmd:w-[70%]">
              <p className="text-[#6B7280]">Be part of our community</p>
              <div className="flex flex-row w-full border-x-0 border-y-customLightGray border-y-2 mt-2">
                <Link
                  href="https://twitter.com/Popcorn_DAO"
                  passHref
                  className="flex flex-row items-center w-full justify-end">
                  <div className="flex flex-row items-center w-3/4">
                    <p className="text-[#645F4B] py-2 w-fit leading-7 font-bold mr-4">Follow us on Twitter</p>
                    <TwitterIcon color="#645F4B" size="24" />
                  </div>
                  <div className="w-1/4">
                    <SecondaryActionButton label="" customArrowColor="645F4B" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col grow w-full mt-20 smmd:mt-30 divide-y divide-primaryLight">
          <FaqCard title="What is Popcorn?" description="xxx" />
          <FaqCard title="How does Popcorn work?" description="xxx" />
          <FaqCard title="Can I create a savings account with Popcorn?" description="xxx" />
          <FaqCard title="What kind of positive global impact can I make with Popcorn?" description="xxx" />
        </div>
      </div>
    </section>
  )
}