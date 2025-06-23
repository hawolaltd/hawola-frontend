import React, {useState} from 'react';
import {Controller, useForm, useWatch} from "react-hook-form";
import {RegisterFormType} from "@/types/auth";
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import {register} from "@/redux/auth/authSlice";
import ControlledInput from "@/components/shared/ControlledInput";
import {toast} from "sonner";
import {useRouter} from "next/router";
import {normalizeErrors} from "@/util";

function RegisterForm() {

    const {control, handleSubmit, formState: {errors}, reset} = useForm<RegisterFormType>();

    const [regSuccess, setRegSuccess] = useState(false)

    const [formData, setFormData] = useState<RegisterFormType | null>(null)

    const dispatch = useAppDispatch()

    const {isLoading, message} = useAppSelector(state => state.auth)

    const terms = useWatch({
        control, name: 'terms',
    })

    const router = useRouter()

    const onSubmit = async (data: RegisterFormType) => {
        console.log(data);

        setFormData(data)

        const finalData = {
            email: data.email, username: data.username, password1: data.password1, password2: data.password2, gender: "M"
        }
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

            {regSuccess && (<div className={"flex items-center justify-center w-full"}>
                    <p>A confirmation mail has been to your email {formData?.email}, <span className={'text-primary cursor-pointer'} onClick={()=>{
                        router.push('/')
                    }}>click</span> on back to the homepage</p>
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
                    <div>
                        <ControlledInput<RegisterFormType>
                            control={control}
                            errors={errors}
                            name="username"
                            label=" Username*"
                            type="text"
                            placeholder="stevenjob"
                            defaultValue={''}
                            rules={{
                                required: 'Username is required', minLength: {
                                    value: 5, message: 'Username must be at least 5 characters',
                                },
                            }}
                            className="w-full text-xs mt-1 p-3 border rounded-md bg-white border-[#dde4f0] focus:outline-none"
                        />
                    </div>
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
                                required: 'Password is required', minLength: {
                                    value: 8, message: 'Password must be at least 8 characters',
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
                                required: 'Password is required', minLength: {
                                    value: 8, message: 'Password must be at least 8 characters',
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
                </form>
            </div>}

            {!regSuccess && <div className={'pt-16 px-8 md:px-0 flex flex-col gap-8 w-full'}>
                <h2 className="text-xl text-center font-bold text-[#435a8c]">Use Social Network Account</h2>
                <div className={'flex flex-col gap-4'}>
                    <button
                        className="text-sm flex items-center justify-center font-bold text-primary p-4 border rounded-md bg-white border-[#dde4f0]">Sign
                        up with <img src={'/imgs/page/account/google.svg'} alt={'google'}/>
                    </button>
                    <button
                        className="text-sm flex items-center justify-center font-bold text-primary p-4 border rounded-md bg-white border-[#dde4f0]">Sign
                        up with <span className="text-[#3AA1FF] text-[16px] font-bold">Facebook</span>
                        {/*<img src={'/imgs/page/account/google.svg'} alt={'google'}/>*/}
                    </button>
                    <button
                        className="text-sm flex items-center justify-center font-bold text-primary p-4 border rounded-md bg-white border-[#dde4f0]">Sign
                        up with <img src={'/imgs/page/account/amazon.svg'} alt={'google'}/>
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