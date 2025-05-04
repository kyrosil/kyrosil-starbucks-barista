// Canvas ve Context (Artık başlangıçta gizli)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- YENİ: Giriş Ekranı Elementleri ---
const startScreenDiv = document.getElementById('startScreen');
const gameTitleEl = document.getElementById('gameTitle');
const gameSloganEl = document.getElementById('gameSlogan');
const langTRButton = document.getElementById('langTR');
const langENButton = document.getElementById('langEN');
const regionSelect = document.getElementById('regionSelect');
const regionLabelEl = document.getElementById('regionLabel'); // Gerekirse diye
const rewardTitleEl = document.getElementById('rewardTitle');
const rewardSummaryEl = document.getElementById('rewardSummary');
const startButton = document.getElementById('startButton');
// --- Giriş Ekranı Elementleri Sonu ---

// Mesajlaşma Elementleri (Aynı)
const messageOverlay = document.getElementById('messageOverlay'); /* ... */
const messageTitle = document.getElementById('messageTitle');   /* ... */
const messageBody = document.getElementById('messageBody');     /* ... */
const closeButton = document.getElementById('closeButton');     /* ... */

// Görsel Nesneleri ve Yükleme Durumları
const bgImage = new Image(); const logoImage = new Image();
let bgLoaded = false, logoLoaded = false;

// Oyun Durumları ('LOADING', 'START_SCREEN', 'TUTORIAL', 'PLAYING', 'MESSAGE', 'GAME_OVER', 'NO_ATTEMPTS')
let gameState = 'LOADING'; // Yeni başlangıç durumu
let tutorialStep = 0; let isTutorialComplete = false;

// Oyun Değişkenleri
let currentLevelIndex = 0; let currentRecipeStep = 0;
let canPlay = false; let gameLoopStarted = false;
let currentShuffledRecipe = [];

// Dil ve Bölge (Varsayılanlar)
let currentLang = 'TR'; let currentRegion = 'TR';

// localStorage ve Günlük Hak Takibi
let failedAttemptsToday = 0; let lastPlayDate = '';
function loadGameData() { /* ... */ const today=new Date().toISOString().split('T')[0];lastPlayDate=localStorage.getItem('barista_lastPlayDate')||today;failedAttemptsToday=parseInt(localStorage.getItem('barista_failedAttempts')||'0',10);if(lastPlayDate!==today){console.log("Yeni gün!");failedAttemptsToday=0;lastPlayDate=today;saveGameData();} if(failedAttemptsToday>=3){canPlay=false;console.warn("Hak bitti.");}else{canPlay=true;} console.log(`Bugünkü hata hakkı: ${3-failedAttemptsToday}/3`); }
function saveGameData() { /* ... */ localStorage.setItem('barista_lastPlayDate',lastPlayDate);localStorage.setItem('barista_failedAttempts',failedAttemptsToday.toString()); }

// Geri Bildirim Mesajı Değişkenleri
let feedbackMessage = { text: '', color: 'red', expiryTime: 0 };

