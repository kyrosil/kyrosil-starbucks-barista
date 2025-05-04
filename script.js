// Canvas elementini ve 2D çizim bağlamını alalım
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Görsel nesnelerini oluşturalım
const bgImage = new Image();
const logoImage = new Image();

// Görsellerin yüklenip yüklenmediğini takip edelim
let bgLoaded = false;
let logoLoaded = false;

// Oyun Durumları ('LOADING', 'TUTORIAL', 'PLAYING', 'MESSAGE', 'GAME_OVER', 'NO_ATTEMPTS')
let gameState = 'LOADING';
let tutorialStep = 0; // Öğreticinin hangi adımında olduğumuz
let isTutorialComplete = false; // Öğretici bitti mi?

// Oyun Değişkenleri
let currentLevelIndex = 0;
let currentRecipeStep = 0;
let canPlay = false; // Öğretici veya mesaj bitince true olacak
let gameLoopStarted = false;

// Dil ve Bölge
let currentLang = 'TR';
let currentRegion = 'TR'; // 'TR' veya 'EU'

// Mesajlaşma Elementleri
const messageOverlay = document.getElementById('messageOverlay');
const messageTitle = document.getElementById('messageTitle');
const messageBody = document.getElementById('messageBody');
const closeButton = document.getElementById('closeButton');

// localStorage ve Günlük Hak Takibi
let failedAttemptsToday = 0;
let lastPlayDate = '';

function loadGameData() { /* ... */ const today=new Date().toISOString().split('T')[0];lastPlayDate=localStorage.getItem('barista_lastPlayDate')||today;failedAttemptsToday=parseInt(localStorage.getItem('barista_failedAttempts')||'0',10);if(lastPlayDate!==today){console.log("Yeni gün!");failedAttemptsToday=0;lastPlayDate=today;saveGameData();} if(failedAttemptsToday>=3){canPlay=false;console.warn("Hak bitti.");}else{canPlay=true;} console.log(`Bugünkü hata hakkı: ${3-failedAttemptsToday}/3`); }
function saveGameData() { /* ... */ localStorage.setItem('barista_lastPlayDate',lastPlayDate);localStorage.setItem('barista_failedAttempts',failedAttemptsToday.toString()); }

// Geri Bildirim Mesajı Değişkenleri (Canvas için)
let feedbackMessage = { text: '', color: 'red', expiryTime: 0 };

// Metinler Objesi (GÜNCELLENDİ - Yeni uyarılar eklendi)
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
        tutorialIntro: "Oyuna Hoş Geldin! Önce sana önemli yerleri gösterelim.",
        tutorialItemIntro: "Bu: ", tutorialItemAction_Default:". Tarifte adı geçince buraya tıklayacaksın.",
        tutorialItemAction_Cat:". Bazen mola vermek gerekir! 😉", tutorialItemAction_Register:". Siparişi tamamlamak için buraya.",
        tutorialItemAction_OrderSlip:". Siparişi görmek için buraya.", tutorialItemAction_PriceList:". Fiyatları kontrol etmek için.",
        tutorialItemAction_Fridge: ". Soğuk ürünler için buraya.", // Buzdolabı için
        tutorialItemAction_Dessert: ". Tatlılar için buraya.", // Tatlı dolabı için
        tutorialItemPrompt:"Devam etmek için vurgulanan alana tıkla.", tutorialComplete:"Harika! Başlıyoruz!",
        tutorialOutOfAttempts:"Hakların bittiği için bugünlük bu kadar!",
        // YENİ UYARILAR
        mixedOrderWarning: "Not: Malzemeler karışık listelenmiştir, doğru sırada hazırlayın!",
        priceCheckWarning: "Müşteri fiyatı da sordu!" // Fiyat listesi gerektiğinde
    },
    EN: { /* ... İngilizce metinler de benzer şekilde güncellenmeli ... */ }
};

