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

// Logo boyutu
const logoWidth = 80;
const logoHeight = 80;

// Logo yerleşimi: Üstte Ortala
const logoX = canvas.width / 2 - logoWidth / 2; // Yatayda ortala
const logoY = 30; // Üstten sabit boşluk

// --- YENİ KISIM: Tıklanabilir Alanlar ---
const clickableItems = [
    // Koordinatlar ve boyutlar arka plan görseline göre tahminidir, ayarlanabilir!
    { name: 'Espresso Machine Area', x: 605, y: 300, width: 50, height: 60 }, // Sağdaki makinenin düğme alanı
    { name: 'Green Bottle', x: 300, y: 245, width: 30, height: 55 }          // Tezgah arkası 2. yeşil şişe
    // Buraya daha sonra başka tıklanabilir öğeler eklenecek (bardak, süt vb.)
];
// --- YENİ KISIM SONU ---

// Ana oyun döngüsü fonksiyonu
function drawGame() {
    // Her karede ekranı temizleyelim
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Arka planı çizelim
    if (bgLoaded) {
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    }

    // Logoyu çizelim (Beyaz daire içinde)
    if (logoLoaded) {
        const circleCenterX = logoX + logoWidth / 2;
        const circleCenterY = logoY + logoHeight / 2;
        const radius = logoWidth / 2;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(circleCenterX, circleCenterY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
    }

    // --- DEBUG: Tıklanabilir alanları çiz (İsteğe bağlı, yerlerini görmek için) ---
    // Bu kısmı geliştirme sırasında açıp, sonra silebilirsin
    /*
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'; // Kırmızı yarı saydam çizgi
    ctx.lineWidth = 2;
    for (const item of clickableItems) {
        ctx.strokeRect(item.x, item.y, item.width, item.height);
    }
    */
    // --- DEBUG SONU ---


    // Döngüyü devam ettirelim
    requestAnimationFrame(drawGame);
}

// Oyun döngüsünü başlatan fonksiyon
let gameLoopStarted = false;
function startGameLoop() {
    if (!gameLoopStarted) {
        console.log("Oyun döngüsü başlatılıyor...");
        gameLoopStarted = true;
        drawGame();
    }
}

// --- YENİ KISIM: Tıklama İşleyici Fonksiyon ---
function handleClick(event) {
    // Canvas'ın sayfadaki konumunu al (doğru tıklama koordinatları için)
    const rect = canvas.getBoundingClientRect();
    // Tıklamanın Canvas içindeki X ve Y koordinatını hesapla
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // console.log(`Tıklandı: X=${clickX}, Y=${clickY}`); // Tam koordinatı görmek istersen

    let clickedItemName = null; // Başlangıçta null

    // Tanımladığımız tıklanabilir alanlar listesinde dön
    for (const item of clickableItems) {
        // Tıklama bu öğenin sınırları içinde mi?
        if (clickX >= item.x && clickX <= item.x + item.width &&
            clickY >= item.y && clickY <= item.y + item.height) {
            clickedItemName = item.name; // Eşleşme bulundu, ismini al
            break; // Başka alana bakmaya gerek yok
        }
    }

    // Eğer bir öğeye tıklandıysa, konsola ismini yazdır
    if (clickedItemName) {
        console.log(`Tıklandı: ${clickedItemName}`);
        // İLERİDE: Oyun mantığı (seri kontrolü, tarif kontrolü vb.) burada olacak
    } else {
        // console.log("Boş alan tıklandı."); // İstersen boş tıklamaları da görebilirsin
    }
}

// Canvas elementine 'click' olay dinleyicisini ekle
canvas.addEventListener('click', handleClick);
// --- YENİ KISIM SONU ---


// Hata logları... (öncekiyle aynı)
bgImage.onerror = () => { console.error("Arka plan GIF'i yüklenemedi! Dosya adı veya yolu doğru mu?"); };
logoImage.onerror = () => { console.error("Starbucks logosu yüklenemedi! Dosya adı veya yolu doğru mu?"); };

console.log("script.js yüklendi, görseller yükleniyor...");
