import React from 'react';
import {
    Controller,
    Control,
    FieldErrors,
    FieldValues,
    FieldPath,
    RegisterOptions, PathValue,
} from 'react-hook-form';

type ControlledInputProps<TFieldValues extends FieldValues = FieldValues> = {
    name: FieldPath<TFieldValues>;
    label: string;
    type?: string;
    rules?: RegisterOptions<TFieldValues>;
    className?: string;
    placeholder?: string;
    control: Control<TFieldValues>;
    errors: FieldErrors<TFieldValues>;
    defaultValue?: PathValue<TFieldValues, FieldPath<TFieldValues>>;
};

const ControlledInput = <TFieldValues extends FieldValues = FieldValues>({
                                                                             name,
                                                                             label,
                                                                             type = 'text',
                                                                             rules,
                                                                             className = '',
                                                                             errors,
                                                                             control,
                                                                             placeholder,
                                                                             defaultValue,
                                                                         }: ControlledInputProps<TFieldValues>) => {
    const defaultClasses = `w-full mt-1 p-3 border rounded-md bg-white border-[#dde4f0] focus:outline-none ${
        errors[name] ? 'border-red-500' : ''
    } ${type === 'file' ? 'cursor-pointer' : ''}`;

    const inputClasses = `${defaultClasses} ${className}`;
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
                defaultValue={defaultValue}
                render={({ field }) => (
                    type === 'file' ? (
                        <input
                            {...field}
                            id={name}
                            type="file"
                            onChange={(e) => {
                                field.onChange(e.target.files);
                            }}
                            className={inputClasses}
                            value={undefined} // Clear the value prop for file inputs
                        />
                    ) : (
                        <input
                            {...field}
                            id={name}
                            type={type}
                            placeholder={placeholder}
                            className={inputClasses}
                        />
                    )
                )}
            />
            {errorMessage && (
                <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
            )}
        </div>
    );
};
export default ControlledInput;