// Metinler Objesi (GÜNCELLENDİ - Daha fazla anahtar)
const texts = {
    TR: {
        gameTitle: "Kyrosil Starbucks Barista", // Eklendi
        slogan: "En İyi Barista Ol, Ödülleri Kap!", // Eklendi
        regionLabel: "Bölge:", // Eklendi
        rewardTitle: "Ödüller", // Eklendi
        rewardSummary: "Seviye 2/4/6/8'de Starbucks App Ödülleri, Seviye 10'da 500 USDT!", // Eklendi
        startButton: "Oyuna Başla!", // Eklendi
        // --- Diğerleri aynı ---
        level: "Seviye", order: "Sipariş", requirements: "Gerekenler", attemptsLeft: "Kalan Hata Hakkı",
        errorTitle: "Hata!", errorMessage: "Yanlış malzeme veya sıra! Baştan başla.",
        winTitle: "Tebrikler!", winMessagePart1: "Seviye ",
        winMessagePart2_App: " **{REWARD}** değerinde Starbucks Mobil Uygulaması ödülü kazandın!",
        winMessagePart2_USDT: " **NAKİT ÖDÜL (500 USDT)** kazandın!",
        winMessageEmailPrompt: "Ödülünü almak için...", winMessageEmailAddress: "giveaways@kyrosil.eu",
        winMessageEmailSubjectBase: "Kyrosil Starbucks Oyun Ödülü - Seviye ",
        winMessageEmailBodyBase_App: "...", winMessageEmailBodyBase_USDT: "...",
        winMessageEmailInstructions: "...", gameOverTitle: "Oyun Bitti!", gameOverMessage: "Tüm seviyeleri tamamladın!",
        noAttemptsTitle: "Hakların Bitti!", noAttemptsMessage: "Bugünkü 3 hata yapma hakkını doldurdun...",
        closeButton: "Tamam", tutorialIntro:"...", tutorialItemIntro:"...", tutorialItemAction_Default:"...", /*...*/ tutorialComplete:"...", tutorialOutOfAttempts:"...",
        mixedOrderWarning: "Not: Malzemeler karışık listelenmiştir, doğru sırada hazırlayın!",
        priceCheckWarning: "Müşteri fiyatı da sordu!"
    },
    EN: { /* ... İngilizce karşılıkları ... */
        gameTitle: "Kyrosil Starbucks Barista", slogan: "Be the Best Barista, Grab the Rewards!",
        regionLabel: "Region:", rewardTitle: "Rewards",
        rewardSummary: "Starbucks App Rewards at Levels 2/4/6/8, 500 USDT at Level 10!",
        startButton: "Start Game!", level: "Level", order:"Order", /* ... etc ... */
     }
};

// Ödül Seviyeleri (Aynı)
const rewardTiers = { TR:{/*...*/}, EU:{/*...*/} };
function getRewardForLevel(level, region) { return rewardTiers[region]?.[level] || null; }

// Mesaj Gösterme Fonksiyonları (Aynı)
function showMessage(title, bodyHtml, type='info') { /* ... */ }
function hideMessage() { /* ... */ }
closeButton.addEventListener('click', hideMessage);

// Tıklanabilir Alanlar (Aynı)
const clickableItems = [ /* ... önceki koddan 11 öğe ... */ ];

// Seviye Tarifleri (Aynı)
const levels = [ /* ... önceki koddan 10 seviye + bitiş ... */ ];

// Görsel yükleme olayları (GÜNCELLENDİ - Sadece flag set et)
bgImage.onload = function() { console.log("BG yüklendi"); bgLoaded=true; checkAssetsLoaded();};
logoImage.onload = function() { console.log("Logo yüklendi"); logoLoaded=true; checkAssetsLoaded();};
bgImage.src = 'original.gif'; logoImage.src = 'Starbucks_Corporation.png';
const logoWidth = 80; const logoHeight = 80; const logoX = canvas.width/2-logoWidth/2; const logoY = 20;

// --- YENİ: Tüm Görseller Yüklendi Mi Kontrolü ---
function checkAssetsLoaded() {
    if (bgLoaded && logoLoaded && gameState === 'LOADING') {
         console.log("Tüm görseller yüklendi, giriş ekranı hazırlanıyor.");
         gameState = 'START_SCREEN'; // Oyun durumunu değiştir
         updateTexts(currentLang); // İlk metinleri ayarla
         // Giriş ekranı zaten HTML'de görünür durumda
    }
}

// Fisher-Yates Shuffle Algoritması (Aynı)
function shuffleArray(array){/*...*/}

