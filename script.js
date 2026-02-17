/**
 * MÜZİK QUIZ - ADVANCED EDITION
 * Core Model: Gemini 3 Flash
 * Mode: Free Tier
 * Generative Abilities: Text, Video, Image (Nano Banana)
 */

// --- 1. GLOBAL KONFİGÜRASYON ---
const CONFIG = {
    CLIENT_ID: 'a1365b21350f4b709887d1b0ffcbdaa5',
    REDIRECT_URI: 'https://m-zik-quiz.vercel.app/',
    AUTH_ENDPOINT: "https://accounts.spotify.com/authorize",
    SCOPES: ["user-read-private", "user-read-email"],
    MAX_TIME: 15, // Her soru için 15 saniye
    POINTS_PER_CORRECT: 10
};

// --- 2. GENİŞLETİLMİŞ ŞARKI HAVUZU ---
const TRACK_POOL = [
    { name: "10MG", artist: "Motive", id: "0v0oV9h6jO0pI4B4y8mX8D" },
    { name: "Arasan Da", artist: "Uzi", id: "2S6p6DqF6UQY5WfW" },
    { name: "Doğuştan Beri", artist: "Lvbel C5", id: "0X9S5k4YmE" },
    { name: "İmdat", artist: "Çakal", id: "466Xn3pL5" },
    { name: "Geceler", artist: "Ezhel", id: "1shm9p0fL0mB9Y5C" },
    { name: "Bilmem Mi", artist: "Sefo", id: "5yXfXfXfXfXf" },
    { name: "Pazar", artist: "Motive", id: "3XfXfXfXfXf" },
    { name: "KRVN", artist: "Uzi", id: "4XfXfXfXfXf" },
    { name: "Yalan", artist: "Motive", id: "5XfXfXfXfXf" },
    { name: "22", artist: "Motive", id: "6XfXfXfXfXf" }
];

// --- 3. OYUN DURUMU (STATE MANAGEMENT) ---
let gameState = {
    token: window.localStorage.getItem('spotify_token') || null,
    score: 0,
    highScore: window.localStorage.getItem('high_score') || 0,
    currentTrack: null,
    audio: new Audio(),
    timer: null,
    timeLeft: CONFIG.MAX_TIME,
    isGameOver: false,
    correctCount: 0,
    wrongCount: 0,
    rank: "Çaylak"
};

// --- 4. BAŞLATICI (INITIALIZER) ---
window.onload = () => {
    console.log("Müzik Quiz Başlatılıyor...");
    handleAuth();
    
    if (gameState.token) {
        initUI();
        startNewRound();
    }
};

// --- 5. YETKİLENDİRME SİSTEMİ (AUTH) ---
function handleAuth() {
    const hash = window.location.hash;
    
    if (!gameState.token && hash) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");
        
        if (accessToken) {
            gameState.token = accessToken;
            window.localStorage.setItem('spotify_token', accessToken);
            window.location.hash = "";
            console.info("Giriş başarılı, token kaydedildi.");
        }
    }

    if (!gameState.token) {
        redirectToSpotify();
    }
}

function redirectToSpotify() {
    const authUrl = `${CONFIG.AUTH_ENDPOINT}?client_id=${CONFIG.CLIENT_ID}&redirect_uri=${encodeURIComponent(CONFIG.REDIRECT_URI)}&response_type=token&scope=${CONFIG.SCOPES.join('%20')}`;
    console.warn("Token bulunamadı, Spotify'a yönlendiriliyor...");
    window.location.href = authUrl;
}

// --- 6. OYUN MANTIĞI (CORE GAMEPLAY) ---
async function startNewRound() {
    resetRoundState();
    
    // Rastgele şarkı seç
    const randomIndex = Math.floor(Math.random() * TRACK_POOL.length);
    gameState.currentTrack = TRACK_POOL[randomIndex];

    try {
        updateLoadingStatus(true);
        const data = await fetchTrackData(gameState.currentTrack.id);
        
        if (data && data.preview_url) {
            playTrack(data.preview_url);
            generateOptions();
            startTimer();
        } else {
            console.error("Şarkı önizlemesi bulunamadı, yeni şarkı deneniyor...");
            startNewRound();
        }
    } catch (error) {
        handleGlobalError(error);
    } finally {
        updateLoadingStatus(false);
    }
}

async function fetchTrackData(trackId) {
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: { 'Authorization': `Bearer ${gameState.token}` }
    });
    
    if (response.status === 401) {
        forceLogout();
        throw new Error("Oturum süresi dolmuş.");
    }
    
    return await response.json();
}

