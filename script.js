// --- Global Değişken Tanımları ---
let canvas, ctx;
let startScreenDiv, gameTitleEl, gameSloganEl, langTRButton, langENButton, regionSelect, regionLabelEl, rewardTitleEl, rewardListEl, startButton, gsmInput, kvkkCheck, gsmError, gsmLabel, kvkkLabel;
let messageOverlay, messageTitle, messageBody, closeButton;
const bgImage = new Image(); const logoImage = new Image();
let bgLoaded = false, logoLoaded = false;
let assetsReady = false;
let gameState = 'LOADING';
let tutorialStep = 0; let isTutorialComplete = false;
let currentLevelIndex = 0; let currentRecipeStep = 0; let canPlay = true;
let gameLoopStarted = false; let currentShuffledRecipe = [];
let currentLang = 'TR'; let currentRegion = 'TR';
let failedAttemptsToday = 0; let lastPlayDate = '';
let feedbackMessage = { text: '', color: 'red', expiryTime: 0 };
const logoWidth = 80; const logoHeight = 80; let logoX = 0; const logoY = 20;

// --- Sabit Veriler ---
const texts = {
    TR: {
        gameTitle:"Kyrosil Starbucks Barista", slogan:"En İyi Barista Ol! Siparişleri doğru sırayla hazırla, ödülleri kap!", regionLabel:"Bölge:", rewardTitle:"Seviye Ödülleri", startButton:"Oyuna Başla!", loadingText:"Yükleniyor...",
        level:"Seviye", order:"Sipariş", requirements:"Gerekenler", attemptsLeft:"Kalan Hata Hakkı", errorTitle:"Hata!", errorMessage:"Yanlış malzeme veya sıra! Baştan başla.",
        winTitle:"Tebrikler!", winMessagePart1:"Seviye ", winMessagePart2_App:" **{REWARD}** değerinde Starbucks Mobil Uygulaması ödülü kazandın!", winMessagePart2_USDT:" **NAKİT ÖDÜL (500 USDT)** kazandın!",
        winMessageEmailPrompt:"Ödülünü almak için aşağıdaki linke tıklayarak veya manuel olarak", winMessageEmailAddress:"giveaways@kyrosil.eu", winMessageEmailSubjectBase:"Kyrosil Starbucks Oyun Ödülü - Seviye ",
        winMessageEmailBodyBase_App:"Merhaba,\n\nSeviye {LEVEL} Starbucks Mobil Uygulaması ödülünü ({REWARD}) kazandım.\nUygulama kodumu bekliyorum.\n\nEkran görüntüm ektedir.\n\nTeşekkürler.",
        winMessageEmailBodyBase_USDT:"Merhaba,\n\nSeviye 10 Büyük Ödülünü (500 USDT) kazandım.\nÖdül gönderimi için detayları bekliyorum.\n\nEkran görüntüm ektedir.\n\nTeşekkürler.",
        winMessageEmailInstructions:"adresine bu ekranın görüntüsüyle birlikte mail atabilirsin.",
        gameOverTitle:"Oyun Bitti!", gameOverMessage:"Tüm seviyeleri tamamladın! Harikasın!", noAttemptsTitle:"Hakların Bitti!", noAttemptsMessage:"Bugünkü 3 hata yapma hakkını doldurdun. Yarın tekrar oynamak için geri gel!", closeButton:"Tamam",
        tutorialIntro:"Oyuna Hoş Geldin! İşte Tıklama Alanları:", tutorialItemIntro:"Bu: ", tutorialItemAction_Default:". Tarifte adı geçince buraya tıklayacaksın.", tutorialItemAction_Cat:". Önemli bir mola!", tutorialItemAction_Register:". Siparişi bitirmek için.", tutorialItemAction_OrderSlip:". Siparişi almak için.", tutorialItemAction_PriceList:". Fiyatları görmek için.", tutorialItemAction_Fridge:". Soğuk malzemeler burada.", tutorialItemAction_Dessert:". Tatlılar burada.", tutorialItemPrompt:"Devam etmek için vurgulanan alana tıkla.", tutorialComplete:"Harika! Başlıyoruz!", tutorialOutOfAttempts:"Hakların bittiği için bugünlük bu kadar!",
        mixedOrderWarning:"Not: Malzemeler karışık, doğru sırada hazırla!", priceCheckWarning:"Müşteri fiyatı da sordu!",
        gsmLabel:"Starbucks Mobile Kayıtlı GSM No:", gsmPlaceholder:"Numaranızı Girin", kvkkLabel:" KVKK kapsamında numaramın sadece ödül aktarımı için göstermelik olarak istendiğini anladım, onaylıyorum.", gsmError:"Lütfen numara girip kutuyu işaretleyin.",
        rewardTypeApp:"(Starbucks App Kodu)", rewardTypeCash:"(NAKİT ÖDÜL!)",
        // YENİ: Öğe İsimleri (TR)
        itemEspressoMachine: "Espresso Makinesi", itemGreenBottle: "Yeşil Şişe", itemSyrupPump: "Şurup Pompası", itemMilkCarton: "Süt Kutusu", itemCupArea: "Bardak Alanı", itemCatOnCounter: "Tezgahtaki Kedi", itemCashRegister: "Kasa", itemOrderSlip: "Sipariş Fişi", itemFridge: "Buzdolabı", itemDessertDisplay: "Tatlı Dolabı", itemPriceList: "Fiyat Listesi"
    },
    EN: {
        gameTitle:"Kyrosil Starbucks Barista", slogan:"Be the Best Barista! Prepare orders correctly and grab rewards!", regionLabel:"Region:", rewardTitle:"Level Rewards", startButton:"Start Game!", loadingText:"Loading...",
        level:"Level", order:"Order", requirements:"Required", attemptsLeft:"Attempts Left", errorTitle:"Error!", errorMessage:"Wrong item or sequence! Start over.",
        winTitle:"Congratulations!", winMessagePart1:"You won the Level ", winMessagePart2_App:" Starbucks Mobile App reward ({REWARD})!", winMessagePart2_USDT:" CASH PRIZE (500 USDT)!",
        winMessageEmailPrompt:"To claim your reward, click the link below or manually email", winMessageEmailAddress:"giveaways@kyrosil.eu", winMessageEmailSubjectBase:"Kyrosil Starbucks Game Reward - Level ",
        winMessageEmailBodyBase_App:"Hello,\n\nI won the Level {LEVEL} Starbucks Mobile App reward ({REWARD}).\nI'm waiting for my app code.\nMy screenshot is attached.\n\nThanks.",
        winMessageEmailBodyBase_USDT:"Hello,\n\nI won the Level 10 Grand Prize (500 USDT).\nI await details for the prize transfer.\nMy screenshot is attached.\n\nThanks.",
        winMessageEmailInstructions:"with a screenshot.",
        gameOverTitle:"Game Over!", gameOverMessage:"You completed all levels! Awesome!", noAttemptsTitle:"No Attempts Left!", noAttemptsMessage:"You've used your 3 attempts for today. Come back tomorrow!", closeButton:"OK",
        tutorialIntro:"Welcome! Let's show you the interaction areas:", tutorialItemIntro:"This is the: ", tutorialItemAction_Default:". Click here when it's in the recipe.", tutorialItemAction_Cat:". An important break!", tutorialItemAction_Register:". To finish the order.", tutorialItemAction_OrderSlip:". To get the order.", tutorialItemAction_PriceList:". To check prices.", tutorialItemAction_Fridge:". Cold items are here.", tutorialItemAction_Dessert:". Desserts are here.", tutorialItemPrompt:"Click the highlighted area to continue.", tutorialComplete:"Great! Let's begin!", tutorialOutOfAttempts:"You are out of attempts for today!",
        mixedOrderWarning:"Note: Ingredients listed randomly, prepare in correct order!", priceCheckWarning:"Customer asked for the price!",
        gsmLabel:"Starbucks Mobile Registered GSM No:", gsmPlaceholder:"Enter your phone number", kvkkLabel:" I agree my number is requested symbolically for reward transfer under GDPR & Privacy Policy (Applies to USA users selecting Europe too).", gsmError:"Please enter a number and check the box.",
        rewardTypeApp:"(Starbucks App Code)", rewardTypeCash:"(CASH PRIZE!)",
        // YENİ: Öğe İsimleri (EN)
        itemEspressoMachine: "Espresso Machine", itemGreenBottle: "Green Bottle", itemSyrupPump: "Syrup Pump", itemMilkCarton: "Milk Carton", itemCupArea: "Cup Area", itemCatOnCounter: "Cat on Counter", itemCashRegister: "Cash Register", itemOrderSlip: "Order Slip", itemFridge: "Fridge", itemDessertDisplay: "Dessert Display", itemPriceList: "Price List"
     }
};
const rewardTiers = {TR:{2:"200 TL",4:"600 TL",6:"2.000 TL",8:"5.000 TL",10:"500 USDT"},EU:{2:"5 USD",4:"15 USD",6:"40 USD",8:"100 USD",10:"500 USDT"}};
// --- Tıklanabilir Alanlar (GÜNCELLENDİ - name yerine nameKey) ---
const clickableItems = [
    { nameKey: 'itemEspressoMachine', x: 605, y: 300, width: 50, height: 60 },
    { nameKey: 'itemGreenBottle',     x: 300, y: 245, width: 30, height: 55 },
    { nameKey: 'itemSyrupPump',       x: 340, y: 245, width: 30, height: 55 },
    { nameKey: 'itemMilkCarton',      x: 390, y: 245, width: 30, height: 55 }, // Bu kahverengi şişeydi
    { nameKey: 'itemCupArea',         x: 330, y: 357, width: 50, height: 50 },
    { nameKey: 'itemCatOnCounter',    x: 442, y: 352, width: 70, height: 40 },
    { nameKey: 'itemCashRegister',    x: 700, y: 300, width: 60, height: 60 },
    { nameKey: 'itemOrderSlip',       x: 780, y: 240, width: 15, height: 30 },
    { nameKey: 'itemFridge',          x: 445, y: 305, width: 70, height: 40 },
    { nameKey: 'itemDessertDisplay',  x: 700, y: 450, width: 80, height: 60 },
    { nameKey: 'itemPriceList',       x: 500, y: 80, width: 100, height: 200 }
];
// --- Seviye Tarifleri (GÜNCELLENDİ - clicks içinde nameKey kullanıldı) ---
const levels = [
    { level: 1, recipeName: "Espresso",                 clicks: ['itemOrderSlip', 'itemEspressoMachine'] },
    { level: 2, recipeName: "Caffè Latte (Fiyatlı)",        clicks: ['itemEspressoMachine', 'itemMilkCarton', 'itemPriceList'] },
    { level: 3, recipeName: "Vanilya Şur. Soğuk Kahve",     clicks: ['itemCupArea', 'itemFridge', 'itemEspressoMachine', 'itemSyrupPump'] },
    { level: 4, recipeName: "Kedi Molası & Yeşil Çay",      clicks: ['itemCatOnCounter', 'itemGreenBottle', 'itemCupArea'] },
    { level: 5, recipeName: "Yoğun Talep",                  clicks: ['itemOrderSlip', 'itemEspressoMachine', 'itemMilkCarton', 'itemEspressoMachine'] },
    { level: 6, recipeName: "Hesaplı Şuruplu Latte",        clicks: ['itemCupArea', 'itemEspressoMachine', 'itemSyrupPump', 'itemMilkCarton', 'itemPriceList', 'itemCashRegister'] },
    { level: 7, recipeName: "Yeşil & Vanilya & Buz",        clicks: ['itemGreenBottle', 'itemSyrupPump', 'itemFridge', 'itemCupArea'] },
    { level: 8, recipeName: "Tam Menü (Basit)",             clicks: ['itemOrderSlip', 'itemCupArea', 'itemEspressoMachine', 'itemMilkCarton', 'itemDessertDisplay', 'itemCashRegister'] },
    { level: 9, recipeName: "Pati Deluxe Özel",             clicks: ['itemCupArea', 'itemFridge', 'itemGreenBottle', 'itemSyrupPump', 'itemEspressoMachine', 'itemCatOnCounter', 'itemCashRegister']},
    { level: 10, recipeName: "USTALIK ESERİ!",              clicks: ['itemOrderSlip', 'itemPriceList', 'itemCupArea', 'itemFridge', 'itemGreenBottle', 'itemSyrupPump', 'itemEspressoMachine', 'itemMilkCarton', 'itemDessertDisplay', 'itemCatOnCounter', 'itemCashRegister']},
    { level: 11, recipeName: "OYUN BİTTİ!",                 clicks: [] }
];

