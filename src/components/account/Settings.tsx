import type {NextPage} from 'next';
import {useEffect, useState} from 'react';
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import {getUserProfile, updateProfile} from "@/redux/auth/authSlice";
import {getAddress} from "@/redux/product/productSlice";
import {capitalize} from "@/util";

const Settings: NextPage = () => {
    const {profile} = useAppSelector(state => state.auth)
    const {addresses} = useAppSelector(state => state.products)

    const dispatch = useAppDispatch()

    const [loading, setLoading] = useState(false)

    const [contactInfo, setContactInfo] = useState({
        first_name: profile?.first_name,
        last_name: profile?.last_name,
        username: profile?.username,
        phone_number: profile?.phone_number,
        email: profile?.email,
        keepUpdated: false,
    });
    const [shippingAddress, setShippingAddress] = useState({
        firstName: addresses?.addresses?.[0]?.first_name  ?? "",
        lastName: addresses?.addresses?.[0]?.last_name ?? "",
        address1: addresses?.addresses?.[0]?.address  ?? "",
        address2: addresses?.addresses?.[0]?.address  ?? "",
        city: addresses?.addresses?.[0]?.city?.name  ?? "",
        postcode: addresses?.addresses?.[0]?.postalCode ?? "",
        companyName: "",
        phone: addresses?.addresses?.[0]?.phone  ?? "",
        additionalInfo: '',
    });

    const handleSave = async () => {
        setLoading(true)
        try {
           await dispatch(updateProfile(contactInfo))
        } catch (e) {
            setLoading(false)
        } finally {
            setLoading(false)
        }
    };


    useEffect(() => {
        dispatch(getUserProfile())
        dispatch(getAddress())
    }, [dispatch]);

    return (
        <div className="p-4 lg:p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="grid grid-cols-1 gap-8">
                    {/* Contact Information */}
                    <div>
                        <h2 className="text-lg font-bold text-primary mb-4">
                            Contact information
                        </h2>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="First Name *"
                                value={contactInfo.first_name}
                                onChange={(e) =>
                                    setContactInfo({...contactInfo, first_name: e.target.value})
                                }
                                className="w-full p-2 border rounded bg-inherit"
                            />
                            <input
                                type="text"
                                placeholder="Last Name *"
                                value={contactInfo.last_name}
                                onChange={(e) =>
                                    setContactInfo({...contactInfo, last_name: e.target.value})
                                }
                                className="w-full p-2 border rounded bg-inherit"
                            />
                            <input
                                type="text"
                                placeholder="Username *"
                                value={contactInfo.username}
                                onChange={(e) =>
                                    setContactInfo({...contactInfo, username: e.target.value})
                                }
                                className="w-full p-2 border rounded bg-inherit"
                            />
                            <input
                                type="text"
                                placeholder="Phone Number *"
                                value={contactInfo.phone_number}
                                onChange={(e) =>
                                    setContactInfo({...contactInfo, phone_number: e.target.value})
                                }
                                className="w-full p-2 border rounded bg-inherit"
                            />
                            <input
                                type="email"
                                placeholder="Email *"
                                value={contactInfo.email}
                                onChange={(e) =>
                                    setContactInfo({...contactInfo, email: e.target.value})
                                }
                                className="w-full p-2 border rounded bg-inherit"
                            />
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={contactInfo.keepUpdated}
                                    onChange={(e) =>
                                        setContactInfo({
                                            ...contactInfo,
                                            keepUpdated: e.target.checked,
                                        })
                                    }
                                    className="mr-2"
                                />
                                <span className="text-sm text-primary">
                      Keep me up to date on news and exclusive offers
                    </span>
                            </label>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                        <h2 className="text-lg font-bold text-primary mb-4">
                            Shipping address
                        </h2>
                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <input
                                    type="text"
                                    placeholder="First name *"
                                    value={shippingAddress.firstName}
                                    onChange={(e) =>
                                        setShippingAddress({
                                            ...shippingAddress,
                                            firstName: e.target.value,
                                        })
                                    }
                                    className="w-full lg:w-1/2 p-2 border rounded bg-inherit"
                                />
                                <input
                                    type="text"
                                    placeholder="Last name *"
                                    value={shippingAddress.lastName}
                                    onChange={(e) =>
                                        setShippingAddress({
                                            ...shippingAddress,
                                            lastName: e.target.value,
                                        })
                                    }
                                    className="w-full lg:w-1/2 p-2 border rounded bg-inherit"
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Address 1 *"
                                value={shippingAddress.address1}
                                onChange={(e) =>
                                    setShippingAddress({
                                        ...shippingAddress,
                                        address1: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded bg-inherit"
                            />
                            <input
                                type="text"
                                placeholder="Address 2 *"
                                value={shippingAddress.address2}
                                onChange={(e) =>
                                    setShippingAddress({
                                        ...shippingAddress,
                                        address2: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded bg-inherit"
                            />
                            <div className="flex flex-col md:flex-row gap-4">
                                <select
                                    value={shippingAddress.city}
                                    onChange={(e) =>
                                        setShippingAddress({
                                            ...shippingAddress,
                                            city: e.target.value,
                                        })
                                    }
                                    className="w-full lg:w-1/2 p-2 border rounded bg-inherit"
                                >
                                    <option value="">Select an option...</option>
                                    <option value="Chicago">Chicago</option>
                                    <option value="New York">New York</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="City *"
                                    value={shippingAddress.city}
                                    onChange={(e) =>
                                        setShippingAddress({
                                            ...shippingAddress,
                                            city: e.target.value,
                                        })
                                    }
                                    className="w-full lg:w-1/2 p-2 border rounded bg-inherit"
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="PostCode / ZIP *"
                                value={shippingAddress.postcode}
                                onChange={(e) =>
                                    setShippingAddress({
                                        ...shippingAddress,
                                        postcode: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded bg-inherit"
                            />
                            <div className="flex flex-col md:flex-row gap-4">
                                <input
                                    type="text"
                                    placeholder="Company name"
                                    value={shippingAddress.companyName}
                                    onChange={(e) =>
                                        setShippingAddress({
                                            ...shippingAddress,
                                            companyName: e.target.value,
                                        })
                                    }
                                    className="w-full lg:w-1/2 p-2 border rounded bg-inherit"
                                />
                                <input
                                    type="text"
                                    placeholder="Phone *"
                                    value={shippingAddress.phone}
                                    onChange={(e) =>
                                        setShippingAddress({
                                            ...shippingAddress,
                                            phone: e.target.value,
                                        })
                                    }
                                    className="w-full lg:w-1/2 p-2 border rounded bg-inherit"
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Additional Information"
                                value={shippingAddress.additionalInfo}
                                onChange={(e) =>
                                    setShippingAddress({
                                        ...shippingAddress,
                                        additionalInfo: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded bg-inherit"
                            />
                        </div>

                    </div>
                    <button
                        disabled={loading}
                        onClick={handleSave}
                        className={`flex items-center justify-center ${loading ? 'bg-blue-200 cursor-not-allowed' : 'bg-primary'} w-[60%] lg:w-[30%] text-white px-6 py-2 rounded mt-6`}
                    >
                        {loading ? <div className={'flex items-center justify-center w-full'}>
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
                        </div> : "Save change"}
                    </button>
                </div>
                <div className={'flex flex-col gap-4 lg:items-end'}>
                    {
                        addresses?.addresses?.map(address => (
                            <div key={address?.id} className="mt-4 flex flex-col sm:w-1/2">
                                <p className="text-sm text-primary">
                                    {capitalize(address?.first_name)} {capitalize(address?.last_name)}
                                </p>
                                <p className="text-sm text-primary">
                                    Home Address: {address?.address}
                                </p>
                                <p className="text-sm text-primary">
                                    City: {address?.city?.name}
                                </p>
                                <p className="text-sm text-primary">
                                    Phone Number: {address?.phone}
                                </p>
                                <button className="bg-primary w-fit text-white px-4 py-2 rounded mt-2">
                                    Set as Default
                                </button>
                            </div>
                        ))
                    }
                </div>
            </div>

        </div>
    );
};

export default Settings;