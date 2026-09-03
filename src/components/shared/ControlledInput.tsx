import React, { useState } from 'react';
import {
    Controller,
    Control,
    FieldErrors,
    FieldValues,
    FieldPath,
    RegisterOptions, PathValue,
} from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

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
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const defaultClasses = `w-full mt-1 p-3 border rounded-md bg-white border-[#dde4f0] focus:outline-none ${
        errors[name] ? 'border-red-500' : ''
    } ${type === 'file' ? 'cursor-pointer' : ''}`;

    const inputClasses = `${defaultClasses} ${className}${isPassword ? ' pr-11' : ''}`;
    const errorMessage = errors[name]?.message as string | undefined;

    return (
        <div className="mb-4">
            <label htmlFor={name} className="block text-sm font-medium text-[#435a8c]">
                {label}
            </label>
            <div className="relative">
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
                                value={undefined}
                            />
                        ) : (
                            <input
                                {...field}
                                id={name}
                                type={inputType}
                                placeholder={placeholder}
                                className={inputClasses}
                                autoComplete={
                                    isPassword
                                        ? name === 'password'
                                            ? 'current-password'
                                            : 'new-password'
                                        : undefined
                                }
                            />
                        )
                    )}
                />
                {isPassword ? (
                    <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#435a8c]/70 hover:text-[#435a8c]"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5" aria-hidden />
                        ) : (
                            <EyeIcon className="h-5 w-5" aria-hidden />
                        )}
                    </button>
                ) : null}
            </div>
            {errorMessage && (
                <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
            )}
        </div>
    );
};
export default ControlledInput;