// Ödül Seviyeleri (Aynı)
const rewardTiers = { TR:{2:"200 TL",4:"600 TL",6:"2.000 TL",8:"5.000 TL",10:"500 USDT"}, EU:{2:"5 USD",4:"15 USD",6:"40 USD",8:"100 USD",10:"500 USDT"} };
function getRewardForLevel(level, region) { return rewardTiers[region]?.[level] || null; }

// Mesaj Gösterme Fonksiyonları (Aynı)
function showMessage(title, bodyHtml, type='info') { /* ... */ console.log(`showMessage: Tip=${type}, Başlık=${title}`); messageTitle.innerText=title; messageBody.innerHTML=bodyHtml; messageOverlay.className=`overlay message-${type}`; messageOverlay.style.display='flex'; canPlay=false; }
function hideMessage() { /* ... */ messageOverlay.style.display='none'; if(failedAttemptsToday<3 && currentLevelIndex<levels.length-1 && gameState==='PLAYING'){canPlay=true;} } // Sadece oyun durumunda canPlay'i true yap
closeButton.addEventListener('click', hideMessage);

// --- Tıklanabilir Alanlar (SON TAHMİNİ KOORDİNATLAR) ---
// Bu koordinatlar hala %100 doğru olmayabilir, gerekirse son ayar yapılır.
const clickableItems = [
    { name: 'Espresso Makinesi', x: 605, y: 300, width: 50, height: 60 }, // OK
    { name: 'Yeşil Şişe',        x: 300, y: 245, width: 30, height: 55 }, // OK (2. yeşil)
    { name: 'Şurup Pompası',     x: 340, y: 245, width: 30, height: 55 }, // OK (3. yeşil)
    { name: 'Süt Kutusu',        x: 390, y: 245, width: 30, height: 55 }, // Kahverengi şişe (OK)
    { name: 'Bardak Alanı',      x: 330, y: 357, width: 50, height: 50 }, // OK (Şurup altı)
    { name: 'Tezgahtaki Kedi',   x: 442, y: 352, width: 70, height: 40 }, // Turuncu Kedi (OK)
    { name: 'Kasa',              x: 700, y: 300, width: 60, height: 60 }, // OK
    { name: 'Sipariş Fişi',      x: 780, y: 240, width: 15, height: 30 }, // OK (Tahmini Boyut)
    { name: 'Buzdolabı',         x: 445, y: 305, width: 70, height: 40 }, // OK (Eski kedi yeri - Tahmini Boyut)
    { name: 'Tatlı Dolabı',      x: 700, y: 450, width: 80, height: 60 }, // OK (Kasa altı - Tahmini Boyut)
    { name: 'Fiyat Listesi',     x: 500, y: 80, width: 100, height: 200 } // OK (Sol menü board - Tahmini Boyut)
];

