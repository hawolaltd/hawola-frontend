import React, {useState, useEffect, useRef} from 'react';
import {Controller, useForm, useWatch} from "react-hook-form";
import { GoogleLogin } from "@react-oauth/google";
import {RegisterFormType} from "@/types/auth";
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import {register, loginWithGoogle, resendConfirmationEmail} from "@/redux/auth/authSlice";
import ControlledInput from "@/components/shared/ControlledInput";
import {toast} from "sonner";
import {useRouter} from "next/router";
import Link from "next/link";
import {normalizeErrors} from "@/util";
import { addToCarts, addToCartsLocal } from "@/redux/product/productSlice";
import { CheckCircleIcon, EnvelopeIcon, ArrowRightIcon, ClockIcon } from '@heroicons/react/24/outline';

// Rate limiting constants
const MAX_RESEND_ATTEMPTS = 2;
const COOLDOWN_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Storage keys
const getStorageKey = (email: string) => `resend_email_${email}`;
const getAttemptsKey = (email: string) => `resend_attempts_${email}`;
const getCooldownKey = (email: string) => `resend_cooldown_${email}`;

function RegisterForm() {
    
    const {control, handleSubmit, formState: {errors}, reset, getValues} = useForm<RegisterFormType>();

    const [regSuccess, setRegSuccess] = useState(false)
    const [formData, setFormData] = useState<RegisterFormType | null>(null)
    const [resendLoading, setResendLoading] = useState(false)
    const [resendAttempts, setResendAttempts] = useState(0)
    const [cooldownTime, setCooldownTime] = useState<number | null>(null)
    const [timeRemaining, setTimeRemaining] = useState<number>(0)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    const dispatch = useAppDispatch()

    const {isLoading, message} = useAppSelector(state => state.auth)
    const {localCart} = useAppSelector(state => state.products)

    const terms = useWatch({
        control, name: 'terms',
    })

    const router = useRouter()

    // Load saved attempts and cooldown from localStorage
    useEffect(() => {
        if (formData?.email) {
            const attempts = parseInt(localStorage.getItem(getAttemptsKey(formData.email)) || '0', 10);
            const cooldownEnd = localStorage.getItem(getCooldownKey(formData.email));
            
            setResendAttempts(attempts);
            
            if (cooldownEnd) {
                const cooldownEndTime = parseInt(cooldownEnd, 10);
                const now = Date.now();
                if (cooldownEndTime > now) {
                    setCooldownTime(cooldownEndTime);
                } else {
                    // Cooldown expired, clear it
                    localStorage.removeItem(getCooldownKey(formData.email));
                }
            }
        }
    }, [formData?.email]);

    // Update countdown timer
    useEffect(() => {
        if (cooldownTime) {
            const updateTimer = () => {
                const now = Date.now();
                const remaining = Math.max(0, Math.ceil((cooldownTime - now) / 1000));
                setTimeRemaining(remaining);
                
                if (remaining <= 0) {
                    setCooldownTime(null);
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                }
            };

            updateTimer();
            intervalRef.current = setInterval(updateTimer, 1000);

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        }
    }, [cooldownTime]);

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleResendEmail = async () => {
        if (!formData?.email) {
            toast.error('Email address not found');
            return;
        }

        // Check if max attempts reached
        if (resendAttempts >= MAX_RESEND_ATTEMPTS) {
            toast.error(`You've reached the maximum number of resend attempts (${MAX_RESEND_ATTEMPTS}). Please wait before trying again.`);
            return;
        }

        // Check if still in cooldown
        if (cooldownTime && Date.now() < cooldownTime) {
            toast.error('Please wait before requesting another email.');
            return;
        }

        setResendLoading(true);

        try {
            const result = await dispatch(resendConfirmationEmail(formData.email));
            
            if (resendConfirmationEmail.fulfilled.match(result)) {
                // Increment attempts
                const newAttempts = resendAttempts + 1;
                setResendAttempts(newAttempts);
                localStorage.setItem(getAttemptsKey(formData.email), newAttempts.toString());

                // If this was the last attempt, set cooldown
                if (newAttempts >= MAX_RESEND_ATTEMPTS) {
                    const cooldownEnd = Date.now() + COOLDOWN_DURATION;
                    setCooldownTime(cooldownEnd);
                    localStorage.setItem(getCooldownKey(formData.email), cooldownEnd.toString());
                    toast.success('Confirmation email sent! You have reached the maximum attempts. Please wait before requesting again.');
                } else {
                    toast.success('Confirmation email sent successfully!');
                }
            } else {
                // Handle error from API
                const errorMessage = result.payload as string || 'Failed to resend confirmation email';
                toast.error(errorMessage);
                
                // If API returns rate limit error, set cooldown
                if (errorMessage.toLowerCase().includes('wait') || errorMessage.toLowerCase().includes('cooldown')) {
                    const cooldownEnd = Date.now() + COOLDOWN_DURATION;
                    setCooldownTime(cooldownEnd);
                    localStorage.setItem(getCooldownKey(formData.email), cooldownEnd.toString());
                }
            }
        } catch (error: any) {
            toast.error('An unexpected error occurred. Please try again later.');
        } finally {
            setResendLoading(false);
        }
    };

    const onSubmit = async (data: RegisterFormType) => {
        console.log(data);

        setFormData(data)

        // Auto-generate username from email (no separate username input)
        const finalData = {
            email: data.email,
            username: data.email,
            password1: data.password1,
            password2: data.password2,
            gender: "M"
        };
        const res = await dispatch(register(finalData))

        console.log(res)

        if (res?.type.includes('fulfilled')) {
            toast.success("Welcome to HAWOLA")
            reset()
            setRegSuccess(true)
            // router.push('/auth/login')
        }else {
            const errorMessage = normalizeErrors(message)
            toast.error(errorMessage, {style: {
                    background: "#ef4444",
                    color: "white",
                },}
            )
        }

        console.log(res)
    };


    return (

        <div className="flex flex-col lg:flex-row gap-12 w-full pt-16 mb-28 md:px-28 bg-white">

            {regSuccess && (
                <div className="flex items-center justify-center w-full min-h-[60vh] px-4">
                    <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12">
                        {/* Success Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
                                <div className="relative bg-green-50 rounded-full p-4">
                                    <CheckCircleIcon className="h-16 w-16 text-green-500" />
                                </div>
                            </div>
                        </div>

                        {/* Main Message */}
                        <div className="text-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Welcome to Hawola! 🎉
                            </h2>
                            <p className="text-lg text-gray-600 mb-6">
                                Your account has been created successfully
                            </p>
                        </div>

                        {/* Email Confirmation Card */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <EnvelopeIcon className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Check your email
                                    </h3>
                                    <p className="text-gray-700 mb-3">
                                        We've sent a confirmation email to:
                                    </p>
                                    <p className="text-blue-700 font-semibold text-lg break-all mb-4">
                                        {formData?.email}
                                    </p>
                                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                                        <p className="text-sm text-gray-600 mb-2">
                                            <span className="font-semibold">Next steps:</span>
                                        </p>
                                        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                                            <li>Click the verification link in the email</li>
                                            <li>Check your spam folder if you don't see it</li>
                                            <li>Verify your email to activate your account</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => router.push('/')}
                                className="flex-1 flex items-center justify-center gap-2 bg-[#435a8c] hover:bg-[#354a73] text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                <span>Back to Homepage</span>
                                <ArrowRightIcon className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => {
                                    // Optionally resend email or go to login
                                    router.push('/auth/login');
                                }}
                                className="flex-1 border-2 border-[#435a8c] text-[#435a8c] hover:bg-[#435a8c] hover:text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200"
                            >
                                Go to Login
                            </button>
                        </div>

                        {/* Resend Email Section */}
                        <div className="mt-8 border-t border-gray-200 pt-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-4">
                                    Didn't receive the email?
                                </p>
                                
                                {/* Attempts Counter */}
                                {resendAttempts > 0 && (
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-500">
                                            Resend attempts: {resendAttempts} / {MAX_RESEND_ATTEMPTS}
                                        </p>
                                    </div>
                                )}

                                {/* Cooldown Timer */}
                                {cooldownTime && timeRemaining > 0 && (
                                    <div className="mb-4 flex items-center justify-center gap-2 text-orange-600">
                                        <ClockIcon className="h-5 w-5" />
                                        <span className="text-sm font-semibold">
                                            Please wait {formatTime(timeRemaining)} before requesting again
                                        </span>
                                    </div>
                                )}

                                {/* Resend Button */}
                                <button
                                    onClick={handleResendEmail}
                                    disabled={
                                        resendLoading || 
                                        resendAttempts >= MAX_RESEND_ATTEMPTS || 
                                        (cooldownTime !== null && Date.now() < cooldownTime)
                                    }
                                    className={`
                                        inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm
                                        transition-all duration-200
                                        ${
                                            resendLoading || 
                                            resendAttempts >= MAX_RESEND_ATTEMPTS || 
                                            (cooldownTime !== null && Date.now() < cooldownTime)
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-blue-50 text-[#435a8c] hover:bg-blue-100 border-2 border-[#435a8c]'
                                        }
                                    `}
                                >
                                    {resendLoading ? (
                                        <>
                                            <svg 
                                                className="animate-spin h-4 w-4" 
                                                xmlns="http://www.w3.org/2000/svg" 
                                                fill="none" 
                                                viewBox="0 0 24 24"
                                            >
                                                <circle 
                                                    className="opacity-25" 
                                                    cx="12" 
                                                    cy="12" 
                                                    r="10" 
                                                    stroke="currentColor" 
                                                    strokeWidth="4"
                                                ></circle>
                                                <path 
                                                    className="opacity-75" 
                                                    fill="currentColor" 
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            <span>Sending...</span>
                                        </>
                                    ) : resendAttempts >= MAX_RESEND_ATTEMPTS ? (
                                        <>
                                            <EnvelopeIcon className="h-4 w-4" />
                                            <span>Maximum attempts reached</span>
                                        </>
                                    ) : (
                                        <>
                                            <EnvelopeIcon className="h-4 w-4" />
                                            <span>Resend confirmation email</span>
                                        </>
                                    )}
                                </button>

                                {/* Helpful Message */}
                                {resendAttempts >= MAX_RESEND_ATTEMPTS && !cooldownTime && (
                                    <p className="mt-3 text-xs text-gray-500">
                                        You can try again after the cooldown period expires
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!regSuccess && <div className="w-full max-w-xl px-8 bg-white ">
                <h2 className="text-xl lg:text-4xl font-bold text-[#435a8c]">Create an Account</h2>
                <p className="text-sm lg:text-lg text-[#435a8c] mb-6 mt-2">Access to all features. No credit card
                    required.</p>

                <form className={'flex flex-col gap-4 mt-8'} onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <ControlledInput<RegisterFormType>
                            control={control}
                            errors={errors}
                            name="email"
                            label=" Email*"
                            type="text"
                            placeholder="stevenjob@gmail.com"
                            defaultValue={''}
                            rules={{
                                required: 'Email is required', pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address',
                                },

                            }}
                            className="w-full text-xs mt-1 p-3 border rounded-md bg-white border-[#dde4f0] focus:outline-none"
                        />

                    </div>
                    {/* Username field hidden: we derive username from email on submit */}
                    <div>
                        <ControlledInput<RegisterFormType>
                            control={control}
                            errors={errors}
                            name="password1"
                            label=" Password*"
                            type="password"
                            placeholder="*********"
                            defaultValue={''}
                            rules={{
                                required: 'Password is required',
                                validate: (value) => {
                                    if (!value || value.length < 8) {
                                        return 'Password must be at least 8 characters';
                                    }
                                    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;
                                    if (!strongRegex.test(value)) {
                                        return 'Password must include upper & lower case letters, a number, and a symbol';
                                    }
                                    return true;
                                },
                            }}
                            className="w-full text-xs mt-1 p-3 border rounded-md bg-white border-[#dde4f0] focus:outline-none"
                        />

                    </div>
                    <div>
                        <ControlledInput<RegisterFormType>
                            control={control}
                            errors={errors}
                            name="password2"
                            label=" Re-Password*"
                            type="password"
                            placeholder="*********"
                            defaultValue={''}
                            rules={{
                                required: 'Password is required',
                                validate: (value) => {
                                    const pwd1 = getValues('password1');
                                    if (!value || value.length < 8) {
                                        return 'Password must be at least 8 characters';
                                    }
                                    if (value !== pwd1) {
                                        return 'Passwords do not match';
                                    }
                                    return true;
                                },
                            }}
                            className="w-full text-xs mt-1 p-3 border rounded-md bg-white border-[#dde4f0] focus:outline-none"
                        />
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <label className="flex items-center text-xs text-[#435a8c]">
                            <Controller
                                name="terms"
                                control={control}
                                defaultValue={'false'}
                                rules={{
                                    required: "You are required to agree to the terms and conditions",
                                }}
                                render={({field, fieldState}) => (<div className={'flex flex-col'}>
                                        <div className={'flex gap-2 items-center'}>
                                            <input value={field.value}
                                                   onChange={field.onChange} type="checkbox" className="mr-2"/>
                                            By clicking Register button, you agree to our terms and policy.
                                        </div>
                                        {fieldState.error && (
                                            <span className="text-red-500">{fieldState.error.message}</span>)}
                                    </div>)}
                            />

                        </label>
                    </div>
                    <button disabled={isLoading || !terms}
                            className={`w-full mt-6 ${isLoading || !terms ? 'bg-blue-300 cursor-not-allowed' : "bg-[#435a8c]"} text-white py-3 rounded-md text-lg font-semibold`}
                            type="submit">
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
                        </div> : "Sign Up"}
                    </button>
                    
                    <Link href={'/auth/login'}>
                        <p className="text-left text-xs text-[#435a8c] mt-4">
                            Already have an account? <span className="text-blue-900 font-semibold">Sign In</span>
                        </p>
                    </Link>
                </form>
            </div>}

            {!regSuccess && <div className={'pt-16 px-8 md:px-0 flex flex-col gap-8 w-full'}>
                <h2 className="text-xl text-center font-bold text-[#435a8c]">Use Social Network Account</h2>
                <div className={'flex flex-col gap-4'}>
                    {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                const token = credentialResponse.credential;
                                if (!token) return;
                                const res = await dispatch(loginWithGoogle(token));
                                if (res?.type?.includes?.("fulfilled")) {
                                    toast.success("Welcome to HAWOLA");
                                    if (localCart?.items?.length > 0) {
                                        dispatch(addToCarts({
                                            items: localCart.items.map((cart: { qty: number; product: { id: number } }) => ({
                                                qty: cart.qty,
                                                product: cart?.product?.id,
                                            })),
                                        }));
                                        dispatch(addToCartsLocal({ items: [] }));
                                    }
                                    router.push("/");
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
                            theme="outline"
                            size="large"
                            text="signup_with"
                            shape="rectangular"
                            width="100%"
                        />
                    )}
                    {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                        <button
                            className="text-sm flex items-center justify-center font-bold text-primary p-4 border rounded-md bg-white border-[#dde4f0]">Sign
                            up with <img src={'/imgs/page/account/google.svg'} alt={'google'}/>
                        </button>
                    )}
                    <button
                        disabled
                        className="text-sm flex items-center justify-center font-bold text-primary p-4 border rounded-md bg-white border-[#dde4f0] opacity-60 cursor-not-allowed">Sign
                        up with <span className="text-[#3AA1FF] text-[16px] font-bold">Facebook</span>
                        {/*<img src={'/imgs/page/account/google.svg'} alt={'google'}/>*/}
                    </button>
                    <button
                        disabled
                        className="text-sm flex items-center justify-center font-bold text-primary p-4 border rounded-md bg-white border-[#dde4f0] opacity-60 cursor-not-allowed">Sign
                        up with <img src={'/imgs/page/account/amazon.svg'} alt={'amazon'}/>
                    </button>

                    <p className="text-center text-xs text-primary mt-4">
                        Buying for work? <a href="#" className="text-blue-900 font-semibold">Create a free business
                        account</a>
                    </p>
                </div>


            </div>}
        </div>

    );
}

export default RegisterForm;