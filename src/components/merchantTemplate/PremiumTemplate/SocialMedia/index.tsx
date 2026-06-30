import React from "react";
import MerchantAboutSocialSidebar from "../../MerchantAboutSocialSidebar";
import type { MerchantSocialDetails } from "../../merchantSocialLinkData";

interface SocialMediaProps extends MerchantSocialDetails {}

const SocialMedia = (props: SocialMediaProps) => (
  <MerchantAboutSocialSidebar details={props} sticky={false} />
);

export default SocialMedia;