// --- Yardımcı Fonksiyon Tanımları ---
function loadGameData(){/*...*/} function saveGameData(){/*...*/} function getRewardForLevel(level, region){/*...*/} function showMessage(title, bodyHtml, type='info'){/*...*/} function hideMessage(){/*...*/} function shuffleArray(array){/*...*/} function updateTexts(lang, region){/*...*/} function checkStartButtonState(){/*...*/} function checkAssetsLoaded(){/*...*/} function tryStartGame(){/*...*/} function startGame(){/*...*/}

// --- Ana Oyun Çizim Döngüsü (GÜNCELLENDİ - İsimler texts'ten alınacak) ---
function drawGame() {
    try { if (!ctx) { return; } ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Arka Plan
        if (bgLoaded && bgImage.complete && bgImage.naturalWidth > 0) { ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height); }
        else { /* Fallback */ }
        // Logo
        if (logoLoaded && logoImage.complete && logoImage.naturalWidth > 0) { /* Draw Logo */ }

        // Diğer Çizimler
        let cTY=30; const langText = texts[currentLang] || texts['TR'];
        /* Kalan Haklar */
        ctx.fillStyle='white';/*...*/ctx.fillText(`${langText.attemptsLeft}: ${3-failedAttemptsToday}`,20,cTY); cTY+=25; /*...*/

        if (gameState === 'TUTORIAL') {
            const itemToShow = clickableItems[tutorialStep];
            if(itemToShow) {
                 // Öğe adını dilden al
                 const itemName = langText[itemToShow.nameKey] || itemToShow.nameKey; // nameKey kullan
                 ctx.strokeStyle=(Math.sin(Date.now()*0.005)>0)?'yellow':'orange';/*...*/ctx.strokeRect(itemToShow.x-2,itemToShow.y-2,itemToShow.width+4,itemToShow.height+4);
                 ctx.fillStyle='rgba(0,0,0,0.7)';/*...*/ctx.fillStyle='white';ctx.font='bold 16px Arial';ctx.textAlign='center';
                 let iAT=langText.tutorialItemAction_Default; /*...*/
                 // Metinde çevrilmiş adı kullan
                 ctx.fillText(langText.tutorialItemIntro + itemName + iAT, canvas.width/2, canvas.height-35);
                 ctx.font='14px Arial'; ctx.fillText(langText.tutorialItemPrompt, canvas.width/2, canvas.height-15); ctx.textAlign='left';
            } else { /*...*/ }
        } else if (gameState === 'PLAYING') {
            if(levels[currentLevelIndex]){
                const d=levels[currentLevelIndex];
                /* Seviye ve Sipariş Adı */
                ctx.fillStyle = 'white'; ctx.textAlign = 'left'; /*...*/
                ctx.font='bold 20px Arial'; ctx.fillText(`${langText.level}: ${d.level}`,20,cTY); cTY+=25;
                if(d.clicks.length>0){
                    ctx.font='18px Arial'; ctx.fillText(`${langText.order}: ${d.recipeName}`,20,cTY); cTY+=25;
                    // Gerekenler Listesi (Karışık ve Çevrilmiş)
                    ctx.font='italic 16px Arial'; ctx.fillText(`${langText.requirements}:`,20,cTY); cTY+=20;
                    const sC=currentShuffledRecipe; // Bu artık nameKey'leri tutuyor
                    for(const itemKey of sC){ // nameKey üzerinden dön
                        const itemName = langText[itemKey] || itemKey; // Çevrilmiş adı al
                        ctx.fillText(`- ${itemName}`, 30, cTY); // Çevrilmiş adı yazdır
                        cTY+=18;
                    }
                    cTY+=5;ctx.fillStyle = 'orange'; ctx.font = 'bold 14px Arial'; ctx.fillText(langText.mixedOrderWarning,20,cTY); cTY+=20;
                    // Fiyat Listesi Uyarısı (clicks artık nameKey içeriyor)
                    if(d.clicks.includes('itemPriceList')){ ctx.fillStyle='lightblue';ctx.fillText(langText.priceCheckWarning,20,cTY);cTY+=20; }
                }
                ctx.shadowColor='transparent';/*...*/
            } else { /*...*/ }
            if(feedbackMessage.text&&Date.now()<feedbackMessage.expiryTime){/*... Feedback çizimi ...*/}else{feedbackMessage.text='';}
        }
        // Döngü
        if (gameLoopStarted && (gameState === 'PLAYING' || gameState === 'TUTORIAL')) { requestAnimationFrame(drawGame); }
        else { console.log("Oyun döngüsü durdu. State:", gameState); gameLoopStarted = false;}
    } catch (e) { console.error("Draw HATA:", e); gameLoopStarted = false; }
}

