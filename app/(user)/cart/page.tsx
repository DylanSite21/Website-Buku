import Link from "next/link";
import { eq } from "drizzle-orm";
import { CheckoutForm } from "@/app/components/checkout-form";
import { removeCartItem, updateCartItem } from "@/actions/cart";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { books, cartItems, carts, stocks } from "@/lib/db/schema";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const user = await requireUser();
  const [cart] = await db.select().from(carts).where(eq(carts.userId, user.id)).limit(1);
  const items = cart
    ? await db.select({ item: cartItems, book: books, available: stocks.availableQuantity })
        .from(cartItems)
        .innerJoin(books, eq(cartItems.bookId, books.id))
        .leftJoin(stocks, eq(books.id, stocks.bookId))
        .where(eq(cartItems.cartId, cart.id))
    : [];
  const total = items.reduce((sum, { item, book }) => sum + Number(book.price) * item.quantity, 0);

  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Pembelian</p>
        <h1 className="mt-2 text-4xl font-bold">Keranjang belanja</h1>
      </div>
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-white p-12 text-center">
          <p className="text-lg font-semibold">Keranjang Anda masih kosong.</p>
          <Link className="btn-primary mt-5" href="/books">Jelajahi katalog</Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <ul className="space-y-3">
            {items.map(({ item, book, available }) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-white p-5">
                <div>
                  <Link href={`/books/${book.slug}`} className="font-bold hover:text-brand">{book.title}</Link>
                  <p className="mt-1 text-sm text-muted">{formatCurrency(book.price)} · {available} tersedia</p>
                </div>
                <div className="flex items-center gap-2">
                  <form action={updateCartItem.bind(null, item.id)} className="flex gap-2">
                    <input className="input w-20" type="number" name="quantity" min="1" max="20" defaultValue={item.quantity} aria-label={`Jumlah ${book.title}`} />
                    <button className="btn-outline">Perbarui</button>
                  </form>
                  <form action={removeCartItem.bind(null, item.id)}>
                    <button className="btn-danger">Hapus</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
          <aside className="h-fit space-y-5 rounded-xl border border-line bg-white p-6">
            <h2 className="text-xl font-bold">Ringkasan pesanan</h2>
            <div className="flex justify-between border-t border-line pt-4 font-bold"><span>Total</span><span>{formatCurrency(total)}</span></div>
            <p className="text-xs leading-5 text-muted">Stok akan diperiksa kembali saat pembayaran dikonfirmasi oleh admin.</p>
            <CheckoutForm />
          </aside>
        </div>
      )}
    </div>
  );
}