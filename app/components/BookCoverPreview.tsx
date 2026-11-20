import { BookCover } from "./book-cover";
import Image from "next/image";

export function BookCoverPreview({
  title,
  image,
}: {
  title: string;
  image: string | null;
}) {
  return (
    <div
      className="
        invisible fixed z-50
        w-48 rounded-xl border border-line
        bg-white p-2 opacity-0 shadow-xl
        transition-all duration-200
        [position-anchor:--book-anchor]
        [position-area:right]
        [position-try-fallbacks:left]
        group-hover/book:visible
        group-hover/book:opacity-100
      "
    >
      <div className="overflow-hidden rounded-lg">
        <BookCover title={title} image={image} />
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-semibold">{title}</p>
    </div>
  );
}
