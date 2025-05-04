// --- Global Değişken Tanımları (SENİN KODUNDAN) ---
let canvas, ctx;
// Giriş ekranı elementleri BU KODDA YOK (Senin temel kodunda yoktu)
// let startScreenDiv, gameTitleEl, ... startButton, gsmInput, kvkkCheck, ...;
let messageOverlay, messageTitle, messageBody, closeButton; // Bunlar mesaj için lazım
const bgImage = new Image(); const logoImage = new Image();
let bgLoaded = false, logoLoaded = false;
let gameState = 'LOADING';
let tutorialStep = 0; let isTutorialComplete = false;
let currentLevelIndex = 0; let currentRecipeStep = 0; let canPlay = true; // Hak kontrolü loadGameData ile yapılacak
let gameLoopStarted = false; let currentShuffledRecipe = [];
let currentLang = 'TR'; let currentRegion = 'TR'; // Dil/Bölge değişkenleri kalsın, manuel değiştirilebilir
let failedAttemptsToday = 0; let lastPlayDate = '';
let feedbackMessage = { text: '', color: 'red', expiryTime: 0 };
const logoWidth = 80; const logoHeight = 80; let logoX = 0; const logoY = 20;
// Fare X-Y takibi KALDIRILDI
// let mouseX = 0; let mouseY = 0;

