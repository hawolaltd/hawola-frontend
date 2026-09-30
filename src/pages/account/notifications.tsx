import { useEffect, useState } from "react";
import Link from "next/link";
import axiosInstance from "@/libs/api/axiosInstance";

type Row = { id: number; title: string; message: string; is_read: boolean; created_at: string; link?: string };

export default function NotificationsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await axiosInstance.get("/api/notifications/my-notifications/");
      setRows(res.data?.results || []);
    } catch {
      setError("Sign in to see your notifications.");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const markAll = async () => {
    await axiosInstance.post("/api/notifications/mark-all-read/");
    await load();
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        <button type="button" className="text-sm font-semibold text-slate-700" onClick={() => void markAll()}>
          Mark all read
        </button>
      </div>
      <p className="mb-4 text-sm text-slate-600">
        These are alerts Hawola already sent. Turn types on or off in{" "}
        <Link href="/account?tab=notifications" className="font-semibold underline">notification settings</Link>.
      </p>
      {error ? <p className="text-sm text-slate-500">{error}</p> : null}
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.id} className={`rounded-xl border px-4 py-3 ${row.is_read ? "border-slate-200 bg-white" : "border-slate-300 bg-slate-50"}`}>
            <p className="font-semibold text-slate-900">{row.title}</p>
            <p className="text-sm text-slate-600">{row.message}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
