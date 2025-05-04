// Canvas elementini ve 2D çizim bağlamını alalım
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Görsel nesnelerini oluşturalım
const bgImage = new Image();
const logoImage = new Image();

// Görsellerin yüklenip yüklenmediğini takip edelim
let bgLoaded = false;
let logoLoaded = false;

// Oyun Durumu Değişkenleri
let currentLevelIndex = 0;
let currentRecipeStep = 0;
let canPlay = true;
let gameLoopStarted = false;

// Dil ve Bölge (Giriş ekranı yapılana kadar varsayılan)
let currentLang = 'TR';
let currentRegion = 'TR'; // 'TR' veya 'EU'

// Mesajlaşma için HTML Element Referansları
const messageOverlay = document.getElementById('messageOverlay');
const messageTitle = document.getElementById('messageTitle');
const messageBody = document.getElementById('messageBody');
const closeButton = document.getElementById('closeButton');

// localStorage ve Günlük Hak Takibi
let failedAttemptsToday = 0;
let lastPlayDate = '';

function loadGameData() {
    const today = new Date().toISOString().split('T')[0];
    lastPlayDate = localStorage.getItem('barista_lastPlayDate') || today;
    failedAttemptsToday = parseInt(localStorage.getItem('barista_failedAttempts') || '0', 10);
    if (lastPlayDate !== today) { console.log("Yeni gün!"); failedAttemptsToday = 0; lastPlayDate = today; saveGameData(); }
    if (failedAttemptsToday >= 3) { canPlay = false; console.warn("Hak bitti."); } else { canPlay = true; }
    console.log(`Bugünkü hata hakkı: ${3 - failedAttemptsToday} / 3`);
}

function saveGameData() {
    localStorage.setItem('barista_lastPlayDate', lastPlayDate);
    localStorage.setItem('barista_failedAttempts', failedAttemptsToday.toString());
}

// Metinler Objesi (GÜNCELLENDİ - Ödül mesajları ayrıldı)
const texts = {
    TR: {
        level: "Seviye",
        order: "Sipariş",
        requirements: "Gerekenler",
        attemptsLeft: "Kalan Hata Hakkı",
        errorTitle: "Hata!",
        errorMessage: "Yanlış malzeme veya sıra! Bu siparişe baştan başla.",
        winTitle: "Tebrikler!",
        winMessagePart1: "Seviye ",
        // Ödül türüne göre farklı mesajlar
        winMessagePart2_App: " değerinde Starbucks Mobil Uygulaması ödülü kazandın!",
        winMessagePart2_USDT: " NAKİT ÖDÜL (500 USDT) kazandın!", // Seviye 10 için
        // ---
        winMessageEmailPrompt: "Ödülünü almak için aşağıdaki linke tıklayarak veya manuel olarak",
        winMessageEmailAddress: "giveaways@kyrosil.eu",
        winMessageEmailSubjectBase: "Kyrosil Starbucks Oyun Ödülü - Seviye ",
        // Ödül türüne göre farklı e-posta içerikleri
        winMessageEmailBodyBase_App: "Merhaba,\n\nSeviye {LEVEL} Starbucks Mobil Uygulaması ödülünü ({REWARD}) kazandım.\nUygulama kodumu bekliyorum.\n\nEkran görüntüm ektedir.\n\nTeşekkürler.",
        winMessageEmailBodyBase_USDT: "Merhaba,\n\nSeviye 10 Büyük Ödülünü (500 USDT) kazandım.\nÖdül gönderimi için detayları bekliyorum.\n\nEkran görüntüm ektedir.\n\nTeşekkürler.",
        // ---
        winMessageEmailInstructions: "adresine bu ekranın görüntüsüyle birlikte mail atabilirsin.",
        gameOverTitle: "Oyun Bitti!",
        gameOverMessage: "Tüm seviyeleri tamamladın! Harikasın!",
        noAttemptsTitle: "Hakların Bitti!",
        noAttemptsMessage: "Bugünkü 3 hata yapma hakkını doldurdun. Yarın tekrar oynamak için geri gel!",
        closeButton: "Tamam"
    },
    EN: {
        level: "Level",
        order: "Order",
        requirements: "Required",
        attemptsLeft: "Attempts Left",
        errorTitle: "Error!",
        errorMessage: "Wrong item or sequence! Start this order again.",
        winTitle: "Congratulations!",
        winMessagePart1: "You won the Level ",
        // Reward type specific messages
        winMessagePart2_App: " Starbucks Mobile App reward ({REWARD})!",
        winMessagePart2_USDT: " CASH PRIZE (500 USDT)!", // For Level 10
        // ---
        winMessageEmailPrompt: "To claim your reward, click the link below or manually email",
        winMessageEmailAddress: "giveaways@kyrosil.eu",
        winMessageEmailSubjectBase: "Kyrosil Starbucks Game Reward - Level ",
         // Reward type specific email bodies
        winMessageEmailBodyBase_App: "Hello,\n\nI won the Level {LEVEL} Starbucks Mobile App reward ({REWARD}).\nI'm waiting for my app code.\nMy screenshot is attached.\n\nThanks.",
        winMessageEmailBodyBase_USDT: "Hello,\n\nI won the Level 10 Grand Prize (500 USDT).\nI await details for the prize transfer.\nMy screenshot is attached.\n\nThanks.",
        // ---
        winMessageEmailInstructions: "with a screenshot of this screen.",
        gameOverTitle: "Game Over!",
        gameOverMessage: "You completed all levels! Awesome!",
        noAttemptsTitle: "No Attempts Left!",
        noAttemptsMessage: "You've used your 3 mistake attempts for today. Come back tomorrow to play again!",
        closeButton: "OK"
    }
};

