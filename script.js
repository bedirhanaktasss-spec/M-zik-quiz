// --- 1. SPOTIFY AYARLARI ---
const CLIENT_ID = 'a1365b21350f4b709887d1b0ffcbdaa5'; 
const REDIRECT_URI = 'https://m-zik-quiz.vercel.app/'; // Buraya tam linki yazdım
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = "user-read-private";

// --- 2. OYUN VERİLERİ ---
const trackPool = [
    { name: "10MG", artist: "Motive", id: "0v0oV9h6jO0pI4B4y8mX8D" },
    { name: "Arasan Da", artist: "Uzi", id: "2S6p6DqF6UQY5WfW" },
    { name: "Doğuştan Beri", artist: "Lvbel C5", id: "5pXkP6XN3z" }
];

let token = window.localStorage.getItem('token');
let currentAudio = new Audio();

// --- 3. TOKEN KONTROLÜ ---
const hash = window.location.hash;
if (!token && hash) {
    token = hash.substring(1).split('&').find(elem => elem.startsWith('access_token')).split('=')[1];
    window.location.hash = "";
    window.localStorage.setItem('token', token);
}

// --- 4. SAYFA YÜKLENDİĞİNDE ---
window.onload = () => {
    const loginScreen = document.getElementById('login-screen');
    const gameScreen = document.getElementById('game-screen');

    if (token) {
        if (loginScreen) loginScreen.style.display = 'none';
        if (gameScreen) gameScreen.style.display = 'block';
        nextQuestion();
    }
};

// Buton Fonksiyonu
document.getElementById('login-btn').onclick = () => {
    window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(SCOPES)}`;
};

async function nextQuestion() {
    // Şarkı çalma mantığı buraya gelecek
    console.log("Oyun başladı, şarkı yükleniyor...");
}
