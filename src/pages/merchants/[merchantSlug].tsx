import NormalMerchantPage from "@/components/merchantTemplate/Normal";
import DashboardTemplate from "@/components/merchantTemplate/PremiumTemplate";
import StandardTemplate from "@/components/merchantTemplate/Standard";
import BasicTemplate from "@/components/merchantTemplate/Basic";
import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import { useEffect } from "react";
import { getMerchants } from "@/redux/product/productSlice";
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

  useEffect(() => {
    dispatch(getMerchants(merchantSlug as string));
    dispatch(getMerchantProfile(merchantSlug as string));
  }, [dispatch, merchantSlug]);

  const templateName = (data?.home_page?.template_name as { name?: string })
    ?.name;

  return (
    <div>
      {templateName === "Standard" && <StandardTemplate />}
      {templateName === "Premium" && <DashboardTemplate />}
      {templateName === "Basic" && <BasicTemplate />}
      {templateName === "Normal" && <NormalMerchantPage />}
    </div>
  );
}
