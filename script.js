// Canvas ve Context
const canvas = document.getElementById('gameCanvas'); const ctx = canvas?.getContext('2d'); // Null check eklendi

// Giriş Ekranı Elementleri
const startScreenDiv=document.getElementById('startScreen'); const gameTitleEl=document.getElementById('gameTitle'); const gameSloganEl=document.getElementById('gameSlogan'); const langTRButton=document.getElementById('langTR'); const langENButton=document.getElementById('langEN'); const regionSelect=document.getElementById('regionSelect'); const regionLabelEl=document.getElementById('regionLabel'); const rewardTitleEl=document.getElementById('rewardTitle'); const rewardListEl=document.getElementById('rewardList'); const startButton=document.getElementById('startButton'); const gsmInput=document.getElementById('gsmInput'); const kvkkCheck=document.getElementById('kvkkCheck'); const gsmError=document.getElementById('gsmError'); const gsmLabel=document.getElementById('gsmLabel'); const kvkkLabel=document.getElementById('kvkkLabel');
// Mesajlaşma Elementleri
const messageOverlay=document.getElementById('messageOverlay'); const messageTitle=document.getElementById('messageTitle'); const messageBody=document.getElementById('messageBody'); const closeButton=document.getElementById('closeButton');
// Görsel Nesneleri ve Yükleme Durumları
const bgImage = new Image(); const logoImage = new Image(); let bgLoaded = false, logoLoaded = false;
// Oyun Durumları
let gameState = 'LOADING'; let tutorialStep = 0; let isTutorialComplete = false;
// Oyun Değişkenleri
let currentLevelIndex = 0; let currentRecipeStep = 0; let canPlay = false; let gameLoopStarted = false; let currentShuffledRecipe = [];
// Dil ve Bölge
let currentLang = 'TR'; let currentRegion = 'TR';
// localStorage ve Günlük Hak Takibi
let failedAttemptsToday = 0; let lastPlayDate = '';
function loadGameData(){const today=new Date().toISOString().split('T')[0];lastPlayDate=localStorage.getItem('barista_lastPlayDate')||today;failedAttemptsToday=parseInt(localStorage.getItem('barista_failedAttempts')||'0',10);if(lastPlayDate!==today){console.log("Yeni gün!");failedAttemptsToday=0;lastPlayDate=today;saveGameData();} if(failedAttemptsToday>=3){canPlay=false;console.warn("Hak bitti.");}else{canPlay=true;} console.log(`Bugünkü hata hakkı: ${3-failedAttemptsToday}/3`);}
function saveGameData(){localStorage.setItem('barista_lastPlayDate',lastPlayDate);localStorage.setItem('barista_failedAttempts',failedAttemptsToday.toString());}
// Geri Bildirim Mesajı Değişkenleri
let feedbackMessage = { text: '', color: 'red', expiryTime: 0 };

