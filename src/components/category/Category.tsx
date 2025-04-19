import type { NextPage } from 'next';
import CategoryCard from "@/components/category/CategoryCard";
import {useEffect} from "react";
import {useAppDispatch, useAppSelector} from "@/hook/useReduxTypes";
import {getAllCategories} from "@/redux/product/productSlice";


const Category: NextPage = () => {
    const {categories} = useAppSelector(state => state.products)

    const dispatch = useAppDispatch()


    useEffect(() => {
        dispatch(getAllCategories())
    }, [dispatch]);


    return (
        <div>
            <div className="max-w-screen-xl mx-auto mt-8 mb-8 px-6 xl:px-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {categories?.categories?.slice(0,4)?.map((category, index) => (
                    <CategoryCard
                        key={index}
                        title={category.name}
                        image={category.icon}
                        items={[]}
                    />
                ))}
            </div>

        </div>
    );
}

export default Category;
