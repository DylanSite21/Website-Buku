import { BookCover } from "./book-cover";

export function BookCoverPreview({
  bookId,
  title,
  image,
}: {
  bookId: string;
  title: string;
  image: string | null;
}) {
  const anchorName = `--book-${bookId}`;

  return (
    <div
      style={{ positionAnchor: anchorName }}
      className="
        invisible fixed z-50
        w-48 rounded-xl border border-line
        bg-white p-2 opacity-0 shadow-xl
        transition-all duration-200
        [position-area:right]
        [position-try-fallbacks:flip-inline]
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
