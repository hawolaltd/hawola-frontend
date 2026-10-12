import type { GetServerSideProps } from "next";
import CmsLegalDocument, {
  type LegalPayload,
} from "@/components/legal/CmsLegalPage";
import { getApiUrl } from "@/lib/config";

type Props = {
  data: LegalPayload | null;
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const raw = ctx.params?.slug;
  const slug = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) {
    return { notFound: true };
  }
  try {
    const path = encodeURIComponent(`/pages/${slug}`);
    const res = await fetch(
      `${getApiUrl()}/api/legal/pages/-/?audience=storefront&path=${path}`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return { notFound: true };
    const data = (await res.json()) as LegalPayload;
    return { props: { data } };
  } catch {
    return { notFound: true };
  }
};

export default function CmsStorefrontPage({ data }: Props) {
  if (!data?.title) return null;
  return (
    <CmsLegalDocument
      title={data.title}
      description={data.description || ""}
      effectiveDate={data.effective_date || ""}
      html={data.html_content || ""}
    />
  );
}
