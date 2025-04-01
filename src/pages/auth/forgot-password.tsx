import React from 'react';
import AuthLayout from "@/components/layout/AuthLayout";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

function ForgotPassword() {
    return (
        <AuthLayout>
            <ForgotPasswordForm/>
        </AuthLayout>
    );
}

export default ForgotPassword;