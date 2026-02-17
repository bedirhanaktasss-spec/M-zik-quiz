// --- 1. AYARLAR ---
const CLIENT_ID = 'a1365b21350f4b709887d1b0ffcbdaa5';
const REDIRECT_URI = 'https://m-zik-quiz.vercel.app';
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";

// --- 2. OYUN VERİLERİ (Daha fazla şarkı ekleyebilirsin) ---
const trackPool = [
    { name: "10MG", artist: "Motive", id: "0v0oV9h6jO0pI4B4y8mX8D" },
    { name: "Arasan Da", artist: "Uzi", id: "2S6p6DqF6UQY5WfW" },
    { name: "Doğuştan Beri", artist: "Lvbel C5", id: "5pXkP6XN3z" },
    { name: "İmdat", artist: "Çakal", id: "466Xn3p" },
    { name: "Geceler", artist: "Ezhel", id: "4H4p2Y5v0" }
];

let token = window.localStorage.getItem('token');
let currentAudio = new Audio();
let score = 0;
let currentTrack = null;

// --- 3. GİRİŞ VE SAYFA YÜKLENME MANTIĞI ---
window.onload = () => {
    const hash = window.location.hash;
    if (!token && hash) {
        token = hash.substring(1).split('&').find(elem => elem.startsWith('access_token')).split('=')[1];
        window.localStorage.setItem('token', token);
        window.location.hash = "";
    }

    if (token) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';
        nextQuestion(); // Oyunu başlat
    }

    document.getElementById('login-btn').onclick = () => {
        window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=user-read-private`;
    };
};

// --- 4. OYUN FONKSİYONLARI ---

async function nextQuestion() {
    // Rastgele bir şarkı seç
    currentTrack = trackPool[Math.floor(Math.random() * trackPool.length)];
    
    // Spotify'dan şarkı bilgisini çek (Önizleme URL'si için)
    try {
        const response = await fetch(`https://api.spotify.com/v1/tracks/${currentTrack.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.preview_url) {
            currentAudio.src = data.preview_url;
            currentAudio.play();
            setupOptions(); // Şıkları hazırla
        } else {
            console.log("Önizleme yok, başka şarkıya geçiliyor...");
            nextQuestion();
        }
    } catch (err) {
        console.error("Hata:", err);
    }
}

function setupOptions() {
    const optionsContainer = document.getElementById('options-container');
    if (!optionsContainer) return;

    optionsContainer.innerHTML = ""; // Eski şıkları temizle
    
    // Şıkları karıştır (Doğru cevap + 2 rastgele yanlış cevap)
    let options = [currentTrack];
    while (options.length < 3) {
        let randomWrong = trackPool[Math.floor(Math.random() * trackPool.length)];
        if (!options.includes(randomWrong)) {
            options.push(randomWrong);
        }
    }
    options.sort(() => Math.random() - 0.5); // Şıkları karıştır

    options.forEach(track => {
        const btn = document.createElement('button');
        btn.innerText = `${track.name} - ${track.artist}`;
        btn.className = "option-btn";
        btn.onclick = () => checkAnswer(track.id);
        optionsContainer.appendChild(btn);
    });
}

function checkAnswer(selectedId) {
    currentAudio.pause();
    if (selectedId === currentTrack.id) {
        score += 10;
        alert("Doğru! Puan: " + score);
    } else {
        alert("Yanlış! Doğru cevap: " + currentTrack.name);
    }
    nextQuestion();
}
