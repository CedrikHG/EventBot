import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

// Inyectamos el token de las variables de entorno
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MapboxViewer = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    // Si el mapa ya se inicializó, no hacemos nada
    if (map.current) return; 

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Tema oscuro de Mapbox
      center: [-100.3899, 20.5888], // Coordenadas de Santiago de Querétaro
      zoom: 12
    });

    // Controles de zoom y rotación
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
  }, []);

  return (
    <div 
      ref={mapContainer} 
      style={{ width: '100%', height: '100%', borderRadius: '4px' }} 
    />
  );
};

export default MapboxViewer;