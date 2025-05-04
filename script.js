// --- Global Değişkenler ---
let canvas, ctx;
let startScreenDiv, gameTitleEl, gameSloganEl, langTRButton, langENButton, regionSelect, regionLabelEl, rewardTitleEl, rewardListEl, startButton, gsmInput, kvkkCheck, gsmError, gsmLabel, kvkkLabel;
let messageOverlay, messageTitle, messageBody, closeButton;
const bgImage = new Image(); const logoImage = new Image();
let bgLoaded = false, logoLoaded = false;
let gameState = 'LOADING'; let tutorialStep = 0; let isTutorialComplete = false;
let currentLevelIndex = 0; let currentRecipeStep = 0; let canPlay = false; let gameLoopStarted = false; let currentShuffledRecipe = [];
let currentLang = 'TR'; let currentRegion = 'TR';
let failedAttemptsToday = 0; let lastPlayDate = '';
let feedbackMessage = { text: '', color: 'red', expiryTime: 0 };

// --- Metinler Objesi ---
const texts = {
    TR: { gameTitle:"Kyrosil Starbucks Barista", slogan:"En İyi Barista Ol! Siparişleri doğru sırayla hazırla, ödülleri kap!", regionLabel:"Bölge:", rewardTitle:"Seviye Ödülleri", startButton:"Oyuna Başla!", level:"Seviye", order:"Sipariş", requirements:"Gerekenler", attemptsLeft:"Kalan Hata Hakkı", errorTitle:"Hata!", errorMessage:"Yanlış malzeme veya sıra! Baştan başla.", winTitle:"Tebrikler!", winMessagePart1:"Seviye ", winMessagePart2_App:" **{REWARD}** değerinde Starbucks Mobil Uygulaması ödülü kazandın!", winMessagePart2_USDT:" **NAKİT ÖDÜL (500 USDT)** kazandın!", winMessageEmailPrompt:"Ödülünü almak için aşağıdaki linke tıklayarak veya manuel olarak", winMessageEmailAddress:"giveaways@kyrosil.eu", winMessageEmailSubjectBase:"Kyrosil Starbucks Oyun Ödülü - Seviye ", winMessageEmailBodyBase_App:"Merhaba,\n\nSeviye {LEVEL} Starbucks Mobil Uygulaması ödülünü ({REWARD}) kazandım.\nUygulama kodumu bekliyorum.\n\nEkran görüntüm ektedir.\n\nTeşekkürler.", winMessageEmailBodyBase_USDT:"Merhaba,\n\nSeviye 10 Büyük Ödülünü (500 USDT) kazandım.\nÖdül gönderimi için detayları bekliyorum.\n\nEkran görüntüm ektedir.\n\nTeşekkürler.", winMessageEmailInstructions:"adresine bu ekranın görüntüsüyle birlikte mail atabilirsin.", gameOverTitle:"Oyun Bitti!", gameOverMessage:"Tüm seviyeleri tamamladın! Harikasın!", noAttemptsTitle:"Hakların Bitti!", noAttemptsMessage:"Bugünkü 3 hata yapma hakkını doldurdun. Yarın tekrar oynamak için geri gel!", closeButton:"Tamam", tutorialIntro:"Oyuna Hoş Geldin! İşte Tıklama Alanları:", tutorialItemIntro:"Bu: ", tutorialItemAction_Default:". Tarifte adı geçince buraya tıklayacaksın.", tutorialItemAction_Cat:". Önemli bir mola!", tutorialItemAction_Register:". Siparişi bitirmek için.", tutorialItemAction_OrderSlip:". Siparişi almak için.", tutorialItemAction_PriceList:". Fiyatları görmek için.", tutorialItemAction_Fridge:". Soğuk malzemeler burada.", tutorialItemAction_Dessert:". Tatlılar burada.", tutorialItemPrompt:"Devam etmek için vurgulanan alana tıkla.", tutorialComplete:"Harika! Başlıyoruz!", tutorialOutOfAttempts:"Hakların bittiği için bugünlük bu kadar!", mixedOrderWarning:"Not: Malzemeler karışık, doğru sırada hazırla!", priceCheckWarning:"Müşteri fiyatı da sordu!", gsmLabel:"Starbucks Mobile Kayıtlı GSM No:", gsmPlaceholder:"Numaranızı Girin", kvkkLabel:" KVKK kapsamında numaramın sadece ödül aktarımı için göstermelik olarak istendiğini anladım, onaylıyorum.", gsmError:"Lütfen numara girip kutuyu işaretleyin.", rewardTypeApp:"(Starbucks App Kodu)", rewardTypeCash:"(NAKİT ÖDÜL!)" },
    EN: { gameTitle:"Kyrosil Starbucks Barista", slogan:"Be the Best Barista! Prepare orders correctly and grab rewards!", regionLabel:"Region:", rewardTitle:"Level Rewards", startButton:"Start Game!", level:"Level", order:"Order", requirements:"Required", attemptsLeft:"Attempts Left", errorTitle:"Error!", errorMessage:"Wrong item or sequence! Start over.", winTitle:"Congratulations!", winMessagePart1:"You won the Level ", winMessagePart2_App:" Starbucks Mobile App reward ({REWARD})!", winMessagePart2_USDT:" CASH PRIZE (500 USDT)!", winMessageEmailPrompt:"To claim your reward, click the link below or manually email", winMessageEmailAddress:"giveaways@kyrosil.eu", winMessageEmailSubjectBase:"Kyrosil Starbucks Game Reward - Level ", winMessageEmailBodyBase_App:"Hello,\n\nI won the Level {LEVEL} Starbucks Mobile App reward ({REWARD})...", winMessageEmailBodyBase_USDT:"Hello,\n\nI won the Level 10 Grand Prize (500 USDT)...", winMessageEmailInstructions:"with a screenshot.", gameOverTitle:"Game Over!", gameOverMessage:"You completed all levels! Awesome!", noAttemptsTitle:"No Attempts Left!", noAttemptsMessage:"You've used your 3 attempts for today. Come back tomorrow!", closeButton:"OK", tutorialIntro:"Welcome! Let's show you the interaction areas:", tutorialItemIntro:"This is the: ", tutorialItemAction_Default:". Click here when it's in the recipe.", /*...*/ tutorialComplete:"Great! Let's begin!", tutorialOutOfAttempts:"You are out of attempts for today!", mixedOrderWarning:"Note: Ingredients listed randomly, prepare in correct order!", priceCheckWarning:"Customer asked for the price!", gsmLabel:"Starbucks Mobile Registered GSM No:", gsmPlaceholder:"Enter your phone number", kvkkLabel:" I agree my number is requested symbolically for reward transfer under GDPR & Privacy Policy (Applies to USA users selecting Europe too).", gsmError:"Please enter a number and check the box.", rewardTypeApp:"(Starbucks App Code)", rewardTypeCash:"(CASH PRIZE!)" }
};

