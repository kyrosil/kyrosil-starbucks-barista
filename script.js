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
    if (lastPlayDate !== today) { console.log("Yeni gün!"); failedAttemptsToday = 0; lastPlayDate = today; saveGameData(); }
    if (failedAttemptsToday >= 3) { canPlay = false; console.warn("Hak bitti."); } else { canPlay = true; }
    console.log(`Bugünkü hata hakkı: ${3 - failedAttemptsToday} / 3`);
}

function saveGameData() {
    localStorage.setItem('barista_lastPlayDate', lastPlayDate);
    localStorage.setItem('barista_failedAttempts', failedAttemptsToday.toString());
}
// --- localStorage Bitiş ---

// --- YENİ: Geri Bildirim Mesajı için Değişkenler ---
let feedbackMessage = { text: '', color: 'red', expiryTime: 0 };
// --- Geri Bildirim Değişkenleri Sonu ---

// Oyun Durumu Değişkenleri
let currentLevelIndex = 0;
let currentRecipeStep = 0;
let gameLoopStarted = false; // <<<--- SADECE BURADA TANIMLI OLMALI

// Dil ve Bölge (Giriş ekranı yapılana kadar varsayılan)
let currentLang = 'TR';
let currentRegion = 'TR'; // 'TR' veya 'EU'

// Mesajlaşma için HTML Element Referansları
const messageOverlay = document.getElementById('messageOverlay');
const messageTitle = document.getElementById('messageTitle');
const messageBody = document.getElementById('messageBody');
const closeButton = document.getElementById('closeButton');

// Metinler Objesi (GÜNCELLENDİ - Ödül mesajları ayrıldı)
const texts = { /* ... Önceki mesajdaki gibi T AMAMI BURADA ... */
    TR: {
        level: "Seviye", order: "Sipariş", requirements: "Gerekenler", attemptsLeft: "Kalan Hata Hakkı",
        errorTitle: "Hata!", errorMessage: "Yanlış malzeme veya sıra! Bu siparişe baştan başla.",
        winTitle: "Tebrikler!", winMessagePart1: "Seviye ",
        winMessagePart2_App: " değerinde Starbucks Mobil Uygulaması ödülü kazandın!",
        winMessagePart2_USDT: " NAKİT ÖDÜL (500 USDT) kazandın!",
        winMessageEmailPrompt: "Ödülünü almak için aşağıdaki linke tıklayarak veya manuel olarak",
        winMessageEmailAddress: "giveaways@kyrosil.eu",
        winMessageEmailSubjectBase: "Kyrosil Starbucks Oyun Ödülü - Seviye ",
        winMessageEmailBodyBase_App: "Merhaba,\n\nSeviye {LEVEL} Starbucks Mobil Uygulaması ödülünü ({REWARD}) kazandım.\nUygulama kodumu bekliyorum.\n\nEkran görüntüm ektedir.\n\nTeşekkürler.",
        winMessageEmailBodyBase_USDT: "Merhaba,\n\nSeviye 10 Büyük Ödülünü (500 USDT) kazandım.\nÖdül gönderimi için detayları bekliyorum.\n\nEkran görüntüm ektedir.\n\nTeşekkürler.",
        winMessageEmailInstructions: "adresine bu ekranın görüntüsüyle birlikte mail atabilirsin.",
        gameOverTitle: "Oyun Bitti!", gameOverMessage: "Tüm seviyeleri tamamladın! Harikasın!",
        noAttemptsTitle: "Hakların Bitti!", noAttemptsMessage: "Bugünkü 3 hata yapma hakkını doldurdun. Yarın tekrar oynamak için geri gel!",
        closeButton: "Tamam"
    },
    EN: { /* ... İngilizce metinler ... */
        level: "Level", order: "Order", requirements: "Required", attemptsLeft: "Attempts Left",
        errorTitle: "Error!", errorMessage: "Wrong item or sequence! Start this order again.",
        winTitle: "Congratulations!", winMessagePart1: "You won the Level ",
        winMessagePart2_App: " Starbucks Mobile App reward ({REWARD})!",
        winMessagePart2_USDT: " CASH PRIZE (500 USDT)!",
        winMessageEmailPrompt: "To claim your reward, click the link below or manually email",
        winMessageEmailAddress: "giveaways@kyrosil.eu",
        winMessageEmailSubjectBase: "Kyrosil Starbucks Game Reward - Level ",
        winMessageEmailBodyBase_App: "Hello,\n\nI won the Level {LEVEL} Starbucks Mobile App reward ({REWARD}).\nI'm waiting for my app code.\nMy screenshot is attached.\n\nThanks.",
        winMessageEmailBodyBase_USDT: "Hello,\n\nI won the Level 10 Grand Prize (500 USDT).\nI await details for the prize transfer.\nMy screenshot is attached.\n\nThanks.",
        winMessageEmailInstructions: "with a screenshot of this screen.",
        gameOverTitle: "Game Over!", gameOverMessage: "You completed all levels! Awesome!",
        noAttemptsTitle: "No Attempts Left!", noAttemptsMessage: "You've used your 3 mistake attempts for today. Come back tomorrow to play again!",
        closeButton: "OK"
    }
};

