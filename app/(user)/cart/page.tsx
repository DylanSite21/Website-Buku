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
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Pembelian</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Keranjang belanja</h1>
        <p className="mt-3 text-muted">Tinjau pilihan buku sebelum melanjutkan checkout.</p>
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white px-5 py-14 text-center shadow-sm">
          <p className="text-lg font-semibold">Keranjang Anda masih kosong.</p>
          <Link className="btn-primary mt-5" href="/books">Jelajahi katalog</Link>
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <ul className="space-y-3">
            {items.map(({ item, book, available }) => (
              <li key={item.id} className="flex flex-col justify-between gap-5 rounded-2xl border border-line bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
                <div>
                  <Link href={`/books/${book.slug}`} className="font-bold hover:text-brand">{book.title}</Link>
                  <p className="mt-1 text-sm text-muted">{formatCurrency(book.price)} · {available} tersedia</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <form action={updateCartItem.bind(null, item.id)} className="flex min-w-0 flex-1 gap-2 sm:flex-none">
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
          <aside className="h-fit space-y-5 rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-6">
            <h2 className="text-xl font-bold">Ringkasan pesanan</h2>
            <div className="flex justify-between border-t border-line pt-4 text-lg font-bold"><span>Total</span><span>{formatCurrency(total)}</span></div>
            <p className="text-xs leading-5 text-muted">Stok akan diperiksa kembali saat pembayaran dikonfirmasi oleh admin.</p>
            <CheckoutForm />
          </aside>
        </div>
      )}
    </div>
  );
}