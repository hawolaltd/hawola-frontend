import { useState } from 'react';
import Link from "next/link";
import ControlledInput from "@/components/shared/ControlledInput";
import {useForm, useWatch} from "react-hook-form";
import {LoginFormType, RegisterFormType} from "@/types/auth";
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import {login, register} from "@/redux/auth/authSlice";
import {toast} from "sonner";
import {useRouter} from "next/router";
import {addToCarts, addToCartsLocal} from "@/redux/product/productSlice";

export default function LoginForm() {
    const [rememberMe, setRememberMe] = useState(false);

    const router = useRouter()

    const { control, handleSubmit,  formState: { errors }, } = useForm<LoginFormType>();

    const dispatch = useAppDispatch()

    const {isLoading} = useAppSelector(state => state.auth)
    const {localCart} = useAppSelector(state => state.products)



    const onSubmit = async (data: LoginFormType) => {
        console.log(data);

        const  res = await dispatch(login(data))

        console.log(res)

        if (res?.type.includes('fulfilled')){
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