// Ana oyun döngüsü fonksiyonu (Çoğunlukla Aynı)
function drawGame() { /* ... Önceki koddan kopyala (Sadece text çizimleri ve state kontrolleri) ... */
    ctx.clearRect(0,0,canvas.width,canvas.height); if(bgLoaded) ctx.drawImage(bgImage,0,0,canvas.width,canvas.height);
    if(logoLoaded){ /*..logo çizimi..*/ }
    let cTY = 30;
    ctx.fillStyle='white';ctx.font='bold 16px Arial';ctx.textAlign='left'; ctx.shadowColor='black';ctx.shadowBlur=3;ctx.shadowOffsetX=1;ctx.shadowOffsetY=1; ctx.fillText(`${texts[currentLang].attemptsLeft}: ${3-failedAttemptsToday}`,20,cTY); cTY+=25; ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;

    if (gameState === 'TUTORIAL') { /* ... Öğretici çizimi ... */ const iTS=clickableItems[tutorialStep]; if(iTS){/*...*/ctx.strokeRect(iTS.x-2,iTS.y-2,iTS.width+4,iTS.height+4); /*...*/ ctx.fillText(/*...*/); ctx.fillText(/*...*/);} }
    else if (gameState === 'PLAYING') { /* ... Seviye, Sipariş, Gerekenler Listesi, Uyarılar çizimi ... */ if(levels[currentLevelIndex]){ const d=levels[currentLevelIndex]; /*...*/ ctx.fillText(`${texts[currentLang].level}: ${d.level}`,20,cTY);cTY+=25; if(d.clicks.length>0){/*...*/ctx.fillText(`${texts[currentLang].order}: ${d.recipeName}`,20,cTY);cTY+=25; ctx.font='italic 16px Arial'; ctx.fillText(`${texts[currentLang].requirements}:`,20,cTY);cTY+=20; const sC=currentShuffledRecipe; for(const i of sC){ctx.fillText(`- ${i}`,30,cTY);cTY+=18;} cTY+=5;ctx.fillStyle='orange';ctx.font='bold 14px Arial';ctx.fillText(texts[currentLang].mixedOrderWarning,20,cTY);cTY+=20; if(d.clicks.includes('Fiyat Listesi')){ctx.fillStyle='lightblue';ctx.fillText(texts[currentLang].priceCheckWarning,20,cTY);cTY+=20;} } ctx.shadowColor='transparent';/*...*/} if(feedbackMessage.text&&Date.now()<feedbackMessage.expiryTime){/*...*/ctx.fillText(feedbackMessage.text,canvas.width/2,canvas.height-30);}else{feedbackMessage.text='';} }
    else if (gameState === 'NO_ATTEMPTS' || gameState === 'GAME_OVER') { /* ... Hak Bitti veya Oyun Bitti Mesajları (Canvas'a) ... */ ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,canvas.height/2-40,canvas.width,80); const t=(gameState==='NO_ATTEMPTS')?texts[currentLang].noAttemptsTitle:texts[currentLang].gameOverTitle; const m=(gameState==='NO_ATTEMPTS')?texts[currentLang].noAttemptsMessage:texts[currentLang].gameOverMessage; const c=(gameState==='NO_ATTEMPTS')?'red':'gold'; ctx.fillStyle=c; ctx.font='bold 30px Arial'; ctx.textAlign='center'; ctx.fillText(t,canvas.width/2,canvas.height/2); ctx.fillStyle='white'; ctx.font='18px Arial'; ctx.fillText(m,canvas.width/2,canvas.height/2+30); ctx.textAlign='left'; }

    // Döngüyü devam ettir
    if (gameLoopStarted && (gameState === 'PLAYING' || gameState === 'TUTORIAL')) { requestAnimationFrame(drawGame); }
}


// --- YENİ: Metin Güncelleme Fonksiyonu ---
function updateTexts(lang) {
    const t = texts[lang];
    document.title = t.gameTitle; // Sayfa başlığını da güncelle
    if(gameTitleEl) gameTitleEl.innerText = t.gameTitle;
    if(gameSloganEl) gameSloganEl.innerText = t.slogan;
    if(regionLabelEl) regionLabelEl.innerText = t.regionLabel; // Gerekirse
    if(rewardTitleEl) rewardTitleEl.innerText = t.rewardTitle;
    if(rewardSummaryEl) rewardSummaryEl.innerText = t.rewardSummary; // Ödül özetini güncelle (Dinamik değil şimdilik)
    if(startButton) startButton.innerText = t.startButton;
    if(closeButton) closeButton.innerText = t.closeButton; // Mesaj kutusu butonu

    // Aktif dil butonunu ayarla
    if(langTRButton) langTRButton.classList.toggle('active', lang === 'TR');
    if(langENButton) langENButton.classList.toggle('active', lang === 'EN');
     // HTML lang attribute'unu güncelle
    document.documentElement.lang = lang.toLowerCase();
    console.log(`Metinler ${lang} olarak güncellendi.`);
}

