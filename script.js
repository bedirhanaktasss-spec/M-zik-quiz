const CLIENT_ID = 'a1365b21350f4b709887d1b0ffcbdaa5';
const REDIRECT_URI = 'https://m-zik-quiz.vercel.app';
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";

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

window.onload = () => {
    const hash = window.location.hash;
    
    // 1. URL'den token gelmiş mi yakala
    if (hash && hash.includes("access_token")) {
        token = hash.substring(1).split('&').find(elem => elem.startsWith('access_token')).split('=')[1];
        window.localStorage.setItem('token', token);
        window.location.hash = "";
    }

    // 2. OTOMATİK YÖNLENDİRME VEYA OYUN BAŞLATMA
    if (!token) {
        // Eğer giriş yoksa "tıkla" demesini bekleme, direkt Spotify'a gönder!
        window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=user-read-private`;
    } else {
        // Giriş varsa arayüzü aç ve oyunu başlat
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';
        nextQuestion();
    }
};

async function nextQuestion() {
    currentTrack = trackPool[Math.floor(Math.random() * trackPool.length)];
    try {
        const res = await fetch(`https://api.spotify.com/v1/tracks/${currentTrack.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.preview_url) {
            currentAudio.src = data.preview_url;
            currentAudio.play();
            renderGame();
        } else { nextQuestion(); }
    } catch (e) { 
        window.localStorage.removeItem('token');
        location.reload(); 
    }
}

function renderGame() {
    const container = document.getElementById('options-container');
    container.innerHTML = "";
    let options = [currentTrack];
    while(options.length < 3) {
        let r = trackPool[Math.floor(Math.random() * trackPool.length)];
        if(!options.find(o => o.id === r.id)) options.push(r);
    }
    options.sort(() => Math.random() - 0.5);

    options.forEach(t => {
        const b = document.createElement('button');
        b.innerText = `${t.name} - ${t.artist}`;
        b.className = "option-btn";
        b.onclick = () => {
            currentAudio.pause();
            if(t.id === currentTrack.id) {
                score += 10;
                document.getElementById('score').innerText = score;
            }
            setTimeout(nextQuestion, 800);
        };
        container.appendChild(b);
    });
}