// Ödül Seviyeleri (Aynı)
const rewardTiers = {
    TR: { 2: "200 TL", 4: "600 TL", 6: "2.000 TL", 8: "5.000 TL", 10: "500 USDT" },
    EU: { 2: "5 USD", 4: "15 USD", 6: "40 USD", 8: "100 USD", 10: "500 USDT" }
};

function getRewardForLevel(level, region) { /* ... öncekiyle aynı ... */ return rewardTiers[region]?.[level] || null; }

// Mesaj Gösterme Fonksiyonları (Aynı)
function showMessage(title, bodyHtml, type = 'info') { /* ... öncekiyle aynı ... */
    messageTitle.innerText = title; messageBody.innerHTML = bodyHtml;
    messageOverlay.className = `overlay message-${type}`;
    messageOverlay.style.display = 'flex'; canPlay = false; }
function hideMessage() { /* ... öncekiyle aynı ... */
    messageOverlay.style.display = 'none';
    if (failedAttemptsToday < 3 && currentLevelIndex < levels.length - 1) { canPlay = true; } }
closeButton.addEventListener('click', hideMessage);

// Seviye Tarifleri (Aynı)
const levels = [ /* ... */
    { level: 1, recipeName: "Sade Espresso", clicks: ['Espresso Machine Area'] },
    { level: 2, recipeName: "Yeşil İçecek", clicks: ['Espresso Machine Area', 'Green Bottle'] },
    { level: 3, recipeName: "Sadece Yeşil", clicks: ['Green Bottle'] },
    // Buraya Seviye 4-10 eklenecek...
    { level: 4, recipeName: "Oyun Bitti!", clicks: [] }
];

// Görsel yükleme olayları... (Aynı)
bgImage.onload = function() { console.log("BG yüklendi"); bgLoaded=true; if(logoLoaded) startGameLoop();};
logoImage.onload = function() { console.log("Logo yüklendi"); logoLoaded=true; if(bgLoaded) startGameLoop();};
bgImage.src = 'original.gif'; logoImage.src = 'Starbucks_Corporation.png';
const logoWidth = 80; const logoHeight = 80; const logoX = canvas.width / 2 - logoWidth / 2; const logoY = 20;
const clickableItems = [ /* ... */ { name: 'Espresso Machine Area', x: 605, y: 300, width: 50, height: 60 },{ name: 'Green Bottle', x: 300, y: 245, width: 30, height: 55 }];