// --- YENİ: Olay Dinleyicileri (Giriş Ekranı) ---
langTRButton.addEventListener('click', () => {
    if (currentLang !== 'TR') {
        currentLang = 'TR';
        updateTexts(currentLang);
        // Seçimi localStorage'a kaydedebiliriz (isteğe bağlı)
        // localStorage.setItem('barista_lang', currentLang);
    }
});

langENButton.addEventListener('click', () => {
    if (currentLang !== 'EN') {
        currentLang = 'EN';
        updateTexts(currentLang);
        // localStorage.setItem('barista_lang', currentLang);
    }
});

regionSelect.addEventListener('change', (event) => {
    currentRegion = event.target.value; // 'TR' veya 'EU'
    console.log("Bölge seçildi:", currentRegion);
    // Ödül özetini veya başka şeyleri bölgeye göre güncelleyebiliriz
    // updateTexts(currentLang); // Metinlerde bölgeye özel bir şey varsa
    // localStorage.setItem('barista_region', currentRegion); // Kaydet
});

startButton.addEventListener('click', startGame); // Başlat butonuna fonksiyon bağlandı

// --- YENİ: Oyunu Başlatma Fonksiyonu ---
function startGame() {
    console.log("Başlat butonuna tıklandı.");
    playSound(clickSound); // Referans koddaki gibi (varsa)

    // Giriş ekranını gizle
    startScreenDiv.style.display = 'none';
    // Canvas'ı göster
    canvas.style.display = 'block';

    // Oyun durumunu başlat (tryStartGame zaten hak kontrolü yapıp TUTORIAL veya NO_ATTEMPTS ayarlıyor)
    tryStartGame(); // Bu fonksiyon oyun döngüsünü de başlatacak (eğer hak varsa)
}
// --- Oyunu Başlatma Sonu ---


