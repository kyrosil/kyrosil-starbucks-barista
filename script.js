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
    if (logoLoaded) startGameLoop();
};

// Logo görseli yüklendiğinde çalışacak fonksiyon
logoImage.onload = function() {
    console.log("Starbucks logosu yüklendi.");
    logoLoaded = true;
    if (bgLoaded) startGameLoop();
};

// Görsel kaynaklarını belirtelim
bgImage.src = 'original.gif';
logoImage.src = 'Starbucks_Corporation.png';

// Logo boyutu ve konumu (Üstte Ortala)
const logoWidth = 80;
const logoHeight = 80;
const logoX = canvas.width / 2 - logoWidth / 2;
const logoY = 20; // Üstten boşluk (Yazılar için yer açtık)

// Tıklanabilir alanlar (Koordinatlar tahmini)
const clickableItems = [
    { name: 'Espresso Machine Area', x: 605, y: 300, width: 50, height: 60 },
    { name: 'Green Bottle', x: 300, y: 245, width: 30, height: 55 }
];

// --- YENİ: Oyun Durumu Değişkenleri ---
let currentLevelIndex = 0; // Başlangıç seviyesi (listenin 0. indeksi -> Seviye 1)
let currentRecipeStep = 0; // Mevcut tarifteki ilerleme (kaçıncı tıklama)
// let score = 0; // Puanı şimdilik eklemiyoruz

// --- YENİ: Seviye Tarifleri ---
const levels = [
    // Gerçek Seviye 1 (Index 0)
    { level: 1, recipeName: "Sade Espresso", clicks: ['Espresso Machine Area'] },
    // Gerçek Seviye 2 (Index 1) - İlk Ödül Seviyesi!
    { level: 2, recipeName: "Yeşil İçecek", clicks: ['Espresso Machine Area', 'Green Bottle'] },
    // Gerçek Seviye 3 (Index 2) - Örnek
    { level: 3, recipeName: "Sadece Yeşil", clicks: ['Green Bottle'] },
    // Buraya Seviye 4, 5, 6, 7, 8, 9, 10 tarifleri eklenecek...
    // Şimdilik oyun 3. seviyeden sonra bitsin diye placeholder:
    { level: 4, recipeName: "Oyun Bitti!", clicks: [] } // Oyun sonu işaretçisi
];
// ---------------------------------

// Ana oyun döngüsü fonksiyonu
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Arka planı çiz
    if (bgLoaded) ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    // Logoyu ve arkasındaki daireyi çiz
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

    // --- YENİ: Seviye ve Sipariş Bilgisini Yazdır ---
    if (levels[currentLevelIndex]) {
        const currentLevelData = levels[currentLevelIndex];
        ctx.fillStyle = 'white'; // Yazı rengi
        ctx.font = 'bold 24px Arial'; // Yazı tipi ve boyutu
        ctx.textAlign = 'center'; // Yazıyı ortala
        // Okunabilirlik için hafif gölge ekleyelim
        ctx.shadowColor = 'black'; ctx.shadowBlur = 4; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2;

        // Seviye Numarası
        ctx.fillText(`Seviye: ${currentLevelData.level}`, canvas.width / 2, 130); // Logonun biraz altına

        // Sipariş Adı (Tarif Adı)
        if (currentLevelData.clicks.length > 0) { // Oyun bitmediyse tarifi yaz
             ctx.font = '20px Arial'; // Sipariş için biraz daha küçük font
             ctx.fillText(`Sipariş: ${currentLevelData.recipeName}`, canvas.width / 2, 165); // Seviyenin altına
        } else { // Oyun bittiyse
             ctx.font = 'bold 28px Arial';
             ctx.fillText(currentLevelData.recipeName, canvas.width / 2, 165); // Oyun Bitti mesajı
        }


        // Gölgeyi sıfırla (diğer çizimleri etkilemesin)
        ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;

        // İpucu: Mevcut adımda hangi öğenin tıklanması gerektiğini gösterebiliriz (İleride)
        // Örn: if(currentRecipeStep < currentLevelData.clicks.length) { /* ilgili öğeyi vurgula */ }
    }
     // --- YENİ KISIM SONU ---

    // --- DEBUG ÇİZİMİ (İsteğe Bağlı) ---
    /*
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'; ctx.lineWidth = 2;
    for (const item of clickableItems) { ctx.strokeRect(item.x, item.y, item.width, item.height); }
    */
    // --- DEBUG SONU ---

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

