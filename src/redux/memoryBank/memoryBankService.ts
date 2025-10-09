import axios from 'axios';
import axiosInstance from '@/libs/api/axiosInstance';
import { API } from '@/constant';
import { Product } from '@/types/product';

// Since we're creating a client-side memory bank, we'll store items in localStorage
// In a real application, you might want to sync with a backend API

const STORAGE_KEY = 'hawola_memory_bank';

// Get memory bank items from localStorage
const getMemoryBankItems = async () => {
    try {
        const storedItems = localStorage.getItem(STORAGE_KEY);
        return storedItems ? JSON.parse(storedItems) : [];
    } catch (error) {
        console.error('Error retrieving memory bank items:', error);
        return [];
    }
};

// Add item to memory bank
const addToMemoryBank = async (product: Product, notes?: string) => {
    try {
        const items = await getMemoryBankItems();

        // Check if product already exists in memory bank
        const existingItemIndex = items.findIndex(
            (item: any) => item.product.id === product.id
        );

        if (existingItemIndex >= 0) {
            // Update existing item if it exists
            items[existingItemIndex] = {
                ...items[existingItemIndex],
                notes: notes || items[existingItemIndex].notes,
                addedAt: new Date().toISOString(),
            };
        } else {
            // Add new item
            const newItem = {
                id: `mb-${Date.now()}`,
                product,
                addedAt: new Date().toISOString(),
                notes,
            };
            items.push(newItem);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        return items;
    } catch (error) {
        console.error('Error adding to memory bank:', error);
        throw error;
    }
};

// Remove item from memory bank
const removeFromMemoryBank = async (itemId: string) => {
    try {
        const items = await getMemoryBankItems();
        const updatedItems = items.filter((item: any) => item.id !== itemId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
        return updatedItems;
    } catch (error) {
        console.error('Error removing from memory bank:', error);
        throw error;
    }
};

// Update item notes
const updateMemoryBankItemNotes = async (itemId: string, notes: string) => {
    try {
        const items = await getMemoryBankItems();
        const updatedItems = items.map((item: any) => {
            if (item.id === itemId) {
                return { ...item, notes };
            }
            return item;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
        return updatedItems;
    } catch (error) {
        console.error('Error updating memory bank item notes:', error);
        throw error;
    }
};

// Clear all items from memory bank
const clearMemoryBank = async () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return [];
    } catch (error) {
        console.error('Error clearing memory bank:', error);
        throw error;
    }
};

const memoryBankService = {
    getMemoryBankItems,
    addToMemoryBank,
    removeFromMemoryBank,
    updateMemoryBankItemNotes,
    clearMemoryBank,
};

export default memoryBankService;
