// Canvas ve Context
const canvas = document.getElementById('gameCanvas'); const ctx = canvas.getContext('2d');

// --- Giriş Ekranı Elementleri ---
const startScreenDiv = document.getElementById('startScreen'); const gameTitleEl = document.getElementById('gameTitle'); const gameSloganEl = document.getElementById('gameSlogan'); const langTRButton = document.getElementById('langTR'); const langENButton = document.getElementById('langEN'); const regionSelect = document.getElementById('regionSelect'); const regionLabelEl = document.getElementById('regionLabel'); const rewardTitleEl = document.getElementById('rewardTitle'); const rewardSummaryEl = document.getElementById('rewardSummary'); const startButton = document.getElementById('startButton'); const gsmInput = document.getElementById('gsmInput'); const kvkkCheck = document.getElementById('kvkkCheck'); const gsmError = document.getElementById('gsmError'); const gsmLabel = document.getElementById('gsmLabel'); const kvkkLabel = document.getElementById('kvkkLabel');

// Mesajlaşma Elementleri ...
const messageOverlay = document.getElementById('messageOverlay'); /*...*/ const messageTitle = document.getElementById('messageTitle'); /*...*/ const messageBody = document.getElementById('messageBody'); /*...*/ const closeButton = document.getElementById('closeButton'); /*...*/

// Görsel Nesneleri ve Yükleme Durumları ...
const bgImage = new Image(); const logoImage = new Image(); let bgLoaded = false, logoLoaded = false;

// Oyun Durumları ...
let gameState = 'LOADING'; let tutorialStep = 0; let isTutorialComplete = false;

// Oyun Değişkenleri ...
let currentLevelIndex = 0; let currentRecipeStep = 0; let canPlay = false; let gameLoopStarted = false; let currentShuffledRecipe = [];

// Dil ve Bölge ...
let currentLang = 'TR'; let currentRegion = 'TR';

// localStorage ve Günlük Hak Takibi ...
let failedAttemptsToday = 0; let lastPlayDate = '';
function loadGameData() { /* ... */ const today=new Date().toISOString().split('T')[0];lastPlayDate=localStorage.getItem('barista_lastPlayDate')||today;failedAttemptsToday=parseInt(localStorage.getItem('barista_failedAttempts')||'0',10);if(lastPlayDate!==today){console.log("Yeni gün!");failedAttemptsToday=0;lastPlayDate=today;saveGameData();} if(failedAttemptsToday>=3){canPlay=false;console.warn("Hak bitti.");}else{canPlay=true;} console.log(`Bugünkü hata hakkı: ${3-failedAttemptsToday}/3`); }
function saveGameData() { /* ... */ localStorage.setItem('barista_lastPlayDate',lastPlayDate);localStorage.setItem('barista_failedAttempts',failedAttemptsToday.toString()); }

// Geri Bildirim Mesajı Değişkenleri ...
let feedbackMessage = { text: '', color: 'red', expiryTime: 0 };

