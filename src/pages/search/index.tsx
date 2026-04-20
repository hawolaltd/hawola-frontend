import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import {
  performSearch,
  fetchSuggestions,
  setCurrentQuery,
  clearSearchResults,
} from "@/redux/search/searchSlice";
import { FiSearch, FiX, FiTrendingUp, FiClock } from "react-icons/fi";
import { BiStore } from "react-icons/bi";
import { AiOutlineProduct } from "react-icons/ai";
import ProductCard from "@/components/product/ProductCard";
import MerchantRichHtml from "@/components/merchant/MerchantRichHtml";
import MiniHeader from "@/components/header/MiniHeader";
import MainHeader from "@/components/header/MainHeader";
import Drawer from "@/components/header/MobileMenuDrawer";
import { setDrawerOpen } from "@/redux/ui/uiSlice";
import Header from "@/components/header";
import AuthLayout from "@/components/layout/AuthLayout";

const SearchPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { searchResults, suggestions, isLoading, currentQuery, error } = useAppSelector(
    (state) => state.search
  );
  const isDrawerOpen = useAppSelector((state) => state.ui.isDrawerOpen);

  const [searchInput, setSearchInput] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "products" | "merchants">("all");

  const handleSearch = useCallback(
    (query: string, page: number = 1) => {
      if (!query.trim()) return;

      dispatch(
        performSearch({
          query: query.trim(),
          page,
          perPage: 20,
        })
      );

      // Update URL without page reload
      router.push(
        {
          pathname: "/search",
          query: { q: query.trim(), page },
        },
        undefined,
        { shallow: true }
      );
    },
    [dispatch, router]
  );

  useEffect(() => {
    if (!router.isReady) return;

    // Get query from URL
    const query = router.query.q as string;
    const page = Number(router.query.page) || 1;

    if (query && query.trim()) {
      setSearchInput(query);
      dispatch(
        performSearch({
          query: query.trim(),
          page,
          perPage: 20,
        })
      );
    } else if (!query && !currentQuery) {
      // Fetch suggestions if no query
      dispatch(fetchSuggestions(10));
    }
  }, [router.isReady, router.query.q, router.query.page, dispatch, currentQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      handleSearch(searchInput);
    }
  };

  const handleSuggestionClick = (query: string) => {
    setSearchInput(query);
    handleSearch(query);
  };

  const handlePageChange = (page: number) => {
    if (currentQuery) {
      handleSearch(currentQuery, page);
    }
  };

  const handleClearSearch = () => {
    setSearchInput("");
    dispatch(clearSearchResults());
    dispatch(fetchSuggestions(10));
    router.push("/search");
  };

  // Render empty state
  const renderEmptyState = () => (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
        <FiSearch className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Start searching
      </h3>
      <p className="text-gray-600 mb-6">
        Search for products, merchants, or categories
      </p>

      {/* Suggestions */}
      {(suggestions?.recent_searches?.length ?? 0) > 0 || (suggestions?.popular_searches?.length ?? 0) > 0 ? (
        <div className="max-w-2xl mx-auto mt-8 space-y-6">
          {/* Recent Searches */}
          {suggestions?.recent_searches && suggestions.recent_searches.length > 0 && (
            <div className="text-left">
              <div className="flex items-center gap-2 mb-3 text-gray-700">
                <FiClock className="w-5 h-5" />
                <h4 className="font-medium">Recent Searches</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.recent_searches.slice(0, 5).map((search) => (
                  <button
                    key={search.id}
                    onClick={() => handleSuggestionClick(search.query)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full hover:border-[#FF5733] hover:text-[#FF5733] transition-colors text-sm"
                  >
                    {search.query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          {suggestions?.popular_searches && suggestions.popular_searches.length > 0 && (
            <div className="text-left">
              <div className="flex items-center gap-2 mb-3 text-gray-700">
                <FiTrendingUp className="w-5 h-5" />
                <h4 className="font-medium">Popular Searches</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.popular_searches.slice(0, 8).map((search) => (
                  <button
                    key={search.id}
                    onClick={() => handleSuggestionClick(search.query)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full hover:border-[#FF5733] hover:text-[#FF5733] transition-colors text-sm"
                  >
                    {search.query}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );

  // Render no results state
  const renderNoResults = () => (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
        <FiSearch className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        No results found for "{currentQuery}"
      </h3>
      <p className="text-gray-600 mb-6">
        Try different keywords or check your spelling
      </p>

      {/* Spelling Suggestions */}
      {searchResults?.suggestions && searchResults.suggestions.length > 0 && (
        <div className="max-w-2xl mx-auto">
          <p className="text-sm text-gray-600 mb-3">Did you mean:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {searchResults.suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full hover:border-[#FF5733] hover:text-[#FF5733] transition-colors text-sm font-medium"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Calculate total results for each category
  const totalProducts = searchResults?.results.products.count || 0;
  const merchantItems = searchResults?.results?.merchants?.items || [];
  const merchantItemsCount = merchantItems.length || 0;
  const totalMerchants = searchResults?.total_merchants || merchantItemsCount;
  const hasMerchantResults = totalMerchants > 0 || merchantItemsCount > 0;
  // Categories block is intentionally hidden for now.
  // const totalCategories = searchResults?.total_categories || 0;

  return (
    
    <AuthLayout>
      <Head>
        <title>
          {currentQuery ? `Search: ${currentQuery}` : "Search"} | Hawola
        </title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => dispatch(setDrawerOpen(false))}
          messageCount={0}
        />
        
        {/* Header with Logo */}
        

        
        <div className="max-w-screen-xl mx-auto px-6 xl:px-0 py-8">
          {/* Additional Search Bar for better UX on search page */}
          <div className="mb-8">
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex w-full items-stretch rounded-lg shadow-sm">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search products, merchants, categories..."
                    className="w-full rounded-l-lg rounded-r-none border-2 border-r-0 border-gray-300 pl-12 pr-12 py-4 text-lg focus:border-[#FF5733] focus:outline-none transition-colors"
                    autoFocus
                  />
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FiX className="w-6 h-6" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="shrink-0 rounded-r-lg rounded-l-none border-2 border-l-0 border-[#FF5733] bg-[#FF5733] px-5 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#e44a28] hover:border-[#e44a28]"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5733]"></div>
              </div>
            )}

            {/* Search Results */}
            {!isLoading && searchResults && (
              <>
                {/* Results Summary */}
                <div className="mb-6 flex flex-wrap items-center gap-4">
                  <div className="text-lg text-gray-700">
                    <span className="font-semibold">{searchResults.total_results}</span> results
                    for "<span className="font-medium">{currentQuery}</span>"
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    {totalProducts > 0 && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-white rounded-full border border-gray-200">
                        <AiOutlineProduct className="w-4 h-4" />
                        <span>{totalProducts} Products</span>
                      </div>
                    )}
                    {hasMerchantResults && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-white rounded-full border border-gray-200">
                        <BiStore className="w-4 h-4" />
                        <span>{totalMerchants} Merchants</span>
                      </div>
                    )}
                    {/* Categories quick stat hidden for now */}
                    {searchResults.total_promoted_products > 0 && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-[#FF5733] text-white rounded-full">
                        <FiTrendingUp className="w-4 h-4" />
                        <span>{searchResults.total_promoted_products} Promoted</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-3 font-medium whitespace-nowrap transition-colors ${
                      activeTab === "all"
                        ? "text-[#FF5733] border-b-2 border-[#FF5733]"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    All Results ({searchResults.total_results})
                  </button>
                  {totalProducts > 0 && (
                    <button
                      onClick={() => setActiveTab("products")}
                      className={`px-4 py-3 font-medium whitespace-nowrap transition-colors ${
                        activeTab === "products"
                          ? "text-[#FF5733] border-b-2 border-[#FF5733]"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Products ({totalProducts})
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab("merchants")}
                    className={`px-4 py-3 font-medium whitespace-nowrap transition-colors ${
                      activeTab === "merchants"
                        ? "text-[#FF5733] border-b-2 border-[#FF5733]"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Merchants ({totalMerchants})
                  </button>
                  {/* Categories tab hidden for now */}
                  {/* {totalCategories > 0 && (
                    <button
                      onClick={() => setActiveTab("categories")}
                      className={`px-4 py-3 font-medium whitespace-nowrap transition-colors ${
                        activeTab === "categories"
                          ? "text-[#FF5733] border-b-2 border-[#FF5733]"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Categories ({totalCategories})
                    </button>
                  )} */}
                </div>

                {/* Results Content */}
                {searchResults.total_results === 0 ? (
                  renderNoResults()
                ) : (
                  <div className="space-y-8">
                    {/* Products Section */}
                    {(activeTab === "all" || activeTab === "products") && totalProducts > 0 && (
                      <div>
                        {activeTab === "all" && (
                          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <AiOutlineProduct className="w-6 h-6" />
                            Products
                          </h2>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                          {searchResults.results.products.items.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                          ))}
                        </div>

                        {/* Pagination */}
                        {searchResults.results.products.total_pages > 1 && (
                          <div className="flex justify-center gap-2 mt-8">
                            {Array.from(
                              { length: searchResults.results.products.total_pages },
                              (_, i) => i + 1
                            ).map((page) => (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                  page === searchResults.results.products.page
                                    ? "bg-[#FF5733] text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Merchants Section */}
                    {(activeTab === "all" || activeTab === "merchants") && (
                        <div>
                          {activeTab === "all" && (
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                              <BiStore className="w-6 h-6" />
                              Merchants
                            </h2>
                          )}
                          {merchantItems.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {merchantItems.map((merchant: any) => (
                                <Link
                                  key={merchant.id}
                                  href={`/merchants/${merchant.slug}`}
                                  className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-[#FF5733] hover:shadow-md transition-all"
                                >
                                  <div className="flex items-start gap-4">
                                    {merchant.logo ? (
                                      <img
                                        src={merchant.logo}
                                        alt={merchant.store_name}
                                        className="w-16 h-16 rounded-lg object-cover"
                                      />
                                    ) : (
                                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <BiStore className="w-8 h-8 text-gray-400" />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <h3 className="font-semibold text-lg mb-1">
                                        {merchant.store_name}
                                      </h3>
                                      {merchant.about && (
                                        <MerchantRichHtml
                                          html={merchant.about}
                                          className="text-gray-600 text-sm line-clamp-2"
                                        />
                                      )}
                                      {merchant.store_address && (
                                        <p className="text-gray-500 text-xs mt-2">
                                          {merchant.store_address}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-lg border border-gray-200 bg-white px-4 py-5 text-sm text-gray-600">
                              No merchants found for this search.
                            </div>
                          )}
                        </div>
                      )}

                    {/* Categories Section hidden for now */}
                    {/*
                    {(activeTab === "all" || activeTab === "categories") &&
                      totalCategories > 0 && (
                        <div>
                          {activeTab === "all" && (
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                              <BiCategory className="w-6 h-6" />
                              Categories
                            </h2>
                          )}
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[
                              ...searchResults.results.categories.items,
                              ...searchResults.results.subcategories.items,
                              ...searchResults.results.subsec_categories.items,
                            ].map((category: any) => {
                              const imageUrl = searchCategoryImageUrl(category);
                              
                              return (
                                <Link
                                  key={`${category.id}-${category.name}`}
                                  href={`/categories?category=${category.id}`}
                                  className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-[#FF5733] hover:shadow-md transition-all text-center"
                                >
                                  {imageUrl ? (
                                    <img
                                      src={imageUrl}
                                      alt={category.name}
                                      className="w-full h-24 object-cover rounded-lg mb-3"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const parent = e.currentTarget.parentElement;
                                        if (parent) {
                                          const placeholder = document.createElement('div');
                                          placeholder.className = 'w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-3';
                                          placeholder.innerHTML = '<svg class="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path></svg>';
                                          parent.insertBefore(placeholder, e.currentTarget);
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                                      <BiCategory className="w-10 h-10 text-gray-400" />
                                    </div>
                                  )}
                                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    */}
                  </div>
                )}
              </>
            )}

          {!isLoading && error && !searchResults && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Search could not be completed. Please try again.
            </div>
          )}

          {/* Empty State (No search yet) */}
          {!isLoading && !searchResults && !error && renderEmptyState()}
        </div>
        
      </div>
    </AuthLayout>
  );
};

export default SearchPage;

