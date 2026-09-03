import React from "react";
import type { GetServerSideProps } from "next";
import AuthLayout from "@/components/layout/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";
import {
  fetchSignupBonusPromoServer,
  type SignupBonusPromo,
} from "@/services/signupBonusService";

type PageProps = {
  signupBonus: SignupBonusPromo | null;
};

function Register({ signupBonus }: PageProps) {
  return (
    <AuthLayout>
      <RegisterForm signupBonus={signupBonus} />
    </AuthLayout>
  );
}

export const getServerSideProps: GetServerSideProps<PageProps> = async ({ res }) => {
  res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");
  const signupBonus = await fetchSignupBonusPromoServer();
  return { props: { signupBonus } };
};

export default Register;
