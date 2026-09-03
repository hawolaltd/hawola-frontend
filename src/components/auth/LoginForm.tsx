import { useState, useEffect } from 'react';
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import ControlledInput from "@/components/shared/ControlledInput";
import {useForm} from "react-hook-form";
import {LoginFormType} from "@/types/auth";
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import {login, loginWithGoogle, requestLoginCode} from "@/redux/auth/authSlice";
import {toast} from "sonner";
import {useRouter} from "next/router";
import { mergeGuestCartAfterLogin } from "@/lib/guestCartClient";
import {normalizeErrors} from "@/util";
import MerchantAuthPrompt from "@/components/auth/MerchantAuthPrompt";

export default function LoginForm() {
    const [rememberMe, setRememberMe] = useState(false);
    const [magicLinkSending, setMagicLinkSending] = useState(false);

    const router = useRouter()
    const redirectTarget =
      typeof router.query.redirect === "string" && router.query.redirect.startsWith("/")
        ? router.query.redirect
        : "/";

    const { control, handleSubmit, getValues, formState: { errors }, } = useForm<LoginFormType>();

    const dispatch = useAppDispatch()

    const {isLoading, error, message } = useAppSelector(state => state.auth)
    const {localCart} = useAppSelector(state => state.products)

    // Handle errors from Redux state (in case error is set but not caught in onSubmit)
    useEffect(() => {
        if (error && message) {
            try {
                const errorMessage =
                    typeof message === 'object' && message !== null && 'message' in message
                        ? String((message as { message?: string }).message)
                        : typeof message === 'string'
                          ? message
                          : normalizeErrors(message);

                if (
                    typeof message === 'object' &&
                    message !== null &&
                    (message as { code?: string }).code === 'email_not_verified'
                ) {
                    const targetEmail = (message as { email?: string }).email;
                    if (targetEmail) {
                        router.push(
                            `/auth/verify-pending?email=${encodeURIComponent(targetEmail)}`
                        );
                    }
                    return;
                }
                
                if (errorMessage) {
                    toast.error(errorMessage, {
                        style: {
                            background: "#ef4444",
                            color: "white",
                        },
                    });
                }
            } catch (e) {
                // If error handling fails, show generic message
                console.error('Error in useEffect error handler:', e);
                toast.error('Unable to log in. Please check your email and password.', {
                    style: {
                        background: "#ef4444",
                        color: "white",
                    },
                });
            }
        }
    }, [error, message]);



    const onSubmit = async (data: LoginFormType) => {
        // Log what the form is submitting
        console.log('[FRONTEND] LoginForm.onSubmit - Form data:', {
            email: data.email,
            password: data.password ? '***' : 'MISSING',
            hasEmail: !!data.email,
            hasPassword: !!data.password
        });
        
        const loginPayload = {
            email: data.email,
            password: data.password
        };
        
        console.log('[FRONTEND] LoginForm.onSubmit - Login payload being dispatched:', {
            email: loginPayload.email,
            password: loginPayload.password ? '***' : 'MISSING',
            payloadKeys: Object.keys(loginPayload),
            payloadStringified: JSON.stringify(loginPayload)
        });
        
        try {
            // Use promise-based approach to properly catch errors
            let res;
            try {
                res = await dispatch(login(loginPayload));
            } catch (dispatchError: any) {
                // If dispatch itself throws, handle it
                console.error('Dispatch error:', dispatchError);
                res = { 
                    type: 'auth/login/rejected', 
                    payload: dispatchError?.message || 'Login failed. Please try again.' 
                };
            }

            // Check if the action was fulfilled
            // @ts-ignore
            const isFulfilled = res?.type?.includes('fulfilled');
            // @ts-ignore
            const isRejected = res?.type?.includes('rejected');
            
            // @ts-ignore
            const hasAccessToken = isFulfilled && res?.payload?.access;
            const requires2fa = isFulfilled && res?.payload?.requires_2fa;

            if (requires2fa) {
                const pending = res?.payload?.pending_token;
                const twoFactorEmail = res?.payload?.email || loginPayload.email;
                router.push(
                    `/auth/two-factor?pending=${encodeURIComponent(pending)}&email=${encodeURIComponent(twoFactorEmail)}&redirect=${encodeURIComponent(redirectTarget)}`
                );
                return;
            }

            if (hasAccessToken){
                toast.success("Welcome Back to HAWOLA")

                void mergeGuestCartAfterLogin(dispatch, localCart?.items || []);
                router.push(redirectTarget)
            } else if (isRejected) {
                // @ts-ignore
                const errorPayload = res?.payload;
                const payloadObj =
                    errorPayload && typeof errorPayload === 'object'
                        ? errorPayload
                        : null;
                const errorMessage =
                    typeof errorPayload === 'string'
                        ? errorPayload
                        : payloadObj?.message ||
                          payloadObj?.detail ||
                          'Unable to log in. Please check your email and password.';

                if (payloadObj?.code === 'email_not_verified') {
                    const targetEmail =
                        payloadObj.email || loginPayload.email;
                    toast.info(errorMessage);
                    router.push(
                        `/auth/verify-pending?email=${encodeURIComponent(targetEmail)}`
                    );
                    return;
                }

                toast.error(errorMessage, {
                    style: {
                        background: "#ef4444",
                        color: "white",
                    },
                });
            } else {
                // Unknown state - show generic error
                toast.error('Unable to log in. Please check your email and password.', {
                    style: {
                        background: "#ef4444",
                        color: "white",
                    },
                });
            }
        } catch (error: any) {
            // Catch any unexpected errors to prevent app crash
            console.error('Login form error:', error);
            
            let errorMessage = 'An unexpected error occurred. Please try again.';
            
            if (error?.response?.data) {
                const errorData = error.response.data;
                if (errorData.error) {
                    if (Array.isArray(errorData.error)) {
                        errorMessage = errorData.error[0] || errorMessage;
                    } else if (typeof errorData.error === 'string') {
                        errorMessage = errorData.error;
                    }
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (errorData.detail) {
                    errorMessage = errorData.detail;
                }
            } else if (error?.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage, {
                style: {
                    background: "#ef4444",
                    color: "white",
                },
            });
        }

    };

    const handleRequestMagicLink = async () => {
        const email = String(getValues("email") ?? "").trim();

        if (!email) {
            toast.error("Please enter your email first.");
            return;
        }

        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        setMagicLinkSending(true);
        try {
            const res = await dispatch(requestLoginCode(email));

            if (res?.type.includes("fulfilled")) {
                toast.success(
                    "If an account with that email exists, we've sent you a one-time login link. Please check your email."
                );
            } else {
                const errorPayload = (res as any)?.payload;
                if (errorPayload?.retry_after) {
                    const minutes = Math.ceil(errorPayload.retry_after / 60);
                    toast.error(
                        `Too many requests. Please wait ${minutes} minute(s) before requesting another login link.`,
                        {
                            style: {
                                background: "#ef4444",
                                color: "white",
                            },
                        }
                    );
                } else {
                    const errorMessage = normalizeErrors(
                        errorPayload?.detail || errorPayload?.message || errorPayload
                    );
                    toast.error(errorMessage || "Could not send login link.", {
                        style: {
                            background: "#ef4444",
                            color: "white",
                        },
                    });
                }
            }
        } finally {
            setMagicLinkSending(false);
        }
    };

    return (
        <div className="relative mx-auto w-full max-w-screen-xl bg-white px-6 pt-8 mb-12 xl:px-0">
            <div className="w-full max-w-2xl rounded-2xl border border-[#e2e8f2] bg-white p-5 shadow-sm md:p-6">
                <h2 className="text-2xl font-bold text-[#435a8c] lg:text-4xl">Member Login</h2>
                <p className="text-[#435a8c] mb-5 mt-2">Welcome back!</p>
                {router.query.confirmed === "true" && (
                    <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        Your account has been activated. You can now login.
                    </div>
                )}

                {/* Primary section: either magic-link login or password login */}

                {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                    <div className="mb-5 rounded-xl border-2 border-[#d7e1f3] bg-[#f7f9fe] p-3 shadow-sm">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#435a8c]">
                            Quick sign in
                        </p>
                        <div className="rounded-lg bg-white p-1.5 ring-1 ring-[#d3def4]">
                            <GoogleLogin
                                onSuccess={async (credentialResponse) => {
                                    const token = credentialResponse.credential;
                                    if (!token) return;
                                    const res = await dispatch(loginWithGoogle(token));
                                    if (res?.type?.includes?.("fulfilled") && res?.payload?.requires_2fa) {
                                        router.push(
                                            `/auth/two-factor?pending=${encodeURIComponent(res.payload.pending_token)}&email=${encodeURIComponent(res.payload.email || "")}&redirect=${encodeURIComponent(redirectTarget)}`
                                        );
                                        return;
                                    }
                                    if (res?.type?.includes?.("fulfilled")) {
                                        toast.success("Welcome Back to HAWOLA");
                                        void mergeGuestCartAfterLogin(dispatch, localCart?.items || []);
                                        router.push(redirectTarget);
                                    } else if (res?.type?.includes?.("rejected") && res?.payload) {
                                        toast.error(String(res.payload), {
                                            style: { background: "#ef4444", color: "white" },
                                        });
                                    }
                                }}
                                onError={() => {
                                    toast.error("Google sign-in failed. Please try again.", {
                                        style: { background: "#ef4444", color: "white" },
                                    });
                                }}
                                useOneTap={false}
                                theme="filled_blue"
                                size="large"
                                text="continue_with"
                                shape="rectangular"
                                width="100%"
                            />
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className={'flex flex-col gap-4 mt-4'}>
                        <div>
                            <ControlledInput<LoginFormType>
                                control={control}
                                errors={errors}
                                name="email"
                                label=" Email*"
                                type="text"
                                placeholder="stevenjob@gmail.com"
                                defaultValue={''}
                                rules={{
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address',
                                    },
                                }}
                                className="w-full text-xs mt-1 p-3 border rounded-md bg-white border-[#dde4f0] focus:outline-none"
                            />
                            <div className="mt-2 flex justify-end">
                                <button
                                    type="button"
                                    disabled={magicLinkSending || isLoading}
                                    onClick={handleRequestMagicLink}
                                    className="text-xs font-semibold text-[#435a8c] hover:underline disabled:opacity-60"
                                >
                                    {magicLinkSending
                                        ? "Sending login link…"
                                        : "Use one-time login link instead"}
                                </button>
                            </div>
                        </div>
                        <ControlledInput<LoginFormType>
                            control={control}
                            errors={errors}
                            name="password"
                            label="Password *"
                            type="password"
                            defaultValue={'****************'}
                            placeholder="****************"
                            rules={{
                                required: 'Password is required',
                                minLength: {
                                    value: 5,
                                    message: 'Password must be at least 5 characters',
                                },
                            }}
                            className="w-full text-xs mt-1 p-3 border rounded-md bg-white border-[#dde4f0] focus:outline-none"
                        />

                        <div className="flex justify-between items-center mt-4">
                            <label className="flex items-center text-xs text-[#435a8c]">
                                <input
                                    type="checkbox"
                                    className="mr-2"
                                    checked={rememberMe}
                                    onChange={() => setRememberMe(!rememberMe)}
                                />
                                Remember me
                            </label>
                            <Link href={'/auth/forgot-password'} className="text-[#435a8c] text-xs">Forgot your password?</Link>
                        </div>

                        <button disabled={isLoading} type={'submit'} className={`w-full mt-6 ${isLoading  ? 'bg-blue-300 cursor-not-allowed' : "bg-[#435a8c]"} text-white py-3 rounded-md text-lg font-semibold`}>
                            {isLoading ? <div className={'flex items-center justify-center w-full'}>
                                <span role="status">
                                    <svg aria-hidden="true"
                                         className="w-5 h-5 text-gray-200 animate-spin fill-blue-300"
                                         viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                            fill="currentColor"/>
                                        <path
                                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                            fill="#435a8c"/>
                                    </svg>
                                    <span className="sr-only">Loading...</span>
                                </span>
                            </div> : "Sign In"}
                        </button>
                    </form>

                <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#435a8c]">
                    <Link href="/auth/register" prefetch={false}>
                        <span>
                            Have not an account?{" "}
                            <span className="font-semibold text-blue-900">Sign Up</span>
                        </span>
                    </Link>
                    <span className="text-gray-300 select-none" aria-hidden>
                        |
                    </span>
                    <MerchantAuthPrompt variant="login" inline />
                </div>
            </div>

            {/* Global loading overlay for clearer feedback */}
            {isLoading && !magicLinkSending && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-lg shadow-lg px-6 py-4 flex items-center gap-3">
                        <svg
                            aria-hidden="true"
                            className="w-6 h-6 text-gray-200 animate-spin fill-blue-300"
                            viewBox="0 0 100 101"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"
                            />
                            <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="#435a8c"
                            />
                        </svg>
                        <span className="text-sm text-[#435a8c] font-medium">
                            Signing you in…
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
