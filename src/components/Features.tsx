import React from "react";
import { Work_Sans } from "next/font/google";
import Hand from "../assets/images/hand.svg";
import Puzzle from "../assets/images/puzzle.svg";
import Phone from "../assets/phone.gif";
import Phone2 from "../assets/phone-2.gif";
import Image from "next/image";

const workSans = Work_Sans({ subsets: ["latin"] });

const Features = () => {
  return (
    <div className="bg-[#00041F] md:px-[100px] px-4 py-12 flex flex-col md:flex-row gap-x-8 justify-center items-center gap-6">
      <div className="flex flex-col items-center justify-center md:gap-y-8 gap-y-6 w-full max-w-[541px]">
        <div className="rounded-2xl p-4 md:px-8 px-4 md:mx-2 mx-0 w-full bg-white/90 border border-black/10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)]">
          <p
            className={`${workSans.className} my-2 text-black md:text-2xl text-[16px] font-semibold`}
          >
            Design the perfect Campaign
          </p>
          <div className="backdrop-blur-sm w-full md:h-[300px] h-[173.55px] rounded-xl my-3 overflow-hidden">
            <Image
              src={Phone}
              alt="Phone GIF"
              className="w-full md:h-[300px] h-[173.55px] object-cover"
            />
          </div>
          <p
            className={`${workSans.className} my-2 text-black/80 md:text-[16px] text-[14px] leading-relaxed`}
          >
            Our Team of experts help design the product campaign choose from a
            suite of features ( Points, Badge, Etc)
          </p>
        </div>
        <div className="rounded-2xl md:p-8 p-4 w-full bg-[#0f1430] border border-white/10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)]">
          <div className="my-4">
            <Hand />
            <p
              className={`${workSans.className} my-3 text-white md:text-2xl text-[16px] font-semibold`}
            >
              Hyper-Personalisation with Web3 AI
            </p>
          </div>
          <div className="my-4">
            <p
              className={`${workSans.className} my-2 md:text-[16px] text-[14px] text-white/80 leading-relaxed`}
            >
              AI enabled campaigns ensure a unique experience for each user
              journey.
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center md:gap-y-8 gap-y-6 w-full max-w-[541px]">
        <div className="rounded-2xl p-4 md:px-8 px-4 md:mx-2 mx-0 w-full bg-[#0f1430] border border-white/10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)]">
          <p
            className={`${workSans.className} my-2 text-white md:text-2xl text-[16px] font-semibold`}
          >
            In Depth Analytics
          </p>
          <div className="backdrop-blur-sm w-full md:h-[300px] h-[173.55px] rounded-xl my-3 overflow-hidden">
            <Image
              src={Phone2}
              alt="Phone GIF"
              className="w-full md:h-[300px] h-[173.55px] object-cover"
            />
          </div>
          <p
            className={`${workSans.className} my-2 text-white/80 md:text-[16px] text-[14px] leading-relaxed`}
          >
            Our AI tool generate unique assists and messaging loream ipsum your
            users gets personalized experience.
          </p>
        </div>
        <div className="rounded-2xl md:p-8 p-4 w-full bg-white/95 border border-black/10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)]">
          <div className="my-4">
            <Puzzle />
            <p
              className={`${workSans.className} my-3 text-black md:text-2xl text-[16px] font-semibold`}
            >
              Gamified User Journeys
            </p>
          </div>
          <div className="my-4">
            <p
              className={`${workSans.className} my-2 text-black/80 md:text-[16px] text-[14px] leading-relaxed`}
            >
              We help you track and analyse every session giving you a better
              understanding of your consumer&apos;s behaviour.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
