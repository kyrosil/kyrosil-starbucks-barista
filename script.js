// Canvas ve Context
let canvas, ctx; // DOMContentLoaded içinde atanacak

// Giriş Ekranı Elementleri (DOM Yüklendikten sonra atanacak)
let startScreenDiv, gameTitleEl, gameSloganEl, langTRButton, langENButton, regionSelect, regionLabelEl, rewardTitleEl, rewardListEl, startButton, gsmInput, kvkkCheck, gsmError, gsmLabel, kvkkLabel;
// Mesajlaşma Elementleri (DOM Yüklendikten sonra atanacak)
let messageOverlay, messageTitle, messageBody, closeButton;

// Görsel Nesneleri ve Yükleme Durumları
const bgImage = new Image(); const logoImage = new Image();
let bgLoaded = false, logoLoaded = false;

// Oyun Durumları ('LOADING', 'START_SCREEN', 'TUTORIAL', 'PLAYING', 'MESSAGE', 'GAME_OVER', 'NO_ATTEMPTS')
let gameState = 'LOADING';
let tutorialStep = 0; let isTutorialComplete = false;

// Oyun Değişkenleri
let currentLevelIndex = 0; let currentRecipeStep = 0; let canPlay = false; let gameLoopStarted = false; let currentShuffledRecipe = [];

// Dil ve Bölge
let currentLang = 'TR'; let currentRegion = 'TR';

// localStorage ve Günlük Hak Takibi
let failedAttemptsToday = 0; let lastPlayDate = '';
function loadGameData(){try{const today=new Date().toISOString().split('T')[0];lastPlayDate=localStorage.getItem('barista_lastPlayDate')||today;failedAttemptsToday=parseInt(localStorage.getItem('barista_failedAttempts')||'0',10);if(lastPlayDate!==today){console.log("Yeni gün!");failedAttemptsToday=0;lastPlayDate=today;saveGameData();} if(failedAttemptsToday>=3){canPlay=false;console.warn("Hak bitti.");}else{canPlay=true;} console.log(`Bugünkü hata hakkı: ${3-failedAttemptsToday}/3`);}catch(e){console.error("loadGameData Hatası:",e);canPlay=false;}}
function saveGameData(){try{localStorage.setItem('barista_lastPlayDate',lastPlayDate);localStorage.setItem('barista_failedAttempts',failedAttemptsToday.toString());}catch(e){console.error("saveGameData Hatası:",e);}}

// Geri Bildirim Mesajı Değişkenleri
let feedbackMessage = { text: '', color: 'red', expiryTime: 0 };

// Metinler Objesi
const texts = { TR: { /* Tam içerik önceki koddan */ }, EN: { /* Tam içerik önceki koddan */ } };

// Ödül Seviyeleri
const rewardTiers = { TR:{/*...*/}, EU:{/*...*/} };
function getRewardForLevel(level, region) { return rewardTiers[region]?.[level] || null; }

// Mesaj Gösterme Fonksiyonları
function showMessage(title, bodyHtml, type='info'){ try{ console.log(`showMessage: Tip=${type}, Başlık=${title}`); if(!messageOverlay || !messageTitle || !messageBody) throw new Error("Mesaj elementleri bulunamadı!"); messageTitle.innerText=title; messageBody.innerHTML=bodyHtml; messageOverlay.className=`overlay message-${type}`; messageOverlay.style.display='flex'; canPlay=false; } catch(e) { console.error("showMessage Hatası:", e); }}
function hideMessage(){ try{ if(!messageOverlay) throw new Error("Mesaj overlay elementi bulunamadı!"); messageOverlay.style.display='none'; if(failedAttemptsToday<3 && currentLevelIndex<levels.length-1 && gameState==='PLAYING'){canPlay=true;} } catch(e) { console.error("hideMessage Hatası:", e); }}

// Fisher-Yates Shuffle
function shuffleArray(array){ /*...*/ let ci=array.length,ri;const na=array.slice();while(ci!==0){ri=Math.floor(Math.random()*ci);ci--;[na[ci],na[ri]]=[na[ri],na[ci]];} return na; }

// Tıklanabilir Alanlar
const clickableItems = [ /* ... 11 öğe ... */ ];
// Seviye Tarifleri
const levels = [ /* ... 10 seviye + bitiş ... */ ];

// Görsel yükleme olayları
bgImage.onload = function(){console.log("BG yüklendi");bgLoaded=true;if(logoLoaded)checkAssetsLoaded();};
logoImage.onload = function(){console.log("Logo yüklendi");logoLoaded=true;if(bgLoaded)checkAssetsLoaded();};
// Görsel kaynakları script sonunda atanacak
const logoWidth = 80; const logoHeight = 80; let logoX = 0, logoY = 20; // X başlangıçta 0, sonra hesaplanacak

