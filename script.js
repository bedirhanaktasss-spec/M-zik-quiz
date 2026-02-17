const CLIENT_ID = 'a1365b21350f4b709887d1b0ffcbdaa5';
const REDIRECT_URI = 'https://m-zik-quiz.vercel.app'; // Sonunda slaç / OLMASIN
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"; 

    // 1. URL'den Token Yakalama
    if (hash && hash.includes("access_token")) {
        const params = new URLSearchParams(hash.substring(1));
        token = params.get("access_token");
        window.localStorage.setItem('token', token);
        window.location.hash = "";
        window.location.reload();
        return;
    }

    // 2. Giriş Kontrolü (HİÇBİR DEĞİŞKEN KULLANMADAN DİREKT LİNK)
    if (!token) {
        // BU LİNKİ HİÇBİR ŞEKİLDE DEĞİŞTİRME, DİREKT KOPYALA:
        window.location.href = "https://accounts.spotify.com/authorize?client_id=a1365b21350f4b709887d1b0ffcbdaa5&redirect_uri=https%3A%2F%2Fm-zik-quiz.vercel.app%2F&response_type=token&scope=user-read-private";
    } else {
        // Token varsa oyun ekranını göster
        document.getElementById('game-screen').style.display = 'block';
        console.log("Giriş başarılı!");
    }
};