// --- Sabit Veriler ---
// texts objesi TAMAMEN YENİLENDİ (İngilizce + Öğe isimleri dahil)
const texts = {
    TR: {
        level: "Seviye", order: "Sipariş", requirements: "Gerekenler", attemptsLeft: "Kalan Hata Hakkı",
        errorTitle: "Hata!", errorMessage: "Yanlış malzeme veya sıra! Baştan başla.",
        winTitle: "Tebrikler!", winMessagePart1: "Seviye ",
        winMessagePart2_App: " **{REWARD}** değerinde Starbucks Mobil Uygulaması ödülü kazandın!",
        winMessagePart2_USDT: " **NAKİT ÖDÜL (500 USDT)** kazandın!",
        winMessageEmailPrompt: "Ödülünü almak için aşağıdaki linke tıklayarak veya manuel olarak",
        winMessageEmailAddress: "giveaways@kyrosil.eu",
        winMessageEmailSubjectBase: "Kyrosil Starbucks Oyun Ödülü - Seviye ",
        winMessageEmailBodyBase_App: "Merhaba,\n\nSeviye {LEVEL} Starbucks Mobil Uygulaması ödülünü ({REWARD}) kazandım.\nUygulama kodumu bekliyorum.\n\nEkran görüntüm ektedir.\n\nTeşekkürler.",
        winMessageEmailBodyBase_USDT: "Merhaba,\n\nSeviye 10 Büyük Ödülünü (500 USDT) kazandım.\nÖdül gönderimi için detayları bekliyorum.\n\nEkran görüntüm ektedir.\n\nTeşekkürler.",
        winMessageEmailInstructions: "adresine bu ekranın görüntüsüyle birlikte mail atabilirsin.",
        gameOverTitle: "Oyun Bitti!", gameOverMessage: "Tüm seviyeleri tamamladın! Harikasın!",
        noAttemptsTitle: "Hakların Bitti!", noAttemptsMessage: "Bugünkü 3 hata yapma hakkını doldurdun. Yarın tekrar oynamak için geri gel!",
        closeButton: "Tamam",
        // Öğretici Metinleri
        tutorialIntro: "Oyuna Hoş Geldin! İşte Tıklama Alanları:", tutorialItemIntro: "Bu: ", tutorialItemAction_Default: ". Tarifte adı geçince buraya tıklayacaksın.",
        tutorialItemAction_Cat: ". Önemli bir mola!", tutorialItemAction_Register: ". Siparişi bitirmek için.", tutorialItemAction_OrderSlip: ". Siparişi almak için.", tutorialItemAction_PriceList: ". Fiyatları görmek için.", tutorialItemAction_Fridge: ". Soğuk malzemeler burada.", tutorialItemAction_Dessert: ". Tatlılar burada.",
        tutorialItemPrompt: "Devam etmek için vurgulanan alana tıkla.", tutorialComplete: "Harika! Başlıyoruz!", tutorialOutOfAttempts: "Hakların bittiği için bugünlük bu kadar!",
        mixedOrderWarning: "Not: Malzemeler karışık, doğru sırada hazırla!", priceCheckWarning: "Müşteri fiyatı da sordu!",
        rewardTypeApp: "(Starbucks App Kodu)", rewardTypeCash: "(NAKİT ÖDÜL!)",
        // Öğe İsimleri (TR)
        itemEspressoMachine: "Espresso Makinesi", itemGreenBottle: "Yeşil Şişe", itemSyrupPump: "Şurup Pompası", itemMilkCarton: "Süt Kutusu", itemCupArea: "Bardak Alanı", itemCatOnCounter: "Tezgahtaki Kedi", itemCashRegister: "Kasa", itemOrderSlip: "Sipariş Fişi", itemFridge: "Buzdolabı", itemDessertDisplay: "Tatlı Dolabı", itemPriceList: "Fiyat Listesi"
    },
    EN: { // İNGİLİZCE ÇEVİRİLER TAMAMLANDI
        level: "Level", order: "Order", requirements: "Required", attemptsLeft: "Attempts Left",
        errorTitle: "Error!", errorMessage: "Wrong item or sequence! Start over.",
        winTitle: "Congratulations!", winMessagePart1: "You won the Level ",
        winMessagePart2_App: " Starbucks Mobile App reward ({REWARD})!", winMessagePart2_USDT: " CASH PRIZE (500 USDT)!",
        winMessageEmailPrompt: "To claim your reward, click the link below or manually email", winMessageEmailAddress: "giveaways@kyrosil.eu", winMessageEmailSubjectBase: "Kyrosil Starbucks Game Reward - Level ",
        winMessageEmailBodyBase_App: "Hello,\n\nI won the Level {LEVEL} Starbucks Mobile App reward ({REWARD}).\nI'm waiting for my app code.\nMy screenshot is attached.\n\nThanks.",
        winMessageEmailBodyBase_USDT: "Hello,\n\nI won the Level 10 Grand Prize (500 USDT).\nI await details for the prize transfer.\nMy screenshot is attached.\n\nThanks.",
        winMessageEmailInstructions: "with a screenshot.",
        gameOverTitle: "Game Over!", gameOverMessage: "You completed all levels! Awesome!",
        noAttemptsTitle: "No Attempts Left!", noAttemptsMessage: "You've used your 3 attempts for today. Come back tomorrow!", closeButton: "OK",
        tutorialIntro: "Welcome! Let's show you the interaction areas:", tutorialItemIntro: "This is the: ", tutorialItemAction_Default: ". Click here when it's in the recipe.",
        tutorialItemAction_Cat: ". An important break!", tutorialItemAction_Register: ". To finish the order.", tutorialItemAction_OrderSlip: ". To get the order.", tutorialItemAction_PriceList: ". To check prices.", tutorialItemAction_Fridge: ". Cold items are here.", tutorialItemAction_Dessert: ". Desserts are here.",
        tutorialItemPrompt: "Click the highlighted area to continue.", tutorialComplete: "Great! Let's begin!", tutorialOutOfAttempts: "You are out of attempts for today!",
        mixedOrderWarning: "Note: Ingredients listed randomly, prepare in correct order!", priceCheckWarning: "Customer asked for the price!",
        rewardTypeApp: "(Starbucks App Code)", rewardTypeCash: "(CASH PRIZE!)",
        // Öğe İsimleri (EN)
        itemEspressoMachine: "Espresso Machine", itemGreenBottle: "Green Bottle", itemSyrupPump: "Syrup Pump", itemMilkCarton: "Milk Carton", itemCupArea: "Cup Area", itemCatOnCounter: "Cat on Counter", itemCashRegister: "Cash Register", itemOrderSlip: "Order Slip", itemFridge: "Fridge", itemDessertDisplay: "Dessert Display", itemPriceList: "Price List"
     }
};
const rewardTiers = { TR:{2:"200 TL",4:"600 TL",6:"2.000 TL",8:"5.000 TL",10:"500 USDT"}, EU:{2:"5 USD",4:"15 USD",6:"40 USD",8:"100 USD",10:"500 USDT"} };
// Tıklanabilir Alanlar (GÜNCELLENDİ - name yerine nameKey)
const clickableItems = [{nameKey:'itemEspressoMachine',x:605,y:300,width:50,height:60},{nameKey:'itemGreenBottle',x:300,y:245,width:30,height:55},{nameKey:'itemSyrupPump',x:340,y:245,width:30,height:55},{nameKey:'itemMilkCarton',x:390,y:245,width:30,height:55},{nameKey:'itemCupArea',x:330,y:357,width:50,height:50},{nameKey:'itemCatOnCounter',x:442,y:352,width:70,height:40},{nameKey:'itemCashRegister',x:700,y:300,width:60,height:60},{nameKey:'itemOrderSlip',x:780,y:240,width:15,height:30},{nameKey:'itemFridge',x:445,y:305,width:70,height:40},{nameKey:'itemDessertDisplay',x:700,y:450,width:80,height:60},{nameKey:'itemPriceList',x:500,y:80,width:100,height:200}];
// Seviye Tarifleri (GÜNCELLENDİ - clicks içinde nameKey kullanıldı)
const levels = [{level:1,recipeName:"İlk Sipariş (Espresso)",clicks:['itemOrderSlip','itemEspressoMachine']},{level:2,recipeName:"Caffè Latte (Fiyatlı)",clicks:['itemEspressoMachine','itemMilkCarton','itemPriceList']},{level:3,recipeName:"Vanilya Şur. Soğuk Kahve",clicks:['itemCupArea','itemFridge','itemEspressoMachine','itemSyrupPump']},{level:4,recipeName:"Kedi Molası & Yeşil Çay",clicks:['itemCatOnCounter','itemGreenBottle','itemCupArea']},{level:5,recipeName:"Yoğun Talep",clicks:['itemOrderSlip','itemEspressoMachine','itemMilkCarton','itemEspressoMachine']},{level:6,recipeName:"Hesaplı Şuruplu Latte",clicks:['itemCupArea','itemEspressoMachine','itemSyrupPump','itemMilkCarton','itemPriceList','itemCashRegister']},{level:7,recipeName:"Yeşil & Vanilya & Buz",clicks:['itemGreenBottle','itemSyrupPump','itemFridge','itemCupArea']},{level:8,recipeName:"Tam Menü (Basit)",clicks:['itemOrderSlip','itemCupArea','itemEspressoMachine','itemMilkCarton','itemDessertDisplay','itemCashRegister']},{level:9,recipeName:"Pati Deluxe Özel",clicks:['itemCupArea','itemFridge','itemGreenBottle','itemSyrupPump','itemEspressoMachine','itemCatOnCounter','itemCashRegister']},{level:10,recipeName:"USTALIK ESERİ!",clicks:['itemOrderSlip','itemPriceList','itemCupArea','itemFridge','itemGreenBottle','itemSyrupPump','itemEspressoMachine','itemMilkCarton','itemDessertDisplay','itemCatOnCounter','itemCashRegister']},{level:11,recipeName:"OYUN BİTTİ!",clicks:[]}];

