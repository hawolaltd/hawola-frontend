import React from 'react';

interface Props {
    orderId: string;
    setOrderId: React.Dispatch<React.SetStateAction<any>>
}

function OrderTracking({
                           orderId,
                           setOrderId
                       }: Props) {
    return (
        <div>
            {/* Order Tracking Input */}
            <section className="mb-6 mt-12 border-b border-b-detailsBorder pb-8">
                <p className="text-sm text-textPadded font-medium mb-2">
                    To track your order please enter your OrderID in the box below and press "Track" button. This was given to you on <br/> your receipt and in the confirmation email you should have received.
                </p>
                <div className="flex space-x-4 w-1/2 mt-8">
                    <input
                        type="text"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        className="flex-1 p-2 border rounded"
                        placeholder="Enter Order ID"
                    />
                    <button className="bg-primary text-white px-4 py-2 rounded">
                        Tracking Now
                    </button>
                </div>
            </section>

            {/* Order Status */}
            <section className="mb-6">
                <h2 className="text-2xl font-bold text-primary">Order Status: <span className={`text-secondaryTextColor`}>International Shipping</span></h2>
                <p className="text-sm text-gray-600 mb-4">
                    Estimated Delivery Date: 27 August - 29 August
                </p>

                {/* Timeline */}

                <div className="relative">
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col text-center w-full items-start">
                            <li className="flex w-full items-center text-primary dark:text-primary after:content-[''] after:w-full after:h-1 after:border-b after:border-primary after:border-4 after:inline-block dark:after:botext-primary">
                                <div className="w-12 h-10 bg-green-500 rounded-full mx-auto flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                            </li>
                            <p className="text-xs mt-2 font-semibold">PLACED</p>
                            <p className="text-xs text-gray-600">09:10 25 August 2022</p>
                        </div>

                        <div className="flex flex-col text-center w-full items-start">
                            <li className="flex w-full items-center text-primary dark:text-primary after:content-[''] after:w-full after:h-1 after:border-b after:border-primary after:border-4 after:inline-block dark:after:botext-primary">
                                <div className="w-12 h-10 bg-green-500 rounded-full mx-auto flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                            </li>
                            <p className="text-xs mt-2 font-semibold">IN PRODUCTION</p>
                            <p className="text-xs text-gray-600">16 August 2022</p>
                        </div>
                        <div className="flex flex-col text-center w-full items-start">
                            <li className="flex w-full items-center text-primary dark:text-primary after:content-[''] after:w-full after:h-1 after:border-b after:border-primary after:border-4 after:inline-block dark:after:botext-primary">
                                <div className="w-12 h-10 bg-green-500 rounded-full mx-auto flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                            </li>
                            <p className="text-xs mt-2 font-semibold">INTERNATIONAL SHIPPING</p>
                            <p className="text-xs text-gray-600">17 August 2022</p>
                        </div>
                        <div className="flex flex-col text-center w-full items-start">
                            <li className="flex w-full items-center text-primary dark:text-primary after:content-[''] after:w-full after:h-1 after:border-b after:border-primary after:border-4 after:inline-block dark:after:botext-primary">
                                <div className="w-12 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M20 6L9 17l-5-5"></path>
                                    </svg>
                                </div>
                            </li>
                            <p className="text-xs mt-2 font-semibold">SHIPPING FINAL MILE</p>
                            <p className="text-xs text-gray-600">18 August 2022</p>
                        </div>
                        <div className="flex flex-col text-center items-start w-full">
                            <li className="flex items-center w-full">
                                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M20 6L9 17l-5-5"></path>
                                    </svg>
                                </div>
                            </li>
                            <p className="text-xs mt-2 font-semibold">DELIVERED</p>
                            <p className="text-xs text-gray-600 text-left">19 August 2022</p>
                        </div>
                    </div>
                </div>

                {/* Timeline Details */}
                <ul className="mt-4 text-sm text-textPadded space-y-2">
                    <li className={'list-disc'}>09:10 25 August 2022: Delivery in progress</li>
                    <li className={'list-disc'}>08:25 25 August 2022: The order has arrived at warehouse 08-YBI MARVEL HUB LM</li>
                    <li className={'list-disc'}>05:44 24 August 2022: Order has been shipped</li>
                    <li className={'list-disc'}>04:29 23 August 2022: The order has arrived at Marvel SOC warehouse</li>
                    <li className={'list-disc'}>20:58 18 August 2022: Order has shipped</li>
                    <li className={'list-disc'}>18:27 17 August 2022: The order has arrived at Marvel SOC warehouse</li>
                    <li className={'list-disc'}>17:09 17 August 2022: Order has been shipped</li>
                    <li className={'list-disc'}>12:37 17 August 2022: The order has arrived at warehouse 20-HNI Marvel 2 SOC</li>
                    <li className={'list-disc'}>12:46 16 August 2022: Successful pick up</li>
                    <li className={'list-disc'}>10:44 15 August 2022: The sender is preparing the goods</li>
                </ul>
            </section>

            {/* Package Location */}
            <section>
                <h2 className="text-2xl font-semibold text-primary">Package Location</h2>
                <div className="mt-4">
                    <div className="mt-2">
                        {/* Replace this with an actual map integration if needed */}
                        <div className="h-64 bg-gray-200 flex items-center justify-center">
                            <p className="text-gray-500">[Map Placeholder - Thanh pho New York, Hoa Ky]</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default OrderTracking;