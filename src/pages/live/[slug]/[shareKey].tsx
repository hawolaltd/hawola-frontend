import HawolaLiveWatch from "@/components/live/HawolaLiveWatch";
import { useRouter } from "next/router";

export default function HawolaLiveSharePage() {
  const router = useRouter();
  const slug = String(router.query.slug || "");
  const shareKey = String(router.query.shareKey || "");
  if (!slug || !shareKey) return null;
  return <HawolaLiveWatch slug={slug} shareKey={shareKey} />;
}
