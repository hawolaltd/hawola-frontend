import React from 'react';
import { Controller, useFormContext, FieldError } from 'react-hook-form';

type ControlledInputProps = {
    name: string;
    label: string;
    type?: string;
    rules?: any;
    className?: string;
    placeholder?: string;
    control: any;
    errors: any;
};

const ControlledInput: React.FC<ControlledInputProps> = ({
                                                             name,
                                                             label,
                                                             type = 'text',
                                                             rules,
                                                             className = '',
                                                             errors,
                                                             control,
                                                             placeholder
                                                         }) => {


    // Default Tailwind classes
    const defaultClasses = `w-full mt-1 p-3 border rounded-md bg-white border-[#dde4f0] focus:outline-none ${
        errors[name] ? 'border-red-500' : ''
    }`;

    // Combine default classes with user-provided classes
    const inputClasses = `${defaultClasses} ${className}`;

    // Safely get the error message as a string
    const errorMessage = errors[name]?.message as string | undefined;

    return (
        <div className="mb-4">
            <label htmlFor={name} className="block text-sm font-medium text-[#435a8c]">
                {label}
            </label>
            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field }) => (
                    <input
                        {...field}
                        id={name}
                        type={type}
                        placeholder={placeholder}
                        className={inputClasses} // Use combined classes
                    />
                )}
            />
            {errorMessage && (
                <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
            )}
        </div>
    );
};

export default ControlledInput;