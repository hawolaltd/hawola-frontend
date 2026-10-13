export function openProductReviews() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("hawola-open-reviews"));
}
