const SubscribeSection = () => {
    return (
        <div className="max-w-screen-2xl w-full flex items-center justify-center bg-[#0E224D]  bg-center bg-cover text-white py-10 text-center">
            <div className={'max-w-screen-xl w-full flex flex-col lg:flex-row items-center lg:items-start lg:gap-28'}>
                <div>
                    <h3 className="text-xl text-left font-bold">Subscribe & Get <span
                        className="text-deepOrange">10%</span> Discount
                    </h3>
                    <p className="text-sm text-left mt-1">Get E-mail updates about our latest shop and special offers.</p>

                </div>
                <div className="mt-4 flex justify-center">
                    <input
                        type="email"
                        placeholder="Your email address"
                        className="p-2 w-80 rounded-l text-xs border-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="bg-deepOrange text-xs text-white px-5 py-2 rounded-r">Sign Up</button>
                </div>
            </div>
        </div>
    );
};

export default SubscribeSection;
