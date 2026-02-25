import React, { useState, useEffect } from 'react';
import { getCookie, setCookie } from '../utils/cookies';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Revisamos si el usuario ya aceptó las cookies previamente
    const consent = getCookie('cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    // Guardamos el consentimiento por 1 año
    setCookie('cookie_consent', 'true', 24 * 365);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner">
      <p>Utilizamos cookies para mantener tu sesión de Spotify activa y mejorar tu experiencia.</p>
      <button className="btn-primary" onClick={acceptCookies}>
        Aceptar Cookies
      </button>
    </div>
  );
};

export default CookieBanner;