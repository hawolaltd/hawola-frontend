import { Product } from './product';

export interface MemoryBankItem {
    id: string;
    product: Product;
    addedAt: string;
    notes?: string;
}

export interface MemoryBankState {
    items: MemoryBankItem[];
    isLoading: boolean;
    error: string | null | unknown;
    message: string | null | unknown;
}
