import React from 'react';

interface SpecificationProps {
    specs: {
        label: string;
        value: string;
    }[];
}

const Specification: React.FC<SpecificationProps> = ({ specs }) => {
    return (
        <div className="mt-8">
            <h2 className="text-xl font-semibold text-textPadded mb-4">Specification</h2>
            <table className="w-full ">
                <tbody>
                {specs.map((spec, index) => (
                    <tr key={index} className={`${index % 2 === 0 ? 'bg-[#f2f2f2]' : ''}`}>
                        <td className="py-2 text-sm px-4 text-gray-700 font-medium w-1/3">
                            {spec.label}
                        </td>
                        <td className="py-2 text-sm px-4">{spec.value}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Specification;