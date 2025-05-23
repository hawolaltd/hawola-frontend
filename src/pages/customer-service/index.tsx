import React from "react";
import Head from "next/head";
import AuthLayout from "@/components/layout/AuthLayout";
import CustomerServicePortal from "@/components/customer-service/CustomerServicePortal";
import { generateMetaTags } from "@/util/performance";

const CustomerServicePage = () => {
  const metaTags = generateMetaTags(
    "Customer Service Portal",
    "Get help with your orders, submit support tickets, and manage returns"
  );

  return (
    <AuthLayout>
      <Head>
        <title>{metaTags.title}</title>
        <meta name="description" content={metaTags.description} />
        <meta property="og:title" content={metaTags.openGraph.title} />
        <meta
          property="og:description"
          content={metaTags.openGraph.description}
        />
        <meta name="twitter:card" content={metaTags.twitter.card} />
        <meta name="twitter:title" content={metaTags.twitter.title} />
        <meta
          name="twitter:description"
          content={metaTags.twitter.description}
        />
      </Head>
      <CustomerServicePortal />
    </AuthLayout>
  );
};

export default CustomerServicePage;