// --- Yardımcı Fonksiyon Tanımları ---
function loadGameData(){try{const today=new Date().toISOString().split('T')[0];lastPlayDate=localStorage.getItem('barista_lastPlayDate')||today;failedAttemptsToday=parseInt(localStorage.getItem('barista_failedAttempts')||'0',10);if(lastPlayDate!==today){console.log("Yeni gün!");failedAttemptsToday=0;lastPlayDate=today;saveGameData();} if(failedAttemptsToday>=3){canPlay=false;console.warn("Hak bitti (loadGameData).");}else{canPlay=true;} console.log(`BG Hata Hakkı: ${3-failedAttemptsToday}/3`);}catch(e){console.error("loadGameData Hatası:",e);canPlay=true;}}
function saveGameData(){try{localStorage.setItem('barista_lastPlayDate',lastPlayDate);localStorage.setItem('barista_failedAttempts',failedAttemptsToday.toString());}catch(e){console.error("saveGameData Hatası:",e);}}
function getRewardForLevel(level, region) { return rewardTiers[region]?.[level] || null; }
function showMessage(title, bodyHtml, type='info'){ try{ console.log(`showMessage Çağrıldı: Tip=${type}, Başlık=${title}`); if(!messageOverlay||!messageTitle||!messageBody) {console.error("Mesaj elementleri bulunamadı!"); return;} messageTitle.innerText=title; messageBody.innerHTML=bodyHtml; messageOverlay.className=`overlay message-${type}`; messageOverlay.style.display='flex'; console.log("Mesaj gösterildi, canPlay=false yapılıyor."); canPlay=false; } catch(e) { console.error("showMessage Hatası:", e); }}
function hideMessage(){ try{ if(!messageOverlay) {console.error("Mesaj overlay elementi bulunamadı!"); return;} messageOverlay.style.display='none'; // Mesajı gizle
    // Oyun durumuna göre canPlay'i ayarla
    if(failedAttemptsToday<3 && currentLevelIndex<levels.length-1 && gameState==='PLAYING'){ canPlay=true; console.log("Mesaj kapatıldı, canPlay=true.");}
    else { console.log("Mesaj kapatıldı, canPlay false."); canPlay = false; }
    // Eğer oyun bitmişse veya hak yoksa, belki giriş ekranına dönmeli? Şimdilik sadece canPlay=false kalıyor.
    } catch(e) { console.error("hideMessage Hatası:", e); }}
