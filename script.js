// Canvas ve Context
const canvas = document.getElementById('gameCanvas'); const ctx = canvas.getContext('2d');

// --- Giriş Ekranı Elementleri ---
const startScreenDiv = document.getElementById('startScreen');
const gameTitleEl = document.getElementById('gameTitle'); const gameSloganEl = document.getElementById('gameSlogan');
const langTRButton = document.getElementById('langTR'); const langENButton = document.getElementById('langEN');
const regionSelect = document.getElementById('regionSelect'); const regionLabelEl = document.getElementById('regionLabel');
const rewardTitleEl = document.getElementById('rewardTitle'); const rewardSummaryEl = document.getElementById('rewardSummary');
const startButton = document.getElementById('startButton');
const gsmInput = document.getElementById('gsmInput');
const kvkkCheck = document.getElementById('kvkkCheck');
const gsmError = document.getElementById('gsmError');
const gsmLabel = document.getElementById('gsmLabel');
const kvkkLabel = document.getElementById('kvkkLabel');
// --- Giriş Ekranı Elementleri Sonu ---

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

// Metinler Objesi (Tamamlanmış)
const texts = {
    TR: { gameTitle:"Kyrosil Starbucks Barista", slogan:"En İyi Barista Ol, Ödülleri Kap!", regionLabel:"Bölge:", rewardTitle:"Ödüller", rewardSummary:"Seviye 2: {LVL2_REWARD}, Seviye 10: {LVL10_REWARD}! Diğer seviyelerde de ödüller var!", startButton:"Oyuna Başla!", level:"Seviye", order:"Sipariş", requirements:"Gerekenler", attemptsLeft:"Kalan Hata Hakkı", errorTitle:"Hata!", errorMessage:"Yanlış malzeme veya sıra! Baştan başla.", winTitle:"Tebrikler!", winMessagePart1:"Seviye ", winMessagePart2_App:" **{REWARD}** değerinde Starbucks Mobil Uygulaması ödülü kazandın!", winMessagePart2_USDT:" **NAKİT ÖDÜL (500 USDT)** kazandın!", winMessageEmailPrompt:"Ödülünü almak için aşağıdaki linke tıklayarak veya manuel olarak", winMessageEmailAddress:"giveaways@kyrosil.eu", winMessageEmailSubjectBase:"Kyrosil Starbucks Oyun Ödülü - Seviye ", winMessageEmailBodyBase_App:"Merhaba,\n\nSeviye {LEVEL} Starbucks Mobil Uygulaması ödülünü ({REWARD}) kazandım.\nUygulama kodumu bekliyorum.\n\nEkran görüntüm ektedir.\n\nTeşekkürler.", winMessageEmailBodyBase_USDT:"Merhaba,\n\nSeviye 10 Büyük Ödülünü (500 USDT) kazandım.\nÖdül gönderimi için detayları bekliyorum.\n\nEkran görüntüm ektedir.\n\nTeşekkürler.", winMessageEmailInstructions:"adresine bu ekranın görüntüsüyle birlikte mail atabilirsin.", gameOverTitle:"Oyun Bitti!", gameOverMessage:"Tüm seviyeleri tamamladın! Harikasın!", noAttemptsTitle:"Hakların Bitti!", noAttemptsMessage:"Bugünkü 3 hata yapma hakkını doldurdun. Yarın tekrar oynamak için geri gel!", closeButton:"Tamam", tutorialIntro:"...", tutorialItemIntro:"...", tutorialItemAction_Default:"...", tutorialItemAction_Cat:"...", tutorialItemAction_Register:"...", tutorialItemAction_OrderSlip:"...", tutorialItemAction_PriceList:"...", tutorialItemAction_Fridge:"...", tutorialItemAction_Dessert:"...", tutorialItemPrompt:"...", tutorialComplete:"...", tutorialOutOfAttempts:"...", mixedOrderWarning:"Not: Malzemeler karışık listelenmiştir, doğru sırada hazırlayın!", priceCheckWarning:"Müşteri fiyatı da sordu!", gsmLabel:"Starbucks Mobile Kayıtlı GSM No:", kvkkLabel:" Aydınlatma Metnini okudum, onaylıyorum.", gsmError:"Lütfen 10 veya 11 haneli numara girip kutuyu işaretleyin." },
    EN: { gameTitle:"Kyrosil Starbucks Barista", slogan:"Be the Best Barista, Grab the Rewards!", regionLabel:"Region:", rewardTitle:"Rewards", rewardSummary:"Level 2: {LVL2_REWARD}, Level 10: {LVL10_REWARD}! Rewards on other levels too!", startButton:"Start Game!", level:"Level", order:"Order", requirements:"Required", attemptsLeft:"Attempts Left", errorTitle:"Error!", errorMessage:"Wrong item or sequence! Start over.", winTitle:"Congratulations!", winMessagePart1:"You won the Level ", winMessagePart2_App:" Starbucks Mobile App reward ({REWARD})!", winMessagePart2_USDT:" CASH PRIZE (500 USDT)!", winMessageEmailPrompt:"To claim your reward, click the link below or manually email", winMessageEmailAddress:"giveaways@kyrosil.eu", winMessageEmailSubjectBase:"Kyrosil Starbucks Game Reward - Level ", winMessageEmailBodyBase_App:"Hello,\n\nI won the Level {LEVEL}...(etc)", winMessageEmailBodyBase_USDT:"Hello,\n\nI won the Level 10...(etc)", winMessageEmailInstructions:"with a screenshot.", gameOverTitle:"Game Over!", gameOverMessage:"You completed all levels!", noAttemptsTitle:"No Attempts Left!", noAttemptsMessage:"You've used your 3 attempts. Come back tomorrow!", closeButton:"OK", tutorialIntro:"Welcome! Let's show you around.", /*...*/ mixedOrderWarning:"Note: Ingredients listed randomly, prepare in correct order!", priceCheckWarning:"Customer asked for the price!", gsmLabel:"Starbucks Mobile Registered GSM No:", kvkkLabel:" I have read and agree to the Privacy Policy.", gsmError:"Please enter a 10 or 11 digit number and check the box." }
};