// Ana oyun döngüsü fonksiyonu (GÜNCELLENDİ - Gerekenler Listesi Eklendi)
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bgLoaded) ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    // Logo ve daire çizimi... (Aynı)
    if (logoLoaded) { /* ... */
        const circleCenterX = logoX + logoWidth / 2; const circleCenterY = logoY + logoHeight / 2;
        const radius = logoWidth / 2; ctx.fillStyle = 'white'; ctx.beginPath();
        ctx.arc(circleCenterX, circleCenterY, radius, 0, Math.PI * 2); ctx.fill();
        ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
     }

    // Kalan Hakları Yazdır (Aynı)
    /* ... Kalan hakları yazdırma kodu ... */
     ctx.fillStyle='white';ctx.font='bold 18px Arial';ctx.textAlign='right';
     ctx.shadowColor='black';ctx.shadowBlur=3;ctx.shadowOffsetX=1;ctx.shadowOffsetY=1;
     ctx.fillText(`${texts[currentLang].attemptsLeft}: ${3-failedAttemptsToday}`,canvas.width-20,30);
     ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;

    // Seviye ve Sipariş Bilgisi Yazdır
     if (levels[currentLevelIndex] && canPlay) {
        const currentLevelData = levels[currentLevelIndex];
        ctx.fillStyle = 'white'; ctx.textAlign = 'center';
        ctx.shadowColor = 'black'; ctx.shadowBlur = 4; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2;

        // Seviye
        ctx.font = 'bold 24px Arial';
        ctx.fillText(`${texts[currentLang].level}: ${currentLevelData.level}`, canvas.width / 2, 130);

        if (currentLevelData.clicks.length > 0) {
             // Sipariş Adı
             ctx.font = '20px Arial';
             ctx.fillText(`${texts[currentLang].order}: ${currentLevelData.recipeName}`, canvas.width / 2, 165);

             // --- YENİ: Gerekenler Listesi ---
             ctx.font = 'italic 16px Arial';
             // Tarif dizisindeki isimleri alıp virgülle birleştirelim
             const requiredItemsText = currentLevelData.clicks.join(', ');
             ctx.fillText(`${texts[currentLang].requirements}: ${requiredItemsText}`, canvas.width / 2, 195); // Siparişin altına
             // --- Gerekenler Listesi Sonu ---

        } else { // Oyun Bitti ise
             ctx.font = 'bold 28px Arial';
             ctx.fillText(texts[currentLang].gameOverTitle, canvas.width / 2, 165); // Oyun Bitti başlığını kullan
        }
        ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
     }

    // Hak Bitti mesajı (HTML overlay'e taşındı, buradan kaldırıldı)
    // if (!canPlay && ...) { ... } // Bu blok kaldırıldı

    requestAnimationFrame(drawGame);
}

// Oyun döngüsünü başlatan fonksiyon (Güncellendi - Hak yoksa HTML mesajı)
let gameLoopStarted = false;
function startGameLoop() {
    if (!gameLoopStarted) {
        loadGameData();
        if (!canPlay) {
            // Hakkı yoksa mesaj göster (HTML ile)
            showMessage(texts[currentLang].noAttemptsTitle, texts[currentLang].noAttemptsMessage, 'error');
        } else {
            console.log("Oyun döngüsü başlatılıyor...");
            gameLoopStarted = true;
            drawGame();
        }
    } else if (canPlay) {
         requestAnimationFrame(drawGame);
    }
}


