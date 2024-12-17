import React, { useState, useEffect } from 'react';
import './App.css';
import Map from './Map';

function App() {
  const [stations, setStations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [filterType, setFilterType] = useState('bikes'); // Par défaut, le filtre est sur vélos
  const [minAvailable, setMinAvailable] = useState(2);
  const [showFavorites, setShowFavorites] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  

  useEffect(() => {
    async function fetchStations() {
      try {
        const stationInfoResponse = await fetch('https://transport.data.gouv.fr/gbfs/lyon/station_information.json');
        const stationInfoData = await stationInfoResponse.json();

        const stationStatusResponse = await fetch('https://transport.data.gouv.fr/gbfs/lyon/station_status.json');
        const stationStatusData = await stationStatusResponse.json();

        const combinedData = stationInfoData.data.stations.map(station => {
          const status = stationStatusData.data.stations.find(s => s.station_id === station.station_id);
          return { ...station, ...status };
        });

        setStations(combinedData);
      } catch (error) {
        console.error("Erreur lors de la récupération des données des stations : ", error);
      }
    }

    fetchStations();
    navigator.geolocation.getCurrentPosition(position => {
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    }, err => {
      console.error(err);
      setUserLocation(null);
    });

    // Charger les favoris depuis le localStorage lors du chargement de l'application
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  const toggleFavorite = (stationId) => {
    setFavorites(prevFavorites => {
      if (prevFavorites.includes(stationId)) {
        return prevFavorites.filter(id => id !== stationId);
      } else {
        return [...prevFavorites, stationId];
      }
    });

    // Sauvegarder les favoris dans le localStorage
    localStorage.setItem('favorites', JSON.stringify([...favorites, stationId]));
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleMinAvailableChange = (event) => {
    setMinAvailable(Number(event.target.value));
  };

  const handleFilterTypeChange = (event) => {
    setFilterType(event.target.value);
  };

  const toggleShowFavorites = () => {
    setShowFavorites(prevShowFavorites => !prevShowFavorites);
  };

  const filteredStations = stations.filter(station => {
    const isFavorite = favorites.includes(station.station_id);
    const isStationNameMatch = station.name.toLowerCase().includes(searchTerm.toLowerCase());
    const meetsMinAvailable = filterType === 'bikes'
      ? station.num_bikes_available >= minAvailable
      : station.num_docks_available >= minAvailable;

    if (showFavorites) {
      return isFavorite;
    } else {
      return isStationNameMatch && meetsMinAvailable;
    }
  });

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <button className="toggle-dark-mode" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? 'Mode Clair' : 'Mode Sombre'}
      </button>
      <header className="App-header">
        <h1>Vélo'v</h1>
        <div className="controls">
          <div className="filters">
            <select value={filterType} onChange={handleFilterTypeChange}>
              <option value="bikes">Vélos disponibles</option>
              <option value="docks">Docks disponibles</option>
            </select>
            <input
              type="number"
              min="0"
              value={minAvailable}
              onChange={handleMinAvailableChange}
              placeholder={`Minimum de ${filterType === 'bikes' ? 'vélos' : 'docks'} disponibles`}
            />
            <button onClick={toggleShowFavorites}>
              {showFavorites ? 'Masquer les stations favorites' : 'Afficher les stations favorites'}
            </button>
          </div>
          <div className="search-bar">
            <input 
              type="text"
              placeholder="Rechercher une station"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <Map stations={filteredStations} userLocation={userLocation}  toggleFavorite={toggleFavorite} favorites={favorites} />
      </header>
      <div className="favorites-dashboard">
        <h2>Stations Favorites</h2>
        <ul>
          {stations.filter(station => favorites.includes(station.station_id)).map(station => (
            <li key={station.station_id}>
              {station.name} - Vélos disponibles: {station.num_bikes_available} 
              <button onClick={() => toggleFavorite(station.station_id)}>Retirer</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