// Metinler Objesi (GÜNCELLENDİ - EN tamamlandı, KVKK/GDPR eklendi, Özet güncellendi)
const texts = {
    TR: {
        gameTitle: "Kyrosil Starbucks Barista", slogan: "En İyi Barista Ol, Ödülleri Kap!", regionLabel: "Bölge:",
        rewardTitle: "Ödüller", rewardSummary: "Seviye 2: {LVL2_REWARD}, Seviye 10: {LVL10_REWARD}! Diğer seviyelerde de ödüller!", // Dinamikleşti
        startButton: "Oyuna Başla!", level: "Seviye", order: "Sipariş", requirements: "Gerekenler", attemptsLeft: "Kalan Hata Hakkı",
        errorTitle: "Hata!", errorMessage: "Yanlış malzeme veya sıra! Baştan başla.", winTitle: "Tebrikler!", winMessagePart1: "Seviye ",
        winMessagePart2_App: " **{REWARD}** değerinde Starbucks Mobil Uygulaması ödülü kazandın!", winMessagePart2_USDT: " **NAKİT ÖDÜL (500 USDT)** kazandın!",
        winMessageEmailPrompt: "Ödülünü almak için aşağıdaki linke tıklayarak veya manuel olarak", winMessageEmailAddress: "giveaways@kyrosil.eu", winMessageEmailSubjectBase: "Kyrosil Starbucks Oyun Ödülü - Seviye ",
        winMessageEmailBodyBase_App: "Merhaba,\n\nSeviye {LEVEL} Starbucks Mobil Uygulaması ödülünü ({REWARD}) kazandım...\n(Kalanı aynı)", winMessageEmailBodyBase_USDT: "Merhaba,\n\nSeviye 10 Büyük Ödülünü (500 USDT) kazandım...\n(Kalanı aynı)",
        winMessageEmailInstructions: "adresine bu ekranın görüntüsüyle birlikte mail atabilirsin.",
        gameOverTitle: "Oyun Bitti!", gameOverMessage: "Tüm seviyeleri tamamladın! Harikasın!",
        noAttemptsTitle: "Hakların Bitti!", noAttemptsMessage: "Bugünkü 3 hata yapma hakkını doldurdun. Yarın tekrar oynamak için geri gel!",
        closeButton: "Tamam", tutorialIntro:"Oyuna Hoş Geldin!", tutorialItemIntro:"Bu: ", tutorialItemAction_Default:". Tarifte adı geçince buraya tıklayacaksın.", /*...*/ tutorialComplete:"Harika! Başlıyoruz!", tutorialOutOfAttempts:"Hakların bittiği için bugünlük bu kadar!",
        mixedOrderWarning: "Not: Malzemeler karışık listelenmiştir, doğru sırada hazırlayın!", priceCheckWarning: "Müşteri fiyatı da sordu!",
        gsmLabel: "Starbucks Mobile Kayıtlı GSM No:", gsmPlaceholder: "05xxxxxxxxx", // Placeholder eklendi
        kvkkLabel: " KVKK kapsamında numaramın sadece ödül aktarımı için kullanılmasını onaylıyorum.", // Yeni metin
        gsmError: "Lütfen 10 veya 11 haneli numara girip kutuyu işaretleyin."
    },
    EN: {
        gameTitle: "Kyrosil Starbucks Barista", slogan: "Be the Best Barista, Grab the Rewards!", regionLabel: "Region:",
        rewardTitle: "Rewards", rewardSummary: "Level 2: {LVL2_REWARD}, Level 10: {LVL10_REWARD}! Rewards on other levels too!",
        startButton: "Start Game!", level: "Level", order: "Order", requirements: "Required", attemptsLeft: "Attempts Left",
        errorTitle: "Error!", errorMessage: "Wrong item or sequence! Start over.", winTitle: "Congratulations!", winMessagePart1: "You won the Level ",
        winMessagePart2_App: " Starbucks Mobile App reward ({REWARD})!", winMessagePart2_USDT: " CASH PRIZE (500 USDT)!",
        winMessageEmailPrompt: "To claim your reward, click the link below or manually email", winMessageEmailAddress: "giveaways@kyrosil.eu", winMessageEmailSubjectBase: "Kyrosil Starbucks Game Reward - Level ",
        winMessageEmailBodyBase_App: "Hello,\n\nI won the Level {LEVEL} Starbucks Mobile App reward ({REWARD}).\nI'm waiting for my app code.\nMy screenshot is attached.\n\nThanks.",
        winMessageEmailBodyBase_USDT: "Hello,\n\nI won the Level 10 Grand Prize (500 USDT).\nI await details for the prize transfer.\nMy screenshot is attached.\n\nThanks.",
        winMessageEmailInstructions: "with a screenshot of this screen.",
        gameOverTitle: "Game Over!", gameOverMessage: "You completed all levels! Awesome!",
        noAttemptsTitle: "No Attempts Left!", noAttemptsMessage: "You've used your 3 attempts for today. Come back tomorrow!",
        closeButton: "OK", tutorialIntro:"Welcome! Let's show you around.", tutorialItemIntro:"This is the: ", tutorialItemAction_Default:". Click here when it's in the recipe.", /*...*/ tutorialComplete:"Great! Let's begin!", tutorialOutOfAttempts:"You are out of attempts for today!",
        mixedOrderWarning: "Note: Ingredients listed randomly, prepare in correct order!", priceCheckWarning: "Customer asked for the price!",
        gsmLabel: "Starbucks Mobile Registered GSM No:", gsmPlaceholder: "Enter phone number", // Placeholder added
        kvkkLabel: " I agree my number may be used solely for reward transfer under GDPR.", // New text (GDPR reference)
        gsmError: "Please enter a 10 or 11 digit number and check the box."
     }
};

