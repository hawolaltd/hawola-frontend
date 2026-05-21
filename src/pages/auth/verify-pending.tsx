import React from 'react';
import AuthLayout from '@/components/layout/AuthLayout';
import VerifyEmailPendingForm from '@/components/auth/VerifyEmailPendingForm';

export default function VerifyPendingPage() {
    return (
        <AuthLayout>
            <VerifyEmailPendingForm />
        </AuthLayout>
    );
}
