const CLIENT_ID = 'a1365b21350f4b709887d1b0ffcbdaa5';
const REDIRECT_URI = 'https://m-zik-quiz.vercel.app'; 
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";

// 1. SAYFA YÜKLENDİĞİNDE ANAHTARI YAKALA
window.onload = () => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem('token');

    // URL'de "access_token" var mı bak (Spotify'dan yeni döndüysen burası çalışır)
    if (hash && hash.includes("access_token")) {
        token = hash.substring(1).split('&').find(elem => elem.startsWith('access_token')).split('=')[1];
        window.localStorage.setItem('token', token); // Anahtarı hafızaya al
        window.location.hash = ""; // URL'deki kalabalığı temizle
    }

    // 2. EKRAN KONTROLÜ
    if (token) {
        // Eğer anahtar varsa giriş ekranını gizle, oyun ekranını aç
        const loginScreen = document.getElementById('login-screen');
        const gameScreen = document.getElementById('game-screen');
        
        if (loginScreen) loginScreen.style.display = 'none';
        if (gameScreen) gameScreen.style.display = 'block';
        
        console.log("Giriş başarılı! Anahtar:", token);
    }

    // 3. BUTONA TIKLAMA (Giriş Yapma)
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.onclick = () => {
            window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=user-read-private`;
        };
    }
};
