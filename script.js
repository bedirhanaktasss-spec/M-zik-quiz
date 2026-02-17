const CLIENT_ID = 'a1365b21350f4b709887d1b0ffcbdaa5';
const REDIRECT_URI = 'https://m-zik-quiz.vercel.app';

// --- 1. ŞARKI LİSTESİ (Burayı istediğin kadar uzatabilirsin) ---
const trackPool = [
    { name: "10MG", artist: "Motive", id: "0v0oV9h6jO0pI4B4y8mX8D" },
    { name: "Arasan Da", artist: "Uzi", id: "2S6p6DqF6UQY5WfW" },
    { name: "Doğuştan Beri", artist: "Lvbel C5", id: "5pXkP6XN3z" },
    { name: "İmdat", artist: "Çakal", id: "466Xn3p" },
    { name: "Geceler", artist: "Ezhel", id: "1shm9p0fL0mB9Y5C" }
];

let token = window.localStorage.getItem('token');
let currentAudio = new Audio();
let score = 0;
let currentTrack = null;

window.onload = () => {
    const hash = window.location.hash;
    
    // URL'den Token Yakala
    if (hash && hash.includes("access_token")) {
        token = new URLSearchParams(hash.substring(1)).get("access_token");
        window.localStorage.setItem('token', token);
        window.location.hash = "";
    }

    // GİRİŞ KONTROLÜ
    if (!token) {
        // Hata veren o uzun linki manuel ve hatasız kuruyoruz:
        const authUrl = "https://accounts.spotify.com/authorize" + 
                        "?client_id=" + CLIENT_ID + 
                        "&redirect_uri=" + encodeURIComponent(REDIRECT_URI) + 
                        "&response_type=token" + 
                        "&scope=user-read-private";
        window.location.href = authUrl;
    } else {
        // Giriş varsa oyunu göster ve ilk soruyu getir
        document.getElementById('game-screen').style.display = 'block';
        nextQuestion();
    }
};

// --- 2. OYUN MEKANİĞİ ---
async function nextQuestion() {
    // Rastgele şarkı seç
    currentTrack = trackPool[Math.floor(Math.random() * trackPool.length)];
    
    try {
        const res = await fetch(`https://api.spotify.com/v1/tracks/${currentTrack.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.preview_url) {
            currentAudio.src = data.preview_url;
            currentAudio.play();
            renderButtons();
        } else {
            // Şarkının önizlemesi yoksa (Spotify bazen vermez), bir sonrakine geç
            nextQuestion();
        }
    } catch (e) {
        console.error("Token süresi dolmuş olabilir.");
        localStorage.clear();
        // window.location.reload();
    }
}

function renderButtons() {
    const container = document.getElementById('options-container');
    container.innerHTML = ""; // Eski şıkları temizle
    
    // Doğru cevap + 2 Yanlış cevap hazırla
    let options = [currentTrack];
    while(options.length < 3) {
        let r = trackPool[Math.floor(Math.random() * trackPool.length)];
        if(!options.find(o => o.id === r.id)) options.push(r);
    }
    options.sort(() => Math.random() - 0.5); // Şıkları karıştır

    options.forEach(t => {
        const btn = document.createElement('button');
        btn.innerText = `${t.name} - ${t.artist}`;
        btn.className = "option-btn";
        btn.onclick = () => {
            currentAudio.pause();
            if(t.id === currentTrack.id) {
                score += 10;
                document.getElementById('score').innerText = score;
                alert("Doğru! 🔥");
            } else {
                alert("Yanlış! Doğru cevap: " + currentTrack.name);
            }
            nextQuestion();
        };
        container.appendChild(btn);
    });
}
