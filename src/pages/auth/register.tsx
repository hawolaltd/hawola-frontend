import React from 'react';
import AuthLayout from "@/components/layout/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";

function Register() {
    return (
        <AuthLayout>
            <RegisterForm/>
        </AuthLayout>
    );
}

export default Register;