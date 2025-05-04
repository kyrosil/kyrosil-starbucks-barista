// Canvas elementini ve 2D çizim bağlamını alalım
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Giriş Ekranı Elementleri ---
const startScreenDiv = document.getElementById('startScreen');
const gameTitleEl = document.getElementById('gameTitle');
const gameSloganEl = document.getElementById('gameSlogan');
const langTRButton = document.getElementById('langTR');
const langENButton = document.getElementById('langEN');
const regionSelect = document.getElementById('regionSelect');
const regionLabelEl = document.getElementById('regionLabel');
const rewardTitleEl = document.getElementById('rewardTitle');
const rewardSummaryEl = document.getElementById('rewardSummary'); // Güncellenecek
const startButton = document.getElementById('startButton');
// --- Giriş Ekranı Elementleri Sonu ---

// Mesajlaşma Elementleri
const messageOverlay = document.getElementById('messageOverlay'); /* ... */
const messageTitle = document.getElementById('messageTitle');   /* ... */
const messageBody = document.getElementById('messageBody');     /* ... */
const closeButton = document.getElementById('closeButton');     /* ... */

// Görsel Nesneleri ve Yükleme Durumları
const bgImage = new Image(); const logoImage = new Image();
let bgLoaded = false, logoLoaded = false;

// Oyun Durumları ('LOADING', 'START_SCREEN', 'TUTORIAL', 'PLAYING', 'MESSAGE', 'GAME_OVER', 'NO_ATTEMPTS')
let gameState = 'LOADING';
let tutorialStep = 0; let isTutorialComplete = false;

// Oyun Değişkenleri
let currentLevelIndex = 0; let currentRecipeStep = 0;
let canPlay = false; let gameLoopStarted = false;
let currentShuffledRecipe = [];

// Dil ve Bölge
let currentLang = 'TR'; let currentRegion = 'TR';

// localStorage ve Günlük Hak Takibi
let failedAttemptsToday = 0; let lastPlayDate = '';
function loadGameData() { /* ... */ const today=new Date().toISOString().split('T')[0];lastPlayDate=localStorage.getItem('barista_lastPlayDate')||today;failedAttemptsToday=parseInt(localStorage.getItem('barista_failedAttempts')||'0',10);if(lastPlayDate!==today){console.log("Yeni gün!");failedAttemptsToday=0;lastPlayDate=today;saveGameData();} if(failedAttemptsToday>=3){canPlay=false;console.warn("Hak bitti.");}else{canPlay=true;} console.log(`Bugünkü hata hakkı: ${3-failedAttemptsToday}/3`); }
function saveGameData() { /* ... */ localStorage.setItem('barista_lastPlayDate',lastPlayDate);localStorage.setItem('barista_failedAttempts',failedAttemptsToday.toString()); }

// Geri Bildirim Mesajı Değişkenleri (Canvas için)
let feedbackMessage = { text: '', color: 'red', expiryTime: 0 };

// Metinler Objesi (Aynı)
const texts = { TR: { /*...*/ }, EN: { /*...*/ } }; // Önceki koddan kopyala

// Ödül Seviyeleri (Aynı)
const rewardTiers = { TR:{2:"200 TL",4:"600 TL",/*...*/10:"500 USDT"}, EU:{2:"5 USD",4:"15 USD",/*...*/10:"500 USDT"} };
function getRewardForLevel(level, region) { return rewardTiers[region]?.[level] || null; }

// Mesaj Gösterme Fonksiyonları (Aynı)
function showMessage(title, bodyHtml, type='info') { /* ... */ }
function hideMessage() { /* ... */ }
closeButton.addEventListener('click', hideMessage);

// Tıklanabilir Alanlar (Aynı)
const clickableItems = [ /* ... önceki koddan 11 öğe ... */ ];

// Seviye Tarifleri (Aynı)
const levels = [ /* ... önceki koddan 10 seviye + bitiş ... */ ];

// Görsel yükleme olayları
bgImage.onload = function() { console.log("BG yüklendi"); bgLoaded=true; if(logoLoaded) checkAssetsLoaded();}; // checkAssetsLoaded çağırıyor
logoImage.onload = function() { console.log("Logo yüklendi"); logoLoaded=true; if(bgLoaded) checkAssetsLoaded();}; // checkAssetsLoaded çağırıyor
bgImage.src = 'original.gif'; logoImage.src = 'Starbucks_Corporation.png';
const logoWidth = 80; const logoHeight = 80; const logoX = canvas.width/2-logoWidth/2; const logoY = 20;


