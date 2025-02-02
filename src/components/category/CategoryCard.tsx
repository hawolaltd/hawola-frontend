import React from 'react';

interface CategoryCardProps {
    title: string;
    image: string;
    items: string[];
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, image, items }) => {
    return (
        <div className="flex justify-between bg-white border border-solid border-[#d5dfe5] rounded-lg gap-4 p-4">
            <div>
                <img src={image} alt={title} className=" w-20 h-20 object-cover mb-4"/>
                <button className="text-[#435a8c] rounded py-1 px-4 text-sm bg-[#d5dfe5] font-normal hover:underline">
                    View all
                </button>
            </div>
            <div>
                <h3 className="text-sm font-semibold text-[#435a8c] mb-2">{title}</h3>
                <ul className="text-xs text-[#6b83b6] space-y-1 mb-4">
                    {items.map((item, index) => (
                        <li className={'relative before:absolute before:-left-2 before:top-1  before:w-2 before:h-2 before:bg-[url(/assets/arrowright.png)] before:bg-contain before:bg-no-repeat'} key={index}>{item}</li>
                    ))}
                </ul>

            </div>
        </div>
    );
}

export default CategoryCard;
