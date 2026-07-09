const MERCHANT_URL = "https://merchant.hawola.com";
const MERCHANT_REGISTER_URL = "https://merchant.hawola.com/register";

type MerchantAuthPromptProps = {
  variant: "login" | "register";
  className?: string;
  /** Render inline (e.g. beside another auth link) */
  inline?: boolean;
};

export default function MerchantAuthPrompt({
  variant,
  className = "",
  inline = false,
}: MerchantAuthPromptProps) {
  const href = variant === "register" ? MERCHANT_REGISTER_URL : MERCHANT_URL;
  const action = variant === "register" ? "sign up" : "sign in";
  const Tag = inline ? "span" : "p";

  return (
    <Tag
      className={`text-xs text-[#435a8c] ${inline ? "" : "text-center"} ${className}`}
    >
      Want to {action} as a merchant?{" "}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-blue-900 underline underline-offset-2 hover:text-blue-800"
      >
        Click here
      </a>
      .
    </Tag>
  );
}