// --- Sabit Veriler ---
const rewardTiers = { TR:{2:"200 TL",4:"600 TL",6:"2.000 TL",8:"5.000 TL",10:"500 USDT"}, EU:{2:"5 USD",4:"15 USD",6:"40 USD",8:"100 USD",10:"500 USDT"} };
const clickableItems = [{name:'Espresso Makinesi',x:605,y:300,width:50,height:60},{name:'Yeşil Şişe',x:300,y:245,width:30,height:55},{name:'Şurup Pompası',x:340,y:245,width:30,height:55},{name:'Süt Kutusu',x:390,y:245,width:30,height:55},{name:'Bardak Alanı',x:330,y:357,width:50,height:50},{name:'Tezgahtaki Kedi',x:442,y:352,width:70,height:40},{name:'Kasa',x:700,y:300,width:60,height:60},{name:'Sipariş Fişi',x:780,y:240,width:15,height:30},{name:'Buzdolabı',x:445,y:305,width:70,height:40},{name:'Tatlı Dolabı',x:700,y:450,width:80,height:60},{name:'Fiyat Listesi',x:500,y:80,width:100,height:200}];
const levels = [{level:1,recipeName:"İlk Sipariş (Espresso)",clicks:['Sipariş Fişi','Espresso Makinesi']},{level:2,recipeName:"Caffè Latte (Fiyatlı)",clicks:['Espresso Makinesi','Süt Kutusu','Fiyat Listesi']},{level:3,recipeName:"Vanilya Şur. Soğuk Kahve",clicks:['Bardak Alanı','Buzdolabı','Espresso Makinesi','Şurup Pompası']},{level:4,recipeName:"Kedi Molası & Yeşil Çay",clicks:['Tezgahtaki Kedi','Yeşil Şişe','Bardak Alanı']},{level:5,recipeName:"Yoğun Talep",clicks:['Sipariş Fişi','Espresso Makinesi','Süt Kutusu','Espresso Makinesi']},{level:6,recipeName:"Hesaplı Şuruplu Latte",clicks:['Bardak Alanı','Espresso Makinesi','Şurup Pompası','Süt Kutusu','Fiyat Listesi','Kasa']},{level:7,recipeName:"Yeşil & Vanilya & Buz",clicks:['Yeşil Şişe','Şurup Pompası','Buzdolabı','Bardak Alanı']},{level:8,recipeName:"Tam Menü (Basit)",clicks:['Sipariş Fişi','Bardak Alanı','Espresso Makinesi','Süt Kutusu','Tatlı Dolabı','Kasa']},{level:9,recipeName:"Pati Deluxe Özel",clicks:['Bardak Alanı','Buzdolabı','Yeşil Şişe','Şurup Pompası','Espresso Makinesi','Tezgahtaki Kedi','Kasa']},{level:10,recipeName:"USTALIK ESERİ!",clicks:['Sipariş Fişi','Fiyat Listesi','Bardak Alanı','Buzdolabı','Yeşil Şişe','Şurup Pompası','Espresso Makinesi','Süt Kutusu','Tatlı Dolabı','Tezgahtaki Kedi','Kasa']},{level:11,recipeName:"OYUN BİTTİ!",clicks:[]}];
const logoWidth = 80; const logoHeight = 80; let logoX = 0; const logoY = 20; // logoX drawGame içinde hesaplanacak

