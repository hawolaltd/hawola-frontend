// components/AddressCard.tsx
import React from 'react';
import {AddressData} from "@/types/product";

interface AddressCardProps {
    address: AddressData;
    onEdit?: () => void;
    onDelete?: () => void;
    onSelect?: () => void;
    isSelected?: boolean;
}

const AddressCard: React.FC<AddressCardProps> = ({
                                                     address,
                                                     onEdit,
                                                     onDelete,
                                                     onSelect,
                                                     isSelected
                                                 }) => {
    return (
        <div className={`border-2 rounded-lg p-4 mb-4 transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-lg">
                    {address?.first_name} {address?.last_name}
                </h3>
                {isSelected && (
                    <span className="bg-primary text-white text-xs px-2 py-1 rounded">
                        Default
                    </span>
                )}
            </div>

            <div className={'flex items-center gap-2'}>
                <p className="text-gray-700 mb-1">{address?.address}</p>
                <p className="text-gray-700 mb-1">
                    {address?.city?.name}, {address?.postalCode}
                </p>
            </div>
            <p className="text-gray-700 mb-3">{address?.phone}</p>

            <div className="flex flex-wrap gap-3 items-center">
                <button
                    onClick={onSelect}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        isSelected
                            ? 'bg-primary text-white cursor-default'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
                    }`}
                >
                    {isSelected ? '✓ Selected' : 'Select this address'}
                </button>

                <div className="flex gap-2">
                    <button
                        onClick={onEdit}
                        className="text-sm text-gray-600 hover:text-gray-800 px-2 py-1 hover:bg-gray-100 rounded"
                    >
                        Edit
                    </button>
                    <button
                        onClick={onDelete}
                        className="text-sm text-red-600 hover:text-red-800 px-2 py-1 hover:bg-red-50 rounded"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddressCard;