import React from 'react';
import {
    Controller,
    Control,
    FieldErrors,
    FieldValues,
    FieldPath,
    RegisterOptions, PathValue,
} from 'react-hook-form';

type ControlledSelectProps<TFieldValues extends FieldValues = FieldValues> = {
    name: FieldPath<TFieldValues>;
    label: string;
    rules?: RegisterOptions<TFieldValues>;
    className?: string;
    control: Control<TFieldValues>;
    errors: FieldErrors<TFieldValues>;
    defaultValue?: PathValue<TFieldValues, FieldPath<TFieldValues>>;
    children: React.ReactNode;
};

export const ControlledSelect = <TFieldValues extends FieldValues = FieldValues>({
                                                                                     name,
                                                                                     label,
                                                                                     rules,
                                                                                     className = '',
                                                                                     errors,
                                                                                     control,
                                                                                     defaultValue,
                                                                                     children,
                                                                                 }: ControlledSelectProps<TFieldValues>) => {
    // Default Tailwind classes
    const defaultClasses = `w-full mt-1 p-3 border rounded-md bg-white border-[#dde4f0] focus:outline-none ${
        errors[name] ? 'border-red-500' : ''
    }`;

    // Combine default classes with user-provided classes
    const selectClasses = `${defaultClasses} ${className}`;

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
                defaultValue={defaultValue}
                render={({ field }) => (
                    <select
                        {...field}
                        id={name}
                        className={selectClasses}
                    >
                        {children}
                    </select>
                )}
            />
            {errorMessage && (
                <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
            )}
        </div>
    );
};

type ControlledTextareaProps<TFieldValues extends FieldValues = FieldValues> = {
    name: FieldPath<TFieldValues>;
    label: string;
    rules?: RegisterOptions<TFieldValues>;
    className?: string;
    placeholder?: string;
    control: Control<TFieldValues>;
    errors: FieldErrors<TFieldValues>;
    defaultValue?: PathValue<TFieldValues, FieldPath<TFieldValues>>;
    rows?: number;
};

export const ControlledTextarea = <TFieldValues extends FieldValues = FieldValues>({
                                                                                       name,
                                                                                       label,
                                                                                       rules,
                                                                                       className = '',
                                                                                       errors,
                                                                                       control,
                                                                                       placeholder,
                                                                                       defaultValue,
                                                                                       rows = 3,
                                                                                   }: ControlledTextareaProps<TFieldValues>) => {
    // Default Tailwind classes
    const defaultClasses = `w-full mt-1 p-3 border rounded-md bg-white border-[#dde4f0] focus:outline-none ${
        errors[name] ? 'border-red-500' : ''
    }`;

    // Combine default classes with user-provided classes
    const textareaClasses = `${defaultClasses} ${className}`;

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
                defaultValue={defaultValue}
                render={({ field }) => (
                    <textarea
                        {...field}
                        id={name}
                        placeholder={placeholder}
                        className={textareaClasses}
                        rows={rows}
                    />
                )}
            />
            {errorMessage && (
                <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
            )}
        </div>
    );
};