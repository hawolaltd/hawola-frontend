import HawolaLiveWatch from "@/components/live/HawolaLiveWatch";
import { useRouter } from "next/router";

export default function HawolaLivePage() {
  const router = useRouter();
  const slug = String(router.query.slug || "");
  if (!slug) return null;
  return <HawolaLiveWatch slug={slug} />;
}
