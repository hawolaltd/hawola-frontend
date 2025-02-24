import React, {useState} from 'react';
import AuthLayout from "@/components/layout/AuthLayout";
import {FaFacebookF, FaInstagram, FaPinterestP, FaTwitter} from 'react-icons/fa';
import ProductInfo from "@/components/product/ProductInfo";
import Specification from "@/components/product/Specification";
import RelatedProduct from "@/components/product/RelatedProduct";

const products = [
    {
        id: 1,
        name: 'iPhone 12 Pro Max 128GB Pacific Blue',
        price: 1099,
        isMain: true,
        img: '/imgs/page/product/sp1.png'
    },
    {
        id: 2,
        name: 'Apple AirPods Pro, Active Noise Cancellation, Custom Fit',
        price: 197,
        img: '/imgs/page/product/sp2.png'
    },
    {

        id: 3,
        name: 'Apple iMac 24\" All-In-One Computer, Apple M1, 8GB RAM, 512GB SSD, macOS Big Sur, Green',
        price: 1599,
        img: '/imgs/page/product/sp3.png'
    }
];


const ProductPage = () => {
    const [quantity, setQuantity] = useState(1);
    // const [quantity, setQuantity] = useState<number>(1);



    const handleQuantityChange = (value: number) => {
        setQuantity((prev) => Math.max(1, prev + value));
    };
    const [position, setPosition] = useState({x: "50%", y: "50%"});
    const [isHovered, setIsHovered] = useState(false);


    const handleMouseMove = (e: any) => {
        const {left, top, width, height} = e.target.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setPosition({x: `${x}%`, y: `${y}%`});
    };


    const [selectedProducts, setSelectedProducts] = useState(products.map(product => product.id));

    const toggleProduct = (id: number) => {
        setSelectedProducts((prev) =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };


    const totalPrice = selectedProducts.reduce(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        (acc, id) => acc + (products ?? [])?.find(product => product?.id === id)?.price,
        0
    );

    return (<AuthLayout>
        <div className="max-w-[1320px] mx-auto px-4 py-8">
            {/* Product Image */}
            <div className="flex flex-col md:flex-row gap-4 border-b border-b-[#dde4f0] pb-16">
                <div style={{flex: 3}} className="flex gap-4 h-4/5">
                    <div className={'flex flex-col gap-4 h-[75vh] w-fit'}>
                        {[1, 2, 3, 4, 5].map((item, key) => (
                            <div key={key}
                                 className={'border border-[#dde4f0] hover:border-orange px-2 flex items-center justify-center rounded-lg h-full'}>
                                <img src="/imgs/page/product/img-gallery-1.jpg" alt="Product Image"
                                     className="w-[100px] h-auto"/>
                            </div>))}
                    </div>

                    <div
                        className="flex items-center justify-center border-4 border-[#dde4f0] h-[75vh] rounded-md"

                    >

                        <div
                            className={'relative w-[400px] h-[400px] overflow-hidden cursor-crosshair'}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            onMouseMove={handleMouseMove}
                        >
                            <img
                                src="/imgs/page/product/img-gallery-1.jpg"
                                alt="Product"
                                className={`w-full h-full object-cover transition-transform duration-300 ${
                                    isHovered ? "scale-[2]" : "scale-100"
                                }`}
                                style={{
                                    objectPosition: isHovered ? `${position.x} ${position.y}` : "center",
                                }}
                            />

                        </div>

                    </div>

                </div>
                <div style={{flex: 4}} className=" p-1 flex flex-col">
                    {/* Product Details */}
                    <h1 className="text-3xl font-bold text-primary mb-6">Samsung Galaxy S22 Ultra, 8K Camera &
                        Video,
                        Brightest Display
                        Screen, S Pen Pro</h1>

                    <div
                        className={'flex items-center mb-4 justify-between w-full border-b border-b-[#dde4f0] pb-4'}>
                        <div>
                            <p className={'text-primary text-sm font-bold'}><span
                                className={'text-[#8c9ec5] text-xs font-bold'}>by</span> Ecom Tech</p>
                            <div className="flex items-center text-xs text-[#8c9ec5] font-bold">
                                <span>⭐⭐⭐⭐⭐ (65 reviews)</span>
                            </div>

                        </div>
                        <div className={'flex items-center gap-4 justify-end'}>
                            <div className={'flex items-center gap-2'}>
                                    <span
                                        className={'flex items-center justify-center border border-[#dde4f0] p-1 rounded-[4px]'}>
                                     <img src="/assets/love2.svg" alt="Wishlist" className="w-6 h-6"/>
                                </span>
                                <p className={'text-primary font-[500]'}>Add to Wish List</p>
                            </div>
                            <div className={'flex items-center gap-2'}>
                            <span
                                className={'flex items-center justify-center border border-[#dde4f0] p-1 rounded-[4px]'}>
                                 <img src="/assets/compare.svg" alt="compare" className="w-6 h-6"/>
                            </span>
                                <p className={'text-primary font-[500]'}>Add to Compare</p>
                            </div>
                        </div>
                    </div>


                    <p className="text-3xl font-bold text-primary">$2856.3 <span
                        className="line-through text-3xl font-medium text-[#8c9ec5]">$3225.6</span>
                    </p>

                    <ul className={'grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-6 mb-6 px-5 font-medium'}>
                        {['8k super steady video', "Adaptive color contrast", "Nightography plus portrait mode", "Premium design & craftsmanship", "50mp photo resolution plus bright display", "Long lasting battery plus fast charging"].map((item, key) => (
                            <li key={key} className={'list-disc text-sm text-primary'}>{item}</li>))}
                    </ul>

                    <div className="mb-6">
                        {/* Color options */}
                        <div className={'flex flex-col gap-2'}>
                            <p className="font-medium text-sm text-primary">
                                Color: <span className="text-sm font-bold text-deepOrange">Pink Gold</span>
                            </p>
                            <div className="flex space-x-3">
                                {[...Array(6)].map((_, index) => (<div key={index}
                                                                       className={`w-10 h-10 border-2 border-dashed rounded cursor-pointer ${index === 3 ? 'border-orange' : 'border-[#dde4f0]'}`}/>))}
                            </div>
                        </div>
                        <div className={'flex items-center justify-between mt-4 w-full'}>
                            {/* Style options */}
                            <div className={'flex flex-col gap-2'}>
                                <p className="font-medium text-sm text-primary">
                                    Style: <span className="text-sm font-bold text-deepOrange">S22</span>
                                </p>
                                <div className="flex space-x-3">
                                    {['S22 Ultra', 'S22', 'S22 + Standing Cover'].map((style, index) => (<button
                                        key={index}
                                        className={`border rounded text-xs px-3 py-1 ${style === 'S22' ? 'border-orange text-deepOrange' : 'border-textPadded text-textPadded'}`}
                                    >
                                        {style}
                                    </button>))}
                                </div>
                            </div>

                            {/* Size options */}
                            <div className={'flex flex-col gap-2'}>
                                <p className="font-medium text-sm text-primary">
                                    Size: <span className="text-sm font-bold text-deepOrange">512GB</span>
                                </p>
                                <div className="flex space-x-3">
                                    {['1GB', '512 GB', '256 GB', '128 GB', '64GB'].map((size, index) => (<button
                                        key={index}
                                        className={`border text-xs rounded px-3 py-1 ${size === '512 GB' ? 'border-orange text-deepOrange' : 'border-textPadded text-textPadded'}`}
                                    >
                                        {size}
                                    </button>))}
                                </div>
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className={'mt-6'}>
                            <p className="text-gray-500 mb-2">Quantity</p>
                            <div className={'flex items-center gap-4'}>
                                <div className="flex items-center space-x-3 border-b-[#dde4f0] pb-2 border-b-4">
                                    <button onClick={() => handleQuantityChange(-1)}
                                            className="font-normal text-primary w-8 h-8 flex items-center justify-center text-4xl">-
                                    </button>
                                    <span className="text-primary w-8 text-3xl h-8 text-center">{quantity}</span>
                                    <button onClick={() => handleQuantityChange(1)}
                                            className="font-normal text-primary w-8 h-8 flex items-center justify-center text-4xl"> +
                                    </button>
                                </div>
                                {/* Buttons */}
                                <div className="flex items-center gap-4">
                                    <button className="border border-primary rounded px-16 py-1 text-primary">Add to
                                        cart
                                    </button>
                                    <button className="bg-primary text-white rounded px-16 py-1">Buy now</button>
                                </div>

                            </div>
                        </div>


                        {/* Additional info */}
                        <div className="grid grid-cols-3 gap-4 text-gray-500 mt-12">
                            <div>
                                <p className={'text-textPadded font-semibold flex items-center gap-0 text-sm'}><span
                                    className="font-bold text-primary text-xs">SKU:</span> iphone12pro128</p>
                                <p className={'text-textPadded font-semibold flex items-center gap-0 text-sm'}><span
                                    className="font-bold text-primary text-xs">Category:</span> Smartphones</p>
                                <p className={'text-textPadded font-semibold flex items-center gap-0 text-sm'}><span
                                    className="font-bold text-primary text-xs">Tags:</span> Blue, Smartphone</p>
                            </div>
                            <div>
                                <p className="font-bold text-primary flex items-center gap-0 text-sm">Free
                                    Delivery</p>
                                <p className={'text-textPadded font-semibold flex items-center gap-0 text-sm'}>Available
                                    for all locations.</p>
                                <p className="text-textPadded font-semibold flex items-center gap-0 text-sm">Delivery
                                    Options & Info</p>
                            </div>

                            {/* Social icons */}
                            <div className="flex gap-4 items-end ">
                                <span className="text-primary font-bold">Share</span>
                                <div className={'pt-1 pl-1 bg-primary'}>
                                    <FaFacebookF className="text-white cursor-pointer"/>
                                </div>
                                <div className={'p-[0.2rem] rounded-full bg-primary'}>
                                    <FaPinterestP className="text-white cursor-pointer"/>
                                </div>
                                <div className={''}>
                                    <FaTwitter className="text-primary cursor-pointer"/>
                                </div>
                                <div className={'p-[0.1rem] rounded-[4px] bg-primary'}>
                                    <FaInstagram className="text-white cursor-pointer"/>
                                </div>
                            </div>
                        </div>


                    </div>


                </div>
            </div>

            {/* Frequently Bought Together */}

            <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Frequently Bought Together</h2>
                <div className={'flex items-center gap-8'}>
                    <div className="flex items-center gap-6 mb-6 w-[60%]">
                        {products.map((product, index) => (
                            <>
                                <div key={product.id}
                                     className="w-full h-full px-2 py-8 flex items-center justify-center rounded-[4px] border-4 border-[#dde4f0]">

                                    <img src={product.img} alt={'product image'} className={'w-4/5 h-auto'}/>

                                </div>

                                {
                                    products?.length !== index + 1 && (
                                        <span className={'text-primary text-4xl'}>+</span>
                                    )
                                }
                            </>
                        ))}
                    </div>

                    <div className="flex flex-col gap-2">
                        <p className="text-3xl text-primary font-bold">${totalPrice.toFixed(2)} <span
                            className={'text-xl font-medium'}>({selectedProducts.length} items)</span></p>
                        <button
                            className="bg-inherit rounded-md px-16 py-1 border border-detailsBorder font-bold hover:bg-primary hover:border-none text-primary hover:text-white">Add
                            To Cart
                        </button>
                    </div>

                </div>
                <ul className="mt-4 space-y-2">
                    {products.map(product => (
                        <li key={product.id} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectedProducts.includes(product.id)}
                                onChange={() => toggleProduct(product.id)}
                                className="w-4 h-4"
                            />
                            <span
                                className={'font-medium text-primary text-sm'}> {product?.isMain && <span
                                className={"font-bold"}>This Item:</span>} {product.name} - ${product.price.toFixed(2)}</span>
                        </li>
                    ))}
                </ul>

                {

                }
             <ProductInfo/>

                <RelatedProduct/>


            </div>
        </div>
    </AuthLayout>);
};


export default ProductPage;