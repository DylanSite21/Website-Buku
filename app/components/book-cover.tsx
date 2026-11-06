import Image from "next/image";

export function BookCover({
  title,
  image,
}: {
  title: string;
  image: string | null;
}) {
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden bg-emerald-50">
      {image ? (
        <Image
          src={image.startsWith("http") ? image : `/uploads/${image}`}
          alt={`Sampul ${title}`}
          fill
          sizes="(max-width: 768px) 50vw, 250px"
          unoptimized={image.startsWith("http")}
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center p-5">
          <span className="text-center font-display text-lg font-bold text-brand">
            {title}
          </span>
        </div>
      )}
    </div>
  );
}
