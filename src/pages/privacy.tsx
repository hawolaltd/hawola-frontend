import type { GetServerSideProps } from "next";
import CmsLegalDocument, {
  type LegalPayload,
} from "@/components/legal/CmsLegalPage";
import { getApiUrl } from "@/lib/config";

type Props = {
  data: LegalPayload | null;
};

const FALLBACK = {
  title: "Hawola Privacy Policy",
  description: "How Hawola collects, uses, and protects your personal information.",
  effective_date: "25 June 2026",
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  try {
    const res = await fetch(
      `${getApiUrl()}/api/legal/pages/storefront-privacy/`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return { props: { data: null } };
    const data = (await res.json()) as LegalPayload;
    return { props: { data } };
  } catch {
    return { props: { data: null } };
  }
};

export default function PrivacyPolicyPage({ data }: Props) {
  return (
    <CmsLegalDocument
      title={data?.title || FALLBACK.title}
      description={data?.description || FALLBACK.description}
      effectiveDate={data?.effective_date || FALLBACK.effective_date}
      html={data?.html_content || ""}
    />
  );
}
