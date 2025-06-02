import {useEffect, useState} from 'react';
import Head from 'next/head';
import AuthLayout from "@/components/layout/AuthLayout";
import {getAddress} from "@/redux/product/productSlice";
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import {getUserProfile, updateProfile} from "@/redux/auth/authSlice";
import OrderTracking from "@/components/account/OrderTracking";
import Notifications from "@/components/account/Notifications";
import Wishlist from "@/components/account/Wishlist";
import Orders from "@/components/account/Orders";
import Settings from "@/components/account/Settings";

export default function AccountPage() {
    const {profile: user} = useAppSelector(state => state.auth);

    const [loading, setLoading] = useState(false)

    const [orderId, setOrderId] = useState('FOSPWRFAF3585');

    const [isTracking, setIsTracking] = useState(true);

    const [tab, setTab] = useState('notification');

    const tabs = [
        {
            id: 'notification',
            name: 'Notification',
        },

        {
            id: 'wish',
            name: 'Wishlist',
        },

        {
            id: 'orders',
            name: 'Orders',
        },

        {
            id: 'tracking',
            name: 'Order Tracking',
        },

        {
            id: 'setting',
            name: 'Setting',
        },
    ]

    const dispatch = useAppDispatch();


    console.log('userL:', user)
    useEffect(() => {
        dispatch(getAddress());
        dispatch(getUserProfile());
    }, [dispatch]);

    return (
        <AuthLayout>
            <div className="min-h-screen bg-gray-50">
                <Head>
                    <title>My Account</title>
                </Head>

                <main className="container mx-auto p-4">
                    {/* Header */}
                    <header className="mb-6">
                        <h1 className="text-3xl font-semibold text-primary">Hello Steven</h1>
                        <p className="text-sm text-textPadded font-medium mt-2 mb-12">
                            From your account dashboard, you can easily check & view your recent orders, <br/> manage your shipping and billing addresses and edit your password and account details.
                        </p>
                        <nav className={`mb-8 flex space-x-4 text-sm text-textPadded border-b border-b-detailsBorder cursor-pointer`}>
                            {tabs.map(ta => (
                                <span key={ta.id} onClick={()=>{
                                    setTab(ta.id)
                                }} className={`pb-2 font-semibold ${tab === ta.id ? "border-b-2 border-primary text-primary" : ""}`}>{ta.name}</span>
                            ))}
                        </nav>
                    </header>

                    {tab === 'notification' && <Notifications/>}

                    {tab === 'tracking' && <OrderTracking orderId={orderId} setOrderId={setOrderId}/>}

                    {tab === 'wish' && <Wishlist />}

                    {tab === 'orders' && <Orders />}

                    {tab === 'setting' && <Settings />}
                </main>
            </div>
        </AuthLayout>
    );
}