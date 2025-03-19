import { useState } from 'react';
import Link from "next/link";
import ControlledInput from "@/components/shared/ControlledInput";
import {useForm, useWatch} from "react-hook-form";
import {LoginFormType, RegisterFormType} from "@/types/auth";
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import {login, register} from "@/redux/auth/authSlice";
import {toast} from "react-toastify";
import {useRouter} from "next/router";

export default function LoginForm() {
    const [rememberMe, setRememberMe] = useState(false);

    const router = useRouter()

    const { control, handleSubmit,  formState: { errors }, } = useForm<LoginFormType>();

    const dispatch = useAppDispatch()

    const {isLoading} = useAppSelector(state => state.auth)



    const onSubmit = async (data: LoginFormType) => {
        console.log(data);

        const  res = await dispatch(login(data))

        console.log(res)

        if (res?.type.includes('fulfilled')){
            toast.success("Welcome Back to HAWOLA")
            router.push('/')
        }
    };



    return (
        <div className="flex  w-full pt-16 mb-28 md:px-28 bg-white">
            <div className="w-full max-w-xl px-8 bg-white ">
                <h2 className="text-4xl font-bold text-[#435a8c]">Member Login</h2>
                <p className="text-[#435a8c] mb-6 mt-2">Welcome back!</p>

                <form onSubmit={handleSubmit(onSubmit)} className={'flex flex-col gap-4 mt-8'}>
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
                        <a href="#" className="text-[#435a8c] text-xs">Forgot your password?</a>
                    </div>

                    <button disabled={isLoading} type={'submit'} className={`w-full mt-6 ${isLoading  ? 'bg-blue-300 cursor-not-allowed' : "bg-[#435a8c]"} text-white py-3 rounded-md text-lg font-semibold`}>
                        Sign In
                    </button>
                    <Link href={'/auth/register'}>
                    <p className="text-left text-xs text-[#435a8c] mt-4">
                        Have not an account? <span className="text-blue-900 font-semibold">Sign Up</span>
                    </p>
                    </Link>
                </form>
            </div>
        </div>
    );
}
