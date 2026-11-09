"use client";

import { archiveBook } from "@/actions/books";

export default function ArchiveButton({
  bookId,
  bookTitle,
}: {
  bookId: string;
  bookTitle: string;
}) {
  return (
    <form
      action={archiveBook.bind(null, bookId)}
      onSubmit={(e) => {
        if (!confirm(`Yakin ingin mengarsipkan "${bookTitle}"?`)) {
          e.preventDefault();
        }
      }}
    >
      <button className="btn-danger">Arsipkan</button>
    </form>
  );
}