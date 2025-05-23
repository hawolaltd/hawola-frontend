import React from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

interface Location {
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

interface MapProps {
  locations: Location[];
}

const Map: React.FC<MapProps> = ({ locations }) => {
  const [selectedLocation, setSelectedLocation] =
    React.useState<Location | null>(null);

  const mapContainerStyle = {
    width: "100%",
    height: "100%",
  };

  const center = {
    lat: locations[0]?.coordinates.lat || 40.7128,
    lng: locations[0]?.coordinates.lng || -74.006,
  };

  const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
    ],
  };

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
        options={mapOptions}
      >
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={location.coordinates}
            onClick={() => setSelectedLocation(location)}
            icon={{
              url: location.isOpen
                ? "/images/marker-open.png"
                : "/images/marker-closed.png",
              scaledSize: new window.google.maps.Size(40, 40),
            }}
          />
        ))}

        {selectedLocation && (
          <InfoWindow
            position={selectedLocation.coordinates}
            onCloseClick={() => setSelectedLocation(null)}
          >
            <div className="p-2 max-w-[300px]">
              <h3 className="font-semibold text-lg mb-2">
                {selectedLocation.name}
              </h3>
              <p className="text-gray-600 text-sm mb-1">
                {selectedLocation.address}
              </p>
              <p className="text-gray-600 text-sm mb-1">
                {selectedLocation.phone}
              </p>
              <p className="text-gray-600 text-sm mb-2">
                {selectedLocation.hours}
              </p>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-gray-600">
                    {selectedLocation.rating}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  {selectedLocation.distance} km away
                </p>
              </div>
              <button className="mt-2 w-full bg-primary text-white py-1 rounded text-sm hover:bg-primary/90 transition-colors">
                Select This Location
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;
