"use client";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import React, { ReactNode } from "react";

type Badge = {
  text: string;
  className?: string;
};

type NftCardProps = {
  href?: string;
  imageUrl: string | StaticImageData;
  title: string;
  description?: string;
  badge?: Badge;
  className?: string;
  imageClassName?: string;
  contentClassName?: string;
  footer?: ReactNode;
};

export default function NftCard({
  href,
  imageUrl,
  title,
  description,
  badge,
  className,
  imageClassName,
  contentClassName,
  footer,
}: NftCardProps) {
  const Card = (
    <div
      className={
        "bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden shadow-lg transition-all duration-200 hover:bg-white/15 flex flex-col h-full " +
        (className || "")
      }
    >
      {/* Badge */}
      {badge?.text ? (
        <div
          className={`absolute top-2 right-2 text-white text-xs px-2 py-1 rounded-full z-10 ${
            badge.className || "bg-white/20"
          }`}
        >
          {badge.text}
        </div>
      ) : null}

      {/* Image */}
      <div className="relative aspect-square">
        <Image
          src={imageUrl || "https://via.placeholder.com/300"}
          alt={title}
          className={"w-full h-full object-cover " + (imageClassName || "")}
          width={200}
          height={200}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
          <h3 className="text-xl font-bold text-white drop-shadow-lg">
            {title}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div
        className={
          "p-4 flex flex-col justify-between grow min-h-[150px] " +
          (contentClassName || "")
        }
      >
        {description ? (
          <p className="text-sm text-white/70 line-clamp-2 mb-4 leading-relaxed">
            {description}
          </p>
        ) : (
          <div className="mb-4" />
        )}
        {footer}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {Card}
      </Link>
    );
  }

  return Card;
}
