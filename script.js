// Canvas ve Context
const canvas = document.getElementById('gameCanvas'); const ctx = canvas.getContext('2d');
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
        gameTitle: "Kyrosil Starbucks Barista", slogan: "En Hızlı ve Dikkatli Barista Ol, Ödülleri Kap! Malzemelere doğru sırada tıklayarak siparişleri hazırla.",
        regionLabel: "Bölge:", rewardTitle: "Seviye Ödülleri", startButton: "Oyuna Başla!",
        level: "Seviye", order: "Sipariş", requirements: "Gerekenler", attemptsLeft: "Kalan Hata Hakkı",
        errorTitle: "Hata!", errorMessage: "Yanlış malzeme veya sıra! Baştan başla.", winTitle: "Tebrikler!", winMessagePart1: "Seviye ",
        winMessagePart2_App: " **{REWARD}** değerinde Starbucks Mobil Uygulaması ödülü kazandın!", winMessagePart2_USDT: " **NAKİT ÖDÜL (500 USDT)** kazandın!",
        winMessageEmailPrompt: "Ödülünü almak için aşağıdaki linke tıklayarak veya manuel olarak", winMessageEmailAddress: "giveaways@kyrosil.eu", winMessageEmailSubjectBase: "Kyrosil Starbucks Oyun Ödülü - Seviye ",
        winMessageEmailBodyBase_App: "Merhaba,\n\nSeviye {LEVEL} Starbucks Mobil Uygulaması ödülünü ({REWARD}) kazandım.\nUygulama kodumu bekliyorum.\n\nEkran görüntüm ektedir.\n\nTeşekkürler.",
        winMessageEmailBodyBase_USDT: "Merhaba,\n\nSeviye 10 Büyük Ödülünü (500 USDT) kazandım.\nÖdül gönderimi için detayları bekliyorum.\n\nEkran görüntüm ektedir.\n\nTeşekkürler.",
        winMessageEmailInstructions: "adresine bu ekranın görüntüsüyle birlikte mail atabilirsin.",
        gameOverTitle: "Oyun Bitti!", gameOverMessage: "Tüm seviyeleri tamamladın! Harikasın!",
        noAttemptsTitle: "Hakların Bitti!", noAttemptsMessage: "Bugünkü 3 hata yapma hakkını doldurdun. Yarın tekrar oynamak için geri gel!",
        closeButton: "Tamam", tutorialIntro:"...", tutorialItemIntro:"Bu: ", tutorialItemAction_Default:". Tarifte adı geçince buraya tıklayacaksın.", /*...*/ tutorialComplete:"Harika! Başlıyoruz!", tutorialOutOfAttempts:"Hakların bittiği için bugünlük bu kadar!",
        mixedOrderWarning: "Not: Malzemeler karışık listelenmiştir, doğru sırada hazırlayın!", priceCheckWarning: "Müşteri fiyatı da sordu!",
        gsmLabel: "Starbucks Mobile Kayıtlı GSM No:", gsmPlaceholder: "Numaranızı Girin",
        kvkkLabel: " KVKK kapsamında numaramın sadece ödül aktarımı için kullanılmasını onaylıyorum.",
        gsmError: "Lütfen numara girip kutuyu işaretleyin.",
        // Yeni ödül tipi açıklamaları
        rewardTypeApp: "(Starbucks App Bakiye/Kod)",
        rewardTypeCash: "(NAKİT ÖDÜL!)"
    },
    EN: {
        gameTitle: "Kyrosil Starbucks Barista", slogan: "Be the Best Barista, Serve Orders, Grab Rewards! Prepare orders by clicking ingredients in the correct sequence.",
        regionLabel: "Region:", rewardTitle: "Level Rewards", startButton: "Start Game!",
        level: "Level", order: "Order", requirements: "Required", attemptsLeft: "Attempts Left",
        errorTitle: "Error!", errorMessage: "Wrong item or sequence! Start over.", winTitle: "Congratulations!", winMessagePart1: "You won the Level ",
        winMessagePart2_App: " Starbucks Mobile App reward ({REWARD})!", winMessagePart2_USDT: " CASH PRIZE (500 USDT)!",
        winMessageEmailPrompt: "To claim your reward, click the link below or manually email", winMessageEmailAddress: "giveaways@kyrosil.eu", winMessageEmailSubjectBase: "Kyrosil Starbucks Game Reward - Level ",
        winMessageEmailBodyBase_App: "Hello,\n\nI won the Level {LEVEL} Starbucks Mobile App reward ({REWARD})...", winMessageEmailBodyBase_USDT: "Hello,\n\nI won the Level 10 Grand Prize (500 USDT)...",
        winMessageEmailInstructions: "with a screenshot.",
        gameOverTitle: "Game Over!", gameOverMessage: "You completed all levels! Awesome!",
        noAttemptsTitle: "No Attempts Left!", noAttemptsMessage: "You've used your 3 attempts for today. Come back tomorrow!",
        closeButton: "OK", tutorialIntro:"Welcome! Let's show you around.", /*...*/ mixedOrderWarning:"Note: Ingredients listed randomly, prepare in correct order!", priceCheckWarning:"Customer asked for the price!",
        gsmLabel: "Starbucks Mobile Registered GSM No:", gsmPlaceholder: "Enter your phone number",
        kvkkLabel: " I agree my number may be used solely for reward transfer under GDPR & Privacy Policy. (Applies to USA users selecting Europe too)", // USA Notu eklendi
        gsmError: "Please enter a number and check the box.",
        // Yeni ödül tipi açıklamaları (EN)
        rewardTypeApp: "(Starbucks App Balance/Code)",
        rewardTypeCash: "(CASH PRIZE!)"
     }
};

