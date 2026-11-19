import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import { getApiUrl } from "@/lib/config";

type Receipt = {
  store_name: string;
  sale_id: string;
  sold_at: string | null;
  payment_method: string;
  customer_name: string;
  origin: string;
  order_number: string | null;
  lines: Array<{ name?: string; qty?: number; unit_price?: string }>;
  total: string;
};

function money(value: string | number) {
  const n = Number(value || 0);
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

async function downloadPdf(token: string, filename: string) {
  const res = await fetch(
    `${getApiUrl()}/api/merchantapi/pos/receipts/${encodeURIComponent(token)}/?download=pdf`
  );
  if (!res.ok) throw new Error("Could not download this receipt.");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function PosPublicReceiptPage() {
  const router = useRouter();
  const token = typeof router.query.token === "string" ? router.query.token : "";
  const [data, setData] = useState<Receipt | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    fetch(`${getApiUrl()}/api/merchantapi/pos/receipts/${encodeURIComponent(token)}/`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Receipt not found.");
        return res.json() as Promise<Receipt>;
      })
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch(() => {
        if (!cancelled) setError("This receipt is not available. Ask the store to sync the sale and try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  function download() {
    if (!data || !token) return;
    const slug = (data.store_name || "receipt").replace(/[^\w.-]+/g, "-");
    void downloadPdf(token, `${slug}-${data.sale_id}.pdf`);
  }

  return (
    <>
      <Head>
        <title>{data ? `${data.store_name}` : "Receipt"}</title>
      </Head>
      <main className="min-h-screen bg-[#f8fafc] px-4 py-10">
        <div className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-sm">
          {loading ? <p className="mt-6 text-sm text-slate-500">Loading receipt…</p> : null}
          {error ? <p className="mt-6 text-sm text-amber-800">{error}</p> : null}
          {data ? (
            <>
              <h1 className="text-2xl font-bold text-slate-900">{data.store_name}</h1>
              <p className="mt-1 font-mono text-sm font-semibold">{data.sale_id}</p>
              <p className="mt-1 text-sm text-slate-500">
                {data.sold_at ? new Date(data.sold_at).toLocaleString() : ""} · {data.payment_method}
                {data.origin === "offline" ? " · Offline sale" : " · Online sale"}
              </p>
              {data.customer_name ? <p className="mt-2 text-sm">For {data.customer_name}</p> : null}
              <ul className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-100">
                {(data.lines || []).map((line, index) => (
                  <li key={`${line.name}-${index}`} className="flex justify-between gap-3 px-3 py-2 text-sm">
                    <span>
                      {line.name} × {line.qty}
                    </span>
                    <span className="font-semibold">
                      {money(Number(line.unit_price || 0) * Number(line.qty || 0))}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xl font-bold">Total {money(data.total)}</p>
              <button
                type="button"
                onClick={download}
                className="mt-6 w-full rounded-2xl bg-[#0f172a] py-3 text-sm font-semibold text-white"
              >
                Download PDF
              </button>
              <p className="mt-4 text-center text-xs text-slate-400">Powered by Hawola.com</p>
            </>
          ) : null}
        </div>
      </main>
    </>
  );
}
