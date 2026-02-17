// --- 1. AYARLAR ---
const CLIENT_ID = 'a1365b21350f4b709887d1b0ffcbdaa5';
const REDIRECT_URI = 'https://m-zik-quiz.vercel.app';
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";

// --- 2. ŞARKI HAVUZU (Spotify ID'leri) ---
const trackPool = [
    { name: "10MG", artist: "Motive", id: "0v0oV9h6jO0pI4B4y8mX8D" },
    { name: "Arasan Da", artist: "Uzi", id: "2S6p6DqF6UQY5WfW" },
    { name: "Doğuştan Beri", artist: "Lvbel C5", id: "5pXkP6XN3z" },
    { name: "İmdat", artist: "Çakal", id: "466Xn3p" },
    { name: "Geceler", artist: "Ezhel", id: "4H4p2Y5v0" },
    { name: "Bilmem mi", artist: "Sefo", id: "5YpXkP6X" }
];

let token = window.localStorage.getItem('token');
let currentAudio = new Audio();
let score = 0;
let currentTrack = null;

// --- 3. GİRİŞ VE BAŞLATMA ---
window.onload = () => {
    const hash = window.location.hash;
    
    // URL'den token yakalama
    if (!token && hash) {
        const params = new URLSearchParams(hash.substring(1));
        token = params.get("access_token");
        if (token) {
            window.localStorage.setItem('token', token);
            window.location.hash = "";
        }
    }

    if (token) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';
        nextQuestion();
    }

    document.getElementById('login-btn').onclick = () => {
        const url = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=user-read-private`;
        window.location.href = url;
    };
};

// --- 4. OYUN MANTIĞI ---
async function nextQuestion() {
    const feedback = document.getElementById('feedback');
    if(feedback) feedback.innerText = "";

    // Rastgele şarkı seç
    currentTrack = trackPool[Math.floor(Math.random() * trackPool.length)];
    
    try {
        const response = await fetch(`https://api.spotify.com/v1/tracks/${currentTrack.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.preview_url) {
            currentAudio.src = data.preview_url;
            currentAudio.play();
            renderOptions();
        } else {
            nextQuestion(); // Önizleme yoksa diğerine geç
        }
    } catch (err) {
        console.error("Spotify hatası:", err);
    }
}

function renderOptions() {
    const container = document.getElementById('options-container');
    container.innerHTML = "";

    // 1 doğru, 2 yanlış şık hazırla
    let options = [currentTrack];
    while (options.length < 3) {
        let random = trackPool[Math.floor(Math.random() * trackPool.length)];
        if (!options.find(o => o.id === random.id)) options.push(random);
    }
    options.sort(() => Math.random() - 0.5);

    options.forEach(track => {
        const btn = document.createElement('button');
        btn.innerText = `${track.name} - ${track.artist}`;
        btn.className = "option-btn";
        btn.onclick = () => checkAnswer(track.id);
        container.appendChild(btn);
    });
}

function checkAnswer(id) {
    currentAudio.pause();
    const feedback = document.getElementById('feedback');
    
    if (id === currentTrack.id) {
        score += 10;
        document.getElementById('score').innerText = score;
        feedback.innerText = "✅ DOĞRU!";
        feedback.style.color = "#1DB954";
    } else {
        feedback.innerText = "❌ YANLIŞ!";
        feedback.style.color = "#ff4d4d";
    }

    setTimeout(nextQuestion, 1500); // 1.5 saniye sonra yeni soru
}
