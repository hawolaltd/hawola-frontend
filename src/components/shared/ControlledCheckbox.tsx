import React from 'react';
import {
    Controller,
    Control,
    FieldErrors,
    FieldValues,
    FieldPath,
    RegisterOptions,
    PathValue,
} from 'react-hook-form';

type ControlledCheckboxProps<TFieldValues extends FieldValues = FieldValues> = {
    name: FieldPath<TFieldValues>;
    label: string;
    rules?: RegisterOptions<TFieldValues>;
    className?: string;
    control: Control<TFieldValues>;
    errors: FieldErrors<TFieldValues>;
    defaultValue?: PathValue<TFieldValues, FieldPath<TFieldValues>>;
    disabled?: boolean;
};

export const ControlledCheckbox = <TFieldValues extends FieldValues = FieldValues>({
                                                                                       name,
                                                                                       label,
                                                                                       rules,
                                                                                       className = '',
                                                                                       errors,
                                                                                       control,
                                                                                       defaultValue,
                                                                                       disabled = false,
                                                                                   }: ControlledCheckboxProps<TFieldValues>) => {
    // Default Tailwind classes
    const defaultClasses = `h-4 w-4 rounded border-gray-300 text-[#435a8c] focus:ring-[#435a8c] ${
        errors[name] ? 'border-red-500' : ''
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;

    // Combine default classes with user-provided classes
    const checkboxClasses = `${defaultClasses} ${className}`;

    // Safely get the error message as a string
    const errorMessage = errors[name]?.message as string | undefined;

    return (
        <div className="mb-4">
            <Controller
                name={name}
                control={control}
                rules={rules}
                defaultValue={defaultValue as PathValue<TFieldValues, FieldPath<TFieldValues>>}
                render={({ field }) => {
                    // Convert field value to boolean safely
                    const checked = typeof field.value === 'boolean'
                        ? field.value
                        : Boolean(field.value);

                    return (
                        <div className="flex items-center">
                            <input
                                {...field}
                                id={name}
                                type="checkbox"
                                disabled={disabled}
                                className={checkboxClasses}
                                checked={checked}
                                onChange={(e) => field.onChange(e.target.checked as PathValue<TFieldValues, FieldPath<TFieldValues>>)}
                                onBlur={field.onBlur}
                                ref={field.ref}
                                value={undefined} // Remove value prop for checkboxes
                            />
                            <label htmlFor={name} className="ml-2 block text-sm font-medium text-[#435a8c]">
                                {label}
                            </label>
                        </div>
                    );
                }}
            />
            {errorMessage && (
                <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
            )}
        </div>
    );
};