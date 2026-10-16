import Link from "next/link";
import AuthLayout from "@/components/layout/AuthLayout";

export default function PayLaterTermsPage() {
  return (
    <AuthLayout>
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8 text-sm leading-6 text-gray-800">
        <h1 className="text-3xl font-bold">Pay later terms</h1>
        <p>
          Pay later is an arrangement with the store. The store is the one allowing you to clear the balance over time. Hawola keeps the record and sends reminders. Hawola is not lending you the money.
        </p>
        <p>
          Before a store can ship, you accept these terms, you agree to receive reminders, and you commit to pay the remaining balance.
        </p>
        <p>
          A payment counts only after the store confirms the proof and the amount. The amount confirmed cannot be more than what is left. You can mark the order received while a balance is still open. Reviews open when the balance is zero.
        </p>
        <p>
          You can turn reminder channels off in your notification settings. The balance itself stays until it is cleared.
        </p>
        <p>
          <Link href="/order/pay-later" className="underline">Back to Pay later</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
