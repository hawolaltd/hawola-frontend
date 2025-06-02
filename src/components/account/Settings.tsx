import type { NextPage } from 'next';
import { useState } from 'react';

const Settings: NextPage = () => {
    const [contactInfo, setContactInfo] = useState({
        fullName: 'Steven Job',
        username: '',
        phoneNumber: '',
        email: '',
        keepUpdated: false,
    });
    const [shippingAddress, setShippingAddress] = useState({
        firstName: '',
        lastName: '',
        address1: '',
        address2: '',
        city: '',
        postcode: '',
        companyName: '',
        phone: '',
        additionalInfo: '',
    });

    const handleSave = () => {
        // Handle save logic here
        console.log('Contact Info:', contactInfo);
        console.log('Shipping Address:', shippingAddress);
    };

    return (
        <div className="">
                <div className="grid grid-cols-2 gap-8">
                    <div className="grid grid-cols-1 gap-8">
                        {/* Contact Information */}
                        <div>
                            <h2 className="text-lg font-bold text-primary mb-4">
                                Contact information
                            </h2>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Fullname *"
                                    value={contactInfo.fullName}
                                    onChange={(e) =>
                                        setContactInfo({ ...contactInfo, fullName: e.target.value })
                                    }
                                    className="w-full p-2 border rounded bg-inherit"
                                />
                                <input
                                    type="text"
                                    placeholder="Username *"
                                    value={contactInfo.username}
                                    onChange={(e) =>
                                        setContactInfo({ ...contactInfo, username: e.target.value })
                                    }
                                    className="w-full p-2 border rounded bg-inherit"
                                />
                                <input
                                    type="text"
                                    placeholder="Phone Number *"
                                    value={contactInfo.phoneNumber}
                                    onChange={(e) =>
                                        setContactInfo({ ...contactInfo, phoneNumber: e.target.value })
                                    }
                                    className="w-full p-2 border rounded bg-inherit"
                                />
                                <input
                                    type="email"
                                    placeholder="Email *"
                                    value={contactInfo.email}
                                    onChange={(e) =>
                                        setContactInfo({ ...contactInfo, email: e.target.value })
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
                                <div className="flex space-x-4">
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
                                        className="w-1/2 p-2 border rounded bg-inherit"
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
                                        className="w-1/2 p-2 border rounded bg-inherit"
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
                                <div className="flex space-x-4">
                                    <select
                                        value={shippingAddress.city}
                                        onChange={(e) =>
                                            setShippingAddress({
                                                ...shippingAddress,
                                                city: e.target.value,
                                            })
                                        }
                                        className="w-1/2 p-2 border rounded bg-inherit"
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
                                        className="w-1/2 p-2 border rounded bg-inherit"
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
                                <div className="flex space-x-4">
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
                                        className="w-1/2 p-2 border rounded bg-inherit"
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
                                        className="w-1/2 p-2 border rounded bg-inherit"
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
                            onClick={handleSave}
                            className="bg-primary w-[30%] text-white px-6 py-2 rounded mt-6"
                        >
                            Save change
                        </button>
                    </div>
                    <div className="mt-4 text-right">
                        <p className="text-sm text-primary">
                            Steven Job<br />
                            Home Address: 205 North Michigan Avenue, Suite 810 Chicago, 60601,
                            USA<br />
                            Delivery address: 205 North Michigan Avenue, Suite 810 Chicago,
                            60601, USA<br />
                            Phone Number: (+01) 234 567 89 - (+01) 888 866 99
                        </p>
                        <button className="bg-primary text-white px-4 py-2 rounded mt-2">
                            Set as Default
                        </button>
                    </div>
                </div>

        </div>
    );
};

export default Settings;