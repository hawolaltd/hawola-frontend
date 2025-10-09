const features = [
    { icon: "/imgs/page/product/delivery.svg", text: "Free Delivery", subtext: "On all orders over $10" },
    { icon: "/imgs/page/product/support.svg", text: "Support 24/7", subtext: "Speak with an expert" },
    { icon: "/assets/voucher.svg", text: "Gift voucher", subtext: "Refer a friend" },
    { icon: "/imgs/page/product/return.svg", text: "Return & Refund", subtext: "Free return over $200" },
    { icon: "/imgs/page/product/payment.svg", text: "Secure payment", subtext: "100% Protected" },
];

const FeaturesSection = () => {
    return (
        <div className="w-full mx-auto py-2 grid md:grid-cols-5 gap-4 text-center">
            {features.map((feature, index) => (
                <div key={index} className="p-2 border border-[#D5DFE4] flex items-center gap-2 rounded">
                    <img src={feature.icon} alt={'features'} width={20} height={20}/>
                    <div className={'flex flex-col'}>
                        <h4 className="font-bold text-xs  text-left text-primary">{feature.text}</h4>
                        <p className="text-[10px] text-left text-textPadded">{feature.subtext}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FeaturesSection;
