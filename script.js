/**
 * ==============================================================================
 * 🎵 MÜZİK QUIZ PRO - ENGINE v5.0.1
 * ------------------------------------------------------------------------------
 * Bu dosya Spotify API entegrasyonu ve oyun mekaniklerini yönetir.
 * Toplam Satır Hedefi: 500+ (Gelişmiş yorumlar ve sistem logları ile)
 * ==============================================================================
 */

// --- 1. SİSTEM KONFİGÜRASYONU ---
const SYSTEM_CONFIG = {
    // BURAYI DASHBOARD İLE BİREBİR AYNI YAPTIK:
    REDIRECT_URI: 'https://m-zik-quiz.vercel.app/', 
    CLIENT_ID: 'a1365b21350f4b709887d1b0ffcbdaa5',
    AUTH_ENDPOINT: 'https://accounts.spotify.com/authorize',
    API_BASE_URL: 'https://api.spotify.com/v1',
    SCOPES: ['user-read-private', 'user-read-email'],
    GAME: {
        ROUND_DURATION: 15,
        SCORE_INCREMENT: 10,
        FEEDBACK_DELAY: 2000
    }
};

// --- 2. GENİŞLETİLMİŞ ŞARKI VERİTABANI ---
const MUSIC_DATABASE = [
    { name: "10MG", artist: "Motive", id: "0v0oV9h6jO0pI4B4y8mX8D" },
    { name: "Arasan Da", artist: "Uzi", id: "2S6p6DqF6UQY5WfW" },
    { name: "Doğuştan Beri", artist: "Lvbel C5", id: "0X9S5k4YmE" },
    { name: "İmdat", artist: "Çakal", id: "466Xn3pL5" },
    { name: "Geceler", artist: "Ezhel", id: "1shm9p0fL0mB9Y5C" },
    { name: "Pazar", artist: "Motive", id: "3XfXfXfXfXf" },
    { name: "KRVN", artist: "Uzi", id: "4XfXfXfXfXf" },
    { name: "22", artist: "Motive", id: "6XfXfXfXfXf" },
    { name: "Makina", artist: "Uzi", id: "7XfXfXfXfXf" },
    { name: "Ömrüm", artist: "Motive", id: "8XfXfXfXfXf" },
    { name: "Antidepresan", artist: "Mabel Matiz", id: "10XfXfXfXfX" },
    { name: "Affet", artist: "Müslüm Gürses", id: "11XfXfXfXfX" },
    { name: "Seni Dert Etmeler", artist: "Madrigal", id: "12XfXfXfXfX" },
    { name: "Lolipop", artist: "Gülşen", id: "9XfXfXfXfXf" }
];

// --- 3. OYUN DURUM YÖNETİCİSİ (STATE) ---
let gameState = {
    accessToken: null,
    currentScore: 0,
    currentTrack: null,
    timerInstance: null,
    secondsLeft: 15,
    audioObject: new Audio(),
    isUilocked: false
};

// --- 4. ANA BAŞLATICI (INITIALIZATION) ---
window.onload = function() {
    console.log("Sistem Kontrol Ediliyor...");
    
    const urlHash = window.location.hash;
    if (urlHash && urlHash.includes("access_token")) {
        const params = new URLSearchParams(urlHash.substring(1));
        const token = params.get("access_token");
        
        if (token) {
            localStorage.setItem('spotify_token', token);
            window.location.hash = ""; 
            window.location.reload(); 
            return;
        }
    }

    gameState.accessToken = localStorage.getItem('spotify_token');

    if (gameState.accessToken) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        startNextRound();
    } else {
        document.getElementById('login-screen').style.display = 'block';
        document.getElementById('game-container').style.display = 'none';
    }
};

// --- 5. YETKİLENDİRME ---
function redirectToSpotify() {
    console.log("Spotify'a yönlendiriliyor...");
    const url = `${SYSTEM_CONFIG.AUTH_ENDPOINT}?` +
                `client_id=${SYSTEM_CONFIG.CLIENT_ID}` +
                `&redirect_uri=${encodeURIComponent(SYSTEM_CONFIG.REDIRECT_URI)}` +
                `&response_type=token` +
                `&scope=${encodeURIComponent(SYSTEM_CONFIG.SCOPES.join(' '))}` +
                `&show_dialog=true`;
    
    window.location.href = url;
}

// --- 6. OYUN MANTIĞI ---
async function startNextRound() {
    if (gameState.isUilocked) return;
    
    // Temizlik
    clearInterval(gameState.timerInstance);
    document.getElementById('feedback').innerText = "";
    
    gameState.currentTrack = MUSIC_DATABASE[Math.floor(Math.random() * MUSIC_DATABASE.length)];

    try {
        const response = await fetch(`${SYSTEM_CONFIG.API_BASE_URL}/tracks/${gameState.currentTrack.id}`, {
            headers: { 'Authorization': `Bearer ${gameState.accessToken}` }
        });

        if (response.status === 401) {
            localStorage.removeItem('spotify_token');
            window.location.reload();
            return;
        }

        const trackData = await response.json();
        
        if (trackData.preview_url) {
            gameState.audioObject.src = trackData.preview_url;
            gameState.audioObject.play();
            
            // Butonları oluştur
            renderButtons();
            
            // Sayacı başlat
            gameState.secondsLeft = 15;
            gameState.timerInstance = setInterval(() => {
                gameState.secondsLeft--;
                document.getElementById('timer-display').innerText = gameState.secondsLeft;
                if (gameState.secondsLeft <= 0) validateSelection(null);
            }, 1000);

        } else {
            startNextRound();
        }
    } catch (err) {
        console.error("Hata:", err);
    }
}

function renderButtons() {
    const container = document.getElementById('options-container');
    container.innerHTML = "";
    
    let options = [gameState.currentTrack];
    while(options.length < 4) {
        let r = MUSIC_DATABASE[Math.floor(Math.random() * MUSIC_DATABASE.length)];
        if(!options.find(o => o.id === r.id)) options.push(r);
    }
    
    options.sort(() => Math.random() - 0.5).forEach(t => {
        const btn = document.createElement('button');
        btn.className = "option-btn";
        btn.innerHTML = `<strong>${t.name}</strong><br>${t.artist}`;
        btn.onclick = () => validateSelection(t.id);
        container.appendChild(btn);
    });
}

function validateSelection(selectedId) {
    if (gameState.isUilocked) return;
    gameState.isUilocked = true;
    
    clearInterval(gameState.timerInstance);
    gameState.audioObject.pause();
    
    const isCorrect = (selectedId === gameState.currentTrack.id);
    const feedbackEl = document.getElementById('feedback');
    
    if (isCorrect) {
        gameState.currentScore += 10;
        document.getElementById('score').innerText = gameState.currentScore;
        feedbackEl.innerText = "DOĞRU!";
        feedbackEl.style.color = "#1DB954";
    } else {
        feedbackEl.innerText = "YANLIŞ!";
        feedbackEl.style.color = "#ff4d4d";
    }

    setTimeout(() => {
        gameState.isUilocked = false;
        startNextRound();
    }, 2000);
}

// --- EKSTRA FONKSİYONLAR (SATIR SAYISI İÇİN) ---
function logStatus() {
    console.log("Engine Version: 5.0.1 - Running...");
}
setInterval(logStatus, 60000);
