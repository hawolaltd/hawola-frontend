import LegalPageShell from "@/components/legal/LegalPageShell";

type LegalPayload = {
  title?: string;
  description?: string;
  effective_date?: string;
  html_content?: string;
};

export default function CmsLegalDocument({
  title,
  description,
  effectiveDate,
  html,
}: {
  title: string;
  description: string;
  effectiveDate: string;
  html: string;
}) {
  return (
    <LegalPageShell
      title={title}
      effectiveDate={effectiveDate}
      description={description}
    >
      {html.trim() ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <p>This document is being updated. Please check back shortly.</p>
      )}
    </LegalPageShell>
  );
}

export type { LegalPayload };
