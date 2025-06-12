import {useCallback, useEffect, useState} from 'react';
import Head from 'next/head';
import AuthLayout from "@/components/layout/AuthLayout";
import {getAddress, getOrderHistory, getWishList} from "@/redux/product/productSlice";
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import {getUserProfile, updateProfile} from "@/redux/auth/authSlice";
import Wishlist from "@/components/account/Wishlist";
import Orders from "@/components/account/Orders";
import Settings from "@/components/account/Settings";
import {getDisputes} from "@/redux/disputes/disputeSlice";

export default function AccountPage() {
    const {profile: user} = useAppSelector(state => state.auth);

    const [loading, setLoading] = useState(false)

    const [tab, setTab] = useState('orders');

    const tabs = [
        {
            id: 'orders',
            name: 'Orders',
        },
        {
            id: 'wish',
            name: 'Wishlist',
        },
        {
            id: 'profile',
            name: 'Profile',
        },
    ]

    const dispatch = useAppDispatch();


    const init = useCallback(async () => {
        try {
            setLoading(true)
            if(tab === "orders"){
                const res = await  dispatch(getOrderHistory())
                if (res.type.includes("fulfilled")) {
                    setLoading(false)
                }
            }


            if(tab === "wish"){
                const res = await  dispatch(getWishList())
                if (res.type.includes("fulfilled")) {
                    setLoading(false)
                }
            }



            if(tab === "dispute"){
                const res = await  dispatch(getDisputes("2"))
                if (res.type.includes("fulfilled")) {
                    setLoading(false)
                }
            }


            if(tab === "profile"){
                const res = await  dispatch(getUserProfile())
                if (res.type.includes("fulfilled")) {
                    setLoading(false)
                }
            }

        } catch (e) {
            console.log(e)
            setLoading(false)
        } finally {
            setLoading(false)
        }

    }, [dispatch, tab]);

    useEffect(() => {
        dispatch(getAddress());
        dispatch(getUserProfile());
    }, [dispatch]);


    useEffect(() => {
        init()
    }, [init]);

    return (
        <AuthLayout>
            <div className="!p-0 bg-gray-50">
                <Head>
                    <title>My Account</title>
                </Head>

                <main className="p-0">
                    {/* Header */}
                    <header className="mb-6 bg-headerBg px-20 pt-4">
                        <h1 className="text-3xl font-semibold text-white">Hello Steven</h1>
                        <p className="text-sm text-white font-medium mt-2 mb-12">
                            From your account dashboard, you can easily check & view your recent orders, <br/> manage your shipping and billing addresses and edit your password and account details.
                        </p>
                        <nav className={`mb-8 flex space-x-6 text-sm text-textPadded border-b border-b-detailsBorder cursor-pointer`}>
                            {tabs.map(ta => (
                                <span key={ta.id} onClick={()=>{
                                    setTab(ta.id)
                                }} className={`pb-2 font-semibold ${tab === ta.id ? "border-b-2 border-white text-white" : ""}`}>{ta.name}</span>
                            ))}
                        </nav>
                    </header>

                    {
                        loading ? (
                            <div className="flex items-center justify-center h-[270px] bg-white rounded-lg">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondaryBgColor"></div>
                            </div>
                        ) : (
                            <div className={'container  mx-auto mb-12'}>
                                {tab === 'wish' && <Wishlist />}

                                {tab === 'orders' && <Orders />}

                                {tab === 'profile' && <Settings />}
                            </div>
                        )
                    }
                </main>
            </div>
        </AuthLayout>
    );
}