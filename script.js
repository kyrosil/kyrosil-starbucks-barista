// Canvas elementini ve 2D çizim bağlamını alalım
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Görsel nesnelerini oluşturalım
const bgImage = new Image();
const logoImage = new Image();

// Görsellerin yüklenip yüklenmediğini takip edelim
let bgLoaded = false;
let logoLoaded = false;

// Arka plan görseli yüklendiğinde çalışacak fonksiyon
bgImage.onload = function() {
    console.log("Arka plan GIF'i yüklendi.");
    bgLoaded = true;
    // Eğer logo da yüklendiyse oyunu başlat/çiz
    if (logoLoaded) {
        startGameLoop();
    }
};

// Logo görseli yüklendiğinde çalışacak fonksiyon
logoImage.onload = function() {
    console.log("Starbucks logosu yüklendi.");
    logoLoaded = true;
    // Eğer arka plan da yüklendiyse oyunu başlat/çiz
    if (bgLoaded) {
        startGameLoop();
    }
};

// Görsel kaynaklarını belirtelim (Dosya adları senin verdiğin gibi)
bgImage.src = 'original.gif';
logoImage.src = 'Starbucks_Corporation.png';

// Logo yerleşimi için YENİ tahmini koordinatlar ve boyut (Deneme 1)
const logoX = 30; // Daha sola aldık
const logoY = 30; // Daha yukarı aldık
const logoWidth = 60; // Boyut aynı kalsın şimdilik
const logoHeight = 60; // Boyut aynı kalsın şimdilik

// Ana oyun döngüsü fonksiyonu
function drawGame() {
    // Her karede ekranı temizleyelim (Animasyon için önemli)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Arka planı çizelim (Şimdilik GIF'i statik resim gibi çiziyoruz)
    // Not: GIF animasyonu için daha sonra ek kod gerekebilir
    if (bgLoaded) {
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    }

    // Logoyu çizmeden ÖNCE: Aslan başını kapatmak için logonun arkasına beyaz bir alan çizelim
    if (logoLoaded) {
        // Beyaz bir dörtgen çiz:
        ctx.fillStyle = 'white'; // Çizilecek şeklin rengi beyaz
        ctx.fillRect(logoX, logoY, logoWidth, logoHeight); // Logonun konumuna ve boyutuna göre doldur

        /* Alternatif: Beyaz Daire İstersen Yukarıdaki fillRect yerine bunları kullan:
        ctx.fillStyle = 'white';
        ctx.beginPath();
        // Dairenin merkezi (logo merkezinde), yarıçapı (logo genişliğinin yarısı)
        ctx.arc(logoX + logoWidth / 2, logoY + logoHeight / 2, logoWidth / 2, 0, Math.PI * 2);
        ctx.fill();
        */

        // Şimdi logoyu beyaz alanın üzerine çizelim
        ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
    }

    // Döngüyü devam ettirelim
    requestAnimationFrame(drawGame);
}

// Oyun döngüsünü başlatan fonksiyon (Görseller yüklendikten sonra çağrılır)
let gameLoopStarted = false;
function startGameLoop() {
    if (!gameLoopStarted) {
        console.log("Oyun döngüsü başlatılıyor...");
        gameLoopStarted = true;
        drawGame(); // İlk çizimi yap ve döngüyü başlat
    }
}

// Tarayıcıya görsellerin yüklenmediği durumlar için hata logları (isteğe bağlı)
bgImage.onerror = () => { console.error("Arka plan GIF'i yüklenemedi! Dosya adı veya yolu doğru mu?"); };
logoImage.onerror = () => { console.error("Starbucks logosu yüklenemedi! Dosya adı veya yolu doğru mu?"); };

console.log("script.js yüklendi, görseller yükleniyor...");
