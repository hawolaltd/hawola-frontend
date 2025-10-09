import React, { useState } from 'react';
import { useAppDispatch } from '@/hook/useReduxTypes';
import { removeFromMemoryBank, updateMemoryBankItemNotes } from '@/redux/memoryBank/memoryBankSlice';
import { MemoryBankItem as MemoryBankItemType } from '@/types/memoryBank';
import Link from 'next/link';

interface MemoryBankItemProps {
    item: MemoryBankItemType;
}

const MemoryBankItem: React.FC<MemoryBankItemProps> = ({ item }) => {
    const dispatch = useAppDispatch();
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [notes, setNotes] = useState(item.notes || '');
    
    const handleRemove = () => {
        dispatch(removeFromMemoryBank(item.id));
    };
    
    const handleSaveNotes = () => {
        dispatch(updateMemoryBankItemNotes({ itemId: item.id, notes }));
        setIsEditingNotes(false);
    };
    
    const formattedDate = new Date(item.addedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
    
    return (
        <div className="border rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/4">
                    {item.product.featured_image && item.product.featured_image.length > 0 ? (
                        <img
                            src={item.product.featured_image[0]}
                            alt={item.product.name}
                            className="w-full h-40 object-cover rounded-md"
                        />
                    ) : (
                        <div className="w-full h-40 bg-gray-200 rounded-md flex items-center justify-center">
                            <span className="text-gray-500">No image</span>
                        </div>
                    )}
                </div>
                
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <Link href={`/product/${item.product.slug}`}>
                                <h3 className="text-lg font-semibold hover:text-blue-600 transition-colors">
                                    {item.product.name}
                                </h3>
                            </Link>
                            <p className="text-gray-500 text-sm">Added on {formattedDate}</p>
                        </div>
                        
                        <div className="flex gap-2">
                            <button
                                onClick={handleRemove}
                                className="text-red-500 hover:text-red-700 transition-colors"
                                title="Remove from Memory Bank"
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
                                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <div className="mt-2">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-gray-700 font-medium">Price:</span>
                            <span className="text-green-600 font-semibold">
                                {item.product.discount_price ? (
                                    <>
                                        <span>{item.product.discount_price}</span>
                                        <span className="text-gray-400 line-through ml-2">
                                            {item.product.price}
                                        </span>
                                    </>
                                ) : (
                                    <span>{item.product.price}</span>
                                )}
                            </span>
                        </div>
                        
                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-700 font-medium">Notes:</span>
                                {!isEditingNotes && (
                                    <button
                                        onClick={() => setIsEditingNotes(true)}
                                        className="text-blue-500 hover:text-blue-700 text-sm"
                                    >
                                        {item.notes ? 'Edit' : 'Add notes'}
                                    </button>
                                )}
                            </div>
                            
                            {isEditingNotes ? (
                                <div>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows={3}
                                        placeholder="Add your notes here..."
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button
                                            onClick={() => {
                                                setNotes(item.notes || '');
                                                setIsEditingNotes(false);
                                            }}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveNotes}
                                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-600 italic">
                                    {item.notes || 'No notes added yet.'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemoryBankItem;
