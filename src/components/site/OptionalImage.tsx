import type { ImgHTMLAttributes } from "react";

type OptionalImageProps = ImgHTMLAttributes<HTMLImageElement>;

export function OptionalImage({
  src,
  alt = "",
  ...props
}: OptionalImageProps) {
  if (!src || (typeof src === "string" && !src.trim())) {
    return null;
  }

  return <img src={src} alt={alt} {...props} />;
}
