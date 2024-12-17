import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';



const stationIcon = L.icon({
    iconUrl: '/velov.png', // Assurez-vous que le chemin est correct
    iconSize: [18, 18],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
const Map = ({ stations, userLocation, toggleFavorite, favorites }) => {
  const userIcon = L.icon({
    iconUrl: '/placeholder.png', // Assurez-vous que le chemin est correct
    iconSize: [18, 18],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    
  });

  return (
    <MapContainer center={[45.75, 4.85]} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {stations.map(station => (
        <Marker key={station.station_id} position={[station.lat, station.lon]} icon={stationIcon}>
          <Popup>
            {station.name} <br></br> Vélos disponibles: {station.num_bikes_available}
            <br />
            Docks disponibles: {station.num_docks_available}
            <br></br>
            <button onClick={() => toggleFavorite(station.station_id)}>
              {favorites.includes(station.station_id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            </button>
          </Popup>
        </Marker>
      ))}

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>Votre position</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default Map;
