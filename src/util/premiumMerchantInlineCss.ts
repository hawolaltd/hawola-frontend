import type { MerchantBrandPalette } from "./merchantBrandPalette";

/**
 * Scoped classnames for Premium merchant dashboard storefront.
 * Consume after injecting `buildMerchantBrandPalette`.
 */
export function buildPremiumMerchantInlineCss(p: MerchantBrandPalette): string {
  const {
    raw,
    primaryFill,
    onPrimary,
    onPrimaryHover,
    headingOnLight,
    accentOnLight,
    saleBadgeBg,
    saleBadgeFg,
    rgbaRaw,
    rgbaPrimaryFill,
  } = p;

  return `
            .merchant-primary {
              background-color: ${primaryFill};
              color: ${onPrimary};
            }
            .merchant-primary-text {
              color: ${accentOnLight};
            }
            .merchant-heading-text {
              color: ${headingOnLight};
            }
            .merchant-primary-border {
              border-color: ${accentOnLight};
            }
            .merchant-primary-hover:hover {
              background-color: ${rgbaPrimaryFill(0.9)};
              color: ${onPrimary};
            }
            .merchant-gradient {
              background: linear-gradient(135deg, ${primaryFill} 0%, ${rgbaPrimaryFill(0.8)} 100%);
              color: ${onPrimary};
            }
            .merchant-text-on-primary {
              color: ${onPrimary};
            }
            .merchant-text-on-primary-hover:hover {
              color: ${onPrimaryHover};
            }
            .merchant-button {
              background-color: ${primaryFill};
              color: ${onPrimary};
              border: 1px solid ${primaryFill};
            }
            .merchant-button:hover {
              background-color: ${rgbaPrimaryFill(0.9)};
              color: ${onPrimary};
            }
            .merchant-button-outline {
              background-color: transparent;
              color: ${accentOnLight};
              border: 1px solid ${accentOnLight};
            }
            .merchant-button-outline:hover {
              background-color: ${primaryFill};
              color: ${onPrimary};
            }
            .merchant-text-shadow {
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            }
            .merchant-text-shadow-strong {
              text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
            }
            .merchant-icon-enhanced {
              filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
            }
            .merchant-icon-strong {
              filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.2));
            }
            .merchant-outline-button {
              border: 2px solid ${accentOnLight};
              color: ${accentOnLight};
              background-color: transparent;
              position: relative;
              overflow: hidden;
            }
            .merchant-outline-button::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-color: ${raw};
              opacity: 0;
              transition: opacity 0.2s ease;
            }
            .merchant-outline-button:hover::before {
              opacity: 0.1;
            }
            .merchant-outline-button:hover {
              background-color: ${rgbaRaw(0.1)};
              border-color: ${primaryFill};
              color: ${accentOnLight};
            }
            .merchant-outline-button:focus {
              outline: 2px solid ${rgbaRaw(0.35)};
              outline-offset: 2px;
            }
            .merchant-border-subtle {
              border: 1px solid ${rgbaRaw(0.2)};
            }
            .merchant-border-strong {
              border: 1px solid ${rgbaRaw(0.4)};
            }
            .merchant-icon-container {
              position: relative;
            }
            .merchant-icon-container::after {
              content: '';
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 100%;
              height: 100%;
              background: radial-gradient(circle, ${rgbaRaw(0.1)} 0%, transparent 70%);
              border-radius: inherit;
              pointer-events: none;
            }
            .merchant-outline-button svg {
              filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
            }
            .scrollbar-thin {
              scrollbar-width: thin;
            }
            .scrollbar-thin::-webkit-scrollbar {
              height: 6px;
            }
            .scrollbar-thin::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 3px;
            }
            .scrollbar-thin::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 3px;
            }
            .scrollbar-thin::-webkit-scrollbar-thumb:hover {
              background: #94a3b8;
            }
            .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, ${rgbaRaw(0.42)} 0%, #cbd5e1 100%);
            }
            .scrollbar-track-gray-100::-webkit-scrollbar-track {
              background: #f3f4f6;
            }
            .merchant-premium-banner-thumb-active {
              border-color: ${primaryFill} !important;
              box-shadow: 0 0 0 2px ${rgbaRaw(0.35)};
            }
            .merchant-badge-digital-premium {
              background: linear-gradient(135deg, ${primaryFill} 0%, ${rgbaPrimaryFill(0.82)} 100%);
              color: ${onPrimary};
            }
            .merchant-badge-sale-premium {
              background-color: ${saleBadgeBg};
              color: ${saleBadgeFg};
            }
            .merchant-product-action-btn:hover svg,
            .merchant-product-action-btn:hover {
              color: ${accentOnLight};
              stroke: ${accentOnLight};
            }
            .merchant-category-accent-dot {
              background-color: ${primaryFill};
              box-shadow: 0 0 0 3px ${rgbaRaw(0.15)};
              opacity: 0.95;
            }
            .merchant-category-accent-dot-soft {
              background-color: ${rgbaRaw(0.55)};
              box-shadow: 0 0 0 2px ${rgbaRaw(0.12)};
              opacity: 0.92;
            }
            .merchant-category-hover-wash {
              background: linear-gradient(
                135deg,
                ${rgbaRaw(0.16)} 0%,
                ${rgbaRaw(0.04)} 100%
              );
            }
            .merchant-live-pulse-dot {
              background-color: ${primaryFill};
            }
            .merchant-btn-focus-visible:focus-visible {
              outline: 2px solid ${rgbaRaw(0.45)};
              outline-offset: 2px;
              box-shadow: 0 0 0 3px ${rgbaRaw(0.15)};
            }
            .merchant-stats-status-active {
              background-color: ${primaryFill};
            }
            .merchant-stats-status-inactive {
              background-color: #94a3b8;
            }
            .merchant-premium-bg-mesh {
              background-image:
                radial-gradient(ellipse 90% 60% at 0% -5%, ${rgbaRaw(0.11)} 0%, transparent 55%),
                radial-gradient(ellipse 70% 50% at 100% -2%, ${rgbaRaw(0.07)} 0%, transparent 50%),
                radial-gradient(ellipse 55% 40% at 80% 100%, ${rgbaRaw(0.05)} 0%, transparent 55%);
              background-repeat: no-repeat;
            }
            .merchant-premium-accent-topbar {
              background: linear-gradient(
                90deg,
                transparent 0%,
                ${primaryFill} 22%,
                ${rgbaRaw(0.55)} 50%,
                ${primaryFill} 78%,
                transparent 100%
              );
              height: 3px;
              opacity: 0.92;
            }
            .merchant-premium-sidebar-card {
              border-left: 3px solid ${primaryFill};
              background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
              box-shadow:
                0 1px 2px rgba(15, 23, 42, 0.04),
                0 8px 24px -8px ${rgbaRaw(0.12)};
            }
            .merchant-premium-section-shell {
              border: 1px solid rgba(226, 232, 240, 0.9);
              background: linear-gradient(180deg, #ffffff 0%, #fafbfc 98%);
              box-shadow:
                0 2px 4px rgba(15, 23, 42, 0.04),
                inset 0 1px 0 ${rgbaRaw(0.14)};
              border-radius: 1rem;
            }
            .merchant-premium-title-rule {
              display: block;
              height: 3px;
              width: min(44%, 3.5rem);
              margin-top: 0.375rem;
              border-radius: 9999px;
              background: linear-gradient(90deg, ${primaryFill}, ${rgbaPrimaryFill(0.2)});
              margin-bottom: 0.125rem;
            }
            .merchant-premium-product-card {
              border: 1px solid #e7e9ec;
              transition:
                transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
                border-color 240ms ease,
                box-shadow 280ms cubic-bezier(0.22, 1, 0.36, 1);
            }
            .merchant-premium-product-card:hover {
              transform: translateY(-4px);
              border-color: ${rgbaRaw(0.38)};
              box-shadow:
                0 20px 40px -12px ${rgbaRaw(0.22)},
                0 12px 24px -10px rgba(15, 23, 42, 0.1);
            }
            .merchant-premium-logo-shell {
              background: linear-gradient(135deg, #ffffff 40%, ${rgbaRaw(0.08)} 100%);
              padding: 2px;
              border-radius: 1rem;
              box-shadow:
                inset 0 0 0 1px rgba(255, 255, 255, 0.95),
                0 4px 14px ${rgbaRaw(0.15)};
            }
            .merchant-premium-banner-shell {
              box-shadow:
                0 0 0 1px rgba(241, 245, 249, 1),
                0 4px 20px ${rgbaRaw(0.1)},
                inset 0 1px 0 ${rgbaRaw(0.12)};
            }
          `;
}
