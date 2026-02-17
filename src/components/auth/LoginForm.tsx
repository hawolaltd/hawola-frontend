import { useState, useEffect } from 'react';
import Link from "next/link";
import ControlledInput from "@/components/shared/ControlledInput";
import {useForm} from "react-hook-form";
import {LoginFormType} from "@/types/auth";
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import {login, requestLoginCode} from "@/redux/auth/authSlice";
import {toast} from "sonner";
import {useRouter} from "next/router";
import {addToCarts, addToCartsLocal} from "@/redux/product/productSlice";
import {normalizeErrors} from "@/util";

export default function LoginForm() {
    const [rememberMe, setRememberMe] = useState(false);
    const [magicEmail, setMagicEmail] = useState("");
    const [showPasswordLogin, setShowPasswordLogin] = useState(false);

    const router = useRouter()

    const { control, handleSubmit,  formState: { errors }, } = useForm<LoginFormType>();

    const dispatch = useAppDispatch()

    const {isLoading, error, message } = useAppSelector(state => state.auth)
    const {localCart} = useAppSelector(state => state.products)

    // Handle errors from Redux state (in case error is set but not caught in onSubmit)
    useEffect(() => {
        if (error && message) {
            try {
                const errorMessage = typeof message === 'string' 
                    ? message 
                    : normalizeErrors(message);
                
                if (errorMessage) {
                    toast.error(errorMessage, {
                        style: {
                            background: "#ef4444",
                            color: "white",
                        },
                        duration: 5000,
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
                    duration: 5000,
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

            if (hasAccessToken){
                toast.success("Welcome Back to HAWOLA")

                if (localCart?.items?.length > 0){
                    dispatch( addToCarts({
                        items: localCart?.items.map(cart => ({
                            qty: cart.qty,
                            product: cart?.product?.id
                        }))
                    }))
                    dispatch(addToCartsLocal({items: []}))
                }
                router.push('/')
            } else if (isRejected) {
                // Login failed - extract error from the rejected action
                let errorMessage = 'Unable to log in. Please check your email and password.';
                
                try {
                    // @ts-ignore
                    const errorPayload = res?.payload;
                    
                    if (errorPayload) {
                        if (typeof errorPayload === 'string') {
                            errorMessage = errorPayload;
                        } else if (errorPayload && typeof errorPayload === 'object') {
                            if (errorPayload.error) {
                                // Handle format: {"error": ["message"]}
                                if (Array.isArray(errorPayload.error)) {
                                    errorMessage = errorPayload.error[0] || errorMessage;
                                } else if (typeof errorPayload.error === 'string') {
                                    errorMessage = errorPayload.error;
                                }
                            } else if (errorPayload.message) {
                                errorMessage = errorPayload.message;
                            } else if (errorPayload.detail) {
                                errorMessage = errorPayload.detail;
                            } else {
                                // Try normalizeErrors as fallback
                                const normalized = normalizeErrors(errorPayload);
                                if (normalized) {
                                    errorMessage = normalized;
                                }
                            }
                        }
                    } else if (message) {
                        // Fallback to Redux state message
                        try {
                            errorMessage = typeof message === 'string' ? message : normalizeErrors(message) || errorMessage;
                        } catch (e) {
                            // If normalizeErrors fails, use default
                            console.error('Error normalizing message:', e);
                        }
                    }
                } catch (parseError) {
                    // If error parsing fails, use default message
                    console.error('Error parsing error payload:', parseError);
                }
                
                // Show user-friendly error message
                toast.error(errorMessage, {
                    style: {
                        background: "#ef4444",
                        color: "white",
                    },
                    duration: 5000,
                });
            } else {
                // Unknown state - show generic error
                toast.error('Unable to log in. Please check your email and password.', {
                    style: {
                        background: "#ef4444",
                        color: "white",
                    },
                    duration: 5000,
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
                duration: 5000,
            });
        }

    };

    const handleRequestMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        const email = magicEmail.trim();

        if (!email) {
            toast.error("Please enter your email to receive a login link.");
            return;
        }

        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        const res = await dispatch(requestLoginCode(email));

        if (res?.type.includes("fulfilled")) {
            // Clear the form after successful request
            setMagicEmail("");
            toast.success(
                "If an account with that email exists, we've sent you a one-time login link. Please check your email."
            );
        } else {
            // Check if it's a rate limit error
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
                        duration: 5000,
                    }
                );
            } else {
                const errorMessage = normalizeErrors(message);
                toast.error(errorMessage, {
                    style: {
                        background: "#ef4444",
                        color: "white",
                    },
                });
            }
        }
    };

    return (
        <div className="relative flex w-full pt-16 mb-28 md:px-28 bg-white">
            <div className="w-full max-w-xl px-8 bg-white ">
                <h2 className="text-4xl font-bold text-[#435a8c]">Member Login</h2>
                <p className="text-[#435a8c] mb-6 mt-2">Welcome back!</p>

                {/* Primary section: either magic-link login or password login */}

                {!showPasswordLogin && (
                    <div className="flex flex-col gap-4 mt-8">
                        <div className="space-y-2">
                            <label className="text-xs text-[#435a8c]">
                                Sign in with a one-time login link
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={magicEmail}
                                    onChange={(e) => setMagicEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="flex-1 text-xs p-3 border rounded-md bg-white border-[#dde4f0] focus:outline-none"
                                />
                                <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={handleRequestMagicLink}
                                    className={`px-4 py-2 rounded-md text-xs font-semibold ${
                                        isLoading
                                            ? "bg-blue-300 cursor-not-allowed text-white"
                                            : "bg-[#435a8c] text-white"
                                    }`}
                                >
                                    Send link
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-500">
                                We&apos;ll email you a secure, one-time link so you can sign in without a password.
                            </p>
                        </div>
                    </div>
                )}

                {showPasswordLogin && (
                    <form onSubmit={handleSubmit(onSubmit)} className={'flex flex-col gap-4 mt-4'}>
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
                )}

                {/* Toggle between methods */}
                <div className="flex items-center my-4">
                    <div className="flex-1 h-px bg-gray-200" />
                    <button
                        type="button"
                        onClick={() => setShowPasswordLogin((prev) => !prev)}
                        className="px-3 text-xs text-[#435a8c] font-semibold hover:underline"
                    >
                        {showPasswordLogin ? "Use one-time login link instead" : "Or, sign in with password"}
                    </button>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                <Link href={'/auth/register'}>
                    <p className="text-left text-xs text-[#435a8c] mt-4">
                        Have not an account? <span className="text-blue-900 font-semibold">Sign Up</span>
                    </p>
                </Link>
            </div>

            {/* Global loading overlay for clearer feedback */}
            {isLoading && (
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
