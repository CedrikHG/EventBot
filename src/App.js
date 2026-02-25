import React, { useEffect, useState, useRef } from 'react';
import './index.css';
import MapboxViewer from './components/MapboxViewer';
import CookieBanner from './components/CookieBanner';
import { redirectToAuthCodeFlow, getAccessToken, getTopArtists } from './utils/spotify';
import { getCookie, setCookie, eraseCookie } from './utils/cookies';
import { supabase } from './utils/supabaseClient';
import { sendTelegramMessage } from './utils/telegram'; // Importamos la función de Telegram

function App() {
  const [spotifyToken, setSpotifyToken] = useState("");
  const [topArtists, setTopArtists] = useState([]);
  const [dbStatus, setDbStatus] = useState("🔴 Desconectado de Supabase");
  const [chatId, setChatId] = useState(""); // Estado para el Chat ID
  const [telegramStatus, setTelegramStatus] = useState(""); // Estado visual del envío
  const hasFetchedToken = useRef(false);

  // Efecto 1: Autenticación de Spotify
  useEffect(() => {
    const savedToken = getCookie('spotify_access_token');
    
    if (savedToken) {
      setSpotifyToken(savedToken);
      return; 
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code && !hasFetchedToken.current) {
      hasFetchedToken.current = true; 
      
      getAccessToken(code).then((token) => {
        if (token) {
          setSpotifyToken(token);
          setCookie('spotify_access_token', token, 1);
          window.history.replaceState({}, document.title, "/");
        }
      }).catch(err => {
        console.error("Error al obtener token:", err);
        hasFetchedToken.current = false; 
      });
    }
  }, []);

  // Efecto 2: Extracción de artistas y guardado en Supabase
  useEffect(() => {
    if (spotifyToken) {
      getTopArtists(spotifyToken)
        .then(async (data) => {
          if (data && data.items) {
            setTopArtists(data.items);
            
            setDbStatus("🟡 Sincronizando datos...");
            const { error } = await supabase
              .from('user_config')
              .insert([
                { top_artists: data.items }
              ]);

            if (error) {
              console.error("Error de Supabase:", error);
              setDbStatus("🔴 Error al guardar en Supabase");
            } else {
              setDbStatus("🟢 Sincronizado con Supabase");
            }
          }
        })
        .catch(err => console.error(err));
    } else {
      setTopArtists([]);
      setDbStatus("🔴 Desconectado de Supabase");
    }
  }, [spotifyToken]);

  const handleLogin = async () => {
    await redirectToAuthCodeFlow();
  };

  const handleLogout = () => {
    setSpotifyToken("");
    eraseCookie('spotify_access_token'); 
    window.localStorage.removeItem('spotify_code_verifier');
  };

  // Función para probar el bot de Telegram
  const handleTestBot = async () => {
    if (!chatId) {
      setTelegramStatus("⚠️ Ingresa un Chat ID primero");
      return;
    }

    setTelegramStatus("⏳ Enviando mensaje...");
    
    // Armamos un mensaje dinámico con los datos de Spotify
    const artistNames = topArtists.map(a => `• ${a.name}`).join('\n');
    const message = `🎸 <b>EventBot Panel Activado</b>\n\nTu radar de eventos para la zona de <b>Santiago de Querétaro</b> está en línea.\n\nArtistas en monitoreo:\n${artistNames || '<i>No hay artistas cargados aún.</i>'}`;

    try {
      await sendTelegramMessage(chatId, message);
      setTelegramStatus("✅ Mensaje enviado con éxito");
      
      // Opcional: Actualizar el registro en Supabase con el chatId
      await supabase.from('user_config').insert([{ telegram_chat_id: chatId }]);
      
    } catch (error) {
      console.error(error);
      setTelegramStatus("❌ Error al enviar. Verifica tu ID y Token.");
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>EventBot Panel</h1>
        <p style={{ color: 'var(--text-muted)' }}>Panel de control para automatización de eventos y música.</p>
      </header>

      <main className="dashboard-grid">
        {/* Panel 1: Autenticación y Top Artists */}
        <div className="panel">
          <h2>Tu Perfil de Spotify</h2>
          {!spotifyToken ? (
            <>
              <p>Vincula tu cuenta para extraer tus Top Artists.</p>
              <button className="btn-primary" onClick={handleLogin}>Conectar con Spotify</button>
            </>
          ) : (
            <div>
              <p style={{ color: 'var(--accent-color)', fontWeight: 'bold', marginBottom: '1rem' }}>✓ Conectado exitosamente</p>
              
              {topArtists.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0 }}>Tus artistas principales:</h3>
                  {topArtists.map(artist => (
                    <div key={artist.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#333', padding: '8px', borderRadius: '6px' }}>
                      {artist.images.length > 0 && (
                        <img 
                          src={artist.images[0].url} 
                          alt={artist.name} 
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      )}
                      <span style={{ fontWeight: '500' }}>{artist.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Cargando tus artistas...</p>
              )}

              <button 
                className="btn-primary" 
                style={{ backgroundColor: '#e53e3e', width: '100%' }} 
                onClick={handleLogout}
              >
                Desconectar
              </button>
            </div>
          )}
        </div>

        {/* Panel 2: Mapa de Mapbox */}
        <div className="panel" style={{ gridColumn: '1 / -1', height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h2>Zona de Cobertura</h2>
          <p>Navega desde Santiago de Querétaro al área geográfica deseada para buscar eventos.</p>
          <div style={{ flex: 1, marginTop: '1rem', position: 'relative' }}>
            <MapboxViewer />
          </div>
        </div>

        {/* Panel 3: Configuración del Bot de Telegram */}
        <div className="panel">
          <h2>Notificaciones Telegram</h2>
          <p>Configura el bot para recibir las alertas en tu muro interactivo o chat personal.</p>
          <input 
            type="text" 
            placeholder="Ingresa tu Chat ID de Telegram" 
            className="input-dark"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
          />
          <button 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '1rem', backgroundColor: '#0088cc' }}
            onClick={handleTestBot}
          >
            Vincular y Probar Bot
          </button>
          {telegramStatus && (
            <p style={{ marginTop: '1rem', fontWeight: 'bold', textAlign: 'center' }}>
              {telegramStatus}
            </p>
          )}
        </div>

        {/* Panel 4: Estado de Supabase */}
        <div className="panel">
          <h2>Estado del Sistema</h2>
          <p>Sincronización de tu perfil y preferencias.</p>
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            backgroundColor: '#121212', 
            borderRadius: '4px',
            borderLeft: dbStatus.includes("🟢") ? '4px solid var(--accent-color)' : '4px solid #e53e3e'
          }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{dbStatus}</p>
          </div>
        </div>
      </main>

      <CookieBanner />
    </div>
  );
}

export default App;