// Tüm Görseller Yüklendi Mi Kontrolü
function checkAssetsLoaded(){ try { if(bgLoaded&&logoLoaded&&gameState==='LOADING'){ console.log("Görseller yüklendi..."); gameState='START_SCREEN'; loadGameData(); // Hak kontrolü updateTexts(currentLang,currentRegion); // Metinleri yükle checkStartButtonState(); // Buton durumunu ayarla } } catch(e){ console.error("checkAssetsLoaded Hatası:", e); }}

// --- Ana Oyun Döngüsü Fonksiyonu (DEBUG LOGLARI EKLENDİ) ---
function drawGame() {
    console.log(`drawGame Başladı - State: ${gameState}, canPlay: ${canPlay}, LoopStarted: ${gameLoopStarted}`); // <<< DEBUG 1
    try {
        if (!ctx) { console.error("CTX bulunamadı, çizim yapılamıyor."); return; } // Güvenlik kontrolü

        // 1. Ekranı Temizle
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        console.log("Ekran temizlendi."); // <<< DEBUG 2

        // 2. Arka Planı Çiz
        if (bgLoaded) {
             ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
             console.log("Arka plan çizildi."); // <<< DEBUG 3
        } else { console.log("Arka plan henüz yüklenmedi.");}

        // 3. Logoyu Çiz
        if (logoLoaded) {
            // Logo X koordinatını burada hesapla (canvas genişliği bilindiğinde)
            logoX = canvas.width / 2 - logoWidth / 2;
            const cX=logoX+logoWidth/2; const cY=logoY+logoHeight/2; const r=logoWidth/2;
            ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(cX,cY,r,0,Math.PI*2); ctx.fill();
            ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
            console.log("Logo çizildi."); // <<< DEBUG 4
        } else { console.log("Logo henüz yüklenmedi.");}

        // 4. Duruma Göre Çizim Yap
        console.log("Oyun durumuna göre çizim yapılacak:", gameState); // <<< DEBUG 5
        let currentTextY = 30;
        ctx.fillStyle='white';ctx.font='bold 16px Arial';ctx.textAlign='left'; ctx.shadowColor='black';ctx.shadowBlur=3;ctx.shadowOffsetX=1;ctx.shadowOffsetY=1;
        ctx.fillText(`${texts[currentLang]?.attemptsLeft || 'Attempts Left'}: ${3-failedAttemptsToday}`,20,currentTextY); currentTextY+=25; // Dil yüklenmemişse diye fallback
        ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;

        if (gameState === 'TUTORIAL') {
            console.log("TUTORIAL çiziliyor, Adım:", tutorialStep); // <<< DEBUG 6
            const itemToShow=clickableItems[tutorialStep]; if(itemToShow){ /* ... vurgulama ve metin ... */ } else { console.warn("Öğretici adımı geçersiz:", tutorialStep); }
        } else if (gameState === 'PLAYING') {
             console.log("PLAYING çiziliyor, Seviye:", currentLevelIndex); // <<< DEBUG 7
             if (levels[currentLevelIndex]) { /* ... Seviye, Sipariş, Gerekenler, Uyarılar ... */ } else { console.warn("Geçerli seviye bulunamadı:", currentLevelIndex); }
            if (feedbackMessage.text && Date.now() < feedbackMessage.expiryTime) { /*...*/ } else { feedbackMessage.text='';}
        } else if (gameState === 'NO_ATTEMPTS' || gameState === 'GAME_OVER') {
             console.log("NO_ATTEMPTS veya GAME_OVER durumu çiziliyor."); // <<< DEBUG 8
             /* ... Hak Bitti veya Oyun Bitti Mesajları ... */
        } else {
             console.warn("Bilinmeyen oyun durumu:", gameState); // <<< DEBUG 9
        }

        console.log("Çizim tamamlandı."); // <<< DEBUG 10

        // Döngüyü devam ettir
        if (gameLoopStarted && (gameState === 'PLAYING' || gameState === 'TUTORIAL')) {
             console.log("requestAnimationFrame çağrılıyor..."); // <<< DEBUG 11
             requestAnimationFrame(drawGame);
        } else {
             console.log("Oyun döngüsü devam etmeyecek. State:", gameState, "LoopStarted:", gameLoopStarted); // <<< DEBUG 12
        }

    } catch (e) { console.error("Draw HATA:",e); gameLoopStarted = false; } // Hata olursa döngüyü durdur
}


// Metin Güncelleme Fonksiyonu
function updateTexts(lang, region) { /* ... Önceki koddan kopyala ... */ }
// Başlat Butonu Durum Kontrolü
function checkStartButtonState() { /* ... Önceki koddan kopyala ... */ }

// tryStartGame Fonksiyonu
function tryStartGame() { /* ... Önceki koddan kopyala (loglar eklendi) ... */
    try { console.log("tryStartGame çağrıldı, hak kontrolü yapılıyor."); loadGameData(); if(!canPlay){ gameState='NO_ATTEMPTS'; console.log("Hak yok, durum NO_ATTEMPTS yapıldı."); requestAnimationFrame(drawGame); }else{ gameState='TUTORIAL'; tutorialStep=0; isTutorialComplete=false; if(levels[currentLevelIndex]?.clicks.length>0){currentShuffledRecipe=shuffleArray(levels[currentLevelIndex].clicks);}else{currentShuffledRecipe=[];} if(!gameLoopStarted){console.log("Oyun döngüsü başlatılıyor (tryStartGame)..."); gameLoopStarted=true;} requestAnimationFrame(drawGame);} } catch(e){ console.error("tryStartGame hatası:",e);}}

// Oyunu Başlatma Fonksiyonu
function startGame() { /* ... Önceki koddan kopyala ... */
    try { console.log("startGame ÇAĞRILDI!"); checkStartButtonState(); if(startButton.disabled){console.warn("Başlatma engellendi.");gsmError.style.display='block';return;} console.log("Başlatma Kontrolleri Geçildi."); if(startScreenDiv)startScreenDiv.style.display='none'; else console.error("startScreenDiv null!"); if(canvas)canvas.style.display='block'; else console.error("canvas null!"); tryStartGame(); } catch(e){ console.error("startGame Hatası:", e); }}

// Tıklama İşleyici Fonksiyon
function handleClick(event) { /* ... Önceki koddan kopyala ... */ }


// --- SAYFA YÜKLENDİĞİNDE ÇALIŞACAK KODLAR ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Yüklendi.");
    try { // Hata yakalama eklendi
        // Element referanslarını al
        canvas = document.getElementById('gameCanvas'); ctx = canvas?.getContext('2d');
        startScreenDiv=document.getElementById('startScreen'); gameTitleEl=document.getElementById('gameTitle'); gameSloganEl=document.getElementById('gameSlogan'); langTRButton=document.getElementById('langTR'); langENButton=document.getElementById('langEN'); regionSelect=document.getElementById('regionSelect'); regionLabelEl=document.getElementById('regionLabel'); rewardTitleEl=document.getElementById('rewardTitle'); rewardListEl=document.getElementById('rewardList'); startButton=document.getElementById('startButton'); gsmInput=document.getElementById('gsmInput'); kvkkCheck=document.getElementById('kvkkCheck'); gsmError=document.getElementById('gsmError'); gsmLabel=document.getElementById('gsmLabel'); kvkkLabel=document.getElementById('kvkkLabel');
        messageOverlay=document.getElementById('messageOverlay'); messageTitle=document.getElementById('messageTitle'); messageBody=document.getElementById('messageBody'); closeButton=document.getElementById('closeButton');

        // Kritik element kontrolü
        if (!canvas || !ctx || !startScreenDiv || !startButton || !gsmInput || !kvkkCheck || !messageOverlay || !closeButton || !langTRButton || !langENButton || !regionSelect || !rewardListEl) {
            throw new Error("Gerekli HTML elementlerinden biri veya birkaçı sayfada bulunamadı!");
        }

        // Olay Dinleyicilerini Ekle
        langTRButton.addEventListener('click', () => { if(currentLang!=='TR'){currentLang='TR';updateTexts(currentLang, currentRegion);}});
        langENButton.addEventListener('click', () => { if(currentLang!=='EN'){currentLang='EN';updateTexts(currentLang, currentRegion);}});
        regionSelect.addEventListener('change', (event) => { currentRegion=event.target.value; console.log("Bölge:",currentRegion); updateTexts(currentLang, currentRegion); });
        startButton.addEventListener('click', startGame);
        gsmInput.addEventListener('input', checkStartButtonState);
        kvkkCheck.addEventListener('change', checkStartButtonState);
        closeButton.addEventListener('click', hideMessage);
        canvas.addEventListener('click', handleClick);

        // Başlangıç Ayarları
        loadGameData(); updateTexts(currentLang, currentRegion); checkStartButtonState();

        // Görsel yüklemelerini başlat
        console.log("Görseller yükleniyor...");
        bgImage.src = 'original.gif'; logoImage.src = 'Starbucks_Corporation.png';

    } catch (error) {
        console.error("DOMContentLoaded içinde KRİTİK HATA:", error);
        alert("Sayfa yüklenirken önemli bir hata oluştu. Lütfen konsolu kontrol edin.");
    }
});

// Hata logları
bgImage.onerror = () => { console.error("BG Yüklenemedi!"); bgLoaded = true; checkAssetsLoaded(); /* Yüklenemese de devam etmeyi dene? */ }
logoImage.onerror = () => { console.error("Logo Yüklenemedi!"); logoLoaded = true; checkAssetsLoaded(); /* Yüklenemese de devam etmeyi dene? */ }

console.log("script.js dosyası okundu.");
