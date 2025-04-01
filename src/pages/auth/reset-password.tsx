import React from 'react';
import AuthLayout from "@/components/layout/AuthLayout";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

function ResetPassword() {
    return (
        <AuthLayout>
            <ResetPasswordForm/>
        </AuthLayout>
    );
}

export default ResetPassword;