// Ödül Seviyeleri (Aynı)
const rewardTiers = { TR:{2:"200 TL",4:"600 TL",6:"2.000 TL",8:"5.000 TL",10:"500 USDT"}, EU:{2:"5 USD",4:"15 USD",6:"40 USD",8:"100 USD",10:"500 USDT"} };
function getRewardForLevel(level, region) { return rewardTiers[region]?.[level] || null; }

// Mesaj Gösterme Fonksiyonları (Aynı)
function showMessage(title, bodyHtml, type='info'){/*...*/} function hideMessage(){/*...*/} closeButton.addEventListener('click', hideMessage);

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

// Metin Güncelleme Fonksiyonu (GÜNCELLENDİ - Detaylı Ödül Listesi + Hata Kontrolü)
function updateTexts(lang, region) {
    try { // Hata yakalama eklendi
        console.log(`updateTexts: Lang=${lang}, Region=${region}`);
        const t = texts[lang];
        if (!t) { console.error("Seçilen dil için metinler bulunamadı:", lang); return; } // Dil yoksa çık

        document.title = t.gameTitle || "Barista Game";
        // HTML Elementlerini Güncelle (Null kontrolü eklendi)
        if(gameTitleEl) gameTitleEl.innerText = t.gameTitle; else console.warn("gameTitleEl bulunamadı");
        if(gameSloganEl) gameSloganEl.innerText = t.slogan; else console.warn("gameSloganEl bulunamadı");
        if(regionLabelEl) regionLabelEl.innerText = t.regionLabel; else console.warn("regionLabelEl bulunamadı");
        if(rewardTitleEl) rewardTitleEl.innerText = t.rewardTitle; else console.warn("rewardTitleEl bulunamadı");
        if(startButton) startButton.innerText = t.startButton; else console.warn("startButton bulunamadı");
        if(closeButton) closeButton.innerText = t.closeButton; else console.warn("closeButton bulunamadı");
        if(gsmLabel) gsmLabel.innerText = t.gsmLabel; else console.warn("gsmLabel bulunamadı");
        if(kvkkLabel) kvkkLabel.innerHTML = t.kvkkLabel; else console.warn("kvkkLabel bulunamadı");
        if(gsmError) gsmError.innerText = t.gsmError; else console.warn("gsmError bulunamadı");
        if(gsmInput && t.gsmPlaceholder) gsmInput.placeholder = t.gsmPlaceholder; else if(!gsmInput) console.warn("gsmInput bulunamadı");

        // Detaylı Ödül Listesini Oluştur
        if(rewardListEl) {
            rewardListEl.innerHTML = ''; // Önceki listeyi temizle
            const currentRewards = rewardTiers[region];
            if (currentRewards) {
                const levelsToShow = [2, 4, 6, 8, 10];
                levelsToShow.forEach(level => {
                    const reward = currentRewards[level];
                    if (reward) {
                        const li = document.createElement('li');
                        const isCash = level === 10;
                        const rewardType = isCash ? t.rewardTypeCash : t.rewardTypeApp;
                        // Ödül metnini oluştur
                        li.innerHTML = `<strong>${t.level} ${level}:</strong> <span>${reward}</span> <span class="prize-type">${rewardType}</span>`;
                        rewardListEl.appendChild(li);
                    }
                });
            } else { console.warn("Seçilen bölge için ödüller bulunamadı:", region); }
        } else { console.warn("rewardListEl bulunamadı"); }

        // Aktif dil butonunu ayarla
        if(langTRButton) langTRButton.classList.toggle('active', lang === 'TR'); else console.warn("langTRButton bulunamadı");
        if(langENButton) langENButton.classList.toggle('active', lang === 'EN'); else console.warn("langENButton bulunamadı");
        document.documentElement.lang = lang.toLowerCase();
        console.log(`Metinler ${lang} (${region}) olarak güncellendi.`);

    } catch (error) {
        console.error("updateTexts içinde hata oluştu:", error);
    }
}


