import React from 'react';

const FilterBar = () => {
    return (
        <div className="flex items-center justify-between px-4 py-2 border-b w-full">
            {/* Filters Section */}
            <div>
                <button className="flex items-center px-3 py-1.5 text-sm font-bold text-primary bg-filterBg rounded">
                    <svg className="w-5 h-5 mr-1 text-primary" viewBox="0 0 15 19" xmlns="http://www.w3.org/2000/svg"><path d="m14.546 6.201a.554.554 0 0 1 -.554.554h-1.79a2.22 2.22 0 0 1 -4.298 0h-6.896a.554.554 0 0 1 0-1.108h6.896a2.22 2.22 0 0 1 4.299 0h1.789a.554.554 0 0 1 .554.554zm0 3.7a.554.554 0 0 1 -.554.554h-7.005a2.22 2.22 0 0 1 -4.298 0h-1.68a.554.554 0 0 1 0-1.108h1.68a2.22 2.22 0 0 1 4.298 0h7.005a.554.554 0 0 1 .554.554zm0 3.7a.554.554 0 0 1 -.554.555h-1.79a2.22 2.22 0 0 1 -4.298 0h-6.896a.554.554 0 0 1 0-1.109h6.896a2.22 2.22 0 0 1 4.299 0h1.789a.554.554 0 0 1 .554.554zm-8.597-3.7a1.11 1.11 0 1 0 -1.111 1.111 1.112 1.112 0 0 0 1.11-1.11zm5.215-3.7a1.111 1.111 0 1 0 -1.11 1.11 1.112 1.112 0 0 0 1.11-1.11zm0 7.4a1.111 1.111 0 1 0 -1.11 1.111 1.112 1.112 0 0 0 1.11-1.11z" fill={'#425A8B'}/></svg>
                    All Filters
                </button>
            </div>

            <div className={'flex items-center gap-4'}>
                {/* Results and Sorting Section */}
                <div className="flex items-center text-sm text-gray-600 gap-4">
                    <span className={"text-primary text-xs font-bold"}>Showing 1–16 of 17 results</span>

                    <div className={'bg-[#D5DFE4] font-medium  h-8 w-[1px]'}/>

                    <div className="relative flex items-center gap-1">
                        <span className={'text-smallHeaderText text-xs font-bold'}>Sort by: </span>
                        <select className="appearance-none bg-transparent border-none text-primary text-xs font-bold ">
                            <option>Latest products</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
                            <svg className={'w-3 h-3'} fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="m17.9188 8.17969h-6.23-5.61003c-.96 0-1.44 1.16-.76 1.84001l5.18003 5.18c.83.83 2.18.83 3.01 0l1.97-1.97 3.21-3.21c.67-.68001.19-1.84001-.77-1.84001z" fill="#6b83b6"/></svg>
                        </div>
                    </div>

                    <div className={'bg-[#D5DFE4] font-medium  h-8 w-[1px]'}/>

                    <div className="relative flex items-center gap-1">
                        <span className={'text-smallHeaderText text-xs font-bold'}>Show: </span>
                        <select className="appearance-none bg-transparent border-none text-primary text-xs font-bold pr-6">
                            <option>30 items</option>
                            <option>15 items</option>
                            <option>60 items</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg className={`w-3 h-3`} fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="m17.9188 8.17969h-6.23-5.61003c-.96 0-1.44 1.16-.76 1.84001l5.18003 5.18c.83.83 2.18.83 3.01 0l1.97-1.97 3.21-3.21c.67-.68001.19-1.84001-.77-1.84001z" fill="#6b83b6"/></svg>
                        </div>
                    </div>
                </div>

                <div className={'bg-[#D5DFE4] font-medium  h-8 w-[1px]'}/>

                {/* View Options */}
                <div className={'flex items-center gap-1'}>
                    <button className="p-1.5 rounded bg-filterBg hover:text-gray-900">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 text-orange">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                        </svg>
                    </button>
                        <button className="p-1.5 rounded bg-filterBg hover:text-gray-900">

                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 text-primary">
                                <path fillRule="evenodd" d="M3 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 5.25Zm0 4.5A.75.75 0 0 1 3.75 9h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 9.75Zm0 4.5a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Zm0 4.5a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                            </svg>


                        </button>
                </div>
            </div>

        </div>
    );
};

export default FilterBar;