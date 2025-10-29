import NormalMerchantPage from "@/components/merchantTemplate/Normal";
import DashboardTemplate from "@/components/merchantTemplate/PremiumTemplate";
import StandardTemplate from "@/components/merchantTemplate/Standard";
import BasicTemplate from "@/components/merchantTemplate/Basic";
import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import { useEffect, useRef } from "react";
import { getMerchantProfile } from "@/redux/product/productSlice";

export default function MerchantPage() {
  const router = useRouter();
  const { merchantSlug, ...rest } = router.query;
  const dispatch = useAppDispatch();
  const {
    merchants,
    isLoading,
    merchantProfile: data,
  } = useAppSelector((state) => state.products);
  
  const fetchedSlugRef = useRef<string | null>(null);

  useEffect(() => {
    if (merchantSlug && typeof merchantSlug === 'string') {
      // Only fetch if we haven't fetched this slug yet
      if (fetchedSlugRef.current !== merchantSlug) {
        fetchedSlugRef.current = merchantSlug;
        dispatch(getMerchantProfile(merchantSlug));
      }
    }
  }, [merchantSlug, dispatch]);

  const templateName = (data?.home_page?.template_name as { name?: string })
    ?.name;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error or not found state
  if (!data || !merchantSlug) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Merchant not found</p>
      </div>
    );
  }

  return (
    <div>
      {templateName === "Standard" && <StandardTemplate />}
      {templateName === "Premium" && <DashboardTemplate />}
      {templateName === "Basic" && <BasicTemplate />}
      {/* Default to Normal template if no template specified or Normal selected */}
      {(!templateName || templateName === "Normal") && <NormalMerchantPage />}
    </div>
  );
}
