export function BookCover({
  id,
  title,
  cover,
  className = "h-32 w-20",
}: {
  id: number;
  title: string;
  cover: string | null;
  className?: string;
}) {
  if (cover) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/api/covers/${cover}`}
        alt={`Sampul ${title}`}
        className={`${className} shrink-0 rounded-sm object-cover`}
      />
    );
  }

  return (
    <div
      className={`${className} flex shrink-0 items-end rounded-sm p-2 text-2xl font-bold text-white/90`}
      style={{ background: `hsl(${(id * 47) % 360} 38% 32%)` }}
      aria-hidden
    >
      {title[0]}
    </div>
  );
}