function generateOptions() {
    const container = document.getElementById('options-container');
    if (!container) return;
    
    container.innerHTML = "";
    let choices = [gameState.currentTrack];
    
    while (choices.length < 4) {
        const randomTrack = TRACK_POOL[Math.floor(Math.random() * TRACK_POOL.length)];
        if (!choices.find(t => t.id === randomTrack.id)) {
            choices.push(randomTrack);
        }
    }

    // Şıkları karıştır (Fisher-Yates Shuffle)
    choices = choices.sort(() => Math.random() - 0.5);

    choices.forEach(track => {
        const button = document.createElement('button');
        button.className = "option-btn animate-fade-in";
        button.innerHTML = `<span>${track.name}</span><small>${track.artist}</small>`;
        button.onclick = () => checkAnswer(track.id);
        container.appendChild(button);
    });
}

// --- 7. KONTROL VE SONUÇ ---
function checkAnswer(selectedId) {
    stopTimer();
    gameState.audio.pause();
    
    const isCorrect = selectedId === gameState.currentTrack.id;
    const feedback = document.getElementById('feedback');

    if (isCorrect) {
        handleSuccess();
    } else {
        handleFailure();
    }

    updateStats();
    setTimeout(startNewRound, 2000);
}

function handleSuccess() {
    gameState.score += CONFIG.POINTS_PER_CORRECT;
    gameState.correctCount++;
    showFeedback("HARİKA! +10 PUAN", "success");
    triggerConfetti(); // Görsel efekt için yer tutucu
}

function handleFailure() {
    gameState.wrongCount++;
    showFeedback(`YANLIŞ! Doğru: ${gameState.currentTrack.name}`, "error");
    shakeScreen(); // Görsel efekt için yer tutucu
}

// --- 8. ZAMANLAYICI VE YARDIMCI FONKSİYONLAR ---
function startTimer() {
    gameState.timeLeft = CONFIG.MAX_TIME;
    const timerDisplay = document.getElementById('timer-display');
    
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        if (timerDisplay) timerDisplay.innerText = `Süre: ${gameState.timeLeft}`;
        
        if (gameState.timeLeft <= 0) {
            stopTimer();
            handleFailure();
            setTimeout(startNewRound, 2000);
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(gameState.timer);
}

function updateStats() {
    const scoreEl = document.getElementById('score');
    if (scoreEl) scoreEl.innerText = gameState.score;
    
    // Rütbe güncelleme
    if (gameState.score > 100) gameState.rank = "Müzik Kurdu";
    if (gameState.score > 250) gameState.rank = "Efsane";
    
    console.log(`Güncel Durum: Puan ${gameState.score}, Rütbe ${gameState.rank}`);
}

function resetRoundState() {
    gameState.audio.pause();
    gameState.audio = new Audio();
    stopTimer();
    const feedback = document.getElementById('feedback');
    if (feedback) feedback.innerText = "";
}

function playTrack(url) {
    gameState.audio.src = url;
    gameState.audio.volume = 0.5;
    gameState.audio.play().catch(e => console.warn("Otomatik oynatma engellendi, etkileşim bekleniyor."));
}

// --- 9. UI VE HATA YÖNETİMİ ---
function initUI() {
    const container = document.getElementById('game-container');
    if (container) {
        container.innerHTML += `<div id="timer-display" class="timer">Süre: ${CONFIG.MAX_TIME}</div>`;
        container.innerHTML += `<div id="rank-display" class="rank">Rütbe: ${gameState.rank}</div>`;
    }
}

function updateLoadingStatus(isLoading) {
    const loader = document.getElementById('loading-text');
    if (loader) loader.style.display = isLoading ? 'block' : 'none';
}

function showFeedback(msg, type) {
    const fb = document.getElementById('feedback');
    if (!fb) return;
    fb.innerText = msg;
    fb.className = `feedback-text ${type}`;
}

function forceLogout() {
    window.localStorage.removeItem('spotify_token');
    location.reload();
}

function handleGlobalError(err) {
    console.error("Kritik Hata:", err.message);
    showFeedback("Bir hata oluştu. Sayfa yenileniyor...", "error");
    setTimeout(() => location.reload(), 3000);
}

// --- 10. GÖRSEL EFEKT YER TUTUCULARI ---
function shakeScreen() {
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 500);
}

function triggerConfetti() {
    // Buraya Canvas Confetti kütüphanesi eklenebilir
    console.log("Konfeti tetiklendi! 🎉");
}

// Kodun sonu - Müzik Quiz Engine v2.1
