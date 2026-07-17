import { Html, Head, Main, NextScript } from "next/document";
import {
  getTikTokPixelHeadScript,
  TIKTOK_PIXEL_ID,
} from "@/lib/tiktokPixelHeadScript";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/fav.png" />
        {TIKTOK_PIXEL_ID ? (
          <>
            {/* TikTok Pixel Code Start */}
            <script
              dangerouslySetInnerHTML={{
                __html: getTikTokPixelHeadScript(TIKTOK_PIXEL_ID),
              }}
            />
            {/* TikTok Pixel Code End */}
          </>
        ) : null}
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
