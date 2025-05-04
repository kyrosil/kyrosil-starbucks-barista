// Canvas ve Context (Global kalabilir)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Görsel Nesneleri ve Yükleme Durumları (Global)
const bgImage = new Image(); const logoImage = new Image();
let bgLoaded = false, logoLoaded = false;

// Oyun Durumları (Global)
let gameState = 'LOADING'; let tutorialStep = 0; let isTutorialComplete = false;

// Oyun Değişkenleri (Global)
let currentLevelIndex = 0; let currentRecipeStep = 0; let canPlay = false; let gameLoopStarted = false; let currentShuffledRecipe = [];

// Dil ve Bölge (Global)
let currentLang = 'TR'; let currentRegion = 'TR';

// localStorage ve Günlük Hak Takibi (Global)
let failedAttemptsToday = 0; let lastPlayDate = '';

// Geri Bildirim Mesajı Değişkenleri (Global)
let feedbackMessage = { text: '', color: 'red', expiryTime: 0 };

// Metinler Objesi (Global)
const texts = { TR: { /*...*/ }, EN: { /*...*/ } }; // Tam içeriği önceki koddan al

// Ödül Seviyeleri (Global)
const rewardTiers = { TR:{/*...*/}, EU:{/*...*/} }; // Tam içeriği önceki koddan al

// --- Fonksiyon Tanımları (Global Kapsamda Kalabilir) ---

function loadGameData(){/*... Önceki kod ...*/ const today=new Date().toISOString().split('T')[0];lastPlayDate=localStorage.getItem('barista_lastPlayDate')||today;failedAttemptsToday=parseInt(localStorage.getItem('barista_failedAttempts')||'0',10);if(lastPlayDate!==today){console.log("Yeni gün!");failedAttemptsToday=0;lastPlayDate=today;saveGameData();} if(failedAttemptsToday>=3){canPlay=false;console.warn("Hak bitti.");}else{canPlay=true;} console.log(`Bugünkü hata hakkı: ${3-failedAttemptsToday}/3`);}
function saveGameData(){/*... Önceki kod ...*/ localStorage.setItem('barista_lastPlayDate',lastPlayDate);localStorage.setItem('barista_failedAttempts',failedAttemptsToday.toString());}
function getRewardForLevel(level, region) { return rewardTiers[region]?.[level] || null; }

function showMessage(title, bodyHtml, type='info'){ console.log(`showMessage: Tip=${type}, Başlık=${title}`); if(messageOverlay && messageTitle && messageBody){ messageTitle.innerText=title; messageBody.innerHTML=bodyHtml; messageOverlay.className=`overlay message-${type}`; messageOverlay.style.display='flex'; canPlay=false; } else { console.error("Mesaj kutusu elementleri bulunamadı!"); }}
function hideMessage(){ if(messageOverlay){ messageOverlay.style.display='none'; if(failedAttemptsToday<3 && currentLevelIndex<levels.length-1 && gameState==='PLAYING'){canPlay=true;} } else { console.error("Mesaj kutusu overlay elementi bulunamadı!"); } }

function shuffleArray(array){ /*... Önceki kod ...*/ let ci=array.length,ri;const na=array.slice();while(ci!==0){ri=Math.floor(Math.random()*ci);ci--;[na[ci],na[ri]]=[na[ri],na[ci]];} return na; }