function shuffleArray(array){ if (!array || array.length === 0) return []; let ci=array.length,ri;const na=array.slice();while(ci!==0){ri=Math.floor(Math.random()*ci);ci--;[na[ci],na[ri]]=[na[ri],na[ci]];} return na; }
// updateTexts, checkStartButtonState GİBİ GİRİŞ EKRANI FONKSİYONLARI BU VERSİYONDA YOK!

// Oyunu Başlatma Tetikleyicisi (SADECE görseller yüklenince çağrılır - Kullanıcının Kodundaki Gibi)
function tryStartGame() {
    if (gameState !== 'LOADING') { console.warn("tryStartGame çağrıldı ama oyun zaten başlamış:", gameState); return; } // Sadece yüklenirken başlar
    try { console.log("tryStartGame çağrılıyor (onload sonrası).");
        loadGameData(); // Hakları kontrol et
        if (!canPlay) { gameState = 'NO_ATTEMPTS'; } // Hak yoksa durum ayarla
        else { gameState = 'TUTORIAL'; tutorialStep = 0; isTutorialComplete = false; } // Hak varsa öğreticiyi ayarla

        currentLevelIndex = 0; currentRecipeStep = 0; // Her başlangıçta sıfırla
        if (levels[currentLevelIndex]?.clicks.length > 0) { currentShuffledRecipe = shuffleArray(levels[currentLevelIndex].clicks); } else { currentShuffledRecipe = []; }
        console.log("Oyun durumu ayarlandı:", gameState, ". Döngü başlatılıyor...");
        if (!gameLoopStarted) { gameLoopStarted = true; requestAnimationFrame(drawGame); } // Döngüyü başlat
    } catch(e){ console.error("tryStartGame hatası:",e); gameLoopStarted = false; }
}

// Başlat Butonu Fonksiyonu YOK (Kullanıcının temel kodunda yoktu)
// function startGame() { ... }

