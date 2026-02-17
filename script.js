"use strict";

const APP_CONFIG = Object.freeze({
    CLIENT_ID: 'a1365b21350f4b709887d1b0ffcbdaa5',
    REDIRECT_URI: 'https://m-zik-quiz.vercel.app/',
    AUTH_URL: 'https://accounts.spotify.com/authorize'
});

window.onload = function() {
    const hash = window.location.hash;
    
    if (hash && hash.includes("access_token")) {
        const params = new URLSearchParams(hash.substring(1));
        const token = params.get("access_token");
        if (token) {
            localStorage.setItem('spotify_token', token);
            window.history.replaceState(null, null, ' '); // URL'yi temizle
            showGame();
            return;
        }
    }

    if (localStorage.getItem('spotify_token')) {
        showGame();
    }
};

function redirectToSpotify() {
    const url = `${APP_CONFIG.AUTH_URL}?client_id=${APP_CONFIG.CLIENT_ID}&redirect_uri=${encodeURIComponent(APP_CONFIG.REDIRECT_URI)}&response_type=token&show_dialog=true`;
    window.location.href = url;
}

function showGame() {
    // HTML'deki ID'leri tam burada eşliyoruz
    const login = document.getElementById('login-screen');
    const game = document.getElementById('game-container');
    
    if (login && game) {
        login.style.display = 'none';
        game.style.display = 'block';
        game.classList.remove('hidden');
        console.log("🛡️ Sistem Güvenli: Oyun Başlatıldı.");
    }
}

function logout() {
    localStorage.removeItem('spotify_token');
    window.location.reload();
}
