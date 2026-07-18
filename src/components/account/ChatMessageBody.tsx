type ChatMessageBodyProps = {
  text: string;
  variant?: "customer" | "merchant";
};

function PromoCodeBlock({ code, onDark }: { code: string; onDark?: boolean }) {
  return (
    <div
      className={`rounded-lg px-3 py-2 ${
        onDark
          ? "bg-white/15 ring-1 ring-white/25"
          : "bg-amber-50 ring-1 ring-amber-200/90"
      }`}
    >
      <p
        className={`text-[10px] font-semibold uppercase tracking-wide ${
          onDark ? "text-amber-100" : "text-amber-800"
        }`}
      >
        Promo code
      </p>
      <p
        className={`mt-0.5 font-mono text-sm font-bold tracking-[0.12em] ${
          onDark ? "text-white" : "text-amber-950"
        }`}
      >
        {code}
      </p>
      <p className={`mt-1 text-xs ${onDark ? "text-white/80" : "text-amber-900/80"}`}>
        Use this code at checkout.
      </p>
    </div>
  );
}

export default function ChatMessageBody({ text, variant = "merchant" }: ChatMessageBodyProps) {
  const onDark = variant === "customer";
  const blocks = text.split(/\n\n+/).map((block) => block.trim()).filter(Boolean);

  if (blocks.length <= 1 && !text.includes("Promo code:")) {
    return <p className="whitespace-pre-wrap">{text}</p>;
  }

  return (
    <div className="space-y-2">
      {blocks.map((block, index) => {
        const promoMatch = block.match(/^Promo code:\s*(\S+)/im);
        const code = promoMatch?.[1]?.trim();
        const isPromoBlock =
          Boolean(code) &&
          (block.includes("Use this code at checkout") || block.split("\n").length <= 3);

        if (isPromoBlock && code) {
          return <PromoCodeBlock key={`promo-${index}`} code={code} onDark={onDark} />;
        }

        if (block.startsWith("Items in your cart:")) {
          return (
            <div
              key={`cart-${index}`}
              className={`rounded-lg px-3 py-2 ${
                onDark
                  ? "bg-white/10 ring-1 ring-white/15"
                  : "bg-gray-50 ring-1 ring-gray-200/80"
              }`}
            >
              <pre className="chat-scroll-pane max-h-28 whitespace-pre-wrap font-sans text-xs leading-snug">
                {block}
              </pre>
            </div>
          );
        }

        return (
          <p key={`block-${index}`} className="whitespace-pre-wrap leading-relaxed">
            {block}
          </p>
        );
      })}
    </div>
  );
}
