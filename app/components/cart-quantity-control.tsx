"use client";

import { useState } from "react";
import { updateCartItem } from "@/actions/cart";

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 20;

export function CartQuantityControl({
  itemId,
  title,
  initialQuantity,
}: {
  itemId: string;
  title: string;
  initialQuantity: number;
}) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const updateItem = updateCartItem.bind(null, itemId);

  return (
    <form action={updateItem} className="flex items-center gap-2">
      <div className="flex flex-col">
        <button
          type="button"
          className="btn-outline size-7 p-0"
          aria-label={`Tambah jumlah ${title}`}
          disabled={quantity >= MAX_QUANTITY}
          onClick={() =>
            setQuantity((current) => Math.min(MAX_QUANTITY, current + 1))
          }
        >
          +
        </button>
        <button
          type="button"
          className="btn-outline size-7 p-0"
          aria-label={`Kurangi jumlah ${title}`}
          disabled={quantity <= MIN_QUANTITY}
          onClick={() =>
            setQuantity((current) => Math.max(MIN_QUANTITY, current - 1))
          }
        >
          -
        </button>
      </div>
      <input
        className="input w-16 text-center"
        type="number"
        name="quantity"
        min={MIN_QUANTITY}
        max={MAX_QUANTITY}
        value={quantity}
        readOnly
        aria-label={`Jumlah ${title}`}
      />
      <button type="submit" className="btn-outline">
        Perbarui
      </button>
    </form>
  );
}
