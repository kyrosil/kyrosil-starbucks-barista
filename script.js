// Canvas elementini ve 2D çizim bağlamını alalım
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Görsel nesnelerini oluşturalım
const bgImage = new Image();
const logoImage = new Image();

// Görsellerin yüklenip yüklenmediğini takip edelim
let bgLoaded = false;
let logoLoaded = false;

// --- localStorage ve Günlük Hak Takibi ---
let failedAttemptsToday = 0;
let lastPlayDate = '';
let canPlay = true;

function loadGameData() {
    const today = new Date().toISOString().split('T')[0];
    lastPlayDate = localStorage.getItem('barista_lastPlayDate') || today;
    failedAttemptsToday = parseInt(localStorage.getItem('barista_failedAttempts') || '0', 10);
    if (lastPlayDate !== today) {
        console.log("Yeni gün! Hata hakları sıfırlandı.");
        failedAttemptsToday = 0;
        lastPlayDate = today;
        saveGameData();
    }
    if (failedAttemptsToday >= 3) {
        canPlay = false;
        console.warn("Bugünkü 3 hata hakkı doldu.");
    } else {
        canPlay = true;
    }
    console.log(`Bugünkü hata hakkı: ${3 - failedAttemptsToday} / 3`);
}

function saveGameData() {
    localStorage.setItem('barista_lastPlayDate', lastPlayDate);
    localStorage.setItem('barista_failedAttempts', failedAttemptsToday.toString());
}
// --- localStorage Bitiş ---

// Oyun Durumu Değişkenleri
let currentLevelIndex = 0;
let currentRecipeStep = 0;

// Seviye Tarifleri
const levels = [
    { level: 1, recipeName: "Sade Espresso", clicks: ['Espresso Machine Area'] },
    { level: 2, recipeName: "Yeşil İçecek", clicks: ['Espresso Machine Area', 'Green Bottle'] },
    { level: 3, recipeName: "Sadece Yeşil", clicks: ['Green Bottle'] },
    { level: 4, recipeName: "Oyun Bitti!", clicks: [] }
];

// Görsel yükleme olayları
bgImage.onload = function() { console.log("BG yüklendi"); bgLoaded=true; if(logoLoaded) startGameLoop();};
logoImage.onload = function() { console.log("Logo yüklendi"); logoLoaded=true; if(bgLoaded) startGameLoop();};

// Görsel kaynakları
bgImage.src = 'original.gif';
logoImage.src = 'Starbucks_Corporation.png';

// Logo konumu ve boyutu
const logoWidth = 80; const logoHeight = 80;
const logoX = canvas.width / 2 - logoWidth / 2; const logoY = 20;

// Tıklanabilir alanlar
const clickableItems = [
    { name: 'Espresso Machine Area', x: 605, y: 300, width: 50, height: 60 },
    { name: 'Green Bottle', x: 300, y: 245, width: 30, height: 55 }
];

// Ana oyun döngüsü fonksiyonu
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bgLoaded) ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    // Logo ve daire çizimi
    if (logoLoaded) {
        const circleCenterX = logoX + logoWidth / 2; const circleCenterY = logoY + logoHeight / 2;
        const radius = logoWidth / 2; ctx.fillStyle = 'white'; ctx.beginPath();
        ctx.arc(circleCenterX, circleCenterY, radius, 0, Math.PI * 2); ctx.fill();
        ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
     }

    // Seviye ve Sipariş Bilgisi Yazdırma
     if (levels[currentLevelIndex]) {
        const currentLevelData = levels[currentLevelIndex];
        ctx.fillStyle = 'white'; ctx.font = 'bold 24px Arial'; ctx.textAlign = 'center';
        ctx.shadowColor = 'black'; ctx.shadowBlur = 4; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2;
        ctx.fillText(`Seviye: ${currentLevelData.level}`, canvas.width / 2, 130);
        if (currentLevelData.clicks.length > 0) {
             ctx.font = '20px Arial';
             ctx.fillText(`Sipariş: ${currentLevelData.recipeName}`, canvas.width / 2, 165);
        } else { ctx.font = 'bold 28px Arial'; ctx.fillText(currentLevelData.recipeName, canvas.width / 2, 165); }
        ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
     }

     // Hakkı Bitti Mesajı
     if (!canPlay) {
         ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
         ctx.fillRect(0, canvas.height / 2 - 40, canvas.width, 80);
         ctx.fillStyle = 'red'; ctx.font = 'bold 30px Arial'; ctx.textAlign = 'center';
         ctx.fillText("Bugünkü Hata Hakkın Doldu!", canvas.width / 2, canvas.height / 2);
         ctx.fillStyle = 'white'; ctx.font = '18px Arial';
         ctx.fillText("Yarın tekrar dene!", canvas.width / 2, canvas.height / 2 + 30);
     }

    // DEBUG Çizimi (Yorumlu)
    /* ... */

    requestAnimationFrame(drawGame);
}