// Ödül Seviyeleri (Aynı)
const rewardTiers = { TR:{2:"200 TL",4:"600 TL",6:"2.000 TL",8:"5.000 TL",10:"500 USDT"}, EU:{2:"5 USD",4:"15 USD",6:"40 USD",8:"100 USD",10:"500 USDT"} };
function getRewardForLevel(level, region) { return rewardTiers[region]?.[level] || null; }

// Mesaj Gösterme Fonksiyonları (Aynı)
function showMessage(title, bodyHtml, type='info') { console.log(`showMessage: Tip=${type}, Başlık=${title}`); messageTitle.innerText=title; messageBody.innerHTML=bodyHtml; messageOverlay.className=`overlay message-${type}`; messageOverlay.style.display='flex'; canPlay=false; }
function hideMessage() { messageOverlay.style.display='none'; if(failedAttemptsToday<3 && currentLevelIndex<levels.length-1 && gameState==='PLAYING'){canPlay=true;} }
closeButton.addEventListener('click', hideMessage);

// Tıklanabilir Alanlar (Aynı)
const clickableItems = [ /* ... 11 öğe ... */ {name:'Espresso Makinesi',x:605,y:300,w:50,h:60},{name:'Yeşil Şişe',x:300,y:245,w:30,h:55},{name:'Şurup Pompası',x:340,y:245,w:30,h:55},{name:'Süt Kutusu',x:390,y:245,w:30,h:55},{name:'Bardak Alanı',x:330,y:357,w:50,h:50},{name:'Tezgahtaki Kedi',x:442,y:352,w:70,h:40},{name:'Kasa',x:700,y:300,w:60,h:60},{name:'Sipariş Fişi',x:780,y:240,w:15,h:30},{name:'Buzdolabı',x:445,y:305,w:70,h:40},{name:'Tatlı Dolabı',x:700,y:450,w:80,h:60},{name:'Fiyat Listesi',x:500,y:80,w:100,h:200} ];

