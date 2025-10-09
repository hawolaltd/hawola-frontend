import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hook/useReduxTypes';
import { getMemoryBankItems, clearMemoryBank } from '@/redux/memoryBank/memoryBankSlice';
import MemoryBankItem from '@/components/memoryBank/MemoryBankItem';
import Link from 'next/link';
import Head from 'next/head';

const MemoryBankPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { items, isLoading } = useAppSelector((state) => state.memoryBank);
    
    useEffect(() => {
        dispatch(getMemoryBankItems());
    }, [dispatch]);
    
    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to clear all items from your Memory Bank?')) {
            dispatch(clearMemoryBank());
        }
    };
    
    return (
        <>
            <Head>
                <title>Memory Bank | Hawola</title>
                <meta name="description" content="Your saved items in Hawola Memory Bank" />
            </Head>
            
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold">Memory Bank</h1>
                    
                    <div className="flex gap-4">
                        {items.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="px-4 py-2 text-red-500 border border-red-500 rounded-md hover:bg-red-50 transition-colors"
                            >
                                Clear All
                            </button>
                        )}
                        <Link href="/">
                            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                                Continue Shopping
                            </button>
                        </Link>
                    </div>
                </div>
                
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-16">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-16 h-16 mx-auto text-gray-400 mb-4"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <h2 className="text-xl font-semibold mb-2">Your Memory Bank is empty</h2>
                        <p className="text-gray-600 mb-6">
                            Save items to your Memory Bank to keep track of products you're interested in.
                        </p>
                        <Link href="/">
                            <button className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                                Explore Products
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div>
                        <p className="text-gray-600 mb-6">
                            You have {items.length} item{items.length !== 1 ? 's' : ''} in your Memory Bank.
                        </p>
                        
                        <div className="space-y-6">
                            {items.map((item) => (
                                <MemoryBankItem key={item.id} item={item} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default MemoryBankPage;
