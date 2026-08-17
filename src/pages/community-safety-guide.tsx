import type { GetServerSideProps } from "next";
import CmsLegalDocument, {
  type LegalPayload,
} from "@/components/legal/CmsLegalPage";
import { getApiUrl } from "@/lib/config";

type Props = {
  data: LegalPayload | null;
};

const FALLBACK = {
  title: "Community Guidelines & Safety Guide",
  description:
    "Hawola community guidelines and safety practices for shoppers and account holders.",
  effective_date: "14 August 2026",
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  try {
    const res = await fetch(
      `${getApiUrl()}/api/legal/pages/community-safety/`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return { props: { data: null } };
    const data = (await res.json()) as LegalPayload;
    return { props: { data } };
  } catch {
    return { props: { data: null } };
  }
};

export default function CommunitySafetyGuidePage({ data }: Props) {
  return (
    <CmsLegalDocument
      title={data?.title || FALLBACK.title}
      description={data?.description || FALLBACK.description}
      effectiveDate={data?.effective_date || FALLBACK.effective_date}
      html={data?.html_content || ""}
    />
  );
}
