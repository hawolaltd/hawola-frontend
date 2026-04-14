import Head from "next/head";

/**
 * Full-screen splash while site settings are fetched (under-construction gate).
 */
export default function SiteSettingsPreloader() {
  return (
    <>
      <Head>
        <title>Hawola</title>
      </Head>
      <div
        className="fixed inset-0 z-[9999] overflow-hidden bg-white"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
          <div className="flex w-full max-w-md flex-col items-center px-8 py-10 text-center">
            <img
              src="/hawola_Logo.png"
              alt="Hawola logo"
              className="h-10 w-auto motion-safe:animate-preloader-logo-pulse motion-reduce:animate-none"
            />
            <p className="mt-6 text-sm font-semibold tracking-[0.08em] text-[#425A8B] md:text-base">
              <span className="inline-block motion-safe:animate-preloader-tagline-rise motion-reduce:animate-none">
                Find it, Own it!
              </span>
            </p>
            <div className="mt-5 h-1.5 w-40 overflow-hidden rounded-full bg-[#e8edf7]">
              <span className="block h-full w-1/2 rounded-full bg-[#FD9636] motion-safe:animate-preloader-progress motion-reduce:animate-none" />
            </div>
          </div>
        </div>
        <span className="sr-only">Loading</span>
      </div>
      <style jsx global>{`
        @keyframes preloaderLogoPulse {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.92; }
          50% { transform: translateY(-2px) scale(1.03); opacity: 1; }
        }
        @keyframes preloaderTaglineRise {
          0% { transform: translateY(10px); opacity: 0; }
          30% { opacity: 1; }
          70% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(0); opacity: 0.86; }
        }
        @keyframes preloaderProgress {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(240%); }
        }
        .animate-preloader-logo-pulse {
          animation: preloaderLogoPulse 1.9s ease-in-out infinite;
        }
        .animate-preloader-tagline-rise {
          animation: preloaderTaglineRise 1.8s ease-in-out infinite;
        }
        .animate-preloader-progress {
          animation: preloaderProgress 1.4s linear infinite;
        }
      `}</style>
    </>
  );
}