// Tıklama İşleyici Fonksiyon (GÜNCELLENDİ - nameKey kullanıyor)
function handleClick(event) {
    try{ if (messageOverlay?.style.display === 'flex') return; if (!canvas) return;
        const rect = canvas.getBoundingClientRect(); const clickX = event.offsetX; const clickY = event.offsetY;
        console.log(`handleClick - State: ${gameState}, Click: ${clickX},${clickY}`);

        if (gameState === 'TUTORIAL') {
            const itemToClickData = clickableItems[tutorialStep];
            if (itemToClickData && clickX>=itemToClickData.x && clickX<=itemToClickData.x+itemToClickData.width && clickY>=itemToClickData.y && clickY<=itemToClickData.y+itemToClickData.height){
                 console.log(`Öğretici: ${itemToClickData.nameKey} tıklandı.`); tutorialStep++;
                 if(tutorialStep>=clickableItems.length){
                     console.log("Öğretici bitti!"); isTutorialComplete=true; gameState='PLAYING'; currentLevelIndex=0; currentRecipeStep=0; canPlay=true;
                     if(levels[currentLevelIndex]?.clicks.length>0){ currentShuffledRecipe = shuffleArray(levels[currentLevelIndex].clicks); } else { currentShuffledRecipe = []; }
                     console.log("Oyun durum PLAYING olarak ayarlandı.");
                 } else { console.log("Öğretici: Sonraki adıma geçiliyor."); }
            } else { console.log("Öğretici: Vurgulanan alan dışına tıklandı."); }
        }
        else if (gameState === 'PLAYING') {
            if (!canPlay || currentLevelIndex >= levels.length - 1) return; let clickedItemKey=null; // Artık key tutuyoruz
            for(const item of clickableItems){ if(clickX>=item.x && clickX<=item.x+item.width && clickY>=item.y && clickY<=item.y+item.height){ clickedItemKey=item.nameKey; break; }} // nameKey'i al
            if(clickedItemKey){ console.log(`Oyun: Tıklandı: ${clickedItemKey}`); const currentLevelData=levels[currentLevelIndex]; const expectedClickKey=currentLevelData.clicks[currentRecipeStep]; // Beklenen key
                if(clickedItemKey === expectedClickKey){ // Key'leri karşılaştır
                     console.log("Oyun: Doğru adım!"); currentRecipeStep++; feedbackMessage={text:'Doğru!',color:'lime',expiryTime:Date.now()+1000};
                     if(currentRecipeStep >= currentLevelData.clicks.length){ // Seviye Bitti
                         const cL=currentLevelData.level; console.log(`--- Seviye ${cL} Bitti! ---`); const rAS=getRewardForLevel(cL,currentRegion); currentLevelIndex++; currentRecipeStep=0;
                         if(levels[currentLevelIndex]?.clicks.length > 0){ currentShuffledRecipe = shuffleArray(levels[currentLevelIndex].clicks); } else { currentShuffledRecipe = []; }
                         if(rAS){ /* ... Ödül mesajı ve mailto (Aynı kalabilir) ... */ showMessage(/*...*/); }
                         const nLD=levels[currentLevelIndex]; if(!nLD||nLD.clicks.length===0){ console.log("OYUN TAMAMLANDI!"); gameState='GAME_OVER'; showMessage(texts[currentLang].gameOverTitle,texts[currentLang].gameOverMessage,'info'); }
                     }
                 } else { /* ... Yanlış Tıklama Mantığı (Aynı) ... */ console.log("Oyun: Yanlış! Baştan başla."); currentRecipeStep=0; failedAttemptsToday++; saveGameData(); console.log(`Kalan hak: ${3-failedAttemptsToday}/3`); feedbackMessage={text:texts[currentLang]?.errorMessage||"Wrong!",color:'red',expiryTime:Date.now()+2500}; if(failedAttemptsToday>=3){ canPlay=false; console.error("Hak bitti!"); gameState='NO_ATTEMPTS'; setTimeout(()=>{if(!canPlay){showMessage(texts[currentLang]?.noAttemptsTitle||"Attempts Done",texts[currentLang]?.noAttemptsMessage||"Try tomorrow",'error');}},500);}}
             } else { console.log("Oyun: Boş alan tıklandı."); }
        }
    }catch(e){console.error("handleClick Hatası:",e);}
}


// --- Başlangıç Kodu (DOMContentLoaded) ---
document.addEventListener('DOMContentLoaded', () => { /* ... Önceki koddan kopyala ... */ });

// Hata logları
bgImage.onerror = () => { /*...*/ }
logoImage.onerror = () => { /*...*/ }

console.log("script.js dosyası tamamen okundu.");

// --- Tüm Fonksiyon Tanımları ---
// loadGameData, saveGameData, ..., handleClick (Yukarıda tanımlandı)
