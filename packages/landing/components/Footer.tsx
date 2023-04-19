import Link from "next/link";
import DiscordIcon from "./SVGIcons/DiscordIcon";
import GithubIcon from "./SVGIcons/GithubIcon";
import MediumIcon from "./SVGIcons/MediumIcon";
import TwitterIcon from "./SVGIcons/TwitterIcon";

export default function Footer() {

  return (
    <section id="xoxop" className="w-full pt-14 xl:max-w-[1800px] xl:mx-auto">
      <div className="flex flex-col md:flex-row justify-between w-11/12 pb-12 mx-auto border-b border-gray-500">
        <Link href="/" passHref>
          <img src="/images/icons/popLogo.svg" alt="Logo" className="h-10 hidden md:block"></img>
        </Link>
        <div className="space-y-6 md:hidden">
          <div className="flex flex-col space-y-3 text-base">
            <p className="text-base font-medium uppercase">Products</p>
            <Link href="https://app.pop.network/sweet-vaults" passHref>
              Sweet Vaults
            </Link>
            <Link href="https://app.pop.network/staking" passHref>
              Staking
            </Link>
          </div>
          <div className="flex flex-col space-y-3 text-base">
            <p className="text-base font-medium uppercase">Connect</p>
            <Link href="https://twitter.com/Popcorn_DAO" passHref>
              Twitter
            </Link>
            <Link href="https://discord.gg/w9zeRTSZsq" passHref>
              Discord
            </Link>
            <Link href="https://github.com/popcorndao" passHref>
              Github
            </Link>
          </div>
          <div className="flex flex-col space-y-3 text-base">
            <p className="text-base font-medium uppercase">Bug Bounty</p>
          </div>
        </div>
        <div className="md:w-6/12 mt-8 md:mt-0">
          <p className="md:w-7/12 text-base font-normal">
            Popcorn is an audited, non-custodial DeFi wealth manager with yield-generating products that simultaneously fund nonprofit and social impact organizations.
          </p>
          <div className="flex flex-row items-center justify-between md:justify-start md:space-x-4 mt-4">
            <Link href="https://twitter.com/Popcorn_DAO" passHref>
              <TwitterIcon color={"black"} size={"24"} />
            </Link>
            <Link href="https://medium.com/popcorndao" passHref>
              <MediumIcon color={"black"} size={"24"} />
            </Link>
            <Link href="https://discord.gg/w9zeRTSZsq" passHref>
              <DiscordIcon color={"black"} size={"24"} />
            </Link>
            <Link href="https://github.com/popcorndao" passHref>
              <GithubIcon color={"black"} size={"24"} />
            </Link>
          </div>
        </div>
        <div className="hidden md:flex flex-col space-y-3 text-base">
          <p className="text-base font-medium uppercase">Products</p>
          <Link href="https://app.pop.network/sweet-vaults" passHref>
            Sweet Vaults
          </Link>
          <Link href="https://app.pop.network/staking" passHref>
            Staking
          </Link>
        </div>
        <div className="hidden md:flex flex-col space-y-3 text-base">
          <p className="text-base font-medium uppercase">Connect</p>
          <Link href="https://twitter.com/Popcorn_DAO" passHref>
            Twitter
          </Link>
          <Link href="https://discord.gg/w9zeRTSZsq" passHref>
            Discord
          </Link>
          <Link href="https://github.com/popcorndao" passHref>
            Github
          </Link>
        </div>
        <div className="hidden md:flex flex-col space-y-3 text-base">
          <p className="text-base font-medium uppercase">Bug Bounty</p>
        </div>
      </div>
    </section>
  )
}