// Metinler Objesi (Güncellendi)
const texts = {
    TR: {
        gameTitle: "Kyrosil Starbucks Barista", slogan: "En İyi Barista Ol! Siparişleri doğru sırayla hazırla, ödülleri kap!", regionLabel: "Bölge:",
        rewardTitle: "Seviye Ödülleri", startButton: "Oyuna Başla!",
        level: "Seviye", order: "Sipariş", requirements: "Gerekenler", attemptsLeft: "Kalan Hata Hakkı",
        errorTitle: "Hata!", errorMessage: "Yanlış malzeme veya sıra! Baştan başla.", winTitle: "Tebrikler!", winMessagePart1: "Seviye ",
        winMessagePart2_App: " **{REWARD}** değerinde Starbucks Mobil Uygulaması ödülü kazandın!", winMessagePart2_USDT: " **NAKİT ÖDÜL (500 USDT)** kazandın!",
        winMessageEmailPrompt: "Ödülünü almak için aşağıdaki linke tıklayarak veya manuel olarak", winMessageEmailAddress: "giveaways@kyrosil.eu", winMessageEmailSubjectBase: "Kyrosil Starbucks Oyun Ödülü - Seviye ",
        winMessageEmailBodyBase_App: "Merhaba,\n\nSeviye {LEVEL} Starbucks Mobil Uygulaması ödülünü ({REWARD}) kazandım.\nUygulama kodumu bekliyorum.\n\nEkran görüntüm ektedir.\n\nTeşekkürler.",
        winMessageEmailBodyBase_USDT: "Merhaba,\n\nSeviye 10 Büyük Ödülünü (500 USDT) kazandım.\nÖdül gönderimi için detayları bekliyorum.\n\nEkran görüntüm ektedir.\n\nTeşekkürler.",
        winMessageEmailInstructions: "adresine bu ekranın görüntüsüyle birlikte mail atabilirsin.",
        gameOverTitle: "Oyun Bitti!", gameOverMessage: "Tüm seviyeleri tamamladın! Harikasın!",
        noAttemptsTitle: "Hakların Bitti!", noAttemptsMessage: "Bugünkü 3 hata yapma hakkını doldurdun. Yarın tekrar oynamak için geri gel!",
        closeButton: "Tamam", tutorialIntro:"...", tutorialItemIntro:"Bu: ", tutorialItemAction_Default:". Tarifte adı geçince buraya tıklayacaksın.", /*...*/ tutorialComplete:"...", tutorialOutOfAttempts:"...",
        mixedOrderWarning: "Not: Malzemeler karışık listelenmiştir, doğru sırada hazırlayın!", priceCheckWarning: "Müşteri fiyatı da sordu!",
        gsmLabel: "Starbucks Mobile Kayıtlı GSM No:", gsmPlaceholder: "Numaranızı Girin", // Düzeltildi
        kvkkLabel: " KVKK kapsamında numaramın sadece ödül aktarımı için göstermelik olarak istendiğini anladım, onaylıyorum.",
        gsmError: "Lütfen numara girip kutuyu işaretleyin.",
        rewardTypeApp: "(Starbucks App Kodu)", rewardTypeCash: "(NAKİT ÖDÜL!)"
    },
    EN: { /* ... İngilizce metinler güncellendi ... */
        gameTitle: "Kyrosil Starbucks Barista", slogan: "Be the Best Barista! Prepare orders correctly and grab rewards!", regionLabel: "Region:",
        rewardTitle: "Level Rewards", startButton: "Start Game!",
        level: "Level", order: "Order", requirements: "Required", attemptsLeft: "Attempts Left",
        errorTitle: "Error!", errorMessage: "Wrong item or sequence! Start over.", winTitle: "Congratulations!", winMessagePart1: "You won the Level ",
        winMessagePart2_App: " Starbucks Mobile App reward ({REWARD})!", winMessagePart2_USDT: " CASH PRIZE (500 USDT)!",
        winMessageEmailPrompt: "To claim your reward, click the link below or manually email", winMessageEmailAddress: "giveaways@kyrosil.eu", winMessageEmailSubjectBase: "Kyrosil Starbucks Game Reward - Level ",
        winMessageEmailBodyBase_App: "Hello,\n\nI won the Level {LEVEL} Starbucks Mobile App reward ({REWARD})...", winMessageEmailBodyBase_USDT: "Hello,\n\nI won the Level 10 Grand Prize (500 USDT)...",
        winMessageEmailInstructions: "with a screenshot.",
        gameOverTitle: "Game Over!", gameOverMessage: "You completed all levels! Awesome!",
        noAttemptsTitle: "No Attempts Left!", noAttemptsMessage: "You've used your 3 attempts for today. Come back tomorrow!",
        closeButton: "OK", tutorialIntro:"Welcome! Let's show you the interaction areas:", tutorialItemIntro:"This is the: ", tutorialItemAction_Default:". Click here when it's in the recipe.",/*...*/ tutorialComplete:"Great! Let's begin!", tutorialOutOfAttempts:"You are out of attempts for today!",
        mixedOrderWarning: "Note: Ingredients listed randomly, prepare in correct order!", priceCheckWarning: "Customer asked for the price!",
        gsmLabel: "Starbucks Mobile Registered GSM No:", gsmPlaceholder: "Enter your phone number", // Fixed
        kvkkLabel: " I agree my number is requested symbolically for reward transfer under GDPR & Privacy Policy. (Applies to USA users selecting Europe too).",
        gsmError: "Please enter a number and check the box.",
        rewardTypeApp: "(Starbucks App Code)", rewardTypeCash: "(CASH PRIZE!)"
     }
};

