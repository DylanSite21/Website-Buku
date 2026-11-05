import { redirect } from "next/navigation";

export default async function LegacyTransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/transactions/${encodeURIComponent(id)}`);
}