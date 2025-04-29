export interface AddDisputeType {
    orderitem_number: string;
    dispute_reason: string;
    proof_image: FileList;
    want_full_refund: 'true' | 'false';
}