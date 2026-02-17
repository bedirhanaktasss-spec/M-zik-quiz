// 1. AYARLAR - Kendi bilgilerini buraya sabitledim
const CLIENT_ID = 'a1365b21350f4b709887d1b0ffcbdaa5'; 
const REDIRECT_URI = 'https://m-zik-quiz.vercel.app'; 
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = "user-read-private";

// 2. SAYFA YÜKLENDİĞİNDE ÇALIŞACAK KISIM
window.onload = () => {
    const loginBtn = document.getElementById('login-btn');
    
    // URL'de token var mı kontrol et (Spotify'dan dönüşte burası çalışır)
    const hash = window.location.hash;
    let token = window.localStorage.getItem('token');

    if (!token && hash) {
        const params = new URLSearchParams(hash.substring(1));
        token = params.get("access_token");
        if (token) {
            window.localStorage.setItem('token', token);
            window.location.hash = "";
        }
    }

    // Eğer token varsa ekranı değiştir
    if (token) {
        const loginScreen = document.getElementById('login-screen');
        const gameScreen = document.getElementById('game-screen');
        if (loginScreen) loginScreen.style.display = 'none';
        if (gameScreen) gameScreen.style.display = 'block';
        console.log("Giriş başarılı!");
    }

    // Buton tıklama olayı
    if (loginBtn) {
        loginBtn.onclick = (e) => {
            e.preventDefault(); // Sayfanın kendi kendine yenilenmesini engeller
            const loginUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(SCOPES)}`;
            window.location.href = loginUrl;
        };
    }
};
