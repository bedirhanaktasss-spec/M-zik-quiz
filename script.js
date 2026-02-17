const CLIENT_ID = 'a1365b21350f4b709887d1b0ffcbdaa5';
const REDIRECT_URI = 'https://m-zik-quiz.vercel.app';
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";

const trackPool = [
    { name: "10MG", artist: "Motive", id: "0v0oV9h6jO0pI4B4y8mX8D" },
    { name: "Arasan Da", artist: "Uzi", id: "2S6p6DqF6UQY5WfW" },
    { name: "Doğuştan Beri", artist: "Lvbel C5", id: "5pXkP6XN3z" },
    { name: "İmdat", artist: "Çakal", id: "466Xn3p" }
];

let token = window.localStorage.getItem('token');
let currentAudio = new Audio();
let score = 0;
let currentTrack = null;

window.onload = () => {
    // 1. GİRİŞ KONTROLÜ
    const hash = window.location.hash;
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

    // 2. BUTON TIKLAMA
    document.getElementById('login-btn').onclick = () => {
        window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=user-read-private`;
    };
};

// 3. OYNANIŞ (Next Question)
async function nextQuestion() {
    currentTrack = trackPool[Math.floor(Math.random() * trackPool.length)];
    
    try {
        const response = await fetch(`https://api.spotify.com/v1/tracks/$${currentTrack.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.preview_url) {
            currentAudio.src = data.preview_url;
            currentAudio.play();
            showOptions();
        } else {
            nextQuestion();
        }
    } catch (e) { console.error("Hata:", e); }
}

function showOptions() {
    const container = document.getElementById('options-container');
    container.innerHTML = "";
    
    let options = [currentTrack];
    while(options.length < 3) {
        let r = trackPool[Math.floor(Math.random() * trackPool.length)];
        if(!options.includes(r)) options.push(r);
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
                document.getElementById('feedback').innerText = "✅ Harika!";
            } else {
                document.getElementById('feedback').innerText = "❌ Yanlış!";
            }
            setTimeout(nextQuestion, 1000);
        };
        container.appendChild(b);
    });
}
