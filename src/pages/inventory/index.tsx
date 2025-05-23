import React from "react";
import Head from "next/head";
import AuthLayout from "@/components/layout/AuthLayout";
import InventoryManagement from "@/components/inventory/InventoryManagement";
import { generateMetaTags } from "@/util/performance";

const InventoryPage = () => {
  const metaTags = generateMetaTags(
    "Inventory Management",
    "Manage your product inventory, track stock levels, and receive alerts for low stock items"
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
      <InventoryManagement />
    </AuthLayout>
  );
};

export default InventoryPage;
