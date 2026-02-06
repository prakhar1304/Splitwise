"use client";

import { getAvatarUrl } from "@/utils/api";

interface AvatarProps {
  userId: string;
  name?: string;
  size?: number;
  className?: string;
}

export default function Avatar({ userId, name, size = 32, className = "" }: AvatarProps) {
  const url = getAvatarUrl(userId);
  return (
    <img
      src={url}
      alt={name ? `Avatar of ${name}` : "User avatar"}
      width={size}
      height={size}
      className={`rounded-full object-cover shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
