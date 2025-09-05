import { Work_Sans } from "next/font/google";
import Fire from "../assets/images/fire.svg";
import Quest from "../assets/images/quest.svg";
import Membership from "../assets/images/membership.svg";
import Collectibles from "../assets/images/collectibles.svg";
import Lock from "../assets/images/lock.svg";
import Phygital from "../assets/images/phigtal.svg";
import ClaimNftPhone from "../assets/claim-nft-phone.png";
import ConnectPhone from "../assets/connect-phone.png";
import Badge from "../assets/badge-icon.png";
import Gift from "../assets/gift-icon.png";
import React from "react";
import Image from "next/image";

const workSans = Work_Sans({ subsets: ["latin"] });

const ExploreSection = () => {
  return (
    <div className="bg-[#00041F] md:py-4 py-0">
      <div className="container">
        <div className="flex flex-col gap-y-8 items-center justify-center my-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-x-[40px]">
            <div className="md:w-[560px] w-[350px] md:h-[420px] h-[262.5px] bg-[#1A1D35] backdrop-blur-md rounded-md flex items-end justify-center">
              <Image
                src={ClaimNftPhone}
                alt="Claim Nft Phone"
                className="md:w-[483px] w-[301.88px]"
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="my-4 px-6">
                <p
                  className={`${workSans.className} text-white md:text-3xl text-2xl font-bold my-2`}
                >
                  Up your game with Web3 Magic
                </p>
                <p className={`${workSans.className} text-white my-2`}>
                  Elevate the perceived value of your rewars by giving users
                  something <br /> they actually own. Better rewards make for
                  happy and engaged <br /> communities
                </p>
              </div>
              <div className="my-4 md:px-4 px-2 flex items-center gap-x-8">
                <div className="flex flex-col items-start justify-center gap-y-8">
                  <div className="flex justify-center items-center gap-x-4">
                    <div className="w-[46px] h-[46px] bg-[#1A1D35] backdrop-blur-md rounded-full flex items-center justify-center">
                      <Fire />
                    </div>
                    <p
                      className={`${workSans.className} text-white md:text-lg text-sm md:font-semibold font-normal`}
                    >
                      Loyalty Points
                    </p>
                  </div>
                  <div className="flex justify-center items-center gap-x-4">
                    <div className="w-[46px] h-[46px] bg-[#1A1D35] backdrop-blur-md rounded-full flex items-center justify-center">
                      <Membership />
                    </div>
                    <p
                      className={`${workSans.className} text-white md:text-lg text-sm md:font-semibold font-normal`}
                    >
                      Membership
                    </p>
                  </div>
                  <div className="flex justify-center items-center gap-x-4">
                    <div className="w-[46px] h-[46px] bg-[#1A1D35] backdrop-blur-md rounded-full flex items-center justify-center">
                      <Image src={Badge} alt="Badge" />
                    </div>
                    <p
                      className={`${workSans.className} text-white md:text-lg text-sm md:font-semibold font-normal`}
                    >
                      Badges
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-start justify-center gap-y-8">
                  <div className="flex justify-center items-center gap-x-4">
                    <div className="w-[46px] h-[46px] bg-[#1A1D35] backdrop-blur-md rounded-full flex items-center justify-center">
                      <Quest />
                    </div>
                    <p
                      className={`${workSans.className} text-white md:text-lg text-sm md:font-semibold font-normal`}
                    >
                      Quests
                    </p>
                  </div>
                  <div className="flex justify-center items-center gap-x-4">
                    <div className="w-[46px] h-[46px] bg-[#1A1D35] backdrop-blur-md rounded-full flex items-center justify-center">
                      <Collectibles />
                    </div>
                    <p
                      className={`${workSans.className} text-white md:text-lg text-sm md:font-semibold font-normal`}
                    >
                      Collectibles
                    </p>
                  </div>
                  <div className="flex justify-center items-center gap-x-4">
                    <div className="w-[46px] h-[46px] bg-[#1A1D35] backdrop-blur-md rounded-full flex items-center justify-center">
                      <Image src={Gift} alt="Badge" />
                    </div>
                    <p
                      className={`${workSans.className} text-white md:text-lg text-sm md:font-semibold font-normal`}
                    >
                      Streaks & more..
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap-reverse items-center justify-center gap-x-[40px]">
            <div className="flex flex-col justify-center">
              <div className="my-4">
                <p
                  className={`${workSans.className} text-white md:text-3xl text-2xl font-bold m-2`}
                >
                  Empower Customers to Become <br className="md:block hidden" />{" "}
                  Owners of your Brand
                </p>
                <p className={`${workSans.className} text-white text-md m-2`}>
                  Get your customers involved with decisions that give them a
                  feeling of <br /> participation and pride in the brand&apos;s
                  identity.
                </p>
              </div>
              <div className="my-4 flex flex-col md:flex-row justify-center items-center gap-x-6 gap-y-4">
                <div className="bg-[#1A1D35] backdrop-blur-md rounded-2xl md:px-6 px-4 md:py-6 py-4 w-full md:w-auto">
                  <div className="w-[46px] h-[46px] bg-[#00041F] backdrop-blur-md rounded-full flex items-center justify-center mb-2">
                    <Lock />
                  </div>
                  <p
                    className={`${workSans.className} text-white text-[20px] font-semibold my-2`}
                  >
                    Phygital Experience
                  </p>
                  <p
                    className={`${workSans.className} text-white text-[14px] my-2`}
                  >
                    Add a new dimension to user{" "}
                    <br className="md:block hidden" /> journeys by combining the{" "}
                    <br className="md:block hidden" /> digital and physical.
                  </p>
                </div>
                <div className="bg-[#1A1D35] backdrop-blur-md rounded-2xl px-6 py-6 w-full md:w-auto">
                  <div className="w-[46px] h-[46px] bg-[#00041F] backdrop-blur-md rounded-full flex items-center justify-center mb-2">
                    <Phygital />
                  </div>
                  <p
                    className={`${workSans.className} text-white text-[20px] font-semibold my-2`}
                  >
                    Customer Acquisition
                  </p>
                  <p
                    className={`${workSans.className} text-white text-[14px] my-2`}
                  >
                    Add community features: <br className="md:block hidden" />{" "}
                    Raffles, Leaderboards,
                    <br className="md:block hidden" /> Milestones, and more.
                  </p>
                </div>
                <div className="bg-[#1A1D35] backdrop-blur-md rounded-md"></div>
              </div>
            </div>
            <div className="md:w-[560px] w-[350px] md:h-[420px] h-[263px] bg-[#1A1D35] backdrop-blur-md rounded-md flex items-end justify-center">
              <Image
                src={ConnectPhone}
                alt="Connect Phone"
                className="md:w-[400.7px] w-[250.44px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreSection;
