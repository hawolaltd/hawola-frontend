import { FormEvent, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import axiosInstance from "@/libs/api/axiosInstance";
import { uploadOrderItemProofOfPayment } from "@/lib/buyerChatApi";

type PayLater = {
  status?: string;
  total_due?: string;
  amount_left?: string;
  amount_confirmed?: string;
  payout_details?: string;
  rhythm?: string;
  terms_path?: string;
  can_accept?: boolean;
  can_add_proof?: boolean;
  orderitem_number?: string;
};

export default function CustomerPayLaterBox({
  plan,
  orderitemNumber,
  onChanged,
}: {
  plan?: PayLater | null;
  orderitemNumber: string;
  onChanged?: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  if (!plan || plan.status === "cancelled") return null;

  const accept = async () => {
    setBusy(true);
    try {
      await axiosInstance.post(`/orders/pay-later/${encodeURIComponent(orderitemNumber)}/accept/`);
      toast.success("You accepted Pay later.");
      onChanged?.();
    } catch (error: unknown) {
      const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail || "Could not accept Pay later.");
    } finally {
      setBusy(false);
    }
  };

  const sendProof = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      toast.error("Add the proof of payment.");
      return;
    }
    setBusy(true);
    try {
      await uploadOrderItemProofOfPayment(orderitemNumber, file, "Pay later payment", amount);
      toast.success("Proof sent. It counts after the store confirms it.");
      setAmount("");
      setFile(null);
      onChanged?.();
    } catch (error: unknown) {
      const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail || "Could not send the proof.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <h2 className="text-base font-semibold">Pay later</h2>
      {plan.status === "offered" ? (
        <>
          <p className="mt-2">
            The store is waiting on ₦{plan.total_due}. Accept the terms, agree to reminders, and commit to pay before the order can ship.
          </p>
          <p className="mt-2 whitespace-pre-wrap">{plan.payout_details}</p>
          <p className="mt-2">
            <Link href="/pay-later-terms" className="underline">Pay later terms</Link>
          </p>
          <button type="button" disabled={busy} onClick={accept} className="mt-3 rounded-lg bg-[#0B1B33] px-4 py-2 font-semibold text-white">
            {busy ? "Saving…" : "I accept Pay later"}
          </button>
        </>
      ) : (
        <>
          <p className="mt-2">
            ₦{plan.amount_left} left of ₦{plan.total_due}. {plan.rhythm === "daily" ? "Daily" : "Weekly"} reminders are on.
          </p>
          <p className="mt-2 whitespace-pre-wrap">{plan.payout_details}</p>
          {plan.can_add_proof ? (
            <form onSubmit={sendProof} className="mt-3 space-y-2">
              <label className="block">
                Amount you are paying
                <input className="mt-1 w-full rounded-lg border px-2 py-2" value={amount} onChange={(event) => setAmount(event.target.value)} required />
              </label>
              <input type="file" accept="image/*,.pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} required />
              <button type="submit" disabled={busy} className="rounded-lg bg-[#0B1B33] px-4 py-2 font-semibold text-white">
                {busy ? "Sending…" : "Send proof"}
              </button>
            </form>
          ) : null}
          {plan.status === "cleared" ? <p className="mt-2 font-semibold">This balance is cleared. You can leave a review.</p> : null}
        </>
      )}
    </section>
  );
}
