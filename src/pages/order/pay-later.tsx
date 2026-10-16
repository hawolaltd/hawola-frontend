import { useEffect, useState } from "react";
import Link from "next/link";
import AuthLayout from "@/components/layout/AuthLayout";
import axiosInstance from "@/libs/api/axiosInstance";
import CustomerPayLaterBox from "@/components/order/CustomerPayLaterBox";

type Plan = {
  orderitem_number: string;
  product_name: string;
  status: string;
  total_due: string;
  amount_left: string;
  payout_details: string;
  rhythm: string;
  can_accept: boolean;
  can_add_proof: boolean;
};

export default function PayLaterPage() {
  const [plans, setPlans] = useState<Plan[]>([]);

  const load = () => {
    axiosInstance.get("/orders/pay-later/").then((response) => {
      setPlans(response.data.results || []);
    });
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <AuthLayout>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800">Pay later</h1>
        <p className="mt-2 text-sm text-gray-600">
          Orders you accepted move here. The store is the one waiting to be paid. Hawola keeps the record and sends reminders.
        </p>
        <p className="mt-2 text-sm">
          <Link href="/pay-later-terms" className="underline">Pay later terms</Link>
        </p>
        <div className="mt-6 space-y-4">
          {plans.length === 0 ? <p className="text-sm text-gray-500">No Pay later orders yet.</p> : null}
          {plans.map((plan) => (
            <div key={plan.orderitem_number}>
              <p className="mb-2 font-semibold text-gray-800">{plan.product_name}</p>
              <CustomerPayLaterBox plan={plan} orderitemNumber={plan.orderitem_number} onChanged={load} />
            </div>
          ))}
        </div>
      </div>
    </AuthLayout>
  );
}
