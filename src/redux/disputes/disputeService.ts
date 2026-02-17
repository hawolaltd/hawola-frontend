import axiosInstance from '@/libs/api/axiosInstance';
import { API } from '@/constant';

const getDisputes = async (orderitem_number: string) => {
    const response = await axiosInstance.get(API + `dispute/${orderitem_number}/`);
    return response.data;
};

const createDispute = async (formdata: FormData) => {
    const response = await axiosInstance.post(API + `dispute/`, formdata, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

const getDisputeComments = async (orderitem_number: string) => {
    const response = await axiosInstance.get(API + `dispute/comments/${orderitem_number}/`);
    return response.data;
};

const addDisputeComment = async (formData: FormData) => {
    const response = await axiosInstance.post(API + `dispute/add/comment/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

const disputesService = {
    getDisputes,
    createDispute,
    getDisputeComments,
    addDisputeComment,
};

export default disputesService;
