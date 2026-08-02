import { useEffect, useState, type ImgHTMLAttributes } from 'react';

function preload(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: string;
};

/**
 * Keeps the previous frame visible until the next src has fully loaded,
 * so image swaps (CMS hydrate, admin upload) do not flash blank.
 */
export default function StableImage({ src, alt = '', ...rest }: Props) {
  const [displaySrc, setDisplaySrc] = useState(src);

  useEffect(() => {
    if (!src || src === displaySrc) return;
    let cancelled = false;
    void preload(src).then(() => {
      if (!cancelled) setDisplaySrc(src);
    });
    return () => {
      cancelled = true;
    };
  }, [src, displaySrc]);

  if (!displaySrc) return null;
  return <img src={displaySrc} alt={alt} {...rest} />;
}

/** Wait until a remote image is decoded before swapping the form value. */
export function waitForImage(src: string): Promise<void> {
  return preload(src);
}
