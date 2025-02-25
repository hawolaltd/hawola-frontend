import React, {useState} from 'react';
import Link from "next/link";

function RegisterForm() {
    const [fullname, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rePassword, setRePassword] = useState('');
    const [terms, setTerms] = useState(false);


    return (

            <div className="flex flex-col lg:flex-row gap-12 w-full pt-16 mb-28 md:px-28 bg-white">
                <div className="w-full max-w-xl px-8 bg-white ">
                    <h2 className="text-xl lg:text-4xl font-bold text-[#435a8c]">Create an Account</h2>
                    <p className="text-sm lg:text-lg text-[#435a8c] mb-6 mt-2">Access to all features. No credit card required.</p>

                    <form className={'flex flex-col gap-4 mt-8'}>
                        <div>
                            <label className="block text-sm font-medium text-[#435a8c]">
                                Full Name*
                            </label>
                            <input
                                type="fullname"
                                placeholder="Steven Job"
                                className="w-full mt-1 p-4 border rounded-md bg-white border-[#dde4f0] focus:outline-none"
                                value={email}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#435a8c]">
                                Email*
                            </label>
                            <input
                                type="email"
                                placeholder="stevenjob@gmail.com"
                                className="w-full mt-1 p-4 border rounded-md bg-white border-[#dde4f0] focus:outline-none"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                       <div>
                            <label className="block text-sm font-medium text-[#435a8c]">
                                Username*
                            </label>
                            <input
                                type="username"
                                placeholder="stevenjob"
                                className="w-full mt-1 p-4 border rounded-md bg-white border-[#dde4f0] focus:outline-none"
                                value={email}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#435a8c] mt-4">
                                Password *
                            </label>
                            <input
                                type="password"
                                placeholder="****************"
                                className="w-full mt-1 p-4 border rounded-md bg-white border-[#dde4f0] focus:outline-none"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#435a8c] mt-4">
                               Re-Password *
                            </label>
                            <input
                                type="rePassword"
                                placeholder="****************"
                                className="w-full mt-1 p-4 border rounded-md bg-white border-[#dde4f0] focus:outline-none"
                                value={password}
                                onChange={(e) => setRePassword(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <label className="flex items-center text-xs text-[#435a8c]">
                                <input
                                    type="checkbox"
                                    className="mr-2"
                                    checked={terms}
                                    onChange={() => setTerms(!terms)}
                                />
                                By clicking Register button, you agree our terms and policy,
                            </label>
                        </div>

                        <button className="w-full mt-6 bg-[#435a8c] text-white py-3 rounded-md text-lg font-semibold">
                            Sign Up
                        </button>

                        <Link href={'/auth/login'}>
                            <p className="text-left text-xs text-[#435a8c] mt-4">
                                Already have an account? <span className="text-blue-900 font-semibold">Sign In</span>
                            </p>
                        </Link>
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