function drawGame() { /* ... Önceki koddaki TÜM drawGame içeriği ... */
    try { ctx.clearRect(0, 0, canvas.width, canvas.height); if (bgLoaded) ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height); if (logoLoaded) { const cX=logoX+logoWidth/2;const cY=logoY+logoHeight/2;const r=logoWidth/2;ctx.fillStyle='white';ctx.beginPath();ctx.arc(cX,cY,r,0,Math.PI*2);ctx.fill();ctx.drawImage(logoImage,logoX,logoY,logoWidth,logoHeight);} let currentTextY = 30; ctx.fillStyle='white';ctx.font='bold 16px Arial';ctx.textAlign='left'; ctx.shadowColor='black';ctx.shadowBlur=3;ctx.shadowOffsetX=1;ctx.shadowOffsetY=1; ctx.fillText(`${texts[currentLang].attemptsLeft}: ${3-failedAttemptsToday}`,20,currentTextY); currentTextY+=25; ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;
    if (gameState==='TUTORIAL'){const iTS=clickableItems[tutorialStep]; if(iTS){ctx.strokeStyle=(Math.sin(Date.now()*0.005)>0)?'yellow':'orange';ctx.lineWidth=3;ctx.strokeRect(iTS.x-2,iTS.y-2,iTS.width+4,iTS.height+4); ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,canvas.height-60,canvas.width,60); ctx.fillStyle='white';ctx.font='bold 16px Arial';ctx.textAlign='center'; let iAT=texts[currentLang].tutorialItemAction_Default; /*...*/ ctx.fillText(texts[currentLang].tutorialItemIntro+iTS.name+iAT,canvas.width/2,canvas.height-35); ctx.font='14px Arial'; ctx.fillText(texts[currentLang].tutorialItemPrompt,canvas.width/2,canvas.height-15); ctx.textAlign='left';}}
    else if(gameState==='PLAYING'){if(levels[currentLevelIndex]){const d=levels[currentLevelIndex];ctx.fillStyle = 'white'; ctx.textAlign = 'left'; ctx.shadowColor = 'black'; ctx.shadowBlur = 4; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; ctx.font='bold 20px Arial'; ctx.fillText(`${texts[currentLang].level}: ${d.level}`,20,currentTextY); currentTextY+=25; if(d.clicks.length>0){ctx.font='18px Arial'; ctx.fillText(`${texts[currentLang].order}: ${d.recipeName}`,20,currentTextY); currentTextY+=25; ctx.font='italic 16px Arial'; ctx.fillText(`${texts[currentLang].requirements}:`,20,currentTextY); currentTextY+=20; const sC=currentShuffledRecipe; for(const i of sC){ctx.fillText(`- ${i}`,30,currentTextY); currentTextY+=18;} currentTextY+=5;ctx.fillStyle = 'orange'; ctx.font = 'bold 14px Arial'; ctx.fillText(texts[currentLang].mixedOrderWarning,20,currentTextY); currentTextY+=20; if(d.clicks.includes('Fiyat Listesi')){ctx.fillStyle = 'lightblue';ctx.fillText(texts[currentLang].priceCheckWarning,20,currentTextY);currentTextY+=20;} } ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;} if(feedbackMessage.text&&Date.now()<feedbackMessage.expiryTime){/*...*/ctx.fillStyle=feedbackMessage.color;ctx.font='bold 28px Arial';ctx.textAlign='center';ctx.shadowColor='black';ctx.shadowBlur=5;ctx.shadowOffsetX=2;ctx.shadowOffsetY=2;ctx.fillText(feedbackMessage.text,canvas.width/2,canvas.height-30); ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;ctx.textAlign='left';}else{feedbackMessage.text='';}}
    else if(gameState==='NO_ATTEMPTS'||gameState==='GAME_OVER'){/*...*/ ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,canvas.height/2-40,canvas.width,80); const title=(gameState==='NO_ATTEMPTS')?texts[currentLang].noAttemptsTitle:texts[currentLang].gameOverTitle; const message=(gameState==='NO_ATTEMPTS')?texts[currentLang].noAttemptsMessage:texts[currentLang].gameOverMessage; const titleColor=(gameState==='NO_ATTEMPTS')?'red':'gold'; ctx.fillStyle=titleColor; ctx.font='bold 30px Arial'; ctx.textAlign='center'; ctx.fillText(title,canvas.width/2,canvas.height/2); ctx.fillStyle='white'; ctx.font='18px Arial'; ctx.fillText(message,canvas.width/2,canvas.height/2+30); ctx.textAlign='left';}
    if(gameLoopStarted&&(gameState==='PLAYING'||gameState==='TUTORIAL')){requestAnimationFrame(drawGame);}}catch(e){console.error("Draw HATA:",e);gameLoopStarted=false;}
}

function tryStartGame() { /* ... Önceki kod ... */
     console.log("tryStartGame çağrıldı, hak kontrolü yapılıyor."); loadGameData(); if(!canPlay){gameState='NO_ATTEMPTS';requestAnimationFrame(drawGame);}else{gameState='TUTORIAL';tutorialStep=0;isTutorialComplete=false; if(levels[0]&&levels[0].clicks.length>0){currentShuffledRecipe=shuffleArray(levels[0].clicks);}else{currentShuffledRecipe=[];} if(!gameLoopStarted){console.log("Oyun döngüsü başlatılıyor...");gameLoopStarted=true;} requestAnimationFrame(drawGame);}
}

function startGame() { /* ... Önceki kod ... */
    console.log("startGame fonksiyonu ÇAĞRILDI!"); checkStartButtonState(); if(startButton.disabled){console.warn("Başlatma engellendi.");gsmError.style.display='block';return;} console.log("Başlatma Kontrolleri Geçildi."); startScreenDiv.style.display='none'; canvas.style.display='block'; tryStartGame();
}