// Ödül Seviyeleri (Aynı)
const rewardTiers = { TR:{2:"200 TL",4:"600 TL",6:"2.000 TL",8:"5.000 TL",10:"500 USDT"}, EU:{2:"5 USD",4:"15 USD",6:"40 USD",8:"100 USD",10:"500 USDT"} };
function getRewardForLevel(level, region) { return rewardTiers[region]?.[level] || null; }

// Mesaj Gösterme Fonksiyonları (Aynı)
function showMessage(title, bodyHtml, type='info') { /*...*/ } function hideMessage() { /*...*/ } closeButton.addEventListener('click', hideMessage);

// Tıklanabilir Alanlar (Aynı)
const clickableItems = [ /* ... 11 öğe ... */ ];

// Seviye Tarifleri (Aynı)
const levels = [ /* ... 10 seviye + bitiş ... */ ];

// Görsel yükleme olayları
bgImage.onload = function() { console.log("BG yüklendi"); bgLoaded=true; if(logoLoaded) checkAssetsLoaded();};
logoImage.onload = function() { console.log("Logo yüklendi"); logoLoaded=true; if(bgLoaded) checkAssetsLoaded();};
const logoWidth = 80; const logoHeight = 80; const logoX = canvas.width/2-logoWidth/2; const logoY = 20;

// Tüm Görseller Yüklendi Mi Kontrolü (Aynı)
function checkAssetsLoaded() { if(bgLoaded&&logoLoaded&&gameState==='LOADING'){console.log("Görseller yüklendi...");gameState='START_SCREEN';loadGameData();updateTexts(currentLang,currentRegion);checkStartButtonState();}}

// Fisher-Yates Shuffle Algoritması (Aynı)
function shuffleArray(array){/*...*/}

// Ana oyun döngüsü fonksiyonu (Aynı - Hata düzeltilmiş hali)
function drawGame() { /* ... Önceki (düzeltilmiş) koddan kopyala ... */ }

// Metin Güncelleme Fonksiyonu (GÜNCELLENDİ - Tüm alanlar)
function updateTexts(lang, region) {
    console.log(`updateTexts: Lang=${lang}, Region=${region}`);
    const t = texts[lang];
    document.title = t.gameTitle;
    if(gameTitleEl) gameTitleEl.innerText = t.gameTitle;
    if(gameSloganEl) gameSloganEl.innerText = t.slogan;
    if(regionLabelEl) regionLabelEl.innerText = t.regionLabel;
    if(rewardTitleEl) rewardTitleEl.innerText = t.rewardTitle;
    if(startButton) startButton.innerText = t.startButton;
    if(closeButton) closeButton.innerText = t.closeButton;
    if(gsmLabel) gsmLabel.innerText = t.gsmLabel;
    if(kvkkLabel) kvkkLabel.innerHTML = t.kvkkLabel;
    if(gsmError) gsmError.innerText = t.gsmError;
    // YENİ: Placeholder güncellemesi
    if(gsmInput && t.gsmPlaceholder) gsmInput.placeholder = t.gsmPlaceholder;

    // Ödül Özetini Güncelle (Dinamik)
    if(rewardSummaryEl) {
        const lvl2Reward = getRewardForLevel(2, region) || '?';
        const lvl10Reward = getRewardForLevel(10, region) || '?';
        // Metni texts objesinden alıp dinamik değerleri yerleştir
        rewardSummaryEl.innerText = t.rewardSummary
            .replace('{LVL2_REWARD}', lvl2Reward)
            .replace('{LVL10_REWARD}', lvl10Reward);
    }

    // Aktif dil butonunu ayarla
    if(langTRButton) langTRButton.classList.toggle('active', lang === 'TR');
    if(langENButton) langENButton.classList.toggle('active', lang === 'EN');
    document.documentElement.lang = lang.toLowerCase();
    console.log(`Metinler ${lang} (${region}) olarak güncellendi.`);
}

