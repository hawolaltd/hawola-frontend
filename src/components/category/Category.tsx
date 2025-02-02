import type { NextPage } from 'next';
import CategoryCard from "@/components/category/CategoryCard";

const categories = [
    {
        title: "Smart Phone",
        image: "/imgs/page/homepage1/smartphone.png",
        items: ["Phone Accessories", "Phone Cases", "Postpaid Phones", "Refurbished Phones"]
    },
    {
        title: "Television",
        image: "/imgs/page/homepage1/television.png",
        items: ["HD DVD Players", "Projection Screens", "Television Accessories", "TV-DVD Combos"]
    },
    {
        title: "Computers",
        image: "/imgs/page/homepage1/computer.png",
        items: ["Computer Components", "Computer Accessories", "Desktops", "Monitors"]
    },
    {
        title: "Electronics",
        image: "/imgs/page/homepage1/electric.png",
        items: ["Office Electronics", "Portable Audio & Video", "Washing Machine", "Accessories & Supplies"]
    }
];

const Category: NextPage = () => {
    return (
        <div>
            <div className="max-w-screen-xl mx-auto mt-8 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {categories.map((category, index) => (
                    <CategoryCard
                        key={index}
                        title={category.title}
                        image={category.image}
                        items={category.items}
                    />
                ))}
            </div>

        </div>
    );
}

export default Category;
