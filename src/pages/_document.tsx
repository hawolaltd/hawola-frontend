import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";
import {
  getTikTokPixelHeadScript,
  TIKTOK_PIXEL_ID,
} from "@/lib/tiktokPixelHeadScript";

export default function Document() {
  const pixelId = TIKTOK_PIXEL_ID;
  const eventsSrc = pixelId
    ? `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(
        pixelId
      )}&lib=ttq`
    : "";

  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/fav.png" />
        <meta
          name="impact-site-verification"
          // Impact.com reads this attribute. It is not a standard meta attribute.
          // @ts-expect-error value is required by Impact site verification
          value="d0cdaa9e-41b9-4ad8-afcf-c382960b189e"
        />
      </Head>
      <body className="antialiased">
        {pixelId ? (
          <>
            <Script
              id="tiktok-pixel"
              strategy="beforeInteractive"
              dangerouslySetInnerHTML={{
                __html: getTikTokPixelHeadScript(pixelId),
              }}
            />
            <Script id="tiktok-pixel-events" strategy="beforeInteractive" src={eventsSrc} />
          </>
        ) : null}
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
