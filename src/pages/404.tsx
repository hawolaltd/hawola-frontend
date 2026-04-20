import Head from "next/head";
import { useRouter } from "next/router";
import AuthLayout from "@/components/layout/AuthLayout";
import StorefrontNotFound from "@/components/common/StorefrontNotFound";

/**
 * Site-wide 404 — same visual system as product detail “not found”.
 */
export default function Custom404() {
  const router = useRouter();
  const asPath = router?.asPath || "";

  return (
    <AuthLayout>
      <Head>
        <title>Hawola | Page not found</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <StorefrontNotFound
        kicker="Page not found"
        headline="This page went shopping elsewhere"
        description="The link may be broken, the page was removed, or you followed an old bookmark. Try search or head home—we will not judge your shopping habits."
        pathHint={asPath && asPath !== "/404" ? asPath : null}
      />
    </AuthLayout>
  );
}