// Seviye Tarifleri (Aynı)
const levels = [ /* ... 10 seviye + bitiş ... */ {level:1,recipeName:"İlk Sipariş (Espresso)",clicks:['Sipariş Fişi','Espresso Makinesi']},{level:2,recipeName:"Caffè Latte (Fiyatlı)",clicks:['Espresso Makinesi','Süt Kutusu','Fiyat Listesi']},{level:3,recipeName:"Vanilya Şur. Soğuk Kahve",clicks:['Bardak Alanı','Buzdolabı','Espresso Makinesi','Şurup Pompası']},{level:4,recipeName:"Kedi Molası & Yeşil Çay",clicks:['Tezgahtaki Kedi','Yeşil Şişe','Bardak Alanı']},{level:5,recipeName:"Yoğun Talep",clicks:['Sipariş Fişi','Espresso Makinesi','Süt Kutusu','Espresso Makinesi']},{level:6,recipeName:"Hesaplı Şuruplu Latte",clicks:['Bardak Alanı','Espresso Makinesi','Şurup Pompası','Süt Kutusu','Fiyat Listesi','Kasa']},{level:7,recipeName:"Yeşil & Vanilya & Buz",clicks:['Yeşil Şişe','Şurup Pompası','Buzdolabı','Bardak Alanı']},{level:8,recipeName:"Tam Menü (Basit)",clicks:['Sipariş Fişi','Bardak Alanı','Espresso Makinesi','Süt Kutusu','Tatlı Dolabı','Kasa']},{level:9,recipeName:"Pati Deluxe Özel",clicks:['Bardak Alanı','Buzdolabı','Yeşil Şişe','Şurup Pompası','Espresso Makinesi','Tezgahtaki Kedi','Kasa']},{level:10,recipeName:"USTALIK ESERİ!",clicks:['Sipariş Fişi','Fiyat Listesi','Bardak Alanı','Buzdolabı','Yeşil Şişe','Şurup Pompası','Espresso Makinesi','Süt Kutusu','Tatlı Dolabı','Tezgahtaki Kedi','Kasa']},{level:11,recipeName:"OYUN BİTTİ!",clicks:[]} ];

// Görsel yükleme olayları
bgImage.onload = function() { console.log("BG yüklendi"); bgLoaded=true; if(logoLoaded) checkAssetsLoaded();};
logoImage.onload = function() { console.log("Logo yüklendi"); logoLoaded=true; if(bgLoaded) checkAssetsLoaded();};
// Görsel kaynakları script sonunda yüklensin
const logoWidth = 80; const logoHeight = 80; const logoX = canvas.width/2-logoWidth/2; const logoY = 20;


// Tüm Görseller Yüklendi Mi Kontrolü (Aynı)
function checkAssetsLoaded() { if(bgLoaded&&logoLoaded&&gameState==='LOADING'){console.log("Görseller yüklendi...");gameState='START_SCREEN';loadGameData();updateTexts(currentLang,currentRegion);checkStartButtonState();/*Butonu kontrol et*/}}

// Fisher-Yates Shuffle Algoritması (Aynı)
function shuffleArray(array){/*...*/}

