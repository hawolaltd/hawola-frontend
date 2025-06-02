import React, {useEffect, useState} from 'react';
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import {useForm} from "react-hook-form";
import {UpdateProfileDataType} from "@/types/auth";
import {getUserProfile, updateProfile} from "@/redux/auth/authSlice";
import Swal from "sweetalert2";
import {getAddress} from "@/redux/product/productSlice";


type User = {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    joinedDate: Date;
};

type PaymentMethod = {
    id: string;
    type: 'Credit Card' | 'PayPal' | 'Bank Transfer';
    last4?: string;
    email?: string;
    expiry?: string;
    isDefault: boolean;
};


function PrevImplementation() {
    const dispatch = useAppDispatch();

    // Sample Payment Methods
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
        {
            id: '1',
            type: 'Credit Card',
            last4: '4242',
            expiry: '12/25',
            isDefault: true,
        },
        {
            id: '2',
            type: 'PayPal',
            email: 'john.doe@example.com',
            isDefault: false,
        },
    ]);

    const [activeTab, setActiveTab] = useState<'profile' | 'address' | 'payment' | 'settings'>('profile');

    const {addresses} = useAppSelector(state => state.products);


    const {profile: user} = useAppSelector(state => state.auth);

    const [loading, setLoading] = useState(false)

    const { control, handleSubmit,  formState: { errors }, } = useForm<UpdateProfileDataType>();


    const onSubmit = async (data: UpdateProfileDataType) => {
        setLoading(true)
        console.log(data);
        try {

            const  res = await dispatch(updateProfile(data))
            console.log(res)
            if (res?.type.includes('fulfilled')){
                setLoading(false)
                Swal.fire({
                    title: "Profile Updated!",
                    icon: "success",
                    draggable: true,
                    showClass: {
                        popup: `
                                      animate__animated
                                      animate__fadeInUp
                                      animate__faster
                                    `
                    },
                    hideClass: {
                        popup: `
                                      animate__animated
                                      animate__fadeOutDown
                                      animate__faster
                                    `
                    }
                });
            }else {
                setLoading(false)
                Swal.fire({
                    title: "Error Occur!",
                    icon: "error",
                    draggable: true,
                    showClass: {
                        popup: `
                            animate__animated
                            animate__fadeInUp
                            animate__faster
                        `
                    },
                    hideClass: {
                        popup: `
                            animate__animated
                            animate__fadeOutDown
                            animate__faster
                        `
                    }
                });
            }
        }catch (e) {
            Swal.fire({
                title: "Error Occur!",
                icon: "error",
                draggable: true,
                showClass: {
                    popup: `
                        animate__animated
                        animate__fadeInUp
                        animate__faster
                    `
                },
                hideClass: {
                    popup: `
                        animate__animated
                        animate__fadeOutDown
                        animate__faster
                    `
                }
            });
        }
    };

    useEffect(() => {
        dispatch(getAddress());
        dispatch(getUserProfile());
    }, [dispatch]);
    return (
        <div>
            {/*<div className="min-h-screen bg-gray-50">*/}
            {/*    <Head>*/}
            {/*        <title>My Account</title>*/}
            {/*    </Head>*/}

            {/*    <div className="container mx-auto px-4 py-8">*/}
            {/*        /!* Header *!/*/}
            {/*        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">*/}
            {/*            <h1 className="text-3xl font-bold text-gray-900">My Account</h1>*/}
            {/*            <p className="text-gray-600">*/}
            {/*                Member since { new Date('2023-01-15').toLocaleDateString('en-US', {year: 'numeric', month: 'long'})}*/}
            {/*            </p>*/}
            {/*        </div>*/}

            {/*        /!* Main Content *!/*/}
            {/*        <div className="flex flex-col lg:flex-row gap-8">*/}
            {/*            /!* Sidebar Navigation *!/*/}
            {/*            <div className="w-full lg:w-1/4">*/}
            {/*                <div className="bg-white rounded-lg shadow-md p-4">*/}
            {/*                    <div className="flex items-center mb-6">*/}
            {/*                        <img*/}
            {/*                            src={'https://randomuser.me/api/portraits/men/1.jpg'}*/}
            {/*                            // src={user?.avatar}*/}
            {/*                            alt={user?.username}*/}
            {/*                            className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500"*/}
            {/*                        />*/}
            {/*                        <div className="ml-4">*/}
            {/*                            <h2 className="font-bold text-lg">{capitalize(user?.first_name)} {capitalize(user?.last_name)}</h2>*/}
            {/*                            <p className="text-gray-600 text-sm">{user?.email}</p>*/}
            {/*                        </div>*/}
            {/*                    </div>*/}

            {/*                    <nav className="space-y-2">*/}
            {/*                        <button*/}
            {/*                            onClick={() => setActiveTab('profile')}*/}
            {/*                            className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'profile' ? 'bg-[#dbe3f2] text-primary font-bold' : 'text-gray-700 hover:bg-gray-100'}`}*/}
            {/*                        >*/}
            {/*                            Profile*/}
            {/*                        </button>*/}

            {/*                        <button*/}
            {/*                            onClick={() => setActiveTab('address')}*/}
            {/*                            className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'address' ? 'bg-[#dbe3f2] text-primary font-bold' : 'text-gray-700 hover:bg-gray-100'}`}*/}
            {/*                        >*/}
            {/*                            Address Book*/}
            {/*                        </button>*/}
            {/*                        <button*/}
            {/*                            onClick={() => setActiveTab('payment')}*/}
            {/*                            className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'payment' ? 'bg-[#dbe3f2] text-primary font-bold' : 'text-gray-700 hover:bg-gray-100'}`}*/}
            {/*                        >*/}
            {/*                            Payment Methods*/}
            {/*                        </button>*/}
            {/*                        <button*/}
            {/*                            onClick={() => setActiveTab('settings')}*/}
            {/*                            className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'settings' ? 'bg-[#dbe3f2] text-primary font-bold' : 'text-gray-700 hover:bg-gray-100'}`}*/}
            {/*                        >*/}
            {/*                            Account Settings*/}
            {/*                        </button>*/}
            {/*                    </nav>*/}
            {/*                </div>*/}
            {/*            </div>*/}

            {/*            /!* Main Content Area *!/*/}
            {/*            <div className="w-full lg:w-3/4">*/}
            {/*                /!* Profile Tab *!/*/}
            {/*                {activeTab === 'profile' && (*/}
            {/*                    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6">*/}
            {/*                        <h2 className="text-xl font-bold mb-6">Profile Information</h2>*/}
            {/*                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">*/}
            {/*                            <div>*/}
            {/*                                <ControlledInput<UpdateProfileDataType>*/}
            {/*                                    control={control}*/}
            {/*                                    errors={errors}*/}
            {/*                                    name="first_name"*/}
            {/*                                    label="First Name"*/}
            {/*                                    type="text"*/}
            {/*                                    placeholder={capitalize(user?.first_name)}*/}
            {/*                                    defaultValue={capitalize(user?.first_name)}*/}
            {/*                                    className="w-full text-xs mt-1 p-3 border rounded-md bg-white border-[#dde4f0] focus:outline-none"*/}
            {/*                                />*/}
            {/*                            </div>*/}

            {/*                            <div>*/}
            {/*                                <ControlledInput<UpdateProfileDataType>*/}
            {/*                                    control={control}*/}
            {/*                                    errors={errors}*/}
            {/*                                    name="last_name"*/}
            {/*                                    label="Last Name"*/}
            {/*                                    type="text"*/}
            {/*                                    placeholder={capitalize(user?.last_name)}*/}
            {/*                                    defaultValue={capitalize(user?.last_name)}*/}
            {/*                                    className="w-full text-xs mt-1 p-3 border rounded-md bg-white border-[#dde4f0] focus:outline-none"*/}
            {/*                                />*/}
            {/*                            </div>*/}
            {/*                            <div>*/}
            {/*                                <ControlledInput<UpdateProfileDataType>*/}
            {/*                                    control={control}*/}
            {/*                                    errors={errors}*/}
            {/*                                    name="username"*/}
            {/*                                    label="Username"*/}
            {/*                                    type="tel"*/}
            {/*                                    placeholder={capitalize(user?.username)}*/}
            {/*                                    defaultValue={capitalize(user?.username)}*/}
            {/*                                    className="w-full text-xs mt-1 p-3 border rounded-md bg-white border-[#dde4f0] focus:outline-none"*/}
            {/*                                />*/}
            {/*                            </div>*/}
            {/*                            <div>*/}
            {/*                                <ControlledInput<UpdateProfileDataType>*/}
            {/*                                    control={control}*/}
            {/*                                    errors={errors}*/}
            {/*                                    name="email"*/}
            {/*                                    label="Email"*/}
            {/*                                    type="text"*/}
            {/*                                    placeholder={capitalize(user?.email)}*/}
            {/*                                    defaultValue={(user?.email)}*/}
            {/*                                    className="w-full text-xs mt-1 p-3 border rounded-md bg-white border-[#dde4f0] focus:outline-none"*/}
            {/*                                />*/}
            {/*                            </div>*/}
            {/*                            <div>*/}
            {/*                                <ControlledInput<UpdateProfileDataType>*/}
            {/*                                    control={control}*/}
            {/*                                    errors={errors}*/}
            {/*                                    name="phone_number"*/}
            {/*                                    label="Phone Number"*/}
            {/*                                    type="tel"*/}
            {/*                                    placeholder={capitalize(user?.phone_number)}*/}
            {/*                                    defaultValue={(user?.phone_number)}*/}
            {/*                                    className="w-full text-xs mt-1 p-3 border rounded-md bg-white border-[#dde4f0] focus:outline-none"*/}
            {/*                                />*/}
            {/*                            </div>*/}
            {/*                        </div>*/}
            {/*                        <div className="mt-6 flex justify-end">*/}
            {/*                            <button*/}
            {/*                                className={`px-4 py-2 ${loading ? 'bg-blue-300 cursor-not-allowed' : "bg-primary"} text-white rounded-md`}>*/}
            {/*                                {loading ? (*/}
            {/*                                    <div className={'flex items-center justify-center w-full'}>*/}
            {/*                                        <span role="status">*/}
            {/*                                            <svg aria-hidden="true"*/}
            {/*                                                 className="w-5 h-5 text-gray-200 animate-spin fill-blue-300"*/}
            {/*                                                 viewBox="0 0 100 101" fill="none"*/}
            {/*                                                 xmlns="http://www.w3.org/2000/svg">*/}
            {/*                                                <path*/}
            {/*                                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"*/}
            {/*                                                    fill="currentColor"/>*/}
            {/*                                                <path*/}
            {/*                                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"*/}
            {/*                                                    fill="#435a8c"/>*/}
            {/*                                            </svg>*/}
            {/*                                            <span className="sr-only">Loading...</span>*/}
            {/*                                        </span>*/}
            {/*                                    </div> ): "Save Changes"*/}
            {/*                                }*/}
            {/*                            </button>*/}
            {/*                        </div>*/}
            {/*                    </form>*/}
            {/*                )}*/}

            {/*                /!* Address Book Tab *!/*/}
            {/*                {activeTab === 'address' && (*/}
            {/*                    <div className="bg-white rounded-lg shadow-md p-6">*/}
            {/*                        <div className="flex justify-between items-center mb-6">*/}
            {/*                            <h2 className="text-xl font-bold">Address Book</h2>*/}
            {/*                            <button*/}
            {/*                                className="px-4 py-2 bg-primary hover:bg-deepOrange text-white rounded-md text-sm">*/}
            {/*                                Add New Address*/}
            {/*                            </button>*/}
            {/*                        </div>*/}
            {/*                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">*/}
            {/*                            {addresses?.addresses.map((address) => (*/}
            {/*                                <div key={address.id}*/}
            {/*                                     className={`border rounded-lg p-4`}>*/}
            {/*                                    /!* ${address ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}*!/*/}
            {/*                                    <div className="flex justify-between">*/}
            {/*                                        <h3 className="font-medium">{address?.first_name} {address?.last_name}</h3>*/}
            {/*                                          /!* {address.isDefault && (*!/*/}
            {/*                                          /!* <span*!/*/}
            {/*                                          /!*  className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">*!/*/}
            {/*                                          /!*  Default*!/*/}
            {/*                                          /!*</span>*!/*/}
            {/*                                          /!* )}*!/*/}
            {/*                                    </div>*/}
            {/*                                    <p className="text-gray-700 mt-2">{address.address}</p>*/}
            {/*                                    <p className="text-gray-700">{address?.city?.name}, {address?.state?.name} {address.postalCode}</p>*/}
            {/*                                    <p className="text-gray-700">{address?.country}</p>*/}
            {/*                                    <div className="mt-4 flex space-x-2">*/}
            {/*                                        <button className="text-sm text-primary hover:text-deepOrange">*/}
            {/*                                            Edit*/}
            {/*                                        </button>*/}
            {/*                                        <button className="text-sm text-gray-500 hover:text-gray-700">*/}
            {/*                                            Delete*/}
            {/*                                        </button>*/}
            {/*                                        /!*{!address.isDefault && (*!/*/}
            {/*                                        /!*    <button*!/*/}
            {/*                                        /!*        className="text-sm text-indigo-600 hover:text-indigo-800 ml-auto">*!/*/}
            {/*                                        /!*        Set as Default*!/*/}
            {/*                                        /!*    </button>*!/*/}
            {/*                                        /!*)}*!/*/}
            {/*                                    </div>*/}
            {/*                                </div>*/}
            {/*                            ))}*/}
            {/*                        </div>*/}
            {/*                    </div>*/}
            {/*                )}*/}

            {/*                /!* Payment Methods Tab *!/*/}
            {/*                {activeTab === 'payment' && (*/}
            {/*                    <div className="bg-white rounded-lg shadow-md p-6">*/}
            {/*                        <div className="flex justify-between items-center mb-6">*/}
            {/*                            <h2 className="text-xl font-bold">Payment Methods</h2>*/}
            {/*                            <button*/}
            {/*                                className="px-4 py-2 bg-primary hover:bg-deepOrange text-white rounded-md text-sm">*/}
            {/*                                Add New Method*/}
            {/*                            </button>*/}
            {/*                        </div>*/}
            {/*                        <div className="space-y-4">*/}
            {/*                            {paymentMethods.map((method) => (*/}
            {/*                                <div key={method.id}*/}
            {/*                                     className={`border rounded-lg p-4 ${method.isDefault ? 'border-none bg-primary text-white' : 'border-gray-200'}`}>*/}
            {/*                                    <div className="flex items-center">*/}
            {/*                                        {method.type === 'Credit Card' && (*/}
            {/*                                            <svg className="w-8 h-8 text-gray-700 mr-4" fill="currentColor"*/}
            {/*                                                 viewBox="0 0 20 20">*/}
            {/*                                                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>*/}
            {/*                                                <path fillRule="evenodd"*/}
            {/*                                                      d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"*/}
            {/*                                                      clipRule="evenodd"/>*/}
            {/*                                            </svg>*/}
            {/*                                        )}*/}
            {/*                                        {method.type === 'PayPal' && (*/}
            {/*                                            <svg className="w-8 h-8 text-blue-500 mr-4" viewBox="0 0 24 24"*/}
            {/*                                                 fill="currentColor">*/}
            {/*                                                <path*/}
            {/*                                                    d="M7.5 11.5c0 .833.667 1.5 1.5 1.5h3.5v-3H9c-.833 0-1.5.667-1.5 1.5z"/>*/}
            {/*                                                <path*/}
            {/*                                                    d="M20 4H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM9 8.5h3.5V12H15l1-4H9c-.833 0-1.5.667-1.5 1.5v1c0 .833.667 1.5 1.5 1.5h1.5v1.5H9V16H6v-4.5c0-1.5 1-3 3-3zm7.5 7.5H15v1.5h-1.5V16H12v-1.5h1.5V13H15v1.5h1.5V16z"/>*/}
            {/*                                            </svg>*/}
            {/*                                        )}*/}
            {/*                                        <div className="flex-1">*/}
            {/*                                            <h3 className="font-medium">{method.type}</h3>*/}
            {/*                                            {method.type === 'Credit Card' && (*/}
            {/*                                                <p className={`${method.isDefault ? 'text-white' : 'text-gray-600'}`}>•••• ••••*/}
            {/*                                                    •••• {method.last4}</p>*/}
            {/*                                            )}*/}
            {/*                                            {method.type === 'PayPal' && (*/}
            {/*                                                <p className={`${method.isDefault ? 'text-white' : 'text-gray-600'}`}>{method.email}</p>*/}
            {/*                                            )}*/}
            {/*                                        </div>*/}
            {/*                                        {method.isDefault && (*/}
            {/*                                            <span*/}
            {/*                                                className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">*/}
            {/*                Default*/}
            {/*              </span>*/}
            {/*                                        )}*/}
            {/*                                    </div>*/}
            {/*                                    <div className="mt-4 flex space-x-2">*/}
            {/*                                        <button className={`${method.isDefault ? 'text-sm text-deepOrange font-bold' : 'text-sm text-indigo-600 hover:text-indigo-800'}`}>*/}
            {/*                                            Edit*/}
            {/*                                        </button>*/}
            {/*                                        <button className={`${method.isDefault ? 'text-sm text-red-600 font-bold' : 'text-sm text-indigo-600 hover:text-indigo-800'}`}>*/}
            {/*                                            Remove*/}
            {/*                                        </button>*/}
            {/*                                        {!method.isDefault && (*/}
            {/*                                            <button*/}
            {/*                                                className="text-sm text-indigo-600 hover:text-indigo-800 ml-auto">*/}
            {/*                                                Set as Default*/}
            {/*                                            </button>*/}
            {/*                                        )}*/}
            {/*                                    </div>*/}
            {/*                                </div>*/}
            {/*                            ))}*/}
            {/*                        </div>*/}
            {/*                    </div>*/}
            {/*                )}*/}

            {/*                /!* Account Settings Tab *!/*/}
            {/*                {activeTab === 'settings' && (*/}
            {/*                    <div className="bg-white rounded-lg shadow-md p-6">*/}
            {/*                        <h2 className="text-xl font-bold mb-6">Account Settings</h2>*/}
            {/*                        <div className="space-y-6">*/}
            {/*                            <div>*/}
            {/*                                <h3 className="font-medium mb-2">Password</h3>*/}
            {/*                                <button*/}
            {/*                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm">*/}
            {/*                                    Change Password*/}
            {/*                                </button>*/}
            {/*                            </div>*/}
            {/*                            <div>*/}
            {/*                                <h3 className="font-medium mb-2">Email Notifications</h3>*/}
            {/*                                <div className="space-y-2">*/}
            {/*                                    <label className="flex items-center">*/}
            {/*                                        <input type="checkbox" className="rounded text-indigo-600"*/}
            {/*                                               defaultChecked/>*/}
            {/*                                        <span className="ml-2">Order updates</span>*/}
            {/*                                    </label>*/}
            {/*                                    <label className="flex items-center">*/}
            {/*                                        <input type="checkbox" className="rounded text-indigo-600"*/}
            {/*                                               defaultChecked/>*/}
            {/*                                        <span className="ml-2">Promotions</span>*/}
            {/*                                    </label>*/}
            {/*                                    <label className="flex items-center">*/}
            {/*                                        <input type="checkbox" className="rounded text-indigo-600"/>*/}
            {/*                                        <span className="ml-2">Newsletter</span>*/}
            {/*                                    </label>*/}
            {/*                                </div>*/}
            {/*                            </div>*/}
            {/*                            <div>*/}
            {/*                                <h3 className="font-medium mb-2">Delete Account</h3>*/}
            {/*                                <p className="text-gray-600 mb-2">This will permanently remove your account*/}
            {/*                                    and all associated data.</p>*/}
            {/*                                <button*/}
            {/*                                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm">*/}
            {/*                                    Delete My Account*/}
            {/*                                </button>*/}
            {/*                            </div>*/}
            {/*                        </div>*/}
            {/*                    </div>*/}
            {/*                )}*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>
    );
}

export default PrevImplementation;