// --- Yardımcı Fonksiyonlar ---
function loadGameData(){try{const today=new Date().toISOString().split('T')[0];lastPlayDate=localStorage.getItem('barista_lastPlayDate')||today;failedAttemptsToday=parseInt(localStorage.getItem('barista_failedAttempts')||'0',10);if(lastPlayDate!==today){console.log("Yeni gün!");failedAttemptsToday=0;lastPlayDate=today;saveGameData();} if(failedAttemptsToday>=3){canPlay=false;console.warn("Hak bitti.");}else{canPlay=true;} console.log(`Bugünkü hata hakkı: ${3-failedAttemptsToday}/3`);}catch(e){console.error("loadGameData Hatası:",e);canPlay=false;}}
function saveGameData(){try{localStorage.setItem('barista_lastPlayDate',lastPlayDate);localStorage.setItem('barista_failedAttempts',failedAttemptsToday.toString());}catch(e){console.error("saveGameData Hatası:",e);}}
function getRewardForLevel(level, region) { return rewardTiers[region]?.[level] || null; }
function showMessage(title, bodyHtml, type='info'){ try{ console.log(`showMessage: Tip=${type}, Başlık=${title}`); if(!messageOverlay || !messageTitle || !messageBody) throw new Error("Mesaj elementleri bulunamadı!"); messageTitle.innerText=title; messageBody.innerHTML=bodyHtml; messageOverlay.className=`overlay message-${type}`; messageOverlay.style.display='flex'; canPlay=false; } catch(e) { console.error("showMessage Hatası:", e); }}
function hideMessage(){ try{ if(!messageOverlay) throw new Error("Mesaj overlay elementi bulunamadı!"); messageOverlay.style.display='none'; if(failedAttemptsToday<3 && currentLevelIndex<levels.length-1 && gameState==='PLAYING'){canPlay=true;} } catch(e) { console.error("hideMessage Hatası:", e); }}
function shuffleArray(array){ let ci=array.length,ri;const na=array.slice();while(ci!==0){ri=Math.floor(Math.random()*ci);ci--;[na[ci],na[ri]]=[na[ri],na[ci]];} return na; }

// --- Ana Oyun Fonksiyonları ---

