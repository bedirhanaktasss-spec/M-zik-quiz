// 1. AYARLAR - Senin bilgilerine göre güncelledim
const CLIENT_ID = 'a1365b21350f4b709887d1b0ffcbdaa5';
const REDIRECT_URI = 'https://m-zik-quiz.vercel.app';
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = "user-read-private";

// 2. TOKEN YAKALAMA VE SAYFA YÜKLENİNCE YAPILACAKLAR
window.onload = () => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem('token');

    // Eğer URL'de token varsa onu al ve kaydet
    if (!token && hash) {
        const params = new URLSearchParams(hash.substring(1));
        token = params.get("access_token");
        if (token) {
            window.localStorage.setItem('token', token);
            window.location.hash = ""; // URL'deki karmaşayı temizle
        }
    }

    // Ekranları kontrol et
    const loginScreen = document.getElementById('login-screen');
    const gameScreen = document.getElementById('game-screen');

    if (token) {
        // Giriş yapılmışsa oyunu göster
        if (loginScreen) loginScreen.style.display = 'none';
        if (gameScreen) gameScreen.style.display = 'block';
        console.log("Spotify bağlantısı aktif!");
        // Buraya ileride şarkı başlatma fonksiyonunu ekleyebilirsin
    }

    // Buton tıklama olayını bağla
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.onclick = () => {
            // Spotify'a gitmek için gereken tam URL
            const loginUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(SCOPES)}`;
            window.location.href = loginUrl;
        };
    }
};

// 3. ÖRNEK OYUN VERİLERİ (İleride genişletilebilir)
const trackPool = [
    { name: "10MG", artist: "Motive", id: "0v0oV9h6jO0pI" },
    { name: "Arasan Da", artist: "Uzi", id: "2S6p6DqF6U" }
];
