import React, { useState } from "react";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  onReset,
}) => {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const brands = [
    "Apple",
    "Samsung",
    "Baseus",
    "Remax",
    "Handtown",
    "Elecom",
    "Razer",
    "Auto Focus",
    "Nillkin",
    "Logitech",
    "ChromeBook",
  ];
  const specialOffers = ["On sale", "FREE shipping", "Big deals", "Shop Mall"];
  const readyToShip = [
    "1 business day",
    "1–3 business days",
    "in 1 week",
    "Shipping now",
  ];
  const orderingOptions = [
    "Accepts gift cards",
    "Customizable",
    "Can be gift-wrapped",
    "Installment 0%",
  ];
  const materials = [
    "Nylon (8)",
    "Tempered Glass (5)",
    "Liquid Silicone Rubber (5)",
    "Aluminium Alloy (3)",
  ];
  const productTags = [
    "Games",
    "Electronics",
    "Video",
    "Cellphone",
    "Indoor",
    "VGA Card",
    "USB",
    "Lightning",
    "Camera",
  ];

  const toggleSelection = (
    item: string,
    currentSelection: string[],
    setSelection: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (currentSelection.includes(item)) {
      setSelection(currentSelection.filter((i) => i !== item));
    } else {
      setSelection([...currentSelection, item]);
    }
  };

  const handleRatingClick = (stars: number) => {
    setSelectedRating(selectedRating === stars ? null : stars);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 pt-8 flex items-start justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white overflow-y-auto w-full max-w-[1024px]">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-headerBg">Advance Filters</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-4 flex w-full gap-2">
          {/* Brands Section */}
          <div className={`w-[20%]`}>
            <h3 className="font-bold mb-2 text-sm text-primary">Brands</h3>
            <div className="space-y-2">
              {brands.map((brand) => (
                <div key={brand} className="flex items-center text-xs">
                  <input
                    type="checkbox"
                    id={`brand-${brand}`}
                    checked={selectedBrands.includes(brand)}
                    onChange={() =>
                      toggleSelection(brand, selectedBrands, setSelectedBrands)
                    }
                    className="mr-2 text-sm w-3 h-3"
                  />
                  <label
                    className={`text-smallHeaderText`}
                    htmlFor={`brand-${brand}`}
                  >
                    {brand}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Special Offers Section */}
            <div>
              <h3 className="font-bold mb-2 text-sm text-primary">
                Special offers
              </h3>
              <div className="space-y-2">
                {specialOffers.map((offer) => (
                  <div key={offer} className="flex items-center text-xs">
                    <input
                      type="checkbox"
                      id={`offer-${offer}`}
                      checked={selectedOffers.includes(offer)}
                      onChange={() =>
                        toggleSelection(
                          offer,
                          selectedOffers,
                          setSelectedOffers
                        )
                      }
                      className="mr-2 w-3 h-3"
                    />
                    <label
                      className={`text-xs text-smallHeaderText`}
                      htmlFor={`offer-${offer}`}
                    >
                      {offer}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Ordering Options Section */}
            <div>
              <h3 className="font-bold mb-2 text-sm text-primary">
                Ordering options
              </h3>
              <div className="space-y-2">
                {orderingOptions.map((option) => (
                  <div key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`option-${option}`}
                      checked={selectedOptions.includes(option)}
                      onChange={() =>
                        toggleSelection(
                          option,
                          selectedOptions,
                          setSelectedOptions
                        )
                      }
                      className="mr-2"
                    />
                    <label
                      className={`text-xs text-smallHeaderText`}
                      htmlFor={`option-${option}`}
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Material Section */}
            <div>
              <h3 className="font-bold mb-2 text-sm text-primary">Material</h3>
              <div className="space-y-2">
                {materials.map((material) => (
                  <div key={material} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`material-${material}`}
                      checked={selectedMaterials.includes(material)}
                      onChange={() =>
                        toggleSelection(
                          material,
                          selectedMaterials,
                          setSelectedMaterials
                        )
                      }
                      className="mr-2"
                    />
                    <label
                      className={`text-xs text-smallHeaderText`}
                      htmlFor={`material-${material}`}
                    >
                      {material}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Ready to ship Section */}
            <div>
              <h3 className="font-bold mb-2 text-sm text-primary">
                Ready to ship in
              </h3>
              <div className="space-y-2">
                {readyToShip.map((ship) => (
                  <div key={ship} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`ship-${ship}`}
                      checked={selectedShipping.includes(ship)}
                      onChange={() =>
                        toggleSelection(
                          ship,
                          selectedShipping,
                          setSelectedShipping
                        )
                      }
                      className="mr-2"
                    />
                    <label
                      className={`text-xs text-smallHeaderText`}
                      htmlFor={`ship-${ship}`}
                    >
                      {ship}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating Section */}
            <div>
              <h3 className="font-bold mb-2 text-sm text-primary">Rating</h3>
              <div className="flex flex-col space-x-1">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => handleRatingClick(stars)}
                    className={`flex items-center ${
                      selectedRating === stars
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }`}
                  >
                    {Array(stars)
                      .fill(0)
                      .map((_, i) => (
                        <svg
                          key={i}
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="m17.56 21a1 1 0 0 1 -.46-.11l-5.1-2.67-5.1 2.67a1 1 0 0 1 -1.45-1.06l1-5.63-4.12-4a1 1 0 0 1 -.25-1 1 1 0 0 1 .81-.68l5.7-.83 2.51-5.13a1 1 0 0 1 1.8 0l2.54 5.12 5.7.83a1 1 0 0 1 .81.68 1 1 0 0 1 -.25 1l-4.12 4 1 5.63a1 1 0 0 1 -.4 1 1 1 0 0 1 -.62.18z"
                            fill="currentColor"
                          />
                        </svg>
                      ))}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Tags Section */}
            <div>
              <h3 className="font-bold mb-2 text-sm text-primary">
                Product tags
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {productTags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center py-2 px-3.5 font-bold border border-[#EBF0F3] text-[10px] rounded-md justify-center text-primary"
                  >
                    <label htmlFor={`tag-${tag}`}>{tag}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex gap-2">
          <button
            onClick={onApply}
            className="px-6 py-2 bg-primary font-bold text-white text-xs rounded"
          >
            Apply Filter
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 text-xs font-bold rounded text-primary"
          >
            Reset Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