// Metin Güncelleme
function updateTexts(lang, region) {
    try {
        console.log(`updateTexts: Lang=${lang}, Region=${region}`);
        const t = texts[lang]; if (!t) throw new Error(`Metinler bulunamadı: ${lang}`);
        document.title = t.gameTitle;
        gameTitleEl.innerText = t.gameTitle; gameSloganEl.innerText = t.slogan; regionLabelEl.innerText = t.regionLabel;
        rewardTitleEl.innerText = t.rewardTitle; startButton.innerText = t.startButton; closeButton.innerText = t.closeButton;
        gsmLabel.innerText = t.gsmLabel; kvkkLabel.innerHTML = t.kvkkLabel; gsmError.innerText = t.gsmError;
        if(gsmInput && t.gsmPlaceholder) gsmInput.placeholder = t.gsmPlaceholder;
        // Detaylı Ödül Listesi
        rewardListEl.innerHTML = ''; const currentRewards = rewardTiers[region];
        if (currentRewards) { const levelsToShow = [2, 4, 6, 8, 10]; levelsToShow.forEach(level => { const reward = currentRewards[level]; if (reward) { const li = document.createElement('li'); const isCash = level === 10; const rewardType = isCash ? t.rewardTypeCash : t.rewardTypeApp; li.innerHTML = `<strong>${t.level} ${level}:</strong> <span>${reward}</span> <span class="prize-type">${rewardType}</span>`; rewardListEl.appendChild(li); } });
        } else { console.warn("Bölge için ödül bulunamadı:", region); }
        langTRButton.classList.toggle('active', lang === 'TR'); langENButton.classList.toggle('active', lang === 'EN');
        document.documentElement.lang = lang.toLowerCase(); console.log(`Metinler ${lang} (${region}) güncellendi.`);
    } catch (error) { console.error("updateTexts hatası:", error); }
}

// Başlat Butonu Kontrolü
function checkStartButtonState() { /* ... */ try { const numberEntered = gsmInput?.value.trim().length > 0; const kvkkValid = kvkkCheck?.checked; console.log(`checkStartButtonState: num=${numberEntered}, kvkk=${kvkkValid}`); if (startButton) { if(numberEntered && kvkkValid){startButton.disabled=false;if(gsmError)gsmError.style.display='none';console.log(`checkStartButtonState: Aktif!`);}else{startButton.disabled=true;console.log(`checkStartButtonState: Pasif!`); if(gsmError && (!numberEntered||!kvkkValid)&&((gsmInput&&gsmInput.value.length>0)|| (kvkkCheck&&kvkkCheck.checked))){gsmError.innerText=texts[currentLang]?.gsmError || "Please enter number and check box.";gsmError.style.display='block';}else if(gsmError){gsmError.style.display='none';}}}else{console.warn("Buton yok!");} } catch(e){console.error("checkStartButtonState hatası:",e);} }

// Görsel Yükleme Kontrolü
function checkAssetsLoaded(){if(bgLoaded&&logoLoaded&&gameState==='LOADING'){console.log("Görseller yüklendi...");gameState='START_SCREEN';loadGameData();updateTexts(currentLang,currentRegion);checkStartButtonState();}}

// Oyunu Başlatma Tetikleyicisi
function tryStartGame() { try { console.log("tryStartGame çağrıldı, hak kontrolü."); loadGameData(); if(!canPlay){ gameState='NO_ATTEMPTS'; if(gameLoopStarted){requestAnimationFrame(drawGame);}else{showMessage(texts[currentLang].noAttemptsTitle,texts[currentLang].noAttemptsMessage,'error');}}else{ gameState='TUTORIAL'; tutorialStep=0; isTutorialComplete=false; if(levels[currentLevelIndex]?.clicks.length>0){currentShuffledRecipe=shuffleArray(levels[currentLevelIndex].clicks);}else{currentShuffledRecipe=[];} if(!gameLoopStarted){console.log("Oyun döngüsü başlatılıyor...");gameLoopStarted=true;} requestAnimationFrame(drawGame);}}catch(e){console.error("tryStartGame hatası:",e);}}

