import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {ControlledSelect, ControlledTextarea} from "@/components/shared/ControlledSelect";
import ControlledInput from "@/components/shared/ControlledInput";
import {LoginFormType} from "@/types/auth";
import {useForm} from "react-hook-form";
import {useAppDispatch} from "@/hook/useReduxTypes";
import {AddDisputeType} from "@/types/disputes";
import {ControlledCheckbox} from "@/components/shared/ControlledCheckbox";
import {createDispute} from "@/redux/disputes/disputeSlice";

type DisputeModalProps = {
    isOpen: boolean;
    onClose: () => void;
    order:  OrderDetail;
};

const DisputeModal = ({ isOpen, onClose, order }: DisputeModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { control, handleSubmit, watch, formState: { errors }, } = useForm<AddDisputeType>({
        defaultValues: {
            want_full_refund: 'false'
        }
    });

    const dispatch = useAppDispatch()
    const onSubmit = async (data: AddDisputeType) => {
        setIsSubmitting(true);
        try {
            // Create FormData object
            const formData = new FormData();

            // Append all form data
            formData.append('orderitem_number', order?.orderitem_number.toString());
            formData.append('dispute_reason', data.dispute_reason);
            formData.append('want_full_refund', data.want_full_refund.toString());

            // Append file if exists
            if (data.proof_image && data.proof_image[0]) {
                formData.append('proof_image', data.proof_image[0]);
            }

            await dispatch(createDispute(formData));
            // onClose();
        } catch (e) {
            console.error('Submission error:', e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const proofImage = watch('proof_image');
    const fileName = proofImage?.[0]?.name || 'No file chosen';

    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex justify-between items-center">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                        File Dispute for Order #{order?.id}
                                    </Dialog.Title>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                                    <div>
                                        <ControlledTextarea<AddDisputeType>
                                            name="dispute_reason"
                                            label="Dispute Reason"
                                            control={control}
                                            errors={errors}
                                            placeholder="Please describe the issue in detail..."
                                            rows={4}
                                        />
                                    </div>

                                    <div>
                                        <div className="flex flex-col">
                                            <ControlledInput<AddDisputeType>
                                                control={control}
                                                errors={errors}
                                                name="proof_image"
                                                type="file"
                                                className="hidden"
                                                label={'Proof Image'}
                                            />
                                            <div className={'flex items-center'}>
                                                <label
                                                    htmlFor="proof_image"
                                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                                                >
                                                    Choose File
                                                </label>
                                                <span className="ml-2 text-sm text-gray-500">
                                                {fileName}
                                            </span>
                                            </div>
                                        </div>
                                        {errors.proof_image && (
                                            <p className="mt-1 text-sm text-red-500">{errors.proof_image.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <ControlledCheckbox<AddDisputeType>
                                            name="want_full_refund"
                                            label="I want full refund"
                                            control={control}
                                            errors={errors}
                                            defaultValue={'false'}
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:bg-red-400"
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Submit Dispute'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default DisputeModal;