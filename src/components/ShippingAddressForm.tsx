import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useAppSelector, useAppDispatch } from "@/hook/useReduxTypes";
import {getStateLocations} from "@/redux/general/generalSlice";
import {addAddress, getAddress} from "@/redux/product/productSlice";
import {toast} from "sonner";
import {AddressData} from "@/types/product";

type ShippingFormValues = {
    first_name: string;
    last_name: string;
    address: string;
    state: string;
    location: string;
    phone: string;
    phone2?: string;
};

const ShippingAddressForm = ({selectedAdd, editingAddress}:{selectedAdd: AddressData, editingAddress: boolean}) => {
    const dispatch = useAppDispatch();
    const { states, stateLocations, isLoading } = useAppSelector(state => state.general);

    const { control, handleSubmit, watch, setValue } = useForm<ShippingFormValues>({
        defaultValues: {
            first_name: selectedAdd?.first_name,
            last_name: selectedAdd?.last_name,
            address: selectedAdd?.address,
            phone: selectedAdd?.phone,
            phone2: selectedAdd?.phone2,
            state: selectedAdd?.state?.name,
            location: selectedAdd?.city?.name
        }
    });

    // Watch state value changes
    const selectedState = watch("state");

    // Reset location when state changes
    React.useEffect(() => {
        if (selectedState) {
            setValue("location", "");
            dispatch(getStateLocations(selectedState));
        }
    }, [selectedState, dispatch, setValue]);

    const onSubmit = async (data: ShippingFormValues) => {
        console.log("Form submitted:", data);

        const res = await dispatch(addAddress(data))

        // console.log(res)

        if(!res.type.includes('rejected')){
            toast.success('Successfully')
            dispatch(getAddress())
        }
    };

    return (
        <div className="w-full mx-auto">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">Shipping address</h2>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Controller
                        name="first_name"
                        control={control}
                        rules={{ required: "First name is required" }}
                        render={({ field, fieldState: { error } }) => (
                            <div className="w-full">
                                <input
                                    {...field}
                                    type="text"
                                    placeholder="First name*"
                                    className={`border ${error ? 'border-red-500' : 'border-slate-200'} rounded-md p-2 w-full text-slate-500 placeholder:text-slate-400`}
                                />
                                {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                            </div>
                        )}
                    />
                    <Controller
                        name="last_name"
                        control={control}
                        rules={{ required: "Last name is required" }}
                        render={({ field, fieldState: { error } }) => (
                            <div className="w-full">
                                <input
                                    {...field}
                                    type="text"
                                    placeholder="Last name*"
                                    className={`border ${error ? 'border-red-500' : 'border-slate-200'} rounded-md p-2 w-full text-slate-500 placeholder:text-slate-400`}
                                />
                                {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                            </div>
                        )}
                    />
                </div>

                <Controller
                    name="address"
                    control={control}
                    rules={{ required: "Address is required" }}
                    render={({ field, fieldState: { error } }) => (
                        <div className="w-full">
                            <input
                                {...field}
                                type="text"
                                placeholder="Address*"
                                className={`border ${error ? 'border-red-500' : 'border-slate-200'} rounded-md p-2 w-full text-slate-500 placeholder:text-slate-400`}
                            />
                            {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                        </div>
                    )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Controller
                        name="state"
                        control={control}
                        rules={{ required: "State is required" }}
                        render={({ field, fieldState: { error } }) => (
                            <div className="w-full">
                                <select
                                    {...field}
                                    className={`border ${error ? 'border-red-500' : 'border-slate-200'} rounded-md p-2 w-full text-slate-500`}
                                    disabled={!states?.data?.length}
                                >
                                    <option value="">Select a state...</option>
                                    {states?.data?.map(state => (
                                        <option key={state.id} value={state.id}>{state.name}</option>
                                    ))}
                                </select>
                                {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                            </div>
                        )}
                    />

                    <Controller
                        name="location"
                        control={control}
                        rules={{
                            required: "Location is required",
                            validate: value => selectedState ? true : "Please select a state first"
                        }}
                        render={({ field, fieldState: { error } }) => (
                            <div className="w-full">
                                <select
                                    {...field}
                                    className={`border ${error ? 'border-red-500' : 'border-slate-200'} rounded-md p-2 w-full text-slate-500`}
                                    disabled={!selectedState || isLoading}
                                >
                                    <option value="">{isLoading ? "Loading locations..." : "Select a location..."}</option>
                                    {stateLocations?.data?.map(location => (
                                        <option key={location.id} value={location.id}>{location.name}</option>
                                    ))}
                                </select>
                                {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                            </div>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Controller
                        name="phone"
                        control={control}
                        rules={{
                            required: "Phone is required",
                            pattern: {
                                value: /^[0-9]{10,15}$/,
                                message: "Please enter a valid phone number"
                            }
                        }}
                        render={({ field, fieldState: { error } }) => (
                            <div className="w-full">
                                <input
                                    {...field}
                                    type="tel"
                                    placeholder="Phone*"
                                    className={`border ${error ? 'border-red-500' : 'border-slate-200'} rounded-md p-2 w-full text-slate-500 placeholder:text-slate-400`}
                                />
                                {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                            </div>
                        )}
                    />
                    <Controller
                        name="phone2"
                        control={control}
                        rules={{
                            pattern: {
                                value: /^[0-9]{10,15}$/,
                                message: "Please enter a valid phone number"
                            }
                        }}
                        render={({ field, fieldState: { error } }) => (
                            <div className="w-full">
                                <input
                                    {...field}
                                    type="tel"
                                    placeholder="Phone 2 (optional)"
                                    className={`border ${error ? 'border-red-500' : 'border-slate-200'} rounded-md p-2 w-full text-slate-500 placeholder:text-slate-400`}
                                />
                                {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                            </div>
                        )}
                    />
                </div>

                <button
                    type="submit"
                    className="bg-primary text-white rounded-md px-8 py-2 hover:bg-primary-dark transition-colors"
                    disabled={isLoading}
                >
                    {isLoading ? "Processing..." : editingAddress ? "Edit Address" : "Submit"}
                </button>
            </form>
        </div>
    );
};

export default ShippingAddressForm;