// Ödül Seviyeleri (Aynı)
const rewardTiers = { TR:{/*...*/}, EU:{/*...*/} }; function getRewardForLevel(level, region) { return rewardTiers[region]?.[level] || null; }

// Mesaj Gösterme Fonksiyonları (Aynı)
function showMessage(title, bodyHtml, type='info'){/*...*/} function hideMessage(){/*...*/}

// Tıklanabilir Alanlar (Aynı)
const clickableItems = [ /* ... 11 öğe ... */ ];
// Seviye Tarifleri (Aynı)
const levels = [ /* ... 10 seviye + bitiş ... */ ];

// Görsel yükleme olayları
bgImage.onload = function(){console.log("BG yüklendi");bgLoaded=true;if(logoLoaded)checkAssetsLoaded();};
logoImage.onload = function(){console.log("Logo yüklendi");logoLoaded=true;if(bgLoaded)checkAssetsLoaded();};
const logoWidth = 80; const logoHeight = 80; const logoX = canvas.width/2-logoWidth/2; const logoY = 20;

// Tüm Görseller Yüklendi Mi Kontrolü (Aynı)
function checkAssetsLoaded(){if(bgLoaded&&logoLoaded&&gameState==='LOADING'){console.log("Görseller yüklendi...");gameState='START_SCREEN';loadGameData();updateTexts(currentLang,currentRegion);checkStartButtonState();}}

// Fisher-Yates Shuffle Algoritması (Aynı)
function shuffleArray(array){/*...*/}

// Metin Güncelleme Fonksiyonu (Aynı)
function updateTexts(lang, region) { /* ... Önceki koddan kopyala (Detaylı ödül listesi dahil) ... */ }

// Başlat Butonu Durum Kontrolü (Aynı)
function checkStartButtonState() { /* ... Önceki koddan kopyala (Hane kontrolsüz) ... */ }

// tryStartGame Fonksiyonu (Aynı - Tanımı yukarıda)
function tryStartGame() { /* ... Önceki koddan kopyala ... */ }

// Oyunu Başlatma Fonksiyonu (Aynı)
function startGame() { /* ... Önceki koddan kopyala ... */ }

// Ana oyun döngüsü fonksiyonu (GÜNCELLENDİ - DEBUG KUTULARI GERİ GELDİ)
function drawGame() {
    try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (bgLoaded) ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        if (logoLoaded) { /* ... logo ve daire ... */ }

        let currentTextY = 30;

        // Sol Üst: Kalan Haklar
        /* ... */ ctx.fillStyle='white';ctx.font='bold 16px Arial';ctx.textAlign='left'; ctx.shadowColor='black';ctx.shadowBlur=3;ctx.shadowOffsetX=1;ctx.shadowOffsetY=1; ctx.fillText(`${texts[currentLang].attemptsLeft}: ${3-failedAttemptsToday}`,20,currentTextY); currentTextY+=25; ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;

        // Oyun Durumuna Göre Çizim
        if (gameState === 'TUTORIAL') {
            const itemToShow=clickableItems[tutorialStep]; if(itemToShow){ ctx.strokeStyle=(Math.sin(Date.now()*0.005)>0)?'yellow':'orange';ctx.lineWidth=3;ctx.strokeRect(itemToShow.x-2,itemToShow.y-2,itemToShow.width+4,itemToShow.height+4); /*...*/ } // Vurgulama

        } else if (gameState === 'PLAYING') {
            // Sol Üst: Seviye, Sipariş, Gerekenler, Uyarılar
            if (levels[currentLevelIndex]) { /* ... Yazı çizimleri ... */ }
             // Geçici Hata/Başarı Mesajı
            if (feedbackMessage.text && Date.now() < feedbackMessage.expiryTime) { /*...*/ } else { feedbackMessage.text='';}

        } else if (gameState === 'NO_ATTEMPTS' || gameState === 'GAME_OVER') {
             // Hak Bitti veya Oyun Bitti Mesajları
             /* ... */
        }

        // --- DEBUG: Tıklanabilir alanları çiz (TEKRAR AKTİF!) ---
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)'; ctx.lineWidth = 2;
        ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '10px Arial';
        for (const item of clickableItems) {
            ctx.strokeRect(item.x, item.y, item.width, item.height);
            ctx.fillText(item.name, item.x + item.width / 2, item.y + item.height / 2 + 4);
        }
        ctx.textAlign = 'left'; // Hizalamayı geri al
        // --- DEBUG SONU ---

        // Döngüyü devam ettir
        if (gameLoopStarted && (gameState === 'PLAYING' || gameState === 'TUTORIAL')) {
             requestAnimationFrame(drawGame);
        }
    } catch (e) { console.error("Draw HATA:",e); gameLoopStarted = false; }
}

