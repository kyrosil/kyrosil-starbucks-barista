// Canvas elementini ve 2D çizim bağlamını alalım
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Görsel nesnelerini oluşturalım
const bgImage = new Image();
const logoImage = new Image();

// Görsellerin yüklenip yüklenmediğini takip edelim
let bgLoaded = false;
let logoLoaded = false;

// --- YENİ: localStorage ve Günlük Hak Takibi ---
let failedAttemptsToday = 0;
let lastPlayDate = '';
let canPlay = true; // Oynayıp oynayamayacağını belirten bayrak

function loadGameData() {
    const today = new Date().toISOString().split('T')[0]; // Bugünün tarihini YYYY-MM-DD formatında al
    lastPlayDate = localStorage.getItem('barista_lastPlayDate') || today;
    failedAttemptsToday = parseInt(localStorage.getItem('barista_failedAttempts') || '0', 10);

    // Eğer kaydedilen son tarih bugünden farklıysa, hakları sıfırla
    if (lastPlayDate !== today) {
        console.log("Yeni gün! Hata hakları sıfırlandı.");
        failedAttemptsToday = 0;
        lastPlayDate = today;
        saveGameData(); // Sıfırlanmış veriyi kaydet
    }

    // Oynama hakkı kalmış mı kontrol et
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
    // Buraya Seviye 4-10 eklenecek...
    { level: 4, recipeName: "Oyun Bitti!", clicks: [] }
];

// Arka plan görseli yüklendiğinde
bgImage.onload = function() { /* ... öncekiyle aynı ... */ console.log("BG yüklendi"); bgLoaded=true; if(logoLoaded) startGameLoop();};
// Logo görseli yüklendiğinde
logoImage.onload = function() { /* ... öncekiyle aynı ... */ console.log("Logo yüklendi"); logoLoaded=true; if(bgLoaded) startGameLoop();};

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

    // Logo ve daire çizimi... (öncekiyle aynı)
    if (logoLoaded) { /* ... logo ve daire çizim kodu ... */
        const circleCenterX = logoX + logoWidth / 2; const circleCenterY = logoY + logoHeight / 2;
        const radius = logoWidth / 2; ctx.fillStyle = 'white'; ctx.beginPath();
        ctx.arc(circleCenterX, circleCenterY, radius, 0, Math.PI * 2); ctx.fill();
        ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
     }

    // Seviye ve Sipariş Bilgisi Yazdırma... (öncekiyle aynı, sadece gölge ayarı düzeltildi)
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

     // --- YENİ: Hakkı Bitti Mesajı ---
     if (!canPlay) {
         ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Yarı saydam siyah arka plan
         ctx.fillRect(0, canvas.height / 2 - 40, canvas.width, 80); // Ortada bir bant
         ctx.fillStyle = 'red';
         ctx.font = 'bold 30px Arial';
         ctx.textAlign = 'center';
         ctx.fillText("Bugünkü Hata Hakkın Doldu!", canvas.width / 2, canvas.height / 2);
         ctx.fillStyle = 'white';
         ctx.font = '18px Arial';
         ctx.fillText("Yarın tekrar dene!", canvas.width / 2, canvas.height / 2 + 30);
     }
     // --- Mesaj Sonu ---

    // DEBUG Çizimi (Yorumlu) ...
    /* ... debug kodu ... */

    requestAnimationFrame(drawGame);
}

// Oyun döngüsünü başlatan fonksiyon (GÜNCELLENDİ)
let gameLoopStarted = false;
function startGameLoop() {
    // Oyunu başlatmadan önce localStorage'dan veriyi yükle ve kontrol et
    loadGameData();

    if (!canPlay) {
         // Eğer oynama hakkı yoksa, oyun döngüsünü başlatma ama çizim yapsın (mesajı göstermek için)
         if (!gameLoopStarted) { // Sadece bir kez çizelim
             gameLoopStarted = true; // Döngü başlamadı ama tekrar çizmemek için işaretle
             drawGame(); // Mesajı çizmek için bir kez çağır
             console.log("Oynama hakkı yok, oyun başlatılmadı ama mesaj gösteriliyor.");
         }
         return; // Oynama hakkı yoksa fonksiyondan çık
    }

    // Oynama hakkı varsa ve döngü başlamadıysa başlat
    if (!gameLoopStarted) {
        console.log("Oyun döngüsü başlatılıyor...");
        gameLoopStarted = true;
        drawGame();
    }
}

// Tıklama İşleyici Fonksiyon (GÜNCELLENDİ)
function handleClick(event) {
    // Eğer oynama hakkı yoksa veya oyun bittiyse tıklamaları işleme
    if (!canPlay || currentLevelIndex >= levels.length - 1) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    let clickedItemName = null;
    for (const item of clickableItems) { /* ... öğe bulma kodu aynı ... */
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
                     canPlay = false; // Oyun bitince de oynamayı durdurabiliriz
                }
            }
        } else { // YANLIŞ TIKLAMA
            console.log("Yanlış malzeme veya sıra! Bu tarif için baştan başla.");
            currentRecipeStep = 0; // Adımı sıfırla

            // --- YENİ: Hata Hakkını Azalt ---
            failedAttemptsToday++; // Hata sayacını artır
            saveGameData(); // Yeni sayacı kaydet
            console.log(`Kalan hata hakkı: ${3 - failedAttemptsToday} / 3`);
            // --- Hata Hakkı Azaltma Sonu ---

            // --- YENİ: Hak Bitti Kontrolü ---
            if (failedAttemptsToday >= 3) {
                canPlay = false; // Oynama hakkı bitti
                console.error("Bugünkü 3 hata hakkı doldu! Oyun durduruldu.");
                // Ekrana mesaj zaten drawGame içinde çizilecek
            }
            // --- Hak Bitti Kontrolü Sonu ---

            // BURAYA CANVAS'A "HATA!" MESAJI ÇİZME KODU EKLENECEK
        }
    } else {
         console.log("Boş alan tıklandı.");
    }
}

// Olay dinleyicisi... (öncekiyle aynı)
canvas.addEventListener('click', handleClick);
// Hata logları... (öncekiyle aynı)
bgImage.onerror = /* ... */ ; logoImage.onerror = /* ... */ ;
console.log("script.js yüklendi, görseller yükleniyor...");