// Başlat Butonu Fonksiyonu
function startGame() { try { console.log("startGame ÇAĞRILDI!"); checkStartButtonState(); if(startButton.disabled){console.warn("Başlatma engellendi.");gsmError.style.display='block';return;} console.log("Başlatma Kontrolleri Geçildi."); if(startScreenDiv)startScreenDiv.style.display='none'; else console.error("startScreenDiv null!"); if(canvas)canvas.style.display='block'; else console.error("canvas null!"); tryStartGame(); } catch(e){ console.error("startGame Hatası:", e); }}

// Oyun Çizim Döngüsü
function drawGame() { try { if(!ctx) return; ctx.clearRect(0,0,canvas.width,canvas.height); if(bgLoaded)ctx.drawImage(bgImage,0,0,canvas.width,canvas.height); if(logoLoaded){logoX=canvas.width/2-logoWidth/2; const cX=logoX+logoWidth/2; const cY=logoY+logoHeight/2; const r=logoWidth/2; ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(cX,cY,r,0,Math.PI*2); ctx.fill(); ctx.drawImage(logoImage,logoX,logoY,logoWidth,logoHeight);} let cTY=30; ctx.fillStyle='white';ctx.font='bold 16px Arial';ctx.textAlign='left'; ctx.shadowColor='black';ctx.shadowBlur=3;ctx.shadowOffsetX=1;ctx.shadowOffsetY=1; ctx.fillText(`${texts[currentLang]?.attemptsLeft||'Attempts Left'}: ${3-failedAttemptsToday}`,20,cTY); cTY+=25; ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;
    if(gameState==='TUTORIAL'){const iTS=clickableItems[tutorialStep];if(iTS){ctx.strokeStyle=(Math.sin(Date.now()*0.005)>0)?'yellow':'orange';ctx.lineWidth=3;ctx.strokeRect(iTS.x-2,iTS.y-2,iTS.width+4,iTS.height+4); ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,canvas.height-60,canvas.width,60); ctx.fillStyle='white';ctx.font='bold 16px Arial';ctx.textAlign='center'; let iAT=texts[currentLang]?.tutorialItemAction_Default||". Click here when needed."; if(iTS.name==='Tezgahtaki Kedi')iAT=texts[currentLang].tutorialItemAction_Cat;/*...*/ ctx.fillText((texts[currentLang]?.tutorialItemIntro||"This is: ")+iTS.name+iAT,canvas.width/2,canvas.height-35); ctx.font='14px Arial'; ctx.fillText(texts[currentLang]?.tutorialItemPrompt||"Click the highlighted area.",canvas.width/2,canvas.height-15); ctx.textAlign='left';}}
    else if(gameState==='PLAYING'){if(levels[currentLevelIndex]){const d=levels[currentLevelIndex]; ctx.fillStyle='white';ctx.textAlign='left'; ctx.shadowColor='black';ctx.shadowBlur=4;ctx.shadowOffsetX=2;ctx.shadowOffsetY=2; ctx.font='bold 20px Arial'; ctx.fillText(`${texts[currentLang]?.level||'Level'}: ${d.level}`,20,cTY); cTY+=25; if(d.clicks.length>0){ctx.font='18px Arial'; ctx.fillText(`${texts[currentLang]?.order||'Order'}: ${d.recipeName}`,20,cTY); cTY+=25; ctx.font='italic 16px Arial'; ctx.fillText(`${texts[currentLang]?.requirements||'Required'}:`,20,cTY); cTY+=20; const sC=currentShuffledRecipe; for(const i of sC){ctx.fillText(`- ${i}`,30,cTY); cTY+=18;} cTY+=5;ctx.fillStyle='orange'; ctx.font='bold 14px Arial'; ctx.fillText(texts[currentLang]?.mixedOrderWarning||"Note: Prepare in correct order!",20,cTY); cTY+=20; if(d.clicks.includes('Fiyat Listesi')){ctx.fillStyle='lightblue';ctx.fillText(texts[currentLang]?.priceCheckWarning||"Customer asked for price!",20,cTY);cTY+=20;} } ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;} if(feedbackMessage.text&&Date.now()<feedbackMessage.expiryTime){ctx.fillStyle=feedbackMessage.color;ctx.font='bold 28px Arial';ctx.textAlign='center';ctx.shadowColor='black';ctx.shadowBlur=5;ctx.shadowOffsetX=2;ctx.shadowOffsetY=2;ctx.fillText(feedbackMessage.text,canvas.width/2,canvas.height-30); ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;ctx.textAlign='left';}else{feedbackMessage.text='';}}
    else if(gameState==='NO_ATTEMPTS'||gameState==='GAME_OVER'){ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,canvas.height/2-40,canvas.width,80); const title=(gameState==='NO_ATTEMPTS')?texts[currentLang]?.noAttemptsTitle||"No Attempts":texts[currentLang]?.gameOverTitle||"Game Over"; const message=(gameState==='NO_ATTEMPTS')?texts[currentLang]?.noAttemptsMessage||"Try tomorrow":texts[currentLang]?.gameOverMessage||"Well done!"; const titleColor=(gameState==='NO_ATTEMPTS')?'red':'gold'; ctx.fillStyle=titleColor; ctx.font='bold 30px Arial'; ctx.textAlign='center'; ctx.fillText(title,canvas.width/2,canvas.height/2); ctx.fillStyle='white'; ctx.font='18px Arial'; ctx.fillText(message,canvas.width/2,canvas.height/2+30); ctx.textAlign='left';}
    if(gameLoopStarted&&(gameState==='PLAYING'||gameState==='TUTORIAL')){requestAnimationFrame(drawGame);}}catch(e){console.error("Draw HATA:",e);gameLoopStarted=false;}
}