// Tıklama İşleyici Fonksiyon (Aynı)
function handleClick(event) { /* ... Önceki mesajdaki tam kod ... */
    const rect=canvas.getBoundingClientRect();const clickX=event.clientX-rect.left;const clickY=event.clientY-rect.top;
    if(gameState==='TUTORIAL'){const itemToClick=clickableItems[tutorialStep];if(itemToClick&&clickX>=itemToClick.x&&clickX<=itemToClick.x+itemToClick.width&&clickY>=itemToClick.y&&clickY<=itemToClick.y+itemToClick.height){console.log(`Öğretici: ${itemToClick.name} tıklandı.`);tutorialStep++;if(tutorialStep>=clickableItems.length){console.log("Öğretici bitti!");isTutorialComplete=true;gameState='PLAYING';currentLevelIndex=0;currentRecipeStep=0;canPlay=true;currentShuffledRecipe=shuffleArray(levels[currentLevelIndex].clicks);if(gameLoopStarted)requestAnimationFrame(drawGame);}else{requestAnimationFrame(drawGame);}}else{console.log("Öğretici: Yanlış yere tıklandı.");}}
    else if(gameState==='PLAYING'){if(!canPlay||currentLevelIndex>=levels.length-1||messageOverlay.style.display==='flex')return;let clickedItemName=null;for(const item of clickableItems){if(clickX>=item.x&&clickX<=item.x+item.width&&clickY>=item.y&&clickY<=item.y+item.height){clickedItemName=item.name;break;}} if(clickedItemName){console.log(`Oyun: Tıklandı: ${clickedItemName}`);const currentLevelData=levels[currentLevelIndex];const expectedClick=currentLevelData.clicks[currentRecipeStep];if(clickedItemName===expectedClick){console.log("Oyun: Doğru adım!");currentRecipeStep++;if(currentRecipeStep>=currentLevelData.clicks.length){const completedLevel=currentLevelData.level;console.log(`--- Seviye ${completedLevel} Bitti! ---`);const rewardAmountStr=getRewardForLevel(completedLevel,currentRegion);currentLevelIndex++;currentRecipeStep=0;if(levels[currentLevelIndex]&&levels[currentLevelIndex].clicks.length>0){currentShuffledRecipe=shuffleArray(levels[currentLevelIndex].clicks);}else{currentShuffledRecipe=[];} if(rewardAmountStr){console.warn(`%cÖDÜL! Seviye ${completedLevel} (${rewardAmountStr})`,'color:green;font-weight:bold;');const isLevel10=completedLevel===10;const winMsgPart2=isLevel10?texts[currentLang].winMessagePart2_USDT:texts[currentLang].winMessagePart2_App.replace('{REWARD}',rewardAmountStr);const mailBodyBase=isLevel10?texts[currentLang].winMessageEmailBodyBase_USDT:texts[currentLang].winMessageEmailBodyBase_App;const mailBody=encodeURIComponent(mailBodyBase.replace('{LEVEL}',completedLevel).replace('{REWARD}',rewardAmountStr));const mailSubject=encodeURIComponent(`${texts[currentLang].winMessageEmailSubjectBase}${completedLevel}${isLevel10?' - NAKIT ODUL':''}`);const mailtoLink=`mailto:${texts[currentLang].winMessageEmailAddress}?subject=${mailSubject}&body=${mailBody}`;const winHtml=`<p>${texts[currentLang].winMessagePart1}${completedLevel}${winMsgPart2}</p><hr><p>${texts[currentLang].winMessageEmailPrompt}<br><a href="${mailtoLink}" target="_blank"><b>${texts[currentLang].winMessageEmailAddress}</b></a><br>${texts[currentLang].winMessageEmailInstructions}</p>`;showMessage(texts[currentLang].winTitle,winHtml,'win');} const nextLevelData=levels[currentLevelIndex];if(!nextLevelData||nextLevelData.clicks.length===0){console.log("OYUN TAMAMLANDI!");gameState='GAME_OVER';requestAnimationFrame(drawGame);}}else{/*Doğru adım feedback?*/}}else{console.log("Oyun: Yanlış! Baştan başla.");currentRecipeStep=0;failedAttemptsToday++;saveGameData();console.log(`Kalan hak: ${3-failedAttemptsToday}/3`);feedbackMessage={text:texts[currentLang].errorMessage,color:'red',expiryTime:Date.now()+2500};if(failedAttemptsToday>=3){canPlay=false;console.error("Hak bitti!");gameState='NO_ATTEMPTS';} requestAnimationFrame(drawGame);}}else{console.log("Oyun: Boş alan tıklandı.");}}}
}


// Olay dinleyicileri
canvas.addEventListener('click', handleClick);
// Fare koordinatları kaldırıldı
// canvas.addEventListener('mousemove', handleMouseMove);

// Hata logları
bgImage.onerror = () => { console.error("BG Yüklenemedi!"); }
logoImage.onerror = () => { console.error("Logo Yüklenemedi!"); }

// --- Başlangıç Ayarları ---
// Sayfa ilk yüklendiğinde varsayılan dil/bölge ile metinleri ayarla
// ve localStorage'dan hakları kontrol et (ama oyunu başlatma)
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Yüklendi.");
    // Belki localStorage'dan kayıtlı dil/bölge tercihini okuruz?
    // currentLang = localStorage.getItem('barista_lang') || 'TR';
    // currentRegion = localStorage.getItem('barista_region') || 'TR';
    // regionSelect.value = currentRegion; // Dropdown'ı ayarla
    updateTexts(currentLang); // Ekrana ilk metinleri yaz
    loadGameData(); // Hakları kontrol et (oyunu başlatmaz)

    // Görsel yüklemelerini başlat (bunlar bitince tryStartGame çağrılacak)
    console.log("Görseller yükleniyor...");
});

console.log("script.js dosyası okundu.");
