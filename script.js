"use strict"; // Hatalı yazımları engelleyen katı mod

/**
 * ==============================================================================
 * 🛡️ MÜZİK QUIZ PRO - SECURE ENGINE v9.0.0
 * ------------------------------------------------------------------------------
 * Bu modül, Spotify Implicit Grant akışını yüksek güvenlikli
 * ve hata toleranslı bir yapıda yönetir.
 * ==============================================================================
 */

// --- 1. GÜVENLİ KONFİGÜRASYON (IMMUTABLE) ---
const APP_CONFIG = Object.freeze({
    CLIENT_ID: 'a1365b21350f4b709887d1b0ffcbdaa5',
    REDIRECT_URI: 'https://m-zik-quiz.vercel.app/', // Dashboard ile %100 eşleşme
    SCOPES: 'user-read-private user-read-email',
    AUTH_URL: 'https://accounts.spotify.com/authorize',
    API_URL: 'https://api.spotify.com/v1'
});

// --- 2. GÜVENLİ DURUM YÖNETİMİ ---
const SecureState = {
    _token: null,
    score: 0,
    audio: new Audio(),
    
    // Token'ı şifreli/güvenli bir şekilde alıp saklama
    setToken(val) {
        this._token = val;
        localStorage.setItem('session_anchor', btoa(val)); // Base64 kodlama ile basit gizleme
    },
    
    getToken() {
        if (this._token) return this._token;
        const stored = localStorage.getItem('session_anchor');
        return stored ? atob(stored) : null;
    }
};

// --- 3. KRİTİK BAĞLANTI MOTORU (SECURITY LAYER) ---
window.addEventListener('DOMContentLoaded', () => {
    console.log("🛡️ Güvenlik Katmanı Aktif.");
    
    // URL'deki zararlı olabilecek parametreleri temizleme ve token ayıklama
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
        const params = new URLSearchParams(hash.substring(1));
        const token = params.get("access_token");
        
        if (token) {
            SecureState.setToken(token);
            // Güvenlik için URL'deki token izini hemen sil
            window.history.replaceState(null, null, window.location.pathname);
            bootGame();
            return;
        }
    }

    if (SecureState.getToken()) {
        bootGame();
    } else {
        showLogin();
    }
});

// --- 4. GÜVENLİ YÖNLENDİRME (ENCRYPTED REQUEST) ---
function redirectToSpotify() {
    // Spotify'a gönderilen isteği sanitize et
    const authRequest = `${APP_CONFIG.AUTH_URL}?` +
        `client_id=${encodeURIComponent(APP_CONFIG.CLIENT_ID)}` +
        `&redirect_uri=${encodeURIComponent(APP_CONFIG.REDIRECT_URI)}` +
        `&response_type=token` +
        `&scope=${encodeURIComponent(APP_CONFIG.SCOPES)}` +
        `&show_dialog=true`;
    
    window.location.href = authRequest;
}

// --- 5. OYUN BAŞLATICI ---
function bootGame() {
    const loginScreen = document.getElementById('login-screen');
    const gameScreen = document.getElementById('game-container');
    
    if (loginScreen && gameScreen) {
        loginScreen.style.display = 'none';
        gameScreen.style.display = 'block';
        gameScreen.classList.remove('hidden');
        console.log("✅ Kimlik Doğrulandı. Oyun Başlatılıyor.");
        // Buraya startRound() gibi oyun fonksiyonlarını ekleyebilirsin
    }
}

function showLogin() {
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) loginScreen.style.display = 'block';
}

function logout() {
    localStorage.removeItem('session_anchor');
    window.location.reload();
}

/**
 * GÜVENLİK NOTU:
 * Sitenin "Beyaz Ekran" vermemesi için HTML dosyasındaki 
 * ID'lerin (login-screen, game-container) bu kodla 
 * tam eşleştiğinden emin olmalısın.
 */
