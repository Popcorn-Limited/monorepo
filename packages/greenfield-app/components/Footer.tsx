import Link from "next/link";
import React, { useEffect, useState } from "react";
import NewsletterSubscription from "@popcorn/greenfield-app/components/NewsletterSubscription";
import DiscordIcon from "@popcorn/greenfield-app/components/SVGIcons/DiscordIcon";
import MediumIcon from "@popcorn/greenfield-app/components/SVGIcons/MediumIcon";
import RedditIcon from "@popcorn/greenfield-app/components/SVGIcons/RedditIcon";
import TelegramIcon from "@popcorn/greenfield-app/components/SVGIcons/TelegramIcon";
import TwitterIcon from "@popcorn/greenfield-app/components/SVGIcons/TwitterIcon";
import YoutubeIcon from "@popcorn/greenfield-app/components/SVGIcons/YoutubeIcon";

const Footer = () => {
  const [telegramColor, setTelegramColor] = useState("#645F4B");
  const [twitterColor, setTwitterColor] = useState("#645F4B");
  const [mediumIcon, setMediumColor] = useState("#645F4B");
  const [discordColor, setDiscordColor] = useState("#645F4B");
  const [redditColor, setRedditColor] = useState("#645F4B");
  const [youtubeColor, setYoutubeColor] = useState("#645F4B");

  const [iconSize, setIconSize] = useState("24");

  useEffect(() => {
    if (window.matchMedia("(max-width: 768px)").matches) {
      setIconSize("30");
      setTelegramColor("#645F4B");
      setTwitterColor("#645F4B");
      setMediumColor("#645F4B");
      setDiscordColor("#645F4B");
      setRedditColor("#645F4B");
      setYoutubeColor("#645F4B");
    }
  }, []);

  const onHoverIcon = (setFunction) => {
    setFunction("#000000");
  };

  const onLeaveIcon = (setFunction) => {
    setFunction("#645F4B");
  };
  return (
    <footer className="grid grid-cols-12 smmd:gap-14 pb-10 mt-20 font-landing px-6 md:px-8">
      <div className="col-span-12 lg:col-span-3 order-1 smmd:order-1">
        <div className="bg-customYellow rounded-lg py-3 text-center font-medium text-black">
          Subscribe to our newsletter
        </div>
        <NewsletterSubscription title="Sign up" buttonLabel="Submit" />
      </div>
      <div className="col-span-12 smmd:col-span-6 flex flex-col justify-between order-3 smmd:order-2 mt-12 smmd:mt-0">
        <p className=" text-primaryDark leading-6 order-2 smmd:order-1 mt-8 smmd:mt-0">
          Popcorn is a multi-chain regenerative yield optimizing protocol.
        </p>
        <div className="flex justify-between smmd:justify-start smmd:gap-7 order-1 smmd:order-2">
          <a
            href="https://twitter.com/Popcorn_DAO"
            onMouseEnter={() => onHoverIcon(setTwitterColor)}
            onMouseLeave={() => onLeaveIcon(setTwitterColor)}
          >
            <TwitterIcon color={twitterColor} size={iconSize} />
          </a>
          <a
            href="https://discord.gg/w9zeRTSZsq"
            onMouseEnter={() => onHoverIcon(setDiscordColor)}
            onMouseLeave={() => onLeaveIcon(setDiscordColor)}
          >
            <DiscordIcon color={discordColor} size={iconSize} />
          </a>
          <a
            href="https://t.me/popcorndaochat"
            onMouseEnter={() => onHoverIcon(setTelegramColor)}
            onMouseLeave={() => onLeaveIcon(setTelegramColor)}
          >
            <TelegramIcon color={telegramColor} size={iconSize} />
          </a>
          <a
            href="https://medium.com/popcorndao"
            onMouseEnter={() => onHoverIcon(setMediumColor)}
            onMouseLeave={() => onLeaveIcon(setMediumColor)}
          >
            <MediumIcon color={mediumIcon} size={iconSize} />
          </a>
          <a
            href="https://www.reddit.com/r/popcorndao/"
            onMouseEnter={() => onHoverIcon(setRedditColor)}
            onMouseLeave={() => onLeaveIcon(setRedditColor)}
          >
            <RedditIcon color={redditColor} size={iconSize} />
          </a>
          <a
            href="https://www.youtube.com/channel/UCe8n8mGG4JR7nhFT4v9APyA"
            onMouseEnter={() => onHoverIcon(setYoutubeColor)}
            onMouseLeave={() => onLeaveIcon(setYoutubeColor)}
          >
            <YoutubeIcon color={youtubeColor} size={iconSize} />
          </a>
        </div>
      </div>

      <div className="col-span-12 smmd:col-span-6 lg:col-span-3 flex flex-col smmd:flex-row  gap-12 smmd:gap-0 smmd:justify-between order-2 smmd:order-3 mt-12 smmd:mt-0">
        <div>
          <p className="text-gray-900 font-medium leading-6 tracking-1">Links</p>
          <div className="flex flex-col">
            <Link href="/" className=" text-primary hover:text-black leading-6 mt-4">
              Popcorn
            </Link>
            <Link
              href="/docs/Popcorn_whitepaper_v1.pdf"
              target="_blank"
              className=" text-primary hover:text-black leading-6 mt-4"
            >
              Whitepaper
            </Link>
            <Link
              href="https://popcorn-dao.gitbook.io/popcorndao-gitbook/about-popcorn/welcome-to-popcorn"
              target="_blank"
              className=" text-primary hover:text-black leading-6 mt-4"
            >
              Gitbook
            </Link>
            <Link
              href="/disclaimer"
              target="_blank"
              className=" text-primary hover:text-black leading-6 mt-4"
            >
              Disclaimer
            </Link>
          </div>
        </div>

        <div>
          <p className="text-gray-900 font-medium leading-6 tracking-1">Bug Bounty</p>
          <div className="flex flex-col">
            <Link
              href="https://immunefi.com/bounty/popcornnetwork"
              passHref
              target="_blank"
              className=" text-primary hover:text-black leading-6 mt-4"
            >
              Immunefi
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