// --- Seviye Tarifleri (GÜNCELLENDİ - 10 Seviye, Zorluk++, İsimler) ---
const levels = [
    // level: Gerçek Seviye No, recipeName: Görünecek İsim, clicks: Doğru Tıklama Sırası
    { level: 1, recipeName: "İlk Sipariş (Espresso)",       clicks: ['Sipariş Fişi', 'Espresso Makinesi'] }, // Zorluk +1
    { level: 2, recipeName: "Caffè Latte (Fiyatlı)",        clicks: ['Espresso Makinesi', 'Süt Kutusu', 'Fiyat Listesi'] }, // ÖDÜL 1, Zorluk +1
    { level: 3, recipeName: "Vanilya Şur. Soğuk Kahve",     clicks: ['Bardak Alanı', 'Buzdolabı', 'Espresso Makinesi', 'Şurup Pompası'] }, // Zorluk ++
    { level: 4, recipeName: "Kedi Molası & Yeşil Çay",      clicks: ['Tezgahtaki Kedi', 'Yeşil Şişe', 'Bardak Alanı'] }, // ÖDÜL 2
    { level: 5, recipeName: "Yoğun Talep",                  clicks: ['Sipariş Fişi', 'Espresso Makinesi', 'Süt Kutusu', 'Espresso Makinesi'] }, // Tekrar eden öğe
    { level: 6, recipeName: "Hesaplı Şuruplu Latte",        clicks: ['Bardak Alanı', 'Espresso Makinesi', 'Şurup Pompası', 'Süt Kutusu', 'Fiyat Listesi', 'Kasa'] }, // ÖDÜL 3
    { level: 7, recipeName: "Yeşil & Vanilya & Buz",        clicks: ['Yeşil Şişe', 'Şurup Pompası', 'Buzdolabı', 'Bardak Alanı'] },
    { level: 8, recipeName: "Tam Menü (Basit)",             clicks: ['Sipariş Fişi', 'Bardak Alanı', 'Espresso Makinesi', 'Süt Kutusu', 'Tatlı Dolabı', 'Kasa'] }, // ÖDÜL 4
    { level: 9, recipeName: "Pati Deluxe Özel",             clicks: ['Bardak Alanı', 'Buzdolabı', 'Yeşil Şişe', 'Şurup Pompası', 'Espresso Makinesi', 'Tezgahtaki Kedi', 'Kasa']}, // Zor
    { level: 10, recipeName: "USTALIK ESERİ!",              clicks: ['Sipariş Fişi', 'Fiyat Listesi', 'Bardak Alanı', 'Buzdolabı', 'Yeşil Şişe', 'Şurup Pompası', 'Espresso Makinesi', 'Süt Kutusu', 'Tatlı Dolabı', 'Tezgahtaki Kedi', 'Kasa']}, // ÖDÜL 5 (USDT) - Hepsi!
    { level: 11, recipeName: "OYUN BİTTİ!",                 clicks: [] } // Oyun sonu işaretçisi
];
// ---------------------------------


// Görsel yükleme olayları
bgImage.onload = function() { console.log("BG yüklendi"); bgLoaded=true; if(logoLoaded) tryStartGame();};
logoImage.onload = function() { console.log("Logo yüklendi"); logoLoaded=true; if(bgLoaded) tryStartGame();};
bgImage.src = 'original.gif'; logoImage.src = 'Starbucks_Corporation.png';
const logoWidth = 80; const logoHeight = 80; const logoX = canvas.width/2-logoWidth/2; const logoY = 20;

// Oyunu Başlatmayı Deneme Fonksiyonu (Aynı)
function tryStartGame() { /* ... */ if(gameState==='LOADING'){console.log("Görseller yüklendi...");loadGameData();if(!canPlay){gameState='NO_ATTEMPTS';}else{gameState='TUTORIAL';tutorialStep=0;isTutorialComplete=false;} if(!gameLoopStarted){requestAnimationFrame(drawGame);gameLoopStarted=true;}} }

// --- YENİ: Fisher-Yates Shuffle Algoritması --- (Aynı)
function shuffleArray(array){let ci=array.length,ri;const na=array.slice();while(ci!==0){ri=Math.floor(Math.random()*ci);ci--;[na[ci],na[ri]]=[na[ri],na[ci]];} return na;}