// --- tryStartGame Fonksiyonu (Düzeltilmiş Tanım Yeri) ---
// Bu fonksiyon oyun durumunu ayarlar ve ilk çizim döngüsünü tetikler
function tryStartGame() {
    // Sadece START_SCREEN durumundayken veya LOADING sonrası çağrılmalı
    if (gameState !== 'START_SCREEN' && gameState !== 'LOADING') {
         console.warn("tryStartGame beklenmeyen durumda çağrıldı:", gameState);
        // return; // Belki de dönmek yerine devam etmek daha iyi? Duruma göre karar verilir.
    }

    console.log("tryStartGame çağrıldı, hak kontrolü yapılıyor.");
    loadGameData(); // Hakları YENİDEN KONTROL ET (en güncel hali için)

    if (!canPlay) {
        gameState = 'NO_ATTEMPTS';
        if (gameLoopStarted) { // Eğer döngü zaten başka bir yerden başladıysa çizimi tetikle
            requestAnimationFrame(drawGame);
        } else { // Yoksa HTML mesajını göster (daha tutarlı)
             showMessage(texts[currentLang].noAttemptsTitle, texts[currentLang].noAttemptsMessage, 'error');
        }
    } else {
        gameState = 'TUTORIAL';
        tutorialStep = 0;
        isTutorialComplete = false;
        if (levels[currentLevelIndex] && levels[currentLevelIndex].clicks.length > 0) { // currentLevelIndex 0 olacak başta
             currentShuffledRecipe = shuffleArray(levels[currentLevelIndex].clicks);
        } else { currentShuffledRecipe = []; }

        // Oyun döngüsünü başlat (eğer zaten başlamadıysa)
        if (!gameLoopStarted) {
             console.log("Oyun döngüsü başlatılıyor (tryStartGame içinden)...");
             gameLoopStarted = true; // Başladı olarak işaretle
             requestAnimationFrame(drawGame); // Döngüyü başlat
        } else {
             // Döngü zaten çalışıyorsa, sadece state değişti, çizim devam edecek
             console.log("Oyun döngüsü zaten aktifti, gameState TUTORIAL olarak ayarlandı.");
        }
    }
}
// --- tryStartGame Sonu ---

// Oyunu Başlatma Fonksiyonu (Aynı)
function startGame() { /* ... */ checkStartButtonState(); if(startButton.disabled){console.warn("Başlatma engellendi.");gsmError.style.display='block';return;} console.log("Başlat tıklandı."); startScreenDiv.style.display='none'; canvas.style.display='block'; tryStartGame();}

// Başlat Butonu Durum Kontrolü (Aynı - Hane kontrolü yok)
function checkStartButtonState() { /* ... */ const numberEntered=gsmInput.value.trim().length > 0; const kvkkValid=kvkkCheck.checked; if(numberEntered&&kvkkValid){startButton.disabled=false;gsmError.style.display='none';}else{startButton.disabled=true; if((gsmInput.value.length>0||kvkkCheck.checked)&&!(numberEntered&&kvkkValid)){gsmError.innerText=texts[currentLang].gsmError;gsmError.style.display='block';}else{gsmError.style.display='none';}} }
gsmInput.addEventListener('input', checkStartButtonState); kvkkCheck.addEventListener('change', checkStartButtonState);

// Olay Dinleyicileri (Giriş Ekranı - Aynı)
langTRButton.addEventListener('click', () => { if(currentLang!=='TR'){currentLang='TR';updateTexts(currentLang, currentRegion);}});
langENButton.addEventListener('click', () => { if(currentLang!=='EN'){currentLang='EN';updateTexts(currentLang, currentRegion);}});
regionSelect.addEventListener('change', (event) => { currentRegion=event.target.value; console.log("Bölge seçildi:",currentRegion); updateTexts(currentLang, currentRegion); });


// Ana oyun döngüsü fonksiyonu (Aynı)
function drawGame() { /* ... Önceki mesajdaki tam kod ... */ }

// Tıklama İşleyici Fonksiyon (Aynı)
function handleClick(event) { /* ... Önceki mesajdaki tam kod ... */ }


// Olay dinleyicileri
canvas.addEventListener('click', handleClick);
// Hata logları
bgImage.onerror = () => { console.error("BG Yüklenemedi!"); }
logoImage.onerror = () => { console.error("Logo Yüklenemedi!"); }

// Başlangıç Ayarları (DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Yüklendi.");
    // localStorage'dan tercihleri oku (varsa)
    currentLang = localStorage.getItem('barista_lang') || 'TR';
    currentRegion = localStorage.getItem('barista_region') || 'TR';
    regionSelect.value = currentRegion; // Dropdown'ı ayarla
    langTRButton.classList.toggle('active', currentLang === 'TR'); // Butonları ayarla
    langENButton.classList.toggle('active', currentLang === 'EN'); // Butonları ayarla

    loadGameData();
    updateTexts(currentLang, currentRegion); // Metinleri ve ÖDÜL LİSTESİNİ ayarla
    checkStartButtonState();

    console.log("Görseller yükleniyor...");
    bgImage.src = 'original.gif';
    logoImage.src = 'Starbucks_Corporation.png';
});

console.log("script.js dosyası okundu.");