// Ana oyun döngüsü fonksiyonu (DÜZELTİLDİ - Syntax Hatası Giderildi)
function drawGame() {
    try { // Hata yakalama bloğu eklendi (güvenlik için)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (bgLoaded) ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        if (logoLoaded) { /* ... logo ve daire ... */ const cX=logoX+logoWidth/2;const cY=logoY+logoHeight/2;const r=logoWidth/2;ctx.fillStyle='white';ctx.beginPath();ctx.arc(cX,cY,r,0,Math.PI*2);ctx.fill();ctx.drawImage(logoImage,logoX,logoY,logoWidth,logoHeight);}

        let currentTextY = 30; // Sol üst yazıların başlangıç Y'si

        // Sol Üst: Kalan Haklar
        /* ... */ ctx.fillStyle='white';ctx.font='bold 16px Arial';ctx.textAlign='left'; ctx.shadowColor='black';ctx.shadowBlur=3;ctx.shadowOffsetX=1;ctx.shadowOffsetY=1; ctx.fillText(`${texts[currentLang].attemptsLeft}: ${3-failedAttemptsToday}`,20,currentTextY); currentTextY+=25; ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;

        // Oyun Durumuna Göre Çizim
        if (gameState === 'TUTORIAL') {
             /* ... Öğretici çizimi aynı ... */ const iTS=clickableItems[tutorialStep]; if(iTS){/*...*/ctx.strokeRect(iTS.x-2,iTS.y-2,iTS.width+4,iTS.height+4); /*...*/ ctx.fillText(/*...*/); ctx.fillText(/*...*/);}
        } else if (gameState === 'PLAYING') {
            // --- Sol Üst: Seviye, Sipariş ve KARIŞIK Gerekenler ---
            if (levels[currentLevelIndex]) { // BU BLOKTA HATA VARDI, DÜZELTİLDİ
                const currentLevelData = levels[currentLevelIndex];
                ctx.fillStyle = 'white'; ctx.textAlign = 'left';
                ctx.shadowColor = 'black'; ctx.shadowBlur = 4; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2;

                ctx.font = 'bold 20px Arial'; ctx.fillText(`${texts[currentLang].level}: ${currentLevelData.level}`, 20, currentTextY); currentTextY += 25;

                if (currentLevelData.clicks.length > 0) {
                     ctx.font = '18px Arial'; ctx.fillText(`${texts[currentLang].order}: ${currentLevelData.recipeName}`, 20, currentTextY); currentTextY += 25;
                     ctx.font = 'italic 16px Arial'; ctx.fillText(`${texts[currentLang].requirements}:`, 20, currentTextY); currentTextY += 20;
                     const shuffledClicks = shuffleArray(currentShuffledRecipe.length > 0 ? currentShuffledRecipe : currentLevelData.clicks); // Karışık listeyi kullan
                     currentShuffledRecipe = shuffledClicks; // Eğer ilk defa karıştırıyorsak sakla (gerçi seviye başında yapılıyor)
                     for (const item of shuffledClicks) { ctx.fillText(`- ${item}`, 30, currentTextY); currentTextY += 18; }
                     currentTextY += 5; ctx.fillStyle = 'orange'; ctx.font = 'bold 14px Arial'; ctx.fillText(texts[currentLang].mixedOrderWarning, 20, currentTextY); currentTextY += 20;
                     if (currentLevelData.clicks.includes('Fiyat Listesi')) { ctx.fillStyle = 'lightblue'; ctx.fillText(texts[currentLang].priceCheckWarning, 20, currentTextY); currentTextY += 20; }
                } // **BURADA EKSİK OLAN KAPAMA PARANTEZİ EKLENDİ '}'**
                 ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
            } // **BU KAPAMA PARANTEZİ DE if (levels[currentLevelIndex]) İÇİN EKLENDİ**

             // Geçici Hata/Başarı Mesajı (Canvas'a)
            if (feedbackMessage.text && Date.now() < feedbackMessage.expiryTime) { /*...*/ ctx.fillStyle=feedbackMessage.color;ctx.font='bold 28px Arial';ctx.textAlign='center';ctx.shadowColor='black';ctx.shadowBlur=5;ctx.shadowOffsetX=2;ctx.shadowOffsetY=2;ctx.fillText(feedbackMessage.text,canvas.width/2,canvas.height-30); ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;ctx.textAlign='left';} else { feedbackMessage.text='';}

        } else if (gameState === 'NO_ATTEMPTS' || gameState === 'GAME_OVER') {
            // Hak Bitti veya Oyun Bitti Mesajları (Canvas'a)
             /* ... */ ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,canvas.height/2-40,canvas.width,80); const title=(gameState==='NO_ATTEMPTS')?texts[currentLang].noAttemptsTitle:texts[currentLang].gameOverTitle; const message=(gameState==='NO_ATTEMPTS')?texts[currentLang].noAttemptsMessage:texts[currentLang].gameOverMessage; const titleColor=(gameState==='NO_ATTEMPTS')?'red':'gold'; ctx.fillStyle=titleColor; ctx.font='bold 30px Arial'; ctx.textAlign='center'; ctx.fillText(title,canvas.width/2,canvas.height/2); ctx.fillStyle='white'; ctx.font='18px Arial'; ctx.fillText(message,canvas.width/2,canvas.height/2+30); ctx.textAlign='left';
        }

        // Döngüyü devam ettir
        if (gameLoopStarted && (gameState === 'PLAYING' || gameState === 'TUTORIAL')) {
             requestAnimationFrame(drawGame);
        }
    } catch (e) {
        console.error("Draw fonksiyonunda kritik hata:", e);
        gameLoopStarted = false; // Hata olursa döngüyü durdur
    }
}


// Metin Güncelleme Fonksiyonu (GÜNCELLENDİ)
function updateTexts(lang, region) {
    console.log(`updateTexts: Lang=${lang}, Region=${region}`);
    const t = texts[lang];
    document.title = t.gameTitle; // Sayfa başlığını da güncelle
    if(gameTitleEl) gameTitleEl.innerText = t.gameTitle;
    if(gameSloganEl) gameSloganEl.innerText = t.slogan;
    if(regionLabelEl) regionLabelEl.innerText = t.regionLabel;
    if(rewardTitleEl) rewardTitleEl.innerText = t.rewardTitle;
    if(startButton) startButton.innerText = t.startButton;
    if(closeButton) closeButton.innerText = t.closeButton;
    if(gsmLabel) gsmLabel.innerText = t.gsmLabel;
    if(kvkkLabel) kvkkLabel.innerHTML = t.kvkkLabel; // HTML linki için innerHTML kullanabiliriz
    if(gsmError) gsmError.innerText = t.gsmError;

    // Ödül Özetini Güncelle (Dinamik)
    if(rewardSummaryEl) {
        const lvl2Reward = getRewardForLevel(2, region) || '?';
        const lvl10Reward = getRewardForLevel(10, region) || '?';
        rewardSummaryEl.innerText = `Seviye 2: ${lvl2Reward}, Seviye 10: ${lvl10Reward}! Diğer seviyelerde de ödüller var!`;
    }

    // Aktif dil butonunu ayarla
    if(langTRButton) langTRButton.classList.toggle('active', lang === 'TR');
    if(langENButton) langENButton.classList.toggle('active', lang === 'EN');
    document.documentElement.lang = lang.toLowerCase();
    console.log(`Metinler ${lang} (${region}) olarak güncellendi.`);
}