// Ana oyun döngüsü fonksiyonu (GÜNCELLENDİ - Gerekenler Listesi + Uyarılar)
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bgLoaded) ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    if (logoLoaded) { /* ... logo ve daire ... */ const cX=logoX+logoWidth/2;const cY=logoY+logoHeight/2;const r=logoWidth/2;ctx.fillStyle='white';ctx.beginPath();ctx.arc(cX,cY,r,0,Math.PI*2);ctx.fill();ctx.drawImage(logoImage,logoX,logoY,logoWidth,logoHeight);}

    let currentTextY = 30; // Sol üst yazıların başlangıç Y'si

    // Sol Üst: Kalan Haklar
    ctx.fillStyle='white';ctx.font='bold 16px Arial';ctx.textAlign='left'; ctx.shadowColor='black';ctx.shadowBlur=3;ctx.shadowOffsetX=1;ctx.shadowOffsetY=1; ctx.fillText(`${texts[currentLang].attemptsLeft}: ${3-failedAttemptsToday}`,20,currentTextY); currentTextY+=25; ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;

    // Fare Koordinat Göstergesi KALDIRILDI
    // ctx.fillStyle = 'yellow'; ...

    // Oyun Durumuna Göre Çizim
    if (gameState === 'TUTORIAL') { /* ... Öğretici çizimi aynı ... */
        const itemToShow=clickableItems[tutorialStep]; if(itemToShow){ ctx.strokeStyle=(Math.sin(Date.now()*0.005)>0)?'yellow':'orange';ctx.lineWidth=3;ctx.strokeRect(itemToShow.x-2,itemToShow.y-2,itemToShow.width+4,itemToShow.height+4); ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,canvas.height-60,canvas.width,60); ctx.fillStyle='white';ctx.font='bold 16px Arial';ctx.textAlign='center'; let iAT=texts[currentLang].tutorialItemAction_Default; if(itemToShow.name==='Tezgahtaki Kedi')iAT=texts[currentLang].tutorialItemAction_Cat; if(itemToShow.name==='Kasa')iAT=texts[currentLang].tutorialItemAction_Register; if(itemToShow.name==='Sipariş Fişi')iAT=texts[currentLang].tutorialItemAction_OrderSlip; if(itemToShow.name==='Fiyat Listesi')iAT=texts[currentLang].tutorialItemAction_PriceList; if(itemToShow.name==='Buzdolabı')iAT=texts[currentLang].tutorialItemAction_Fridge; if(itemToShow.name==='Tatlı Dolabı')iAT=texts[currentLang].tutorialItemAction_Dessert; ctx.fillText(texts[currentLang].tutorialItemIntro+itemToShow.name+iAT,canvas.width/2,canvas.height-35); ctx.font='14px Arial'; ctx.fillText(texts[currentLang].tutorialItemPrompt,canvas.width/2,canvas.height-15); ctx.textAlign='left';}

    } else if (gameState === 'PLAYING') {
        // Sol Üst: Seviye, Sipariş ve KARIŞIK Gerekenler + Uyarılar
        if (levels[currentLevelIndex]) {
            const currentLevelData = levels[currentLevelIndex];
            ctx.fillStyle = 'white'; ctx.textAlign = 'left';
            ctx.shadowColor = 'black'; ctx.shadowBlur = 4; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2;

            // Seviye
            ctx.font = 'bold 20px Arial';
            ctx.fillText(`${texts[currentLang].level}: ${currentLevelData.level}`, 20, currentTextY);
            currentTextY += 25;

            if (currentLevelData.clicks.length > 0) {
                 // Sipariş Adı
                 ctx.font = '18px Arial';
                 ctx.fillText(`${texts[currentLang].order}: ${currentLevelData.recipeName}`, 20, currentTextY);
                 currentTextY += 25;

                 // Gerekenler Listesi (Karışık)
                 ctx.font = 'italic 16px Arial';
                 ctx.fillText(`${texts[currentLang].requirements}:`, 20, currentTextY);
                 currentTextY += 20;
                 const shuffledClicks = shuffleArray(currentLevelData.clicks);
                 for (const item of shuffledClicks) {
                     ctx.fillText(`- ${item}`, 30, currentTextY);
                     currentTextY += 18;
                 }
                 // Karışık Sıra Uyarısı
                 currentTextY += 5;
                 ctx.fillStyle = 'orange'; ctx.font = 'bold 14px Arial';
                 ctx.fillText(texts[currentLang].mixedOrderWarning, 20, currentTextY);
                 currentTextY += 20;

                 // Fiyat Listesi Uyarısı (Eğer gerekiyorsa)
                 if (currentLevelData.clicks.includes('Fiyat Listesi')) {
                     ctx.fillStyle = 'lightblue'; // Farklı renk
                     ctx.fillText(texts[currentLang].priceCheckWarning, 20, currentTextY);
                     currentTextY += 20;
                 }
            }
            ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
        }
         // Geçici Hata/Başarı Mesajı (Canvas'a)
        if (feedbackMessage.text && Date.now() < feedbackMessage.expiryTime) { /*...*/ ctx.fillStyle=feedbackMessage.color;ctx.font='bold 28px Arial';ctx.textAlign='center';ctx.shadowColor='black';ctx.shadowBlur=5;ctx.shadowOffsetX=2;ctx.shadowOffsetY=2;ctx.fillText(feedbackMessage.text,canvas.width/2,canvas.height-30); ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;ctx.textAlign='left';} else { feedbackMessage.text='';}

    } else if (gameState === 'NO_ATTEMPTS' || gameState === 'GAME_OVER') {
        // Hak Bitti veya Oyun Bitti Mesajları (Canvas'a)
         /* ... */ ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,canvas.height/2-40,canvas.width,80); const title=(gameState==='NO_ATTEMPTS')?texts[currentLang].noAttemptsTitle:texts[currentLang].gameOverTitle; const message=(gameState==='NO_ATTEMPTS')?texts[currentLang].noAttemptsMessage:texts[currentLang].gameOverMessage; const titleColor=(gameState==='NO_ATTEMPTS')?'red':'gold'; ctx.fillStyle=titleColor; ctx.font='bold 30px Arial'; ctx.textAlign='center'; ctx.fillText(title,canvas.width/2,canvas.height/2); ctx.fillStyle='white'; ctx.font='18px Arial'; ctx.fillText(message,canvas.width/2,canvas.height/2+30); ctx.textAlign='left';
    }

    // DEBUG KUTULARI KALDIRILDI
    // requestAnimationFrame(drawGame); // Bu satır döngü içinde olmalı

     // Döngüyü devam ettir (Eğer oyun durumu devam etmeyi gerektiriyorsa)
     // ÖNEMLİ DÜZELTME: requestAnimationFrame çağrısı drawGame fonksiyonunun SONUNDA olmalı
     if (gameLoopStarted && (gameState === 'PLAYING' || gameState === 'TUTORIAL')) {
          requestAnimationFrame(drawGame);
     }
}