// Olay Dinleyicileri (Giriş Ekranı - regionSelect'e updateTexts eklendi)
langTRButton.addEventListener('click', () => { if(currentLang!=='TR'){currentLang='TR';updateTexts(currentLang, currentRegion);}});
langENButton.addEventListener('click', () => { if(currentLang!=='EN'){currentLang='EN';updateTexts(currentLang, currentRegion);}});
regionSelect.addEventListener('change', (event) => { currentRegion=event.target.value; console.log("Bölge seçildi:",currentRegion); updateTexts(currentLang, currentRegion); /* Bölge değişince metinleri (ödül özeti) güncelle */ });
startButton.addEventListener('click', startGame);

// Başlat Butonu Durum Kontrolü (Aynı)
function checkStartButtonState() { /* ... */ const numberValid=gsmInput.value.match(/^\d{10,11}$/); const kvkkValid=kvkkCheck.checked; if(numberValid&&kvkkValid){startButton.disabled=false;gsmError.style.display='none';}else{startButton.disabled=true; if((gsmInput.value.length>0||kvkkCheck.checked)&&!(numberValid&&kvkkValid)){gsmError.style.display='block';}else{gsmError.style.display='none';}} }
gsmInput.addEventListener('input', checkStartButtonState);
kvkkCheck.addEventListener('change', checkStartButtonState);

// --- YENİ: tryStartGame fonksiyon tanımını startGame'den ÖNCEYE taşıyalım ---
function tryStartGame() {
    if (gameState === 'LOADING') return; // Görseller yüklenmeden çağrılırsa bir şey yapma

    if (gameState === 'START_SCREEN' || gameState === 'LOADING') { // Sadece başlangıçta veya yeniden başlatmada
        console.log("tryStartGame çağrıldı, hak kontrolü yapılıyor.");
        loadGameData();
        if (!canPlay) {
            gameState = 'NO_ATTEMPTS';
            requestAnimationFrame(drawGame); // Mesajı çizmek için
        } else {
            gameState = 'TUTORIAL';
            tutorialStep = 0;
            isTutorialComplete = false;
             // İlk seviyenin tarifini karıştır
            if (levels[0] && levels[0].clicks.length > 0) { currentShuffledRecipe = shuffleArray(levels[0].clicks); }
            else { currentShuffledRecipe = []; }

            // Oyun döngüsünü başlat (eğer zaten başlamadıysa)
            if (!gameLoopStarted) {
                console.log("Oyun döngüsü başlatılıyor (tryStartGame içinden)...");
                gameLoopStarted = true;
                requestAnimationFrame(drawGame);
            }
        }
    }
}
// --- tryStartGame Sonu ---

// Oyunu Başlatma Fonksiyonu (tryStartGame'i çağırır)
function startGame() {
    checkStartButtonState();
    if (startButton.disabled) {
        console.warn("Başlatma engellendi: GSM/KVKK şartları sağlanmadı.");
        gsmError.style.display = 'block';
        return;
    }
    console.log("Başlat butonuna tıklandı.");
    startScreenDiv.style.display = 'none';
    canvas.style.display = 'block';
    tryStartGame(); // Oyun durumunu ayarla ve döngüyü tetikle
}


// Oyun döngüsünü başlatan fonksiyon (Artık kullanılmıyor, tryStartGame devraldı)
// function startGameLoop() { ... }


// Tıklama İşleyici Fonksiyon (Aynı)
function handleClick(event) { /* ... Önceki mesajdaki tam kod ... */ }

// Olay dinleyicileri (mousemove kaldırıldı)
canvas.addEventListener('click', handleClick);
// Hata logları
bgImage.onerror = () => { console.error("BG Yüklenemedi!"); }
logoImage.onerror = () => { console.error("Logo Yüklenemedi!"); }

// Başlangıç Ayarları (DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Yüklendi.");
    // localStorage'dan tercihleri oku (varsa)
    // currentLang = localStorage.getItem('barista_lang') || 'TR';
    // currentRegion = localStorage.getItem('barista_region') || 'TR';
    // regionSelect.value = currentRegion; // Dropdown'ı ayarla

    loadGameData(); // Sayfa yüklenince hakları kontrol et
    updateTexts(currentLang, currentRegion); // Metinleri ayarla
    checkStartButtonState(); // Başlat butonunun ilk durumunu ayarla

    // Görsel yüklemelerini başlat
    console.log("Görseller yükleniyor...");
    bgImage.src = 'original.gif';
    logoImage.src = 'Starbucks_Corporation.png';
});

console.log("script.js dosyası okundu.");