// Oyun döngüsünü başlatan fonksiyon
let gameLoopStarted = false;
function startGameLoop() {
    loadGameData();
    if (!canPlay) {
         if (!gameLoopStarted) {
             gameLoopStarted = true;
             drawGame();
             console.log("Oynama hakkı yok, oyun başlatılmadı ama mesaj gösteriliyor.");
         }
         return;
    }
    if (!gameLoopStarted) {
        console.log("Oyun döngüsü başlatılıyor...");
        gameLoopStarted = true;
        drawGame();
    }
}

// Tıklama İşleyici Fonksiyon
function handleClick(event) {
    if (!canPlay || currentLevelIndex >= levels.length - 1) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    let clickedItemName = null;
    for (const item of clickableItems) {
        if (clickX >= item.x && clickX <= item.x + item.width && clickY >= item.y && clickY <= item.y + item.height) {
            clickedItemName = item.name; break; }
    }

    if (clickedItemName) {
        console.log(`Tıklandı: ${clickedItemName}`);
        const currentLevelData = levels[currentLevelIndex];
        const expectedClick = currentLevelData.clicks[currentRecipeStep];

        if (clickedItemName === expectedClick) { // DOĞRU TIKLAMA
            console.log("Doğru adım!");
            currentRecipeStep++;
            if (currentRecipeStep >= currentLevelData.clicks.length) { // Seviye Bitti
                const completedLevel = currentLevelData.level;
                console.log(`--- Seviye ${completedLevel} Bitti! ---`);
                currentLevelIndex++;
                currentRecipeStep = 0;
                if ([2, 4, 6, 8, 10].includes(completedLevel)) { // Ödül Kontrolü
                    console.warn(`%cÖDÜL KAZANILDI! Seviye ${completedLevel} tamamlandı! Mail atmayı unutma!`, 'color: green; font-weight: bold;');
                    // BURAYA CANVAS'A ÖDÜL MESAJI ÇİZME KODU EKLENECEK
                }
                const nextLevelData = levels[currentLevelIndex];
                if (nextLevelData.clicks.length === 0) { // Oyun Bitti Kontrolü
                     console.log("OYUN TAMAMLANDI! TEBRİKLER!");
                     canPlay = false;
                }
            }
        } else { // YANLIŞ TIKLAMA
            console.log("Yanlış malzeme veya sıra! Bu tarif için baştan başla.");
            currentRecipeStep = 0;
            failedAttemptsToday++;
            saveGameData();
            console.log(`Kalan hata hakkı: ${3 - failedAttemptsToday} / 3`);
            if (failedAttemptsToday >= 3) {
                canPlay = false;
                console.error("Bugünkü 3 hata hakkı doldu! Oyun durduruldu.");
            }
            // BURAYA CANVAS'A "HATA!" MESAJI ÇİZME KODU EKLENECEK
        }
    } else {
         console.log("Boş alan tıklandı.");
    }
}

// Olay dinleyicisi
canvas.addEventListener('click', handleClick);

// Hata logları (GÜNCELLENDİ - Sondaki ; kaldırıldı)
bgImage.onerror = () => { console.error("Arka plan GIF'i yüklenemedi! Dosya adı veya yolu doğru mu?") }
logoImage.onerror = () => { console.error("Starbucks logosu yüklenemedi! Dosya adı veya yolu doğru mu?") }

console.log("script.js yüklendi, görseller yükleniyor...");
