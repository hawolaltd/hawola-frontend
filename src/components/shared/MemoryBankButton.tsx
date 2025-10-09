import React from 'react';
import { useAppDispatch, useAppSelector } from '@/hook/useReduxTypes';
import { addToMemoryBank, removeFromMemoryBank } from '@/redux/memoryBank/memoryBankSlice';
import { Product } from '@/types/product';

interface MemoryBankButtonProps {
    product: Product;
    className?: string;
}

const MemoryBankButton: React.FC<MemoryBankButtonProps> = ({ product, className = '' }) => {
    const dispatch = useAppDispatch();
    const { items } = useAppSelector((state) => state.memoryBank);
    
    // Check if product is already in memory bank
    const isInMemoryBank = items.some((item) => item.product.id === product.id);
    
    const handleToggleMemoryBank = () => {
        if (isInMemoryBank) {
            // Find the item ID to remove
            const itemToRemove = items.find((item) => item.product.id === product.id);
            if (itemToRemove) {
                dispatch(removeFromMemoryBank(itemToRemove.id));
            }
        } else {
            dispatch(addToMemoryBank({ product }));
        }
    };
    
    return (
        <button
            onClick={handleToggleMemoryBank}
            className={`flex items-center justify-center p-2 rounded-full transition-colors ${
                isInMemoryBank
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 hover:bg-gray-300'
            } ${className}`}
            title={isInMemoryBank ? 'Remove from Memory Bank' : 'Add to Memory Bank'}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={
                        isInMemoryBank
                            ? "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            : "M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    }
                />
            </svg>
        </button>
    );
};

export default MemoryBankButton;
