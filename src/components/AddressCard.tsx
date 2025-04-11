// components/AddressCard.tsx
import React from 'react';
import {AddressData, } from "@/types/product";

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
        <div className={`border rounded-lg p-4 mb-4 ${isSelected ? 'border-primary' : 'border-gray-200'}`}>
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
                {/*{address.address2 && <p className="text-gray-700 mb-1">{address.address2}</p>}*/}
                <p className="text-gray-700 mb-1">
                    {address?.city?.name}, {address?.postalCode}
                </p>
            </div>
            {/*{address.companyName && <p className="text-gray-700 mb-1">{address.companyName}</p>}*/}
            <p className="text-gray-700 mb-3">{address?.phone}</p>

            <div className="flex space-x-2">

                    <button
                        onClick={onSelect}
                        className={`text-sm ${isSelected ? 'text-blue-600 font-medium' : 'text-gray-600'} `}
                    >
                        {isSelected ? 'Selected' : 'Select this address'}
                    </button>

                    <button
                        onClick={onEdit}
                        className="text-sm text-gray-600 hover:text-gray-800"
                    >
                        Edit
                    </button>

                    <button
                        onClick={onDelete}
                        className="text-sm text-red-600 hover:text-red-800"
                    >
                        Delete
                    </button>

            </div>
        </div>
    );
};

export default AddressCard;