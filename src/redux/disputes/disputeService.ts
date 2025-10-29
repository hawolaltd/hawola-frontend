import axiosInstance from '@/libs/api/axiosInstance';
import { API } from '@/constant';
import { AddDisputeType } from '@/types/disputes';

const API_URL = 'authy';

// get All States
const getDisputes = async (orderitem_number: string) => {
    const response = await axiosInstance.get(
        API + `dispute/${orderitem_number}/`
    );
    console.log('getAllStates:', response.data);

    return response.data;
};

// get State Location
const createDispute = async (formdata: FormData) => {
    const response = await axiosInstance.post(API + `dispute/`, formdata, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    console.log('getStateLocations:', response.data);

    return response.data;
};

const disputesService = {
    getDisputes,
    createDispute,
};

export default disputesService;
