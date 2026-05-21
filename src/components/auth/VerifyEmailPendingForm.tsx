import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import {
    CheckCircleIcon,
    EnvelopeIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch } from '@/hook/useReduxTypes';
import { resendConfirmationEmail } from '@/redux/auth/authSlice';

const MAX_RESEND_ATTEMPTS = 2;
const COOLDOWN_DURATION = 5 * 60 * 1000;

const getAttemptsKey = (email: string) => `resend_attempts_${email}`;
const getCooldownKey = (email: string) => `resend_cooldown_${email}`;

export default function VerifyEmailPendingForm() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const emailParam = router.query.email;
    const email =
        typeof emailParam === 'string'
            ? emailParam
            : Array.isArray(emailParam)
              ? emailParam[0] || ''
              : '';

    const [resendLoading, setResendLoading] = useState(false);
    const [resendAttempts, setResendAttempts] = useState(0);
    const [cooldownTime, setCooldownTime] = useState<number | null>(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!email) return;
        const attempts = parseInt(
            localStorage.getItem(getAttemptsKey(email)) || '0',
            10
        );
        setResendAttempts(attempts);
        const cooldownEnd = localStorage.getItem(getCooldownKey(email));
        if (cooldownEnd) {
            const end = parseInt(cooldownEnd, 10);
            if (end > Date.now()) setCooldownTime(end);
            else localStorage.removeItem(getCooldownKey(email));
        }
    }, [email]);

    useEffect(() => {
        if (!cooldownTime) return;
        const update = () => {
            const remaining = Math.max(
                0,
                Math.ceil((cooldownTime - Date.now()) / 1000)
            );
            setTimeRemaining(remaining);
            if (remaining <= 0) {
                setCooldownTime(null);
                if (intervalRef.current) clearInterval(intervalRef.current);
            }
        };
        update();
        intervalRef.current = setInterval(update, 1000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [cooldownTime]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleResend = async () => {
        if (!email) {
            toast.error('Email address not found. Please register again.');
            return;
        }
        if (resendAttempts >= MAX_RESEND_ATTEMPTS) {
            toast.error(
                `Maximum resend attempts (${MAX_RESEND_ATTEMPTS}) reached. Please wait before trying again.`
            );
            return;
        }
        setResendLoading(true);
        try {
            const result = await dispatch(resendConfirmationEmail(email));
            if (resendConfirmationEmail.fulfilled.match(result)) {
                const next = resendAttempts + 1;
                setResendAttempts(next);
                localStorage.setItem(getAttemptsKey(email), String(next));
                const cooldownEnd = Date.now() + COOLDOWN_DURATION;
                setCooldownTime(cooldownEnd);
                localStorage.setItem(getCooldownKey(email), String(cooldownEnd));
                toast.success('Verification email sent! Please check your inbox.');
            } else {
                toast.error(
                    (result.payload as string) ||
                        'Failed to resend verification email.'
                );
            }
        } finally {
            setResendLoading(false);
        }
    };

    if (!router.isReady) {
        return null;
    }

    if (!email) {
        return (
            <div className="mx-auto max-w-lg px-4 py-12 text-center">
                <p className="text-sm text-gray-600">
                    No email address provided. Please{' '}
                    <Link href="/auth/register" className="font-semibold text-[#435a8c]">
                        register
                    </Link>{' '}
                    or{' '}
                    <Link href="/auth/login" className="font-semibold text-[#435a8c]">
                        sign in
                    </Link>
                    .
                </p>
            </div>
        );
    }

    return (
        <div className="relative mx-auto w-full max-w-screen-xl bg-white px-6 pt-8 mb-12 xl:px-0">
            <div className="w-full max-w-2xl rounded-2xl border border-[#e2e8f2] bg-white p-6 shadow-sm md:p-8">
                <div className="mb-6 flex items-center gap-3">
                    <CheckCircleIcon className="h-10 w-10 text-green-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-[#435a8c]">
                            Verify your email
                        </h1>
                        <p className="text-sm text-gray-600">
                            Your account is not activated yet.
                        </p>
                    </div>
                </div>

                <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                    <div className="flex gap-3">
                        <EnvelopeIcon className="h-8 w-8 shrink-0 text-blue-600" />
                        <div>
                            <p className="text-gray-700">
                                We sent a verification link to:
                            </p>
                            <p className="mt-1 break-all text-lg font-semibold text-blue-700">
                                {email}
                            </p>
                            <ul className="mt-3 list-inside list-disc text-sm text-gray-600">
                                <li>Open the email and click the verification link</li>
                                <li>Check your spam folder if you do not see it</li>
                                <li>Then return here to sign in</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t border-gray-200 pt-6 text-center">
                    <p className="mb-4 text-sm text-gray-600">
                        Did not receive the email?
                    </p>
                    {cooldownTime && timeRemaining > 0 && (
                        <p className="mb-3 flex items-center justify-center gap-2 text-sm font-semibold text-orange-600">
                            <ClockIcon className="h-5 w-5" />
                            Wait {formatTime(timeRemaining)} before resending
                        </p>
                    )}
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={
                            resendLoading ||
                            resendAttempts >= MAX_RESEND_ATTEMPTS ||
                            (cooldownTime !== null && Date.now() < cooldownTime)
                        }
                        className="rounded-lg border-2 border-[#435a8c] bg-blue-50 px-6 py-3 text-sm font-semibold text-[#435a8c] hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {resendLoading ? 'Sending…' : 'Resend verification email'}
                    </button>
                    {resendAttempts > 0 && (
                        <p className="mt-2 text-xs text-gray-500">
                            Resend attempts: {resendAttempts} / {MAX_RESEND_ATTEMPTS}
                        </p>
                    )}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/auth/login"
                        className="flex-1 rounded-lg bg-[#435a8c] py-3 text-center text-sm font-semibold text-white hover:bg-[#354a73]"
                    >
                        Back to sign in
                    </Link>
                    <Link
                        href="/auth/register"
                        className="flex-1 rounded-lg border-2 border-[#435a8c] py-3 text-center text-sm font-semibold text-[#435a8c] hover:bg-[#435a8c] hover:text-white"
                    >
                        Create new account
                    </Link>
                </div>
            </div>
        </div>
    );
}
