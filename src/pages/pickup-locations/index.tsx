import React from "react";
import Head from "next/head";
import AuthLayout from "@/components/layout/AuthLayout";
import {
  FaSearch,
  FaList,
  FaMap,
  FaPhone,
  FaClock,
  FaStar,
  FaMapMarkerAlt,
} from "react-icons/fa";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/map/Map"), {
  loading: () => <div className="w-full h-[600px] bg-gray-100 animate-pulse" />,
  ssr: false,
});

interface PickupLocation {
  id: number;
  name: string;
  address: string;
  phone: string;
  hours: string;
  distance: number;
  rating: number;
  isOpen: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const PickupLocationsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedFilter, setSelectedFilter] = React.useState<
    "all" | "open" | "nearby"
  >("all");
  const [viewMode, setViewMode] = React.useState<"list" | "map">("list");

  // Mock data - replace with actual API call
  const mockLocations: PickupLocation[] = [
    {
      id: 1,
      name: "Downtown Pickup Point",
      address: "123 Main St, Downtown",
      phone: "+234 123 456 7890",
      hours: "Mon-Sat: 8AM-8PM, Sun: 10AM-6PM",
      distance: 0.5,
      rating: 4.5,
      isOpen: true,
      coordinates: {
        lat: 6.5244,
        lng: 3.3792,
      },
    },
    {
      id: 2,
      name: "Shopping Mall Collection",
      address: "456 Retail Ave, Shopping District",
      phone: "+234 123 456 7891",
      hours: "Mon-Sun: 9AM-9PM",
      distance: 1.2,
      rating: 4.2,
      isOpen: true,
      coordinates: {
        lat: 6.5344,
        lng: 3.3892,
      },
    },
    {
      id: 3,
      name: "Express Pickup Center",
      address: "789 Quick Lane, Business Park",
      phone: "+234 123 456 7892",
      hours: "Mon-Fri: 7AM-7PM, Sat: 9AM-5PM",
      distance: 2.0,
      rating: 4.0,
      isOpen: false,
      coordinates: {
        lat: 6.5444,
        lng: 3.3992,
      },
    },
    {
      id: 4,
      name: "24/7 Collection Point",
      address: "321 Night Rd, Entertainment Zone",
      phone: "+234 123 456 7893",
      hours: "24/7",
      distance: 1.5,
      rating: 4.8,
      isOpen: true,
      coordinates: {
        lat: 6.5544,
        lng: 3.4092,
      },
    },
    {
      id: 5,
      name: "Community Pickup Hub",
      address: "654 Local St, Residential Area",
      phone: "+234 123 456 7894",
      hours: "Mon-Sat: 8AM-6PM",
      distance: 0.8,
      rating: 4.3,
      isOpen: true,
      coordinates: {
        lat: 6.5644,
        lng: 3.4192,
      },
    },
  ];

  const filteredLocations = mockLocations.filter((location: PickupLocation) => {
    const matchesSearch =
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "open" && location.isOpen) ||
      (selectedFilter === "nearby" && location.distance <= 1);

    return matchesSearch && matchesFilter;
  });

  return (
    <AuthLayout>
      <Head>
        <title>Pickup Locations | Your Store Name</title>
        <meta
          name="description"
          content="Find nearby pickup points to collect your orders conveniently"
        />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Pickup Locations</h1>

        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFilter("all")}
                className={`px-4 py-2 rounded-lg ${
                  selectedFilter === "all"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedFilter("open")}
                className={`px-4 py-2 rounded-lg ${
                  selectedFilter === "open"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Open Now
              </button>
              <button
                onClick={() => setSelectedFilter("nearby")}
                className={`px-4 py-2 rounded-lg ${
                  selectedFilter === "nearby"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Nearby
              </button>
              <button
                onClick={() =>
                  setViewMode(viewMode === "list" ? "map" : "list")
                }
                className={`px-4 py-2 rounded-lg ${
                  viewMode === "map"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {viewMode === "list" ? <FaMap /> : <FaList />}
              </button>
            </div>
          </div>
        </div>

        {/* Map or List View */}
        {viewMode === "map" ? (
          <div className="h-[600px] rounded-lg overflow-hidden">
            <Map locations={filteredLocations} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((location: PickupLocation) => (
              <div
                key={location.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{location.name}</h3>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      location.isOpen
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {location.isOpen ? "Open" : "Closed"}
                  </span>
                </div>

                <div className="space-y-3">
                  <p className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="mr-2" />
                    {location.address}
                  </p>
                  <p className="flex items-center text-gray-600">
                    <FaPhone className="mr-2" />
                    {location.phone}
                  </p>
                  <p className="flex items-center text-gray-600">
                    <FaClock className="mr-2" />
                    {location.hours}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <FaStar className="text-yellow-400 mr-1" />
                      <span className="text-gray-600">{location.rating}</span>
                    </div>
                    <span className="text-gray-600">
                      {location.distance} km away
                    </span>
                  </div>
                </div>

                <button className="mt-4 w-full bg-primary text-white py-2 rounded hover:bg-primary/90 transition-colors">
                  Select This Location
                </button>
              </div>
            ))}
          </div>
        )}

        {filteredLocations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No locations found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default PickupLocationsPage;