// --- Ana Oyun Çizim Döngüsü ---
function drawGame() {
    try { if (!ctx) { return; } ctx.clearRect(0, 0, canvas.width, canvas.height);
        // ARKA PLAN
        if (bgLoaded && bgImage.complete && bgImage.naturalWidth > 0) { ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height); }
        else { ctx.fillStyle='#BBB';ctx.fillRect(0,0,canvas.width,canvas.height); ctx.fillStyle='red';ctx.font='20px Arial';ctx.textAlign='center'; ctx.fillText("ARKA PLAN YÜKLENEMEDİ!", canvas.width / 2, canvas.height / 2); ctx.textAlign='left'; return; }
        // LOGO
        if (logoLoaded && logoImage.complete && logoImage.naturalWidth > 0) { logoX=canvas.width/2-logoWidth/2; const cX=logoX+logoWidth/2; const cY=logoY+logoHeight/2; const r=logoWidth/2; ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(cX,cY,r,0,Math.PI*2); ctx.fill(); ctx.drawImage(logoImage,logoX,logoY,logoWidth,logoHeight); }

        // Oyun İçi Diğer Çizimler
        let cTY=30; const langText = texts[currentLang] || texts['TR']; // Dil objesi var mı kontrol et
        ctx.fillStyle='white';ctx.font='bold 16px Arial';ctx.textAlign='left'; ctx.shadowColor='black';ctx.shadowBlur=3;ctx.shadowOffsetX=1;ctx.shadowOffsetY=1; ctx.fillText(`${langText.attemptsLeft}: ${3-failedAttemptsToday}`,20,cTY); cTY+=25; ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;

        if (gameState === 'TUTORIAL') { const iTS=clickableItems[tutorialStep]; if(iTS){ const itemName = langText[iTS.nameKey] || iTS.nameKey; ctx.strokeStyle=(Math.sin(Date.now()*0.005)>0)?'yellow':'orange';ctx.lineWidth=3;ctx.strokeRect(iTS.x-2,iTS.y-2,iTS.width+4,iTS.height+4); ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,canvas.height-60,canvas.width,60); ctx.fillStyle='white';ctx.font='bold 16px Arial';ctx.textAlign='center'; let iAT=langText.tutorialItemAction_Default; if(iTS.nameKey==='itemCatOnCounter')iAT=langText.tutorialItemAction_Cat; else if(iTS.nameKey==='itemCashRegister')iAT=langText.tutorialItemAction_Register; else if(iTS.nameKey==='itemOrderSlip')iAT=langText.tutorialItemAction_OrderSlip; else if(iTS.nameKey==='itemPriceList')iAT=langText.tutorialItemAction_PriceList; else if(iTS.nameKey==='itemFridge')iAT=langText.tutorialItemAction_Fridge; else if(iTS.nameKey==='itemDessertDisplay')iAT=langText.tutorialItemAction_Dessert; ctx.fillText(langText.tutorialItemIntro+itemName+iAT,canvas.width/2,canvas.height-35); ctx.font='14px Arial'; ctx.fillText(langText.tutorialItemPrompt,canvas.width/2,canvas.height-15); ctx.textAlign='left';} else {console.warn("Öğretici adımı geçersiz:", tutorialStep); gameState='PLAYING'; if(levels[currentLevelIndex]?.clicks.length>0){currentShuffledRecipe=shuffleArray(levels[currentLevelIndex].clicks);}else{currentShuffledRecipe=[];}}}
        else if (gameState === 'PLAYING') { if(levels[currentLevelIndex]){ const d=levels[currentLevelIndex]; ctx.fillStyle = 'white'; ctx.textAlign = 'left'; ctx.shadowColor = 'black'; ctx.shadowBlur = 4; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; ctx.font='bold 20px Arial'; ctx.fillText(`${langText.level}: ${d.level}`,20,cTY); cTY+=25; if(d.clicks.length>0){ctx.font='18px Arial'; ctx.fillText(`${langText.order}: ${d.recipeName}`,20,cTY); cTY+=25; ctx.font='italic 16px Arial'; ctx.fillText(`${langText.requirements}:`,20,cTY); cTY+=20; const sC=currentShuffledRecipe; for(const itemKey of sC){const itemName = langText[itemKey] || itemKey; ctx.fillText(`- ${itemName}`, 30, cTY); cTY+=18;} cTY+=5;ctx.fillStyle = 'orange'; ctx.font = 'bold 14px Arial'; ctx.fillText(langText.mixedOrderWarning,20,cTY); cTY+=20; if(d.clicks.includes('itemPriceList')){ctx.fillStyle = 'lightblue';ctx.fillText(langText.priceCheckWarning,20,cTY);cTY+=20;} } ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;} else { console.warn("Geçerli seviye yok:", currentLevelIndex); } if(feedbackMessage.text&&Date.now()<feedbackMessage.expiryTime){ctx.fillStyle=feedbackMessage.color;ctx.font='bold 28px Arial';ctx.textAlign='center';ctx.shadowColor='black';ctx.shadowBlur=5;ctx.shadowOffsetX=2;ctx.shadowOffsetY=2;ctx.fillText(feedbackMessage.text,canvas.width/2,canvas.height-30); ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;ctx.textAlign='left';}else{feedbackMessage.text='';}}
        else if (gameState === 'NO_ATTEMPTS' || gameState === 'GAME_OVER') {
            // Bu durumlar showMessage ile HTML'de gösterildiği için burada çizime gerek yok.
             console.log("Oyun Bitti veya Hak Kalmadı durumu çiziliyor (aslında showMessage gösteriyor).");
             gameLoopStarted = false; // Döngüyü durdur
             return; // Çizime devam etme
        }

        // Döngü
        if (gameLoopStarted) { requestAnimationFrame(drawGame); } // Durum kontrolünü kaldırdık, state değişince duracak
        else { console.log("Oyun döngüsü durdu. State:", gameState); }

    } catch (e) { console.error("Draw HATA:", e); gameLoopStarted = false; }
}

