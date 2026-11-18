"use client";

import { archiveBook } from "@/actions/books";

export default function ArchiveButton({
  bookId,
  bookTitle,
  buttonLabel = "Arsipkan",
  confirmationAction = "mengarsipkan",
}: {
  bookId: string;
  bookTitle: string;
  buttonLabel?: string;
  confirmationAction?: string;
}) {
  return (
    <form
      action={archiveBook.bind(null, bookId)}
      onSubmit={(e) => {
        if (!confirm(`Yakin ingin ${confirmationAction} "${bookTitle}"?`)) {
          e.preventDefault();
        }
      }}
    >
      <button className="btn-danger">{buttonLabel}</button>
    </form>
  );
}