// Ödül Seviyeleri (Aynı)
const rewardTiers = { /* ... Önceki mesajdaki gibi ... */
    TR: { 2: "200 TL", 4: "600 TL", 6: "2.000 TL", 8: "5.000 TL", 10: "500 USDT" },
    EU: { 2: "5 USD", 4: "15 USD", 6: "40 USD", 8: "100 USD", 10: "500 USDT" }
};

function getRewardForLevel(level, region) { return rewardTiers[region]?.[level] || null; }

// Mesaj Gösterme Fonksiyonları (Aynı)
function showMessage(title, bodyHtml, type = 'info') { /* ... */ messageTitle.innerText=title; messageBody.innerHTML=bodyHtml; messageOverlay.className=`overlay message-${type}`; messageOverlay.style.display='flex'; canPlay=false; }
function hideMessage() { /* ... */ messageOverlay.style.display='none'; if(failedAttemptsToday<3 && currentLevelIndex<levels.length-1){canPlay=true;} }
closeButton.addEventListener('click', hideMessage);

// Seviye Tarifleri (Aynı)
const levels = [ /* ... */ {level:1,recipeName:"Sade Espresso",clicks:['Espresso Machine Area']},{level:2,recipeName:"Yeşil İçecek",clicks:['Espresso Machine Area','Green Bottle']},{level:3,recipeName:"Sadece Yeşil",clicks:['Green Bottle']},{level:4,recipeName:"Oyun Bitti!",clicks:[]} ];

// Görsel yükleme olayları... (Aynı)
bgImage.onload = function() { console.log("BG yüklendi"); bgLoaded=true; if(logoLoaded) startGameLoop();};
logoImage.onload = function() { console.log("Logo yüklendi"); logoLoaded=true; if(bgLoaded) startGameLoop();};
bgImage.src = 'original.gif'; logoImage.src = 'Starbucks_Corporation.png';
const logoWidth = 80; const logoHeight = 80; const logoX = canvas.width/2-logoWidth/2; const logoY = 20;
const clickableItems = [ { name: 'Espresso Machine Area', x: 605, y: 300, width: 50, height: 60 }, { name: 'Green Bottle', x: 300, y: 245, width: 30, height: 55 }];

// Ana oyun döngüsü fonksiyonu (Aynı)
function drawGame() { /* ... Önceki mesajdaki tam kod ... */
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bgLoaded) ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    if (logoLoaded) { const circleCenterX = logoX + logoWidth / 2; const circleCenterY = logoY + logoHeight / 2; const radius = logoWidth / 2; ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(circleCenterX, circleCenterY, radius, 0, Math.PI * 2); ctx.fill(); ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight); }
    ctx.fillStyle='white';ctx.font='bold 18px Arial';ctx.textAlign='right'; ctx.shadowColor='black';ctx.shadowBlur=3;ctx.shadowOffsetX=1;ctx.shadowOffsetY=1; ctx.fillText(`${texts[currentLang].attemptsLeft}: ${3-failedAttemptsToday}`,canvas.width-20,30); ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;
    if (levels[currentLevelIndex] && canPlay) { const currentLevelData = levels[currentLevelIndex]; ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.shadowColor = 'black'; ctx.shadowBlur = 4; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; ctx.font = 'bold 24px Arial'; ctx.fillText(`${texts[currentLang].level}: ${currentLevelData.level}`, canvas.width / 2, 130); if (currentLevelData.clicks.length > 0) { ctx.font = '20px Arial'; ctx.fillText(`${texts[currentLang].order}: ${currentLevelData.recipeName}`, canvas.width / 2, 165); ctx.font = 'italic 16px Arial'; const requiredItemsText = currentLevelData.clicks.join(', '); ctx.fillText(`${texts[currentLang].requirements}: ${requiredItemsText}`, canvas.width / 2, 195); } else { ctx.font = 'bold 28px Arial'; ctx.fillText(texts[currentLang].gameOverTitle, canvas.width / 2, 165); } ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; }
    // Geçici mesaj çizimi
    if (feedbackMessage.text && Date.now() < feedbackMessage.expiryTime) { ctx.fillStyle = feedbackMessage.color; ctx.font = 'bold 28px Arial'; ctx.textAlign = 'center'; ctx.shadowColor = 'black'; ctx.shadowBlur = 5; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; ctx.fillText(feedbackMessage.text, canvas.width / 2, 240); /* Yazı Y konumu ayarlandı */ ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; } else { feedbackMessage.text = ''; }
    requestAnimationFrame(drawGame);
}


