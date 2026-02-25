const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;

// Endpoints oficiales de Spotify
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const API_ENDPOINT = "https://api.spotify.com/v1"; // Endpoint base para extraer datos
const SCOPES = ["user-top-read"];

// Genera una cadena aleatoria para la seguridad inicial
const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = window.crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

// Cifra la cadena usando el algoritmo SHA-256
const sha256 = async (plain) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
};

// Convierte el resultado cifrado a Base64URL
const base64encode = (input) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

// 1. Redirige al usuario a Spotify pidiendo un código
export const redirectToAuthCodeFlow = async () => {
  const codeVerifier = generateRandomString(64);
  window.localStorage.setItem('spotify_code_verifier', codeVerifier);
  
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(" "),
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });

  window.location.href = `${AUTH_ENDPOINT}?${params.toString()}`;
};

// 2. Intercambia el código devuelto por un Token de Acceso
export const getAccessToken = async (code) => {
  const verifier = window.localStorage.getItem("spotify_code_verifier");

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
  });

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("⚠️ DETALLE DEL ERROR DE SPOTIFY:", errorData);
    throw new Error(`HTTP error! status: ${response.status} - Motivo: ${errorData.error_description}`);
  }

  const data = await response.json();
  return data.access_token;
};

// 3. NUEVO: Función para extraer los artistas más escuchados
export const getTopArtists = async (token) => {
  const response = await fetch(`${API_ENDPOINT}/me/top/artists?limit=5`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Error al obtener artistas: ${response.status}`);
  }

  return await response.json();
};