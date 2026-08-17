import type { GetServerSideProps } from "next";
import CmsLegalDocument, {
  type LegalPayload,
} from "@/components/legal/CmsLegalPage";
import { getApiUrl } from "@/lib/config";

type Props = {
  data: LegalPayload | null;
};

const FALLBACK = {
  title: "Hawola Terms of Use",
  description:
    "Terms and conditions for using the Hawola marketplace as a shopper or account holder.",
  effective_date: "25 June 2026",
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  try {
    const res = await fetch(`${getApiUrl()}/api/legal/pages/storefront-terms/`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return { props: { data: null } };
    const data = (await res.json()) as LegalPayload;
    return { props: { data } };
  } catch {
    return { props: { data: null } };
  }
};

export default function TermsOfUsePage({ data }: Props) {
  return (
    <CmsLegalDocument
      title={data?.title || FALLBACK.title}
      description={data?.description || FALLBACK.description}
      effectiveDate={data?.effective_date || FALLBACK.effective_date}
      html={data?.html_content || ""}
    />
  );
}
