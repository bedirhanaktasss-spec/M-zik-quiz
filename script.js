// Spotify API Ayarları
const CLIENT_ID = 'a1365b21350f4b709887d1b0ffcbdaa5'; // Senin Client ID'n
const REDIRECT_URI = 'http://localhost:8000/spotify-connection.html'; // Kendi URL'ini yaz (Spotify Dashboard'da da aynı olmalı)
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';
const SCOPES = [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'user-read-recently-played',
    'playlist-read-private'
].join(' ');

// DOM Elementleri
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');
const loading = document.getElementById('loading');
const errorMsg = document.getElementById('error');

// Sayfa yüklendiğinde token kontrolü
window.addEventListener('load', () => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem('spotify_token');

    // URL'den token al
    if (hash) {
        const tokenMatch = hash.match(/access_token=([^&]*)/);
        if (tokenMatch) {
            token = tokenMatch[1];
            window.localStorage.setItem('spotify_token', token);
            window.location.hash = ''; // URL'i temizle
        }
    }

    // Token varsa kullanıcı bilgilerini al
    if (token) {
        getUserProfile(token);
    }
});

// Spotify'a giriş yap
loginBtn.addEventListener('click', () => {
    const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES}`;
    window.location.href = authUrl;
});

// Kullanıcı profilini al
async function getUserProfile(token) {
    loading.classList.add('active');
    loginBtn.disabled = true;
    errorMsg.classList.remove('active');

    try {
        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Token geçersiz veya süresi dolmuş');
        }

        const data = await response.json();
        displayUserInfo(data);
        
        // İsteğe bağlı: En çok dinlenen şarkıları al
        getTopTracks(token);

    } catch (error) {
        console.error('Hata:', error);
        errorMsg.textContent = 'Bağlantı hatası: ' + error.message;
        errorMsg.classList.add('active');
        localStorage.removeItem('spotify_token');
        loginBtn.disabled = false;
    } finally {
        loading.classList.remove('active');
    }
}

// Kullanıcı bilgilerini göster
function displayUserInfo(data) {
    document.getElementById('displayName').textContent = data.display_name || 'Bilinmiyor';
    document.getElementById('email').textContent = data.email || 'Bilinmiyor';
    document.getElementById('country').textContent = data.country || 'Bilinmiyor';
    document.getElementById('followers').textContent = data.followers?.total || 0;
    
    if (data.images && data.images.length > 0) {
        document.getElementById('profileImg').src = data.images[0].url;
    } else {
        document.getElementById('profileImg').src = 'https://via.placeholder.com/100';
    }

    userInfo.classList.add('active');
    loginBtn.style.display = 'none';
}

// En çok dinlenen şarkıları al (Örnek)
async function getTopTracks(token) {
    try {
        const response = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=short_term', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('En çok dinlenen şarkıların:', data.items);
            // Burada şarkıları gösterebilirsin
        }
    } catch (error) {
        console.error('Şarkılar alınamadı:', error);
    }
}

// Çıkış yap
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('spotify_token');
    userInfo.classList.remove('active');
    loginBtn.style.display = 'block';
    loginBtn.disabled = false;
    
    // Sayfayı yenile
    window.location.href = window.location.pathname;
});