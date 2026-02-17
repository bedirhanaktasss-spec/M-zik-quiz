// --- SPOTIFY AYARLARI ---
const CLIENT_ID = 'BURAYA_KENDI_CLIENT_ID_KODUNU_YAPISTIR'; 
const REDIRECT_URI = window.location.origin; 
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = "user-read-private";

// --- OYUN VERİLERİ (Örnek Track ID'ler) ---
const trackPool = [
    { name: "10MG", artist: "Motive", id: "0v0oV9h65O8N3uS78O6T5S" },
    { name: "Arasan Da", artist: "Uzi", id: "2S6p6Xn3pP8v7vM8y8Z9pQ" },
    { name: "Doğuştan Beri", artist: "Lvbel C5", id: "1YmRndR4G4rE9zM6iV8B2S" },
    { name: "İmdat", artist: "Çakal", id: "466Xn3pP8v7vM8y8Z9pQ" }
];

let token = window.localStorage.getItem("token");
let currentAudio = new Audio();

// 1. SPOTIFY LOGIN
document.getElementById('login-btn').onclick = () => {
    window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES}`;
};

// 2. TOKEN KONTROL
const hash = window.location.hash;
if (!token && hash) {
    token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1];
    window.location.hash = "";
    window.localStorage.setItem("token", token);
}

if (token) {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    nextQuestion();
}

// 3. OYUN FONKSİYONLARI
async function nextQuestion() {
    document.body.className = "";
    document.getElementById('record').style.animationPlayState = 'paused';
    
    const randomTrack = trackPool[Math.floor(Math.random() * trackPool.length)];
    
    const response = await fetch(`https://api.spotify.com/v1/tracks/${randomTrack.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    if (data.preview_url) {
        currentAudio.src = data.preview_url;
        currentAudio.play();
        document.getElementById('record').style.animationPlayState = 'running';
        displayOptions(randomTrack);
    } else {
        nextQuestion(); // Preview yoksa atla
    }
}

function displayOptions(correct) {
    const container = document.getElementById('options-container');
    container.innerHTML = "";
    
    let choices = [
        `${correct.artist} - ${correct.name}`,
        "Motive - 22",
        "Uzi - Makina",
        "Güneş - Dua"
    ].sort(() => 0.5 - Math.random());

    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = choice;
        btn.onclick = () => {
            currentAudio.pause();
            if(choice === `${correct.artist} - ${correct.name}`) {
                document.body.classList.add("neon-dogru");
            } else {
                document.body.classList.add("neon-yanlis");
            }
            setTimeout(nextQuestion, 1500);
        };
        container.appendChild(btn);
    });
}
