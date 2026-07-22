// Product photo with a graceful fallback when no image URL is set.
// Uses a plain <img> so any external image URL works without extra config.
export default function FootwearImage({
  src,
  alt,
  className = "",
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={
          "flex items-center justify-center bg-cream-dark text-ink-soft " +
          className
        }
      >
        <span className="text-sm">No photo</span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={"object-cover " + className} />;
}
