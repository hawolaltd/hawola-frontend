import React from 'react';

interface CategoryCardProps {
    title: string;
    image: string;
    items: string[];
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, image, items }) => {
    return (
        <div className="flex flex-col bg-white border border-solid border-gray-100 rounded-lg gap-4 p-6 shadow-xs hover:shadow-sm transition-all hover:border-blue-100">
            <div className="flex justify-center">
                <img src={image} alt={title} className="w-20 h-20 object-contain"/>
            </div>
            <div className="text-center">
                <h3 className="text-sm font-semibold text-primary">{title}</h3>
                <ul className="text-xs text-gray-600 space-y-2 px-2">
                    {items.map((item, index) => (
                        <li
                            className="relative pl-4 before:absolute before:left-0 before:top-1.5 before:w-2 before:h-2 before:bg-blue-400 before:rounded-full"
                            key={index}
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default CategoryCard;