// Tıklama İşleyici Fonksiyon
function handleClick(event) { /* ... Önceki koddan kopyala ... */ }

// --- Başlangıç ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Yüklendi.");
    try {
        // Element referanslarını al
        canvas = document.getElementById('gameCanvas'); ctx = canvas?.getContext('2d');
        startScreenDiv=document.getElementById('startScreen'); gameTitleEl=document.getElementById('gameTitle'); /*...*/ startButton=document.getElementById('startButton'); gsmInput=document.getElementById('gsmInput'); kvkkCheck=document.getElementById('kvkkCheck'); /*...*/ messageOverlay=document.getElementById('messageOverlay'); /*...*/ closeButton=document.getElementById('closeButton');

        if (!canvas || !ctx || !startScreenDiv || !startButton || !gsmInput || !kvkkCheck || !messageOverlay || !closeButton || /*...*/ ) { throw new Error("Gerekli HTML elementleri bulunamadı!"); }

        // Olay Dinleyicilerini Ekle
        langTRButton.addEventListener('click', () => { if(currentLang!=='TR'){currentLang='TR';updateTexts(currentLang, currentRegion);}});
        langENButton.addEventListener('click', () => { if(currentLang!=='EN'){currentLang='EN';updateTexts(currentLang, currentRegion);}});
        regionSelect.addEventListener('change', (event) => { currentRegion=event.target.value; updateTexts(currentLang, currentRegion); });
        startButton.addEventListener('click', startGame);
        gsmInput.addEventListener('input', checkStartButtonState);
        kvkkCheck.addEventListener('change', checkStartButtonState);
        closeButton.addEventListener('click', hideMessage);
        canvas.addEventListener('click', handleClick);

        // Başlangıç Ayarları
        currentLang = localStorage.getItem('barista_lang') || 'TR'; currentRegion = localStorage.getItem('barista_region') || 'TR'; regionSelect.value = currentRegion; langTRButton.classList.toggle('active', currentLang === 'TR'); langENButton.classList.toggle('active', currentLang === 'EN');
        loadGameData(); updateTexts(currentLang, currentRegion); checkStartButtonState();

        // Görsel yüklemelerini başlat
        console.log("Görseller yükleniyor..."); bgImage.src = 'original.gif'; logoImage.src = 'Starbucks_Corporation.png';

    } catch (error) { console.error("DOMContentLoaded içinde KRİTİK HATA:", error); alert("Sayfa yüklenirken önemli bir hata oluştu!"); }
});

// Hata logları
bgImage.onerror = () => { console.error("BG Yüklenemedi!"); bgLoaded = true; checkAssetsLoaded(); }
logoImage.onerror = () => { console.error("Logo Yüklenemedi!"); logoLoaded = true; checkAssetsLoaded(); }

console.log("script.js dosyası okundu.");