// Tıklama İşleyici Fonksiyon (GÜNCELLENDİ - nameKey ve touch + Çeviri)
function processClickOrTouch(clickX, clickY) {
    try{ if (messageOverlay?.style.display === 'flex') return; if (!canvas) return;
        console.log(`processClickOrTouch - State: ${gameState}, Click: ${clickX},${clickY}`);

        if (gameState === 'TUTORIAL') { const iTC=clickableItems[tutorialStep];if(iTC&&clickX>=iTC.x&&clickX<=iTC.x+iTC.width&&clickY>=iTC.y&&clickY<=iTC.y+iTC.height){console.log(`Öğretici: ${iTC.nameKey} tıklandı.`);tutorialStep++;if(tutorialStep>=clickableItems.length){console.log("Öğretici bitti!");isTutorialComplete=true;gameState='PLAYING';currentLevelIndex=0;currentRecipeStep=0;canPlay=true;if(levels[currentLevelIndex]?.clicks.length>0){currentShuffledRecipe=shuffleArray(levels[currentLevelIndex].clicks);}else{currentShuffledRecipe=[];}console.log("Oyun durum PLAYING olarak ayarlandı.");}else{console.log("Öğretici: Sonraki adıma geçiliyor.");}}else{console.log("Öğretici: Vurgulanan alan dışına tıklandı.");} }
        else if (gameState === 'PLAYING') { if (!canPlay || currentLevelIndex >= levels.length - 1) return; let clickedItemKey=null; for(const item of clickableItems){if(clickX>=item.x&&clickX<=item.x+item.width&&clickY>=item.y&&clickY<=item.y+item.height){clickedItemKey=item.nameKey;break;}} if(clickedItemKey){console.log(`Oyun: Tıklandı: ${clickedItemKey}`);const cLD=levels[currentLevelIndex]; const langText = texts[currentLang] || texts['TR']; const expectedClickKey=cLD.clicks[currentRecipeStep];if(clickedItemKey===expectedClickKey){console.log("Oyun: Doğru adım!");currentRecipeStep++;feedbackMessage={text:'Doğru!',color:'lime',expiryTime:Date.now()+1000}; if(currentRecipeStep>=cLD.clicks.length){const cL=cLD.level;console.log(`--- Seviye ${cL} Bitti! ---`);const rAS=getRewardForLevel(cL,currentRegion);currentLevelIndex++;currentRecipeStep=0;if(levels[currentLevelIndex]?.clicks.length > 0){currentShuffledRecipe=shuffleArray(levels[currentLevelIndex].clicks);}else{currentShuffledRecipe=[];} if(rAS){console.warn(`%cÖDÜL! Seviye ${cL} (${rAS})`,'color:green;font-weight:bold;');const iL10=cL===10;const winMsgPart2=iL10?langText.winMessagePart2_USDT:langText.winMessagePart2_App.replace('{REWARD}',rAS);const mBB=iL10?langText.winMessageEmailBodyBase_USDT:langText.winMessageEmailBodyBase_App;const mB=encodeURIComponent(mBB.replace('{LEVEL}',cL).replace('{REWARD}',rAS));const mS=encodeURIComponent(`${langText.winMessageEmailSubjectBase}${cL}${iL10?' - NAKIT ODUL':''}`);const mTL=`mailto:${langText.winMessageEmailAddress}?subject=${mS}&body=${mB}`;const wH=`<p>${langText.winMessagePart1}${cL}${winMsgPart2}</p><hr><p>${langText.winMessageEmailPrompt}<br><a href="${mTL}" target="_blank"><b>${langText.winMessageEmailAddress}</b></a><br>${langText.winMessageEmailInstructions}</p>`;showMessage(langText.winTitle,wH,'win');} const nLD=levels[currentLevelIndex];if(!nLD||nLD.clicks.length===0){console.log("OYUN TAMAMLANDI!");gameState='GAME_OVER';showMessage(langText.gameOverTitle,langText.gameOverMessage,'info');}}}else{console.log("Oyun: Yanlış! Baştan başla.");currentRecipeStep=0;failedAttemptsToday++;saveGameData();console.log(`Kalan hak: ${3-failedAttemptsToday}/3`);feedbackMessage={text:langText.errorMessage,color:'red',expiryTime:Date.now()+2500};if(failedAttemptsToday>=3){canPlay=false;console.error("Hak bitti!");gameState='NO_ATTEMPTS';setTimeout(()=>{if(!canPlay){showMessage(langText.noAttemptsTitle,langText.noAttemptsMessage,'error');}},500);}}}else{console.log("Oyun: Boş alan tıklandı.");}}
    }catch(e){console.error("handleClick Hatası:",e);}
}

