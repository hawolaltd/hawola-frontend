import Link from "next/link";
import LegalPageShell from "@/components/legal/LegalPageShell";

const EFFECTIVE_DATE = "14 August 2026";

export default function CommunitySafetyGuidePage() {
  return (
    <LegalPageShell
      title="Community Safety Guide"
      effectiveDate={EFFECTIVE_DATE}
      description="Stay safe when chatting, arranging payment, and meeting merchants or buyers on Hawola."
    >
      <p>
        Hawola helps you discover products and talk with merchants. Many orders are paid through
        Hawola; some are arranged directly between you and the other party. Use this guide whenever
        you chat about payment, share proof of payment, or meet in person.
      </p>

      <section>
        <h2>1. Keep conversations on Hawola when you can</h2>
        <ul>
          <li>
            Prefer Hawola chat for order details, payment timing, and proof of payment so you have
            a record if something goes wrong.
          </li>
          <li>
            Be cautious if someone pressures you to move the conversation only to WhatsApp, SMS, or
            email and avoid leaving any trail on Hawola.
          </li>
        </ul>
      </section>

      <section>
        <h2>2. Payments and proof of payment</h2>
        <ul>
          <li>
            Confirm the amount, bank details, and who you are paying before you send money.
          </li>
          <li>
            Attach proof of payment in the order chat when you pay outside Hawola (image or PDF,
            max 1 MB). You can upload more than one proof if you paid in parts.
          </li>
          <li>
            Never share OTPs, full card numbers, banking passwords, or remote-access apps with
            anyone claiming to be support.
          </li>
          <li>
            If Hawola collected payment for the order, you do not need to pay the merchant again for
            that same line.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Meeting in person</h2>
        <ul>
          <li>Meet in a busy, public place when possible.</li>
          <li>Inspect the item carefully before you hand over cash or leave with the goods.</li>
          <li>Bring a friend if that helps you feel safer.</li>
          <li>Trust your instincts—walk away from deals that feel rushed or unclear.</li>
        </ul>
      </section>

      <section>
        <h2>4. Scams and red flags</h2>
        <ul>
          <li>Prices that seem too good to be true, especially with urgency to pay immediately.</li>
          <li>Requests to pay a “release fee,” “customs fee,” or “verification fee” to a stranger.</li>
          <li>Merchants or buyers who refuse to use Hawola chat for basic order confirmation.</li>
          <li>Anyone asking you to ignore Hawola messages or dispute tools.</li>
        </ul>
      </section>

      <section>
        <h2>5. If something goes wrong</h2>
        <ul>
          <li>
            Keep screenshots of chats, receipts, and proof of payment.
          </li>
          <li>
            Use Hawola order messaging and, when available, the dispute flow for that order line.
          </li>
          <li>
            Contact Hawola support from the customer service page if you need help reporting abuse
            or unsafe behaviour.
          </li>
        </ul>
      </section>

      <p className="mt-8 text-sm text-gray-600 not-prose">
        Also see our{" "}
        <Link href="/terms" className="text-deepOrange hover:underline">
          Terms of Use
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-deepOrange hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </LegalPageShell>
  );
}