// Tüm Görseller Yüklendi Mi Kontrolü (Aynı)
function checkAssetsLoaded() {
    if (bgLoaded && logoLoaded && gameState === 'LOADING') {
         console.log("Tüm görseller yüklendi, giriş ekranı hazırlanıyor.");
         gameState = 'START_SCREEN';
         loadGameData(); // Hakları burada kontrol edelim
         updateTexts(currentLang, currentRegion); // İlk metinleri ve ÖDÜL ÖZETİNİ ayarla
         // Giriş ekranı zaten HTML'de görünür durumda
    }
}

// Fisher-Yates Shuffle Algoritması (Aynı)
function shuffleArray(array){/*...*/}

// Ana oyun döngüsü fonksiyonu (Parantez hatası düzeltildi)
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bgLoaded) ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    if (logoLoaded) { /* ... logo ve daire ... */ const cX=logoX+logoWidth/2;const cY=logoY+logoHeight/2;const r=logoWidth/2;ctx.fillStyle='white';ctx.beginPath();ctx.arc(cX,cY,r,0,Math.PI*2);ctx.fill();ctx.drawImage(logoImage,logoX,logoY,logoWidth,logoHeight);}

    let currentTextY = 30; // Sol üst yazıların başlangıç Y'si

    // Sol Üst: Kalan Haklar
    /* ... */ ctx.fillStyle='white';ctx.font='bold 16px Arial';ctx.textAlign='left'; ctx.shadowColor='black';ctx.shadowBlur=3;ctx.shadowOffsetX=1;ctx.shadowOffsetY=1; ctx.fillText(`${texts[currentLang].attemptsLeft}: ${3-failedAttemptsToday}`,20,currentTextY); currentTextY+=25; ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;

    // Oyun Durumuna Göre Çizim
    if (gameState === 'TUTORIAL') {
        // Öğretici Çizimi...
        const itemToShow = clickableItems[tutorialStep]; if(itemToShow){ /* ... vurgulama ... */ ctx.strokeStyle=(Math.sin(Date.now()*0.005)>0)?'yellow':'orange';ctx.lineWidth=3;ctx.strokeRect(itemToShow.x-2,itemToShow.y-2,itemToShow.width+4,itemToShow.height+4); /* ... alttaki metin ... */ ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,canvas.height-60,canvas.width,60); ctx.fillStyle='white';ctx.font='bold 16px Arial';ctx.textAlign='center'; let iAT=texts[currentLang].tutorialItemAction_Default; /*...*/ if(itemToShow.name==='Tezgahtaki Kedi')iAT=texts[currentLang].tutorialItemAction_Cat; if(itemToShow.name==='Kasa')iAT=texts[currentLang].tutorialItemAction_Register; if(itemToShow.name==='Sipariş Fişi')iAT=texts[currentLang].tutorialItemAction_OrderSlip; if(itemToShow.name==='Fiyat Listesi')iAT=texts[currentLang].tutorialItemAction_PriceList; if(itemToShow.name==='Buzdolabı')iAT=texts[currentLang].tutorialItemAction_Fridge; if(itemToShow.name==='Tatlı Dolabı')iAT=texts[currentLang].tutorialItemAction_Dessert; ctx.fillText(texts[currentLang].tutorialItemIntro+itemToShow.name+iAT,canvas.width/2,canvas.height-35); ctx.font='14px Arial'; ctx.fillText(texts[currentLang].tutorialItemPrompt,canvas.width/2,canvas.height-15); ctx.textAlign='left'; }
    } else if (gameState === 'PLAYING') {
        // Normal Oyun Çizimi...
        if (levels[currentLevelIndex]) { /* ... Seviye, Sipariş, Karışık Gerekenler, Uyarılar ... */
            const d=levels[currentLevelIndex];ctx.fillStyle = 'white'; ctx.textAlign = 'left'; ctx.shadowColor = 'black'; ctx.shadowBlur = 4; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2;
            ctx.font='bold 20px Arial'; ctx.fillText(`${texts[currentLang].level}: ${d.level}`,20,currentTextY); currentTextY+=25;
            if(d.clicks.length>0){ctx.font='18px Arial'; ctx.fillText(`${texts[currentLang].order}: ${d.recipeName}`,20,currentTextY); currentTextY+=25; ctx.font='italic 16px Arial'; ctx.fillText(`${texts[currentLang].requirements}:`,20,currentTextY); currentTextY+=20; const sC=currentShuffledRecipe; for(const i of sC){ctx.fillText(`- ${i}`,30,currentTextY); currentTextY+=18;} currentTextY+=5; ctx.fillStyle='orange'; ctx.font='bold 14px Arial'; ctx.fillText(texts[currentLang].mixedOrderWarning,20,currentTextY); currentTextY+=20; if(d.clicks.includes('Fiyat Listesi')){ctx.fillStyle='lightblue';ctx.fillText(texts[currentLang].priceCheckWarning,20,currentTextY);currentTextY+=20;} }
            ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0; // Gölgeyi sıfırla
        } // <<<--- BU KAPAMA PARANTEZİ ÖNCEKİ KODDA EKSİK OLABİLİR! DÜZELTİLDİ.
         // Geçici Hata/Başarı Mesajı (Canvas'a)
        if (feedbackMessage.text && Date.now() < feedbackMessage.expiryTime) { /*...*/ ctx.fillStyle=feedbackMessage.color;ctx.font='bold 28px Arial';ctx.textAlign='center';ctx.shadowColor='black';ctx.shadowBlur=5;ctx.shadowOffsetX=2;ctx.shadowOffsetY=2;ctx.fillText(feedbackMessage.text,canvas.width/2,canvas.height-30); ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;ctx.textAlign='left';} else { feedbackMessage.text='';}

    } else if (gameState === 'NO_ATTEMPTS' || gameState === 'GAME_OVER') {
        // Hak Bitti veya Oyun Bitti Mesajları (Canvas'a)
         /* ... */ ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,canvas.height/2-40,canvas.width,80); const title=(gameState==='NO_ATTEMPTS')?texts[currentLang].noAttemptsTitle:texts[currentLang].gameOverTitle; const message=(gameState==='NO_ATTEMPTS')?texts[currentLang].noAttemptsMessage:texts[currentLang].gameOverMessage; const titleColor=(gameState==='NO_ATTEMPTS')?'red':'gold'; ctx.fillStyle=titleColor; ctx.font='bold 30px Arial'; ctx.textAlign='center'; ctx.fillText(title,canvas.width/2,canvas.height/2); ctx.fillStyle='white'; ctx.font='18px Arial'; ctx.fillText(message,canvas.width/2,canvas.height/2+30); ctx.textAlign='left';
    } // <<<--- BU KAPAMA PARANTEZİ DE ÖNEMLİ!

    // Döngüyü devam ettir
    if (gameLoopStarted && (gameState === 'PLAYING' || gameState === 'TUTORIAL')) {
         requestAnimationFrame(drawGame);
    }
}