// Dokunma İşleyici Fonksiyon (YENİ)
function handleTouchStart(event) {
    try { event.preventDefault(); if (event.touches.length > 0) { const touch = event.touches[0]; const rect = canvas.getBoundingClientRect(); const touchX = touch.clientX - rect.left; const touchY = touch.clientY - rect.top; console.log(">>> Touch Event Algılandı! <<<"); processClickOrTouch(touchX, touchY); } } catch (e) { console.error("handleTouchStart Hatası:", e); }
}

// --- GÖRSEL YÜKLEME OLAYLARI (Kullanıcının İstediği Gibi - tryStartGame Çağırır) ---
bgImage.onload = function() { console.log(">>> BG Yüklendi (PNG) <<<"); bgLoaded = true; if (logoLoaded) tryStartGame(); };
logoImage.onload = function() { console.log(">>> Logo Yüklendi <<<"); logoLoaded = true; if (bgLoaded) tryStartGame(); };
bgImage.onerror = () => { console.error("!!! Arka Plan YÜKLENEMEDİ!"); bgLoaded = false; /* Oyun başlamaz */ }
logoImage.onerror = () => { console.error("!!! Logo YÜKLENEMEDİ!"); logoLoaded = false; /* Oyun başlamaz */ }

// --- Başlangıç Kodu (DOMContentLoaded - GİRİŞ EKRANI YOK) ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Yüklendi.");
    try {
        // Element Referansları (Sadece Canvas ve Mesaj Kutusu)
        canvas = document.getElementById('gameCanvas'); ctx = canvas?.getContext('2d');
        messageOverlay=document.getElementById('messageOverlay'); messageTitle=document.getElementById('messageTitle'); messageBody=document.getElementById('messageBody'); closeButton=document.getElementById('closeButton');
        if (!canvas||!ctx||!messageOverlay||!closeButton) { throw new Error("Kritik HTML elementleri bulunamadı (canvas, messageOverlay, closeButton)!"); }
        console.log("Temel element referansları alındı.");

        // Olay Dinleyicileri (Sadece Canvas ve Mesaj Kapatma)
        closeButton.addEventListener('click', hideMessage);
        canvas.addEventListener('click', (event) => { processClickOrTouch(event.offsetX, event.offsetY); }); // Click için
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false }); // Touch için
        console.log("Temel olay dinleyicileri eklendi.");

        // Canvas'ı GÖRÜNÜR YAP (Başlangıç ekranı olmadığı için)
        canvas.style.display = 'block';
        console.log("Canvas görünür yapıldı.");

        // Dil/Bölge varsayılan kalsın (Seçim ekranı yok)
        loadGameData(); // Hakları kontrol et
        console.log("Başlangıç ayarları yapıldı (minimal).");

        // Görsel yüklemelerini başlat -> Bunlar bitince tryStartGame çağrılacak
        console.log("Görseller yükleniyor (PNG)...");
        bgImage.src = './arka_plan.png'; // <<<--- PNG KULLANILIYOR!
        logoImage.src = 'Starbucks_Corporation.png';

    } catch (error) { console.error("DOMContentLoaded hatası:", error); }
});

console.log("script.js dosyası tamamen okundu.");