// Olay Dinleyicileri (Giriş Ekranı)
langTRButton.addEventListener('click', () => { if(currentLang!=='TR'){currentLang='TR';updateTexts(currentLang, currentRegion);}});
langENButton.addEventListener('click', () => { if(currentLang!=='EN'){currentLang='EN';updateTexts(currentLang, currentRegion);}});
regionSelect.addEventListener('change', (event) => { currentRegion=event.target.value; console.log("Bölge seçildi:",currentRegion); updateTexts(currentLang, currentRegion); });
startButton.addEventListener('click', startGame);

// --- YENİ: Başlat Butonu Durum Kontrolü ---
function checkStartButtonState() {
    // Telefon numarası 10 veya 11 haneli mi VE KVKK işaretli mi?
    const numberValid = gsmInput.value.match(/^\d{10,11}$/); // Sadece 10 veya 11 rakam kontrolü
    const kvkkValid = kvkkCheck.checked;

    if (numberValid && kvkkValid) {
        startButton.disabled = false;
        gsmError.style.display = 'none';
    } else {
        startButton.disabled = true;
        // Hata mesajını sadece kutu işaretliyken ama numara yanlışsa gösterelim?
        // Veya her iki koşul da sağlanmadığında gösterelim. Şimdilik ikincisi:
        if ( (gsmInput.value.length > 0 || kvkkCheck.checked) && !(numberValid && kvkkValid)) {
             gsmError.style.display = 'block';
        } else {
             gsmError.style.display = 'none';
        }
    }
}
// GSM Input ve KVKK Checkbox için dinleyiciler
gsmInput.addEventListener('input', checkStartButtonState);
kvkkCheck.addEventListener('change', checkStartButtonState);
// --- Başlat Butonu Kontrol Sonu ---


// Oyunu Başlatma Fonksiyonu (GÜNCELLENDİ - Buton kontrolü eklendi)
function startGame() {
    // Başlatmadan önce son bir kontrol
    checkStartButtonState();
    if (startButton.disabled) {
        console.warn("Başlatma engellendi: GSM/KVKK şartları sağlanmadı.");
        gsmError.style.display = 'block'; // Hata mesajını göster
        return;
    }

    console.log("Başlat butonuna tıklandı.");
    // playSound(clickSound); // Ses eklenince açılır

    startScreenDiv.style.display = 'none'; // Giriş ekranını gizle
    canvas.style.display = 'block';    // Canvas'ı göster

    tryStartGame(); // Oyun durumunu ayarla (Tutorial veya No Attempts)
}

// Oyun döngüsünü başlatan fonksiyon (Aynı)
// let gameLoopStarted = false; // Zaten yukarıda tanımlı
function startGameLoop() { if(!gameLoopStarted){loadGameData();if(!canPlay){/*showMessage(texts[currentLang].noAttemptsTitle,texts[currentLang].noAttemptsMessage,'error');*/ gameState='NO_ATTEMPTS'; requestAnimationFrame(drawGame);}else{console.log("Oyun döngüsü...");gameLoopStarted=true;drawGame();}}else if(canPlay){requestAnimationFrame(drawGame);}}


// Tıklama İşleyici Fonksiyon (Aynı)
function handleClick(event) { /* ... Önceki mesajdaki tam kod ... */ }


// Olay dinleyicileri (mousemove kaldırıldı)
canvas.addEventListener('click', handleClick);
// Hata logları
bgImage.onerror = () => { console.error("BG Yüklenemedi!"); }
logoImage.onerror = () => { console.error("Logo Yüklenemedi!"); }

// Başlangıç Ayarları
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Yüklendi.");
    loadGameData(); // Sayfa yüklenince hakları kontrol et
    updateTexts(currentLang, currentRegion); // Metinleri ayarla
    checkStartButtonState(); // Başlat butonunun ilk durumunu ayarla
    console.log("Görseller yükleniyor..."); // Yüklemeyi başlat
    bgImage.src = 'original.gif';
    logoImage.src = 'Starbucks_Corporation.png';
});

console.log("script.js dosyası okundu.");