function checkStartButtonState() { /* ... Önceki kod ... */ const numberEntered=gsmInput.value.trim().length>0; const kvkkValid=kvkkCheck.checked; console.log(`checkStartButtonState: num=${numberEntered}, kvkk=${kvkkValid}`); if(numberEntered&&kvkkValid){startButton.disabled=false;gsmError.style.display='none';console.log(`checkStartButtonState: Aktif!`);}else{startButton.disabled=true;console.log(`checkStartButtonState: Pasif!`); if((!numberEntered||!kvkkValid)&&(gsmInput.value.length>0||kvkkCheck.checked)){gsmError.innerText=texts[currentLang].gsmError;gsmError.style.display='block';}else{gsmError.style.display='none';}}}

function handleClick(event) { /* ... Önceki koddan kopyala ... */ }

// --- Tıklanabilir Alanlar, Seviye Tarifleri, Logo Tanımları ---
// Bunlar globalde kalabilir, DOM hazır olmadan da tanımlanabilirler.
const clickableItems = [ /* ... 11 öğe ... */ ];
const levels = [ /* ... 10 seviye + bitiş ... */ ];
const logoWidth = 80; const logoHeight = 80; const logoX = canvas.width/2-logoWidth/2; const logoY = 20;

// --- SAYFA YÜKLENDİĞİNDE ÇALIŞACAK KODLAR ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Yüklendi.");

    // --- DOM Element Referanslarını BURADA ALALIM ---
    // Canvas ve Context zaten yukarıda alındı ve genellikle sorun çıkarmaz ama garanti olsun:
    // const canvas = document.getElementById('gameCanvas');
    // const ctx = canvas.getContext('2d');

    // Giriş Ekranı Elementleri (Yeniden tanımlama yerine globaldekileri kullan)
    const startScreenDiv = document.getElementById('startScreen');
    const gameTitleEl = document.getElementById('gameTitle');
    const gameSloganEl = document.getElementById('gameSlogan');
    const langTRButton = document.getElementById('langTR'); // <<< HATA BURADAYDI, ŞİMDİ GÜVENDE
    const langENButton = document.getElementById('langEN');
    const regionSelect = document.getElementById('regionSelect');
    const regionLabelEl = document.getElementById('regionLabel');
    const rewardTitleEl = document.getElementById('rewardTitle');
    const rewardListEl = document.getElementById('rewardList'); // ID HTML ile eşleşmeli
    const startButton = document.getElementById('startButton');
    const gsmInput = document.getElementById('gsmInput');
    const kvkkCheck = document.getElementById('kvkkCheck');
    const gsmError = document.getElementById('gsmError');
    const gsmLabel = document.getElementById('gsmLabel');
    const kvkkLabel = document.getElementById('kvkkLabel');
    // Mesajlaşma Elementleri
    const messageOverlay = document.getElementById('messageOverlay');
    const messageTitle = document.getElementById('messageTitle');
    const messageBody = document.getElementById('messageBody');
    const closeButton = document.getElementById('closeButton');
    // --- Referanslar Sonu ---

    // Referansların alınıp alınamadığını kontrol edelim (opsiyonel ama iyi fikir)
    if (!canvas || !startScreenDiv || !langTRButton || !langENButton || !regionSelect || !startButton || !gsmInput || !kvkkCheck || !messageOverlay || !closeButton) {
        console.error("HATA: Gerekli HTML elementlerinden biri veya birkaçı bulunamadı! ID'leri kontrol edin.");
        return; // Elementler yoksa devam etme
    }

    // Olay Dinleyicilerini BURADA EKLEYELİM
    langTRButton.addEventListener('click', () => { if(currentLang!=='TR'){currentLang='TR';updateTexts(currentLang, currentRegion);}});
    langENButton.addEventListener('click', () => { if(currentLang!=='EN'){currentLang='EN';updateTexts(currentLang, currentRegion);}});
    regionSelect.addEventListener('change', (event) => { currentRegion=event.target.value; console.log("Bölge:",currentRegion); updateTexts(currentLang, currentRegion); });
    startButton.addEventListener('click', startGame);
    gsmInput.addEventListener('input', checkStartButtonState);
    kvkkCheck.addEventListener('change', checkStartButtonState);
    closeButton.addEventListener('click', hideMessage);
    canvas.addEventListener('click', handleClick); // Canvas tıklaması

    // Başlangıç Ayarları
    loadGameData();
    updateTexts(currentLang, currentRegion);
    checkStartButtonState();

    // Görsel yüklemelerini başlat
    console.log("Görseller yükleniyor...");
    bgImage.src = 'original.gif';
    logoImage.src = 'Starbucks_Corporation.png';
});

// Hata logları (Globalde kalabilir)
bgImage.onerror = () => { console.error("BG Yüklenemedi!"); }
logoImage.onerror = () => { console.error("Logo Yüklenemedi!"); }

console.log("script.js dosyası okundu.");