// Tıklama İşleyici Fonksiyon (Aynı)
function handleClick(event) { /* ... Önceki koddan kopyala ... */ }


// --- Olay Dinleyicileri (DOMContentLoaded İçinde) ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Yüklendi.");

    // Element referanslarını al
    canvas = document.getElementById('gameCanvas'); ctx = canvas?.getContext('2d');
    startScreenDiv=document.getElementById('startScreen'); gameTitleEl=document.getElementById('gameTitle'); gameSloganEl=document.getElementById('gameSlogan'); langTRButton=document.getElementById('langTR'); langENButton=document.getElementById('langEN'); regionSelect=document.getElementById('regionSelect'); regionLabelEl=document.getElementById('regionLabel'); rewardTitleEl=document.getElementById('rewardTitle'); rewardListEl=document.getElementById('rewardList'); startButton=document.getElementById('startButton'); gsmInput=document.getElementById('gsmInput'); kvkkCheck=document.getElementById('kvkkCheck'); gsmError=document.getElementById('gsmError'); gsmLabel=document.getElementById('gsmLabel'); kvkkLabel=document.getElementById('kvkkLabel');
    messageOverlay=document.getElementById('messageOverlay'); messageTitle=document.getElementById('messageTitle'); messageBody=document.getElementById('messageBody'); closeButton=document.getElementById('closeButton');

    // Kritik element kontrolü
    if (!canvas || !ctx || !startScreenDiv || !startButton || !gsmInput || !kvkkCheck || !messageOverlay || !closeButton || !langTRButton || !langENButton || !regionSelect || !rewardListEl) { console.error("HATA: Gerekli HTML elementlerinden biri bulunamadı!"); alert("Kritik hata!"); return; }

    // Dinleyicileri Ekle
    langTRButton.addEventListener('click', () => { if(currentLang!=='TR'){currentLang='TR';updateTexts(currentLang, currentRegion);}});
    langENButton.addEventListener('click', () => { if(currentLang!=='EN'){currentLang='EN';updateTexts(currentLang, currentRegion);}});
    regionSelect.addEventListener('change', (event) => { currentRegion=event.target.value; console.log("Bölge:",currentRegion); updateTexts(currentLang, currentRegion); });
    startButton.addEventListener('click', startGame);
    gsmInput.addEventListener('input', checkStartButtonState);
    kvkkCheck.addEventListener('change', checkStartButtonState);
    closeButton.addEventListener('click', hideMessage);
    canvas.addEventListener('click', handleClick);

    // Başlangıç Ayarları
    currentLang = localStorage.getItem('barista_lang') || 'TR'; currentRegion = localStorage.getItem('barista_region') || 'TR'; regionSelect.value = currentRegion; langTRButton.classList.toggle('active', currentLang === 'TR'); langENButton.classList.toggle('active', currentLang === 'EN');
    loadGameData(); updateTexts(currentLang, currentRegion); checkStartButtonState();

    // Görsel yüklemelerini başlat
    console.log("Görseller yükleniyor...");
    bgImage.src = 'original.gif'; logoImage.src = 'Starbucks_Corporation.png';
});

// Hata logları
bgImage.onerror = () => { console.error("BG Yüklenemedi!"); }
logoImage.onerror = () => { console.error("Logo Yüklenemedi!"); }

console.log("script.js dosyası okundu.");