// Metin Güncelleme Fonksiyonu (GÜNCELLENDİ - Bölgeye göre ödül özeti)
function updateTexts(lang, region) { // Bölge parametresi eklendi
    console.log(`updateTexts çağrıldı: Lang=${lang}, Region=${region}`);
    const t = texts[lang];
    document.title = t.gameTitle;
    if(gameTitleEl) gameTitleEl.innerText = t.gameTitle;
    if(gameSloganEl) gameSloganEl.innerText = t.slogan;
    if(regionLabelEl) regionLabelEl.innerText = t.regionLabel;
    if(rewardTitleEl) rewardTitleEl.innerText = t.rewardTitle;
    if(startButton) startButton.innerText = t.startButton;
    if(closeButton) closeButton.innerText = t.closeButton;

    // Ödül Özetini Güncelle
    if(rewardSummaryEl) {
        const lvl2Reward = getRewardForLevel(2, region); // Bölgeye göre Seviye 2 ödülünü al
        const lvl10Reward = getRewardForLevel(10, region); // Bölgeye göre Seviye 10 ödülünü al
        // Metni dinamik oluştur (daha açıklayıcı)
        rewardSummaryEl.innerText = `Seviye 2: ${lvl2Reward || '?'} | Seviye 10: ${lvl10Reward || '?'}! Diğer seviyelerde de ödüller var!`;
    }

    // Aktif dil butonunu ayarla
    if(langTRButton) langTRButton.classList.toggle('active', lang === 'TR');
    if(langENButton) langENButton.classList.toggle('active', lang === 'EN');
    document.documentElement.lang = lang.toLowerCase();
    console.log(`Metinler ${lang} (${region}) olarak güncellendi.`);
}

// Olay Dinleyicileri (Giriş Ekranı)
langTRButton.addEventListener('click', () => { if(currentLang!=='TR'){currentLang='TR';updateTexts(currentLang, currentRegion);/*localStorage...*/}});
langENButton.addEventListener('click', () => { if(currentLang!=='EN'){currentLang='EN';updateTexts(currentLang, currentRegion);/*localStorage...*/}});
regionSelect.addEventListener('change', (event) => { currentRegion=event.target.value; console.log("Bölge seçildi:",currentRegion); updateTexts(currentLang, currentRegion); /*localStorage...*/ });
startButton.addEventListener('click', startGame);

// Oyunu Başlatma Fonksiyonu (Aynı)
function startGame() { console.log("Başlat tıklandı."); /*playSound(clickSound);*/ startScreenDiv.style.display = 'none'; canvas.style.display = 'block'; tryStartGame(); }

