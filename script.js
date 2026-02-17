// --- 1. SPOTIFY AYARLARI ---
const CLIENT_ID = 'a1365b21350f4b709887d1b0ffcbdaa5'; 
const REDIRECT_URI = window.location.origin;
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = "user-read-private";

// --- 2. OYUN VERİLERİ (Şarkı Listesi) ---
const trackPool = [
    { name: "10MG", artist: "Motive", id: "0v0oV9h6jO0pI" },
    { name: "Arasan Da", artist: "Uzi", id: "2S6p6DqF6U" },
    { name: "Doğuştan Beri", artist: "Lvbel C5", id: "5pXk" },
    { name: "İmdat", artist: "Çakal", id: "466Xn3p" }
];

let token = window.localStorage.getItem('token');
let currentAudio = new Audio();

// --- 3. TOKEN YAKALAMA VE OTOMATİK GİRİŞ ---
const hash = window.location.hash;

if (!token && hash) {
    const params = new URLSearchParams(hash.substring(1));
    token = params.get("access_token");
    if (token) {
        window.location.hash = "";
        window.localStorage.setItem('token', token);
    }
}

// Sayfa yüklendiğinde durumu kontrol et
window.onload = () => {
    const loginBtn = document.getElementById('login-btn');
    const loginScreen = document.getElementById('login-screen');
    const gameScreen = document.getElementById('game-screen');

    if (token) {
        if (loginScreen) loginScreen.style.display = 'none';
        if (gameScreen) gameScreen.style.display = 'block';
        nextQuestion(); 
    }

    if (loginBtn) {
        loginBtn.onclick = () => {
            window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(SCOPES)}`;
        };
    }
};

// --- 4. OYUN FONKSİYONLARI ---
async function nextQuestion() {
    const randomTrack = trackPool[Math.floor(Math.random() * trackPool.length)];
    
    try {
        const response = await fetch(`https://api.spotify.com/v1/tracks/${randomTrack.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.preview_url) {
            currentAudio.src = data.preview_url;
            currentAudio.play();
        } else {
            console.error("Şarkı önizlemesi bulunamadı, sonrakine geçiliyor...");
            nextQuestion();
        }
    } catch (error) {
        console.error("Spotify API hatası:", error);
    }
}
