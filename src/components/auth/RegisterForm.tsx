import React from 'react';
import {Controller, useForm, useWatch} from "react-hook-form";
import {RegisterFormType} from "@/types/auth";
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import {register} from "@/redux/auth/authSlice";

function RegisterForm() {

    const { control, handleSubmit } = useForm<RegisterFormType>();

    const dispatch = useAppDispatch()

    const {isLoading} = useAppSelector(state => state.auth)

    const terms = useWatch({
        control,
        name: 'terms',
    })

    console.log('terms:', terms)


    const onSubmit = async (data: RegisterFormType) => {
        console.log(data);

        const finalData = {
            email: data.email,
            username: data.username,
            password1: data.password1,
            password2: data.password2,
        }
        const  res = await dispatch(register(finalData))

        console.log(res)
    };



    return (

            <div className="flex flex-col lg:flex-row gap-12 w-full pt-16 mb-28 md:px-28 bg-white">
                <div className="w-full max-w-xl px-8 bg-white ">
                    <h2 className="text-xl lg:text-4xl font-bold text-[#435a8c]">Create an Account</h2>
                    <p className="text-sm lg:text-lg text-[#435a8c] mb-6 mt-2">Access to all features. No credit card
                        required.</p>

                    <form className={'flex flex-col gap-4 mt-8'} onSubmit={handleSubmit(onSubmit)}>
                        {/*<div>*/}
                        {/*    <label className="block text-sm font-medium text-[#435a8c]">Full Name*</label>*/}
                        {/*    <Controller*/}
                        {/*        name="fullname"*/}
                        {/*        control={control}*/}
                        {/*        defaultValue=""*/}
                        {/*        render={({field}) => <input {...field} type="text" placeholder="Steven Job"*/}
                        {/*                                    className="w-full mt-1 p-4 border rounded-md bg-white border-[#dde4f0] focus:outline-none"/>}*/}
                        {/*    />*/}
                        {/*</div>*/}
                        <div>
                            <label className="block text-sm font-medium text-[#435a8c]">Email*</label>
                            <Controller
                                name="email"
                                control={control}
                                defaultValue=""
                                rules={{
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address',
                                    },

                                }}
                                render={({field, fieldState}) => {

                                    console.log("fieldState:", fieldState)
                                    console.log("fieldState.error:", fieldState.error)
                                    console.log("fieldState.error.message:", fieldState.error?.message)

                                    return(

                                        <><input  value={field.value}
                                                  onChange={field.onChange} type="email" placeholder="stevenjob@gmail.com"
                                                  className="w-full mt-1 p-4 border rounded-md bg-white border-[#dde4f0] focus:outline-none"/>

                                            {fieldState.error && (
                                                <span className="text-red-500">{fieldState.error.message}</span>
                                            )}
                                        </>
                                )}}
                            />

                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#435a8c]">Username*</label>
                            <Controller
                                name="username"
                                control={control}
                                defaultValue=""
                                rules={{
                                    required: 'Username is required',
                                    minLength: {
                                        value: 5,
                                        message: 'Username must be at least 5 characters',
                                    },
                                }}
                                render={({field, fieldState}) => <>
                                    <input value={field.value}
                                           onChange={field.onChange} type="text" placeholder="stevenjob"
                                           className="w-full mt-1 p-4 border rounded-md bg-white border-[#dde4f0] focus:outline-none"/>

                                    {fieldState.error && (
                                        <span className="text-red-500">{fieldState.error.message}</span>
                                    )}
                                </>
                                }

                            />

                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#435a8c] mt-4">Password *</label>
                            <Controller
                                name="password1"
                                control={control}
                                defaultValue=""
                                rules={{
                                    required: 'Password is required',
                                    minLength: {
                                        value: 8,
                                        message: 'Password must be at least 8 characters',
                                    },
                                }}
                                render={({field, fieldState}) => (
                                    <>
                                        <input value={field.value}
                                               onChange={field.onChange} type="password" placeholder="****************"
                                               className="w-full mt-1 p-4 border rounded-md bg-white border-[#dde4f0] focus:outline-none"/>
                                        {fieldState.error && (
                                            <span className="text-red-500">{fieldState.error.message}</span>
                                        )}
                                    </>
                                )}
                            />

                        </div>
                        <div>
                        <label className="block text-sm font-medium text-[#435a8c] mt-4">Re-Password *</label>
                            <Controller
                                name="password2"
                                control={control}
                                defaultValue=""
                                rules={{
                                    required: 'Password is required',
                                    minLength: {
                                        value: 8,
                                        message: 'Password must be at least 8 characters',
                                    },
                                }}
                                render={({field, fieldState}) => (
                                    <>
                                        <input value={field.value}
                                               onChange={field.onChange} type="password" placeholder="****************"
                                               className="w-full mt-1 p-4 border rounded-md bg-white border-[#dde4f0] focus:outline-none"/>
                                        {fieldState.error && (
                                            <span className="text-red-500">{fieldState.error.message}</span>
                                        )}
                                    </>

                                )}
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
                                    render={({field,fieldState}) => (
                                        <div className={'flex flex-col'}>
                                           <div className={'flex gap-2 items-center'}>
                                               <input value={field.value}
                                                      onChange={field.onChange} type="checkbox" className="mr-2"/>
                                               By clicking Register button, you agree to our terms and policy.
                                           </div>
                                            {fieldState.error && (
                                                <span className="text-red-500">{fieldState.error.message}</span>
                                            )}
                                        </div>
                                    )}
                            />

                            </label>
                        </div>
                        <button disabled={isLoading || !terms } className={`w-full mt-6 ${isLoading || !terms  ? 'bg-blue-300 cursor-not-allowed' : "bg-[#435a8c]" } text-white py-3 rounded-md text-lg font-semibold`}
                                type="submit">
                            Sign Up
                        </button>
                    </form>
                </div>

                <div className={'pt-16 px-8 md:px-0 flex flex-col gap-8 w-full'}>
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


                </div>
            </div>

    );
}

export default RegisterForm;