// Tıklama İşleyici Fonksiyon (Aynı)
function handleClick(event) { /* ... Önceki mesajdaki tam kod ... */
    const rect=canvas.getBoundingClientRect();const clickX=event.clientX-rect.left;const clickY=event.clientY-rect.top;
    if(gameState==='TUTORIAL'){const iTC=clickableItems[tutorialStep];if(iTC&&clickX>=iTC.x&&clickX<=iTC.x+iTC.width&&clickY>=iTC.y&&clickY<=iTC.y+iTC.height){console.log(`Öğretici: ${iTC.name} tıklandı.`);tutorialStep++;if(tutorialStep>=clickableItems.length){console.log("Öğretici bitti!");isTutorialComplete=true;gameState='PLAYING';currentLevelIndex=0;currentRecipeStep=0;canPlay=true;currentShuffledRecipe=shuffleArray(levels[currentLevelIndex].clicks);if(gameLoopStarted)requestAnimationFrame(drawGame);}else{requestAnimationFrame(drawGame);}}else{console.log("Öğretici: Yanlış yere tıklandı.");}}
    else if(gameState==='PLAYING'){if(!canPlay||currentLevelIndex>=levels.length-1||messageOverlay.style.display==='flex')return;let cIN=null;for(const item of clickableItems){if(clickX>=item.x&&clickX<=item.x+item.width&&clickY>=item.y&&clickY<=item.y+item.height){cIN=item.name;break;}} if(cIN){console.log(`Oyun: Tıklandı: ${cIN}`);const cLD=levels[currentLevelIndex];const eC=cLD.clicks[currentRecipeStep];if(cIN===eC){console.log("Oyun: Doğru adım!");currentRecipeStep++;if(currentRecipeStep>=cLD.clicks.length){const cL=cLD.level;console.log(`--- Seviye ${cL} Bitti! ---`);const rAS=getRewardForLevel(cL,currentRegion);currentLevelIndex++;currentRecipeStep=0;if(levels[currentLevelIndex]&&levels[currentLevelIndex].clicks.length>0){currentShuffledRecipe=shuffleArray(levels[currentLevelIndex].clicks);}else{currentShuffledRecipe=[];} if(rAS){console.warn(`%cÖDÜL! Seviye ${cL} (${rAS})`,'color:green;font-weight:bold;');const iL10=cL===10;const wMP2=iL10?texts[currentLang].winMessagePart2_USDT:texts[currentLang].winMessagePart2_App.replace('{REWARD}',rAS);const mBB=iL10?texts[currentLang].winMessageEmailBodyBase_USDT:texts[currentLang].winMessageEmailBodyBase_App;const mB=encodeURIComponent(mBB.replace('{LEVEL}',cL).replace('{REWARD}',rAS));const mS=encodeURIComponent(`${texts[currentLang].winMessageEmailSubjectBase}${cL}${iL10?' - NAKIT ODUL':''}`);const mTL=`mailto:${texts[currentLang].winMessageEmailAddress}?subject=${mS}&body=${mB}`;const wH=`<p>${texts[currentLang].winMessagePart1}${cL}${wMP2}</p><hr><p>${texts[currentLang].winMessageEmailPrompt}<br><a href="${mTL}" target="_blank"><b>${texts[currentLang].winMessageEmailAddress}</b></a><br>${texts[currentLang].winMessageEmailInstructions}</p>`;showMessage(texts[currentLang].winTitle,wH,'win');} const nLD=levels[currentLevelIndex];if(!nLD||nLD.clicks.length===0){console.log("OYUN TAMAMLANDI!");gameState='GAME_OVER';requestAnimationFrame(drawGame);}}else{/*Doğru adım feedback?*/}}else{console.log("Oyun: Yanlış! Baştan başla.");currentRecipeStep=0;failedAttemptsToday++;saveGameData();console.log(`Kalan hak: ${3-failedAttemptsToday}/3`);feedbackMessage={text:texts[currentLang].errorMessage,color:'red',expiryTime:Date.now()+2500};if(failedAttemptsToday>=3){canPlay=false;console.error("Hak bitti!");gameState='NO_ATTEMPTS';} requestAnimationFrame(drawGame);}}else{console.log("Oyun: Boş alan tıklandı.");}}}
}


// Olay dinleyicileri
canvas.addEventListener('click', handleClick);
// Hata logları
bgImage.onerror = () => { console.error("BG Yüklenemedi!"); }
logoImage.onerror = () => { console.error("Logo Yüklenemedi!"); }

// Başlangıç Ayarları
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Yüklendi.");
    updateTexts(currentLang, currentRegion); // Ekrana ilk metinleri yaz (Ödül özeti dahil)
    loadGameData(); // Hakları kontrol et (oyunu başlatmaz)
    console.log("Görseller yükleniyor..."); // Yüklemeyi başlat
    bgImage.src = 'original.gif';
    logoImage.src = 'Starbucks_Corporation.png';
});

console.log("script.js dosyası okundu.");