// Oyun döngüsünü başlatan fonksiyon (DÜZELTİLDİ - gereksiz 'let' kaldırıldı)
// let gameLoopStarted = false; // <<<--- BU SATIR SİLİNDİ! (Yukarıda zaten vardı)
function startGameLoop() {
    if (!gameLoopStarted) {
        loadGameData();
        if (!canPlay) {
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


// Tıklama İşleyici Fonksiyon (Aynı)
function handleClick(event) { /* ... Önceki mesajdaki tam kod ... */
    if (!canPlay || currentLevelIndex >= levels.length - 1 || messageOverlay.style.display === 'flex') return;
    const rect = canvas.getBoundingClientRect(); const clickX = event.clientX - rect.left; const clickY = event.clientY - rect.top;
    let clickedItemName = null; for (const item of clickableItems) { if (clickX>=item.x && clickX<=item.x+item.width && clickY>=item.y && clickY<=item.y+item.height){clickedItemName=item.name;break;}}
    if (clickedItemName) { console.log(`Tıklandı: ${clickedItemName}`); const currentLevelData = levels[currentLevelIndex]; const expectedClick = currentLevelData.clicks[currentRecipeStep];
        if (clickedItemName === expectedClick) { console.log("Doğru adım!"); currentRecipeStep++;
            if (currentRecipeStep >= currentLevelData.clicks.length) { const completedLevel = currentLevelData.level; console.log(`--- Seviye ${completedLevel} Bitti! ---`); const rewardAmountStr = getRewardForLevel(completedLevel, currentRegion); currentLevelIndex++; currentRecipeStep = 0;
                if (rewardAmountStr) { console.warn(`%cÖDÜL KAZANILDI! Seviye ${completedLevel} (${rewardAmountStr})`, 'color: green; font-weight: bold;'); const isLevel10 = completedLevel === 10; const winMsgPart2 = isLevel10 ? texts[currentLang].winMessagePart2_USDT : texts[currentLang].winMessagePart2_App.replace('{REWARD}', rewardAmountStr); const mailBodyBase = isLevel10 ? texts[currentLang].winMessageEmailBodyBase_USDT : texts[currentLang].winMessageEmailBodyBase_App; const mailBody = encodeURIComponent(mailBodyBase.replace('{LEVEL}', completedLevel).replace('{REWARD}', rewardAmountStr)); const mailSubject = encodeURIComponent(`${texts[currentLang].winMessageEmailSubjectBase}${completedLevel}${isLevel10 ? ' - NAKIT ODUL' : ''}`); const mailtoLink = `mailto:${texts[currentLang].winMessageEmailAddress}?subject=${mailSubject}&body=${mailBody}`; const winHtml = `<p>${texts[currentLang].winMessagePart1}${completedLevel}${winMsgPart2}</p><hr><p>${texts[currentLang].winMessageEmailPrompt}<br><a href="${mailtoLink}" target="_blank"><b>${texts[currentLang].winMessageEmailAddress}</b></a><br>${texts[currentLang].winMessageEmailInstructions}</p>`; showMessage(texts[currentLang].winTitle, winHtml, 'win'); }
                 const nextLevelData = levels[currentLevelIndex]; if (!nextLevelData || nextLevelData.clicks.length === 0) { console.log("OYUN TAMAMLANDI! TEBRİKLER!"); canPlay = false; /* showMessage(texts[currentLang].gameOverTitle, texts[currentLang].gameOverMessage, 'info'); */ }
            } else { /* İstersen doğru adım mesajı: showMessage("Doğru!", "Sıradaki...", 'success'); setTimeout(hideMessage, 500); */ }
        } else { console.log("Yanlış malzeme veya sıra! Bu tarif için baştan başla."); currentRecipeStep = 0; failedAttemptsToday++; saveGameData(); console.log(`Kalan hata hakkı: ${3 - failedAttemptsToday} / 3`);
            showMessage(texts[currentLang].errorTitle, texts[currentLang].errorMessage, 'error'); setTimeout(hideMessage, 1500);
            if (failedAttemptsToday >= 3) { canPlay = false; console.error("Hak bitti!"); setTimeout(() => { if (!canPlay) { showMessage(texts[currentLang].noAttemptsTitle, texts[currentLang].noAttemptsMessage, 'error'); } }, 1550); }
        }
    } else { console.log("Boş alan tıklandı."); }
}


// Olay dinleyicisi
canvas.addEventListener('click', handleClick);

// Hata logları (Sondaki ; kaldırıldı)
bgImage.onerror = () => { console.error("BG Yüklenemedi!"); }
logoImage.onerror = () => { console.error("Logo Yüklenemedi!"); }

// İlk veri yüklemesini yap
loadGameData();
// Oyunu başlatmayı dene (Görsellerin yüklenmesi içeride bekleniyor)
startGameLoop();
console.log("script.js yüklendi ve çalıştırıldı.");
