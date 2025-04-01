import React from "react";
import Image from "next/image";
import {useRouter} from "next/router";
import {useAppSelector} from "@/hook/useReduxTypes";
import {amountFormatter} from "@/util";

const CartModal = () => {
    const router = useRouter()

    const {carts} = useAppSelector(state => state.products)

    const totalPrice = carts?.cart_items?.reduce((sum, item) => sum + +(item?.product?.price) * item?.qty, 0);

    return (
        <div className="bg-white rounded-br-md rounded-bl-md p-4 w-96 border border-detailsBorder" style={{
            position: "absolute",
            zIndex: 20,
            right: "0px",
            top: '100%',
        }}>
            <div className={'h-[250px] overflow-x-hidden'}>
                {carts?.cart_items?.map((item) => (
                    <div key={item.id} className="flex items-start space-x-4 mb-4">
                        <Image src={item?.product?.featured_image?.[0]?.image?.thumbnail} alt={"product"} width={60} height={60} className="rounded-md" />
                        <div className="flex-1">
                            <p className="font-bold text-primary text-sm">{item?.product?.name}</p>
                            <p className="text-deepOrange font-bold text-sm">{item?.qty} x ${amountFormatter((+(item?.product?.price)).toFixed(2))}</p>
                        </div>
                    </div>
                ))}
            </div>

            <hr className="my-4" />

            <div className="flex justify-between font-semibold text-lg">
                <p>Total</p>
                <p className="text-blue-500">${amountFormatter(totalPrice.toFixed(1))}</p>
            </div>

            <div className="mt-4 flex space-x-3 justify-between">
                <button className="w-[40%] border border-detailsBorder rounded-md py-2 text-primary" onClick={()=>{

                    router.push('/carts')
                }} > View cart </button>
                <button className="w-[40%] bg-primary text-white rounded-md py-2">Checkout</button>
            </div>
        </div>
    );
};

export default CartModal;
