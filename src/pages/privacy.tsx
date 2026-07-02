import Link from "next/link";
import LegalPageShell from "@/components/legal/LegalPageShell";

const EFFECTIVE_DATE = "25 June 2026";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      title="Hawola Privacy Policy"
      effectiveDate={EFFECTIVE_DATE}
      description="How Hawola collects, uses, and protects your personal information when you shop on our marketplace."
    >
      <p className="rounded-lg border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 px-4 py-3 text-sm not-prose mb-8">
        This policy explains how Hawola handles information for{" "}
        <strong>shoppers and account holders</strong> on hawola.com and the Hawola mobile app.
        For merchant-specific practices, see the{" "}
        <a href="https://merchant.hawola.com/privacy" target="_blank" rel="noopener noreferrer">
          Hawola Merchant Privacy Policy
        </a>
        .
      </p>

      <section>
        <h2>Introduction</h2>
        <p>
          Hawola (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates a multi-vendor marketplace that lets you
          discover stores, compare products, place orders, chat with merchants, post buying
          requests, and manage your account. This Privacy Policy describes how we collect, use,
          disclose, and safeguard personal information when you use Hawola as a customer or
          visitor (&quot;you&quot;).
        </p>
        <p>
          By using Hawola, you agree to the practices described here and in our{" "}
          <Link href="/terms">Terms of Use</Link>.
        </p>
      </section>

      <section>
        <h2>1. Information we collect</h2>

        <h3>1.1 Account and profile information</h3>
        <p>When you register or update your account, we may collect:</p>
        <ul>
          <li>Full name and email address</li>
          <li>Phone number (where provided)</li>
          <li>Password or login credentials</li>
          <li>Profile details you choose to add</li>
        </ul>
        <p>
          If you sign in with Google, we receive basic profile information from Google (such as
          your name and email) in accordance with your Google account settings and Google&apos;s
          privacy policy.
        </p>

        <h3>1.2 Shopping and transaction data</h3>
        <ul>
          <li>Cart and wishlist items</li>
          <li>Order history, delivery addresses, and billing details</li>
          <li>Payment status and transaction references (payments may be processed by Paystack or other payment partners)</li>
          <li>Disputes, returns, and customer-service enquiries</li>
          <li>Pickup location preferences where applicable</li>
        </ul>

        <h3>1.3 Buying requests and communications</h3>
        <ul>
          <li>Product requests you post (&quot;looking for product&quot; / buying requests), including title, description, category, budget, and images you upload</li>
          <li>Messages and chats with merchants through Hawola</li>
          <li>Contact details you choose to share when responding to or receiving responses on buying requests</li>
        </ul>

        <h3>1.4 Usage and device data</h3>
        <ul>
          <li>IP address, browser type, device identifiers, and operating system</li>
          <li>Pages viewed, search queries, recently viewed products, and interactions with the platform</li>
          <li>Log files, crash reports, and analytics data used to improve performance and security</li>
        </ul>

        <h3>1.5 Cookies and similar technologies</h3>
        <p>
          We use cookies and local storage to keep you signed in, remember preferences, maintain
          your cart, and understand how the site is used. You can manage cookies through your
          browser settings, though some features may not work correctly if cookies are disabled.
        </p>
      </section>

      <section>
        <h2>2. How we use your information</h2>
        <p>We use collected data to:</p>
        <ul>
          <li>Create and manage your account</li>
          <li>Process orders, payments, and deliveries</li>
          <li>Connect you with merchants for products, chats, and buying requests</li>
          <li>Provide customer support and resolve disputes</li>
          <li>Send order updates, security alerts, and service messages</li>
          <li>Personalise your experience (for example, recently viewed items and recommendations)</li>
          <li>Detect fraud, abuse, and unauthorised access</li>
          <li>Comply with legal obligations and enforce our policies</li>
        </ul>
      </section>

      <section>
        <h2>3. How we share information</h2>
        <p>
          <strong>We do not sell your personal data.</strong>
        </p>

        <h3>3.1 With merchants</h3>
        <p>
          When you place an order, open a chat, or interact with a store, we share information
          necessary to fulfil that interaction—such as your name, contact details, delivery
          address, order contents, and messages. Merchants are independent businesses and are
          responsible for handling your data in line with applicable laws and their own policies.
        </p>

        <h3>3.2 With service providers</h3>
        <p>We may share data with trusted providers who help us operate Hawola, including:</p>
        <ul>
          <li>Payment processors (e.g. Paystack)</li>
          <li>Cloud hosting and infrastructure providers</li>
          <li>Email and notification services</li>
          <li>Analytics and security tools</li>
        </ul>
        <p>These providers only access data needed to perform their services.</p>

        <h3>3.3 Legal and safety</h3>
        <p>
          We may disclose information where required by law, to respond to lawful requests, or to
          protect the rights, safety, and integrity of Hawola, our users, and the public.
        </p>
      </section>

      <section>
        <h2>4. Payments</h2>
        <p>
          When you pay through Hawola, payment information is handled by our payment partners.
          We typically receive confirmation of payment status and limited transaction details—not
          your full card details. Payment partners&apos; own privacy policies apply to their
          processing of payment data.
        </p>
        <p>
          In some cases, merchants may collect payment directly outside Hawola. Hawola is not
          responsible for how merchants handle payment data in those transactions.
        </p>
      </section>

      <section>
        <h2>5. Data storage and security</h2>
        <p>
          We apply reasonable technical and organisational safeguards, including encryption in
          transit, access controls, and secure hosting. No online service is completely secure;
          please keep your password confidential and notify us if you suspect unauthorised access
          to your account.
        </p>
      </section>

      <section>
        <h2>6. Data retention</h2>
        <ul>
          <li>We retain account and order data while your account is active and as needed to provide services.</li>
          <li>Certain records may be kept longer for legal, tax, fraud-prevention, or dispute-resolution purposes.</li>
          <li>After account deletion requests, limited data may still be retained where required by law or legitimate business needs.</li>
        </ul>
      </section>

      <section>
        <h2>7. Your rights</h2>
        <p>
          Depending on your location, including under Nigeria&apos;s Nigeria Data Protection Regulation
          (NDPR), you may have rights to:
        </p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of certain data</li>
          <li>Object to or restrict certain processing</li>
          <li>Withdraw consent where processing is based on consent</li>
        </ul>
        <p>
          You can update much of your information in your{" "}
          <Link href="/account">account settings</Link>. For other requests, contact us using the
          details below.
        </p>
      </section>

      <section>
        <h2>8. Children&apos;s privacy</h2>
        <p>
          Hawola is not intended for individuals under 18. We do not knowingly collect personal
          information from children. If you believe a child has provided us with personal data,
          please contact us so we can take appropriate action.
        </p>
      </section>

      <section>
        <h2>9. Third-party links and services</h2>
        <p>
          Hawola may link to merchant websites, social media, maps, or other third-party services.
          We are not responsible for the privacy practices of those third parties. Review their
          policies before sharing personal information with them.
        </p>
      </section>

      <section>
        <h2>10. International users</h2>
        <p>
          Hawola is operated from Nigeria. If you access Hawola from outside Nigeria, your
          information may be processed in Nigeria or other locations where our service providers
          operate, subject to applicable law.
        </p>
      </section>

      <section>
        <h2>11. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. When we make material changes, we
          will post the updated policy on this page and update the effective date. Continued use of
          Hawola after changes take effect means you accept the updated policy.
        </p>
      </section>

      <section>
        <h2>12. Contact us</h2>
        <p>
          Questions about this Privacy Policy or your personal data? Contact us at{" "}
          <a href="mailto:ask@hawola.com">ask@hawola.com</a> or through Hawola customer support
          in the app or website.
        </p>
      </section>

      <p className="text-sm text-gray-500 border-t border-gray-200 pt-6 mt-8 not-prose">
        See also our <Link href="/terms">Terms of Use</Link>.
      </p>
    </LegalPageShell>
  );
}