// Tıklama İşleyici Fonksiyon (GÜNCELLENDİ - Mesajlar ve Mailto)
function handleClick(event) {
    // Oynama hakkı yoksa, oyun bittiyse veya mesaj gösteriliyorsa tıklama yok
    if (!canPlay || currentLevelIndex >= levels.length - 1 || messageOverlay.style.display === 'flex') return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    let clickedItemName = null;
    for (const item of clickableItems) { if (clickX>=item.x && clickX<=item.x+item.width && clickY>=item.y && clickY<=item.y+item.height){clickedItemName=item.name;break;}}

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

                const rewardAmountStr = getRewardForLevel(completedLevel, currentRegion); // Ödülü al

                currentLevelIndex++; // Sonraki seviyeye geç (ödül olsa da olmasa da)
                currentRecipeStep = 0; // Adımı sıfırla

                if (rewardAmountStr) { // Ödül varsa
                    console.warn(`%cÖDÜL KAZANILDI! Seviye ${completedLevel} (${rewardAmountStr})`, 'color: green; font-weight: bold;');

                    const isLevel10 = completedLevel === 10; // Nakit ödül mü?

                    // Ödül mesajını ve e-posta gövdesini seviyeye göre ayarla
                    const winMsgPart2 = isLevel10 ? texts[currentLang].winMessagePart2_USDT : texts[currentLang].winMessagePart2_App.replace('{REWARD}', rewardAmountStr);
                    const mailBodyBase = isLevel10 ? texts[currentLang].winMessageEmailBodyBase_USDT : texts[currentLang].winMessageEmailBodyBase_App;
                    const mailBody = encodeURIComponent(
                        mailBodyBase.replace('{LEVEL}', completedLevel).replace('{REWARD}', rewardAmountStr)
                    );
                    const mailSubject = encodeURIComponent(`${texts[currentLang].winMessageEmailSubjectBase}${completedLevel}${isLevel10 ? ' - NAKIT ODUL' : ''}`);
                    const mailtoLink = `mailto:${texts[currentLang].winMessageEmailAddress}?subject=${mailSubject}&body=${mailBody}`;

                    // HTML mesaj içeriğini oluştur
                    const winHtml = `
                        <p>${texts[currentLang].winMessagePart1}${completedLevel}${winMsgPart2}</p>
                        <hr>
                        <p>${texts[currentLang].winMessageEmailPrompt}
                           <br><a href="${mailtoLink}" target="_blank"><b>${texts[currentLang].winMessageEmailAddress}</b></a><br>
                           ${texts[currentLang].winMessageEmailInstructions}
                        </p>
                    `;
                    showMessage(texts[currentLang].winTitle, winHtml, 'win'); // Mesajı göster

                }

                // Oyun Bitti mi kontrol et (bir sonraki seviye tanımsızsa veya tarifi boşsa)
                 const nextLevelData = levels[currentLevelIndex];
                 // ÖNEMLİ: Ödül mesajından sonra oyun bitişini kontrol et!
                 if (!nextLevelData || nextLevelData.clicks.length === 0) {
                      console.log("OYUN TAMAMLANDI! TEBRİKLER!");
                      // Oyun bitti mesajını ödül mesajı kapandıktan sonra göstermek daha iyi olabilir
                      // Ya da ödül mesajının içine bir "Oyun Bitti" ibaresi ekleyebiliriz.
                      // Şimdilik sadece konsola yazıyor ve oynanabilirliği kapatıyor.
                      canPlay = false; // Oyunu durdur
                      // İstersek burada da bir showMessage çağırabiliriz.
                      // showMessage(texts[currentLang].gameOverTitle, texts[currentLang].gameOverMessage, 'info');
                 }

            } else {
                 // Tarifin sonraki adımı var, devam...
            }
        } else { // YANLIŞ TIKLAMA
            console.log("Yanlış malzeme veya sıra! Bu tarif için baştan başla.");
            currentRecipeStep = 0;
            failedAttemptsToday++;
            saveGameData();
            console.log(`Kalan hata hakkı: ${3 - failedAttemptsToday} / 3`);

            // Ekrana Hata Mesajı Göster (Kısa süreli)
            showMessage(texts[currentLang].errorTitle, texts[currentLang].errorMessage, 'error');
            setTimeout(hideMessage, 1500); // 1.5 saniye sonra otomatik kapat

            // Hak Bitti Kontrolü
            if (failedAttemptsToday >= 3) {
                canPlay = false;
                console.error("Bugünkü 3 hata hakkı doldu! Oyun durduruldu.");
                // Hak bitti mesajını göstermek için showMessage çağırabiliriz
                // veya drawGame'deki kontrol yeterli olabilir. Tutarlılık için
                // setTimeout ile hata mesajı kapandıktan sonra hak bitti mesajını gösterelim:
                setTimeout(() => {
                    if (!canPlay) { // Tekrar kontrol et, belki arada gün değişti? Pek olası değil ama...
                         showMessage(texts[currentLang].noAttemptsTitle, texts[currentLang].noAttemptsMessage, 'error');
                    }
                }, 1550); // Hata mesajı kaybolduktan hemen sonra
            }
        }
    } else {
         console.log("Boş alan tıklandı.");
    }
}

// Olay dinleyicisi... (Aynı)
canvas.addEventListener('click', handleClick);
// Hata logları... (Aynı)
bgImage.onerror = () => { console.error("BG Yüklenemedi!"); }
logoImage.onerror = () => { console.error("Logo Yüklenemedi!"); }

// İlk veri yüklemesini yap ve oyunu başlatmayı dene
loadGameData();
startGameLoop(); // Görsellerin yüklenmesini beklemeden döngüyü başlatmayı deneyebiliriz,
                 // çünkü yükleme kontrolü zaten startGameLoop içinde var.
console.log("script.js yüklendi ve çalıştırıldı.");