// Tıklama İşleyici Fonksiyon (Aynı)
function handleClick(event) { /* ... Önceki mesajdaki tam kod ... */
    const rect=canvas.getBoundingClientRect();const clickX=event.clientX-rect.left;const clickY=event.clientY-rect.top;
    if(gameState==='TUTORIAL'){const itemToClick=clickableItems[tutorialStep];if(itemToClick&&clickX>=itemToClick.x&&clickX<=itemToClick.x+itemToClick.width&&clickY>=itemToClick.y&&clickY<=itemToClick.y+itemToClick.height){console.log(`Öğretici: ${itemToClick.name} tıklandı.`);tutorialStep++;if(tutorialStep>=clickableItems.length){console.log("Öğretici bitti!");isTutorialComplete=true;gameState='PLAYING';currentLevelIndex=0;currentRecipeStep=0;canPlay=true;if(gameLoopStarted)requestAnimationFrame(drawGame); /* Döngüyü tekrar başlat */} else { requestAnimationFrame(drawGame); /* Sonraki öğretici adımını çiz */ }}else{console.log("Öğretici: Yanlış yere tıklandı.");}}
    else if(gameState==='PLAYING'){if(!canPlay||currentLevelIndex>=levels.length-1)return;let clickedItemName=null;for(const item of clickableItems){if(clickX>=item.x&&clickX<=item.x+item.width&&clickY>=item.y&&clickY<=item.y+item.height){clickedItemName=item.name;break;}} if(clickedItemName){console.log(`Oyun: Tıklandı: ${clickedItemName}`);const currentLevelData=levels[currentLevelIndex];const expectedClick=currentLevelData.clicks[currentRecipeStep];if(clickedItemName===expectedClick){console.log("Oyun: Doğru adım!");currentRecipeStep++;if(currentRecipeStep>=currentLevelData.clicks.length){const completedLevel=currentLevelData.level;console.log(`--- Seviye ${completedLevel} Bitti! ---`);const rewardAmountStr=getRewardForLevel(completedLevel,currentRegion);currentLevelIndex++;currentRecipeStep=0;if(rewardAmountStr){console.warn(`%cÖDÜL! Seviye ${completedLevel} (${rewardAmountStr})`,'color:green;font-weight:bold;');const isLevel10=completedLevel===10;const winMsgPart2=isLevel10?texts[currentLang].winMessagePart2_USDT:texts[currentLang].winMessagePart2_App.replace('{REWARD}',rewardAmountStr);const mailBodyBase=isLevel10?texts[currentLang].winMessageEmailBodyBase_USDT:texts[currentLang].winMessageEmailBodyBase_App;const mailBody=encodeURIComponent(mailBodyBase.replace('{LEVEL}',completedLevel).replace('{REWARD}',rewardAmountStr));const mailSubject=encodeURIComponent(`${texts[currentLang].winMessageEmailSubjectBase}${completedLevel}${isLevel10?' - NAKIT ODUL':''}`);const mailtoLink=`mailto:${texts[currentLang].winMessageEmailAddress}?subject=${mailSubject}&body=${mailBody}`;const winHtml=`<p>${texts[currentLang].winMessagePart1}${completedLevel}${winMsgPart2}</p><hr><p>${texts[currentLang].winMessageEmailPrompt}<br><a href="${mailtoLink}" target="_blank"><b>${texts[currentLang].winMessageEmailAddress}</b></a><br>${texts[currentLang].winMessageEmailInstructions}</p>`;showMessage(texts[currentLang].winTitle,winHtml,'win');} const nextLevelData=levels[currentLevelIndex];if(!nextLevelData||nextLevelData.clicks.length===0){console.log("OYUN TAMAMLANDI!");gameState='GAME_OVER'; requestAnimationFrame(drawGame); /* Son durumu çizmek için */}}else{/*Doğru adım feedback?*/}}else{console.log("Oyun: Yanlış! Baştan başla.");currentRecipeStep=0;failedAttemptsToday++;saveGameData();console.log(`Kalan hak: ${3-failedAttemptsToday}/3`);feedbackMessage={text:texts[currentLang].errorMessage,color:'red',expiryTime:Date.now()+2500};if(failedAttemptsToday>=3){canPlay=false;console.error("Hak bitti!");gameState='NO_ATTEMPTS'; /* setTimeout(()=>{if(!canPlay){showMessage(texts[currentLang].noAttemptsTitle,texts[currentLang].noAttemptsMessage,'error');}},2550); */} requestAnimationFrame(drawGame); /* Hata mesajını çizmek için */}}else{console.log("Oyun: Boş alan tıklandı.");}}
}


// Fare Hareketi Dinleyicisi (KALDIRILDI)
// function handleMouseMove(event) { /* ... */ }
// canvas.addEventListener('mousemove', handleMouseMove); // KALDIRILDI

// Olay dinleyicisi
canvas.addEventListener('click', handleClick);
// Hata logları
bgImage.onerror = () => { console.error("BG Yüklenemedi!"); }
logoImage.onerror = () => { console.error("Logo Yüklenemedi!"); }

// İlk veri yüklemesini yap ve oyunu başlatmayı dene
loadGameData();
tryStartGame();
console.log("script.js yüklendi ve çalıştırıldı.");
