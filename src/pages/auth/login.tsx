import React from 'react';
import AuthLayout from "@/components/layout/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";

function Login() {
    return (
            <AuthLayout>
                <LoginForm/>
            </AuthLayout>
    );
}

export default Login;