// Tıklama İşleyici Fonksiyon (GÜNCELLENMİŞ)
function handleClick(event) {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Oyun bitmişse tıklamaları dikkate alma
    if (currentLevelIndex >= levels.length - 1) return;

    let clickedItemName = null;
    for (const item of clickableItems) {
        if (clickX >= item.x && clickX <= item.x + item.width &&
            clickY >= item.y && clickY <= item.y + item.height) {
            clickedItemName = item.name;
            break;
        }
    }

    if (clickedItemName) {
        console.log(`Tıklandı: ${clickedItemName}`);

        // Mevcut seviye için oyun mantığını kontrol et
        const currentLevelData = levels[currentLevelIndex];
        const expectedClick = currentLevelData.clicks[currentRecipeStep];

        if (clickedItemName === expectedClick) {
            console.log("Doğru adım!");
            currentRecipeStep++; // Sonraki adıma geç

            // Tarif tamamlandı mı?
            if (currentRecipeStep >= currentLevelData.clicks.length) {
                const completedLevel = currentLevelData.level;
                console.log(`--- Seviye ${completedLevel} Bitti! ---`);
                currentLevelIndex++; // Sonraki seviyeye geç
                currentRecipeStep = 0; // Adım sayacını sıfırla

                // Ödül seviyesi mi kontrol et (2, 4, 6, 8, 10)
                if ([2, 4, 6, 8, 10].includes(completedLevel)) {
                    // ŞİMDİLİK SADECE KONSOLA YAZALIM
                    console.warn(`%cÖDÜL KAZANILDI! Seviye ${completedLevel} tamamlandı! Mail atmayı unutma!`, 'color: green; font-weight: bold;');
                    // BURAYA KAZANMA MESAJINI CANVAS'A ÇİZEN KOD GELECEK
                    // VEYA BASİT BİR ALERT:
                    // alert(`Tebrikler! Seviye ${completedLevel} ödülünü kazandın! (${completedLevel === 2 ? (REGION === 'TR' ? '200TL' : '$5') : 'Daha büyük ödül!'})\nEkran görüntüsünü giveaways@kyrosil.eu adresine gönder!`);
                    // Not: REGION değişkeni ve ödül miktarını daha sonra ekleyeceğiz.
                }

                // Oyun bitti mi kontrol et
                const nextLevelData = levels[currentLevelIndex];
                if (nextLevelData.clicks.length === 0) { // Bir sonraki seviyenin tarifi boşsa oyun bitmiştir
                     console.log("OYUN TAMAMLANDI! TEBRİKLER!");
                     // Oyun bittiğinde özel bir şey yapabiliriz. Şimdilik döngü duracak.
                }
            }
        } else {
            console.log("Yanlış malzeme veya sıra! Bu tarif için baştan başla.");
            // Yanlış tıklamada mevcut adımı sıfırla, oyuncu tarife baştan başlasın
            currentRecipeStep = 0;
            // İstersen burada bir ses efekti veya görsel hata mesajı da gösterebiliriz
        }

    } else {
         console.log("Boş alan tıklandı."); // Boş alan tıklaması
    }
}

// Canvas elementine 'click' olay dinleyicisini ekle
canvas.addEventListener('click', handleClick);


// Hata logları... (öncekiyle aynı)
bgImage.onerror = () => { console.error("Arka plan GIF'i yüklenemedi! Dosya adı veya yolu doğru mu?"); };
logoImage.onerror = () => { console.error("Starbucks logosu yüklenemedi! Dosya adı veya yolu doğru mu?"); };

console.log("script.js yüklendi, görseller yükleniyor...");
