import { Html, Head, Main, NextScript } from "next/document";
import {
  getTikTokPixelHeadScript,
  TIKTOK_PIXEL_ID,
} from "@/lib/tiktokPixelHeadScript";

export default function Document() {
  const pixelId = TIKTOK_PIXEL_ID.trim();

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
        {pixelId ? (
          <script
            id="tiktok-pixel"
            dangerouslySetInnerHTML={{ __html: getTikTokPixelHeadScript(pixelId) }}
          />
        ) : null}
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
