import { useState } from 'react';
import Link from "next/link";

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    return (
        <div className="flex  w-full pt-16 mb-28 md:px-28 bg-white">
            <div className="w-full max-w-xl px-8 bg-white ">
                <h2 className="text-4xl font-bold text-[#435a8c]">Member Login</h2>
                <p className="text-[#435a8c] mb-6 mt-2">Welcome back!</p>

                <form className={'flex flex-col gap-4 mt-8'}>
                    <div>
                        <label className="block text-sm font-medium text-[#435a8c]">
                            Email / Phone / Username *
                        </label>
                        <input
                            type="email"
                            placeholder="stevenjob@gmail.com"
                            className="w-full mt-1 p-3 border rounded-md bg-white border-[#dde4f0] focus:outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#435a8c] mt-4">
                            Password *
                        </label>
                        <input
                            type="password"
                            placeholder="****************"
                            className="w-full mt-1 p-3 border rounded-md bg-white border-[#dde4f0] focus:outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

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

                    <button className="w-full mt-6 bg-[#435a8c] text-white py-3 rounded-md text-lg font-semibold">
                        Sign Up
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
