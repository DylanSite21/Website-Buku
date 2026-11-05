import Image from "next/image";

export function BookCover({
  title,
  image,
}: {
  title: string;
  image: string | null;
}) {
  return (
    <div className="relative flex h-48 w-32 shrink-0 items-center justify-center overflow-hidden rounded-md bg-emerald-50">
      {image ? (
        <Image
          src={image.startsWith("http") ? image : `/uploads/${image}`}
          alt={`Sampul ${title}`}
          fill
          sizes="128px"
          unoptimized={image.startsWith("http")}
          className="object-cover"
        />
      ) : (
        <span className="px-3 text-center font-display text-sm font-semibold text-brand">
          {title}
        </span>
      )}
    </div>
  );
}
