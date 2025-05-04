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
let currentRegion = 'TR';

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

// Metinler Objesi (GÜNCELLENDİ)
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
        tutorialItemIntro: "Bu: ",
        tutorialItemAction_Default: ". Tarifte adı geçince buraya tıklayacaksın.",
        tutorialItemAction_Cat: ". Bazen mola vermek gerekir! 😉",
        tutorialItemAction_Register: ". Siparişi tamamlamak için buraya.",
        tutorialItemAction_OrderSlip: ". Siparişi görmek için buraya.", // Yeni
        tutorialItemAction_PriceList: ". Fiyatları kontrol etmek için.", // Yeni
        tutorialItemPrompt: "Devam etmek için vurgulanan alana tıkla.",
        tutorialComplete: "Harika! Artık hazırsın. Oyun başlıyor!",
        tutorialOutOfAttempts: "Hakların bittiği için bugünlük bu kadar!", // Güncellendi
        // YENİ
        mixedOrderWarning: "Not: Malzemeler karışık listelenmiştir, doğru sırada hazırlayın!"
    },
    EN: { /* ... İngilizce metinler de benzer şekilde güncellenmeli ... */ }
};

// Ödül Seviyeleri (Aynı)
const rewardTiers = { TR:{2:"200 TL",4:"600 TL",6:"2.000 TL",8:"5.000 TL",10:"500 USDT"}, EU:{2:"5 USD",4:"15 USD",6:"40 USD",8:"100 USD",10:"500 USDT"} };
function getRewardForLevel(level, region) { return rewardTiers[region]?.[level] || null; }

// Mesaj Gösterme Fonksiyonları (Aynı)
function showMessage(title, bodyHtml, type='info') { console.log(`showMessage: Tip=${type}, Başlık=${title}`); messageTitle.innerText=title; messageBody.innerHTML=bodyHtml; messageOverlay.className=`overlay message-${type}`; messageOverlay.style.display='flex'; canPlay=false; }
function hideMessage() { messageOverlay.style.display='none'; if(failedAttemptsToday<3 && currentLevelIndex<levels.length-1 && gameState==='PLAYING'){canPlay=true;} } // Sadece oyun durumunda canPlay'i true yap
closeButton.addEventListener('click', hideMessage);

// --- Tıklanabilir Alanlar (TÜMÜ GÜNCELLENDİ - Tahmini Boyutlarla) ---
// Boyutları senin geri bildiriminle ayarlayacağız!
const clickableItems = [
    { name: 'Espresso Makinesi', x: 605, y: 300, width: 50, height: 60 }, // OK
    { name: 'Yeşil Şişe',        x: 300, y: 245, width: 30, height: 55 }, // OK (2. yeşil)
    { name: 'Şurup Pompası',     x: 340, y: 245, width: 30, height: 55 }, // OK (3. yeşil)
    { name: 'Süt Kutusu',        x: 390, y: 245, width: 30, height: 55 }, // Kahverengi şişe (OK)
    { name: 'Bardak Alanı',      x: 330, y: 357, width: 50, height: 50 }, // OK (Şurup altı)
    { name: 'Tezgahtaki Kedi',   x: 442, y: 352, width: 70, height: 40 }, // Turuncu Kedi (OK - Boyut?)
    { name: 'Kasa',              x: 700, y: 300, width: 60, height: 60 }, // OK
    { name: 'Sipariş Fişi',      x: 780, y: 240, width: 15, height: 30 }, // Yeni (Tahmini Boyut)
    { name: 'Buzdolabı',         x: 445, y: 305, width: 70, height: 40 }, // Yeni (Eski kedi yeri - Tahmini Boyut)
    { name: 'Tatlı Dolabı',      x: 700, y: 450, width: 80, height: 60 }, // Yeni (Kasa altı - Tahmini Boyut)
    { name: 'Fiyat Listesi',     x: 500, y: 80, width: 100, height: 200 } // Yeni (Sol menü board - Tahmini Boyut)
];

// --- YENİ: Seviye Tarifleri (10 Seviye + Bitiş - Starbucks İsimleri ve Zorluk) ---
const levels = [
    // level: Gerçek Seviye No, recipeName: Görünecek İsim, clicks: Doğru Tıklama Sırası
    { level: 1, recipeName: "Espresso",                 clicks: ['Espresso Makinesi'] }, // Basit başlangıç
    { level: 2, recipeName: "Caffè Latte",              clicks: ['Espresso Makinesi', 'Süt Kutusu'] }, // ÖDÜL 1
    { level: 3, recipeName: "Iced Yeşil Çay",           clicks: ['Bardak Alanı', 'Yeşil Şişe', 'Buzdolabı'] }, // Yeni öğe
    { level: 4, recipeName: "Caramel Macchiato",        clicks: ['Bardak Alanı', 'Şurup Pompası', 'Süt Kutusu', 'Espresso Makinesi'] }, // ÖDÜL 2 (Sıra önemli)
    { level: 5, recipeName: "Sipariş Kontrol",          clicks: ['Sipariş Fişi', 'Espresso Makinesi', 'Kasa'] }, // Yeni öğe
    { level: 6, recipeName: "Vanilyalı Soğuk Latte",    clicks: ['Bardak Alanı', 'Buzdolabı', 'Şurup Pompası', 'Espresso Makinesi', 'Süt Kutusu'] }, // ÖDÜL 3
    { level: 7, recipeName: "Kedi Sever Barista",       clicks: ['Espresso Makinesi', 'Tezgahtaki Kedi', 'Süt Kutusu', 'Bardak Alanı'] }, // Kedi molası
    { level: 8, recipeName: "Fiyat Soran Müşteri",      clicks: ['Espresso Makinesi', 'Süt Kutusu', 'Fiyat Listesi', 'Kasa'] }, // ÖDÜL 4
    { level: 9, recipeName: "Özel Tatlı Menüsü",        clicks: ['Sipariş Fişi', 'Bardak Alanı', 'Espresso Makinesi', 'Tatlı Dolabı', 'Tezgahtaki Kedi', 'Kasa']}, // Çok adımlı
    { level: 10, recipeName: "USTALIK ESERİ!",          clicks: ['Bardak Alanı', 'Buzdolabı', 'Yeşil Şişe', 'Şurup Pompası', 'Espresso Makinesi', 'Süt Kutusu', 'Tezgahtaki Kedi', 'Fiyat Listesi','Sipariş Fişi', 'Kasa']}, // ÖDÜL 5 (USDT) - Hepsi!
    { level: 11, recipeName: "OYUN BİTTİ!",             clicks: [] } // Oyun sonu işaretçisi
];
// ---------------------------------

// Görsel yükleme olayları
bgImage.onload = function() { console.log("BG yüklendi"); bgLoaded=true; if(logoLoaded) tryStartGame();};
logoImage.onload = function() { console.log("Logo yüklendi"); logoLoaded=true; if(bgLoaded) tryStartGame();};
bgImage.src = 'original.gif'; logoImage.src = 'Starbucks_Corporation.png';
const logoWidth = 80; const logoHeight = 80; const logoX = canvas.width/2-logoWidth/2; const logoY = 20;


// Oyunu Başlatmayı Deneme Fonksiyonu (Aynı)
function tryStartGame() { if(gameState==='LOADING'){console.log("Görseller yüklendi...");loadGameData();if(!canPlay){gameState='NO_ATTEMPTS';}else{gameState='TUTORIAL';tutorialStep=0;isTutorialComplete=false;} if(!gameLoopStarted){requestAnimationFrame(drawGame);gameLoopStarted=true;}} }

// --- YENİ: Fisher-Yates Shuffle Algoritması ---
// Bir dizinin kopyasını karıştırmak için kullanılır
function shuffleArray(array) {
  let currentIndex = array.length, randomIndex;
  const newArray = array.slice(); // Orijinal diziyi bozmamak için kopyasını oluştur
  // Kalan elementler varken...
  while (currentIndex !== 0) {
    // Kalan elementlerden birini seç...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // Ve şu anki elementle yer değiştir.
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
}
// --- Shuffle Sonu ---


// Ana oyun döngüsü fonksiyonu (GÜNCELLENDİ - Karışık Liste ve Uyarı)
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bgLoaded) ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    if (logoLoaded) { /* ... logo ve daire çizimi ... */ const cX=logoX+logoWidth/2;const cY=logoY+logoHeight/2;const r=logoWidth/2;ctx.fillStyle='white';ctx.beginPath();ctx.arc(cX,cY,r,0,Math.PI*2);ctx.fill();ctx.drawImage(logoImage,logoX,logoY,logoWidth,logoHeight);}

    let currentTextY = 30; // Sol üst yazıların başlangıç Y'si

    // Sol Üst: Kalan Haklar
    /* ... */ ctx.fillStyle='white';ctx.font='bold 16px Arial';ctx.textAlign='left'; ctx.shadowColor='black';ctx.shadowBlur=3;ctx.shadowOffsetX=1;ctx.shadowOffsetY=1; ctx.fillText(`${texts[currentLang].attemptsLeft}: ${3-failedAttemptsToday}`,20,currentTextY); currentTextY+=25; ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;
    // Sol Üst: Fare Koordinatları (DEBUG İÇİN AÇIK BIRAKILDI)
    /* ... */ ctx.fillStyle = 'yellow'; ctx.font = '14px Arial'; ctx.textAlign = 'left'; ctx.fillText(`Fare X: ${mouseX} Y: ${mouseY}`, 20, currentTextY); currentTextY += 20;


    // Oyun Durumuna Göre Çizim
    if (gameState === 'TUTORIAL') { /* ... Öğretici çizimi aynı ... */
        const itemToShow=clickableItems[tutorialStep]; if(itemToShow){ ctx.strokeStyle=(Math.sin(Date.now()*0.005)>0)?'yellow':'orange';ctx.lineWidth=3;ctx.strokeRect(itemToShow.x-2,itemToShow.y-2,itemToShow.width+4,itemToShow.height+4); ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,canvas.height-60,canvas.width,60); ctx.fillStyle='white';ctx.font='bold 16px Arial';ctx.textAlign='center'; let iAT=texts[currentLang].tutorialItemAction_Default; if(itemToShow.name==='Tezgahtaki Kedi')iAT=texts[currentLang].tutorialItemAction_Cat; if(itemToShow.name==='Kasa')iAT=texts[currentLang].tutorialItemAction_Register; if(itemToShow.name==='Sipariş Fişi')iAT=texts[currentLang].tutorialItemAction_OrderSlip; if(itemToShow.name==='Fiyat Listesi')iAT=texts[currentLang].tutorialItemAction_PriceList; ctx.fillText(texts[currentLang].tutorialItemIntro+itemToShow.name+iAT,canvas.width/2,canvas.height-35); ctx.font='14px Arial'; ctx.fillText(texts[currentLang].tutorialItemPrompt,canvas.width/2,canvas.height-15); ctx.textAlign='left'; /* Hizalamayı geri al */}

    } else if (gameState === 'PLAYING') {
        // --- Sol Üst: Seviye, Sipariş ve KARIŞIK Gerekenler ---
        if (levels[currentLevelIndex]) {
            const currentLevelData = levels[currentLevelIndex];
            ctx.fillStyle = 'white'; ctx.textAlign = 'left'; // Hizalama sol
            ctx.shadowColor = 'black'; ctx.shadowBlur = 4; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2;

            // Seviye
            ctx.font = 'bold 20px Arial';
            ctx.fillText(`${texts[currentLang].level}: ${currentLevelData.level}`, 20, currentTextY);
            currentTextY += 25;

            if (currentLevelData.clicks.length > 0) { // Oyun bitmediyse
                 // Sipariş Adı
                 ctx.font = '18px Arial';
                 ctx.fillText(`${texts[currentLang].order}: ${currentLevelData.recipeName}`, 20, currentTextY);
                 currentTextY += 25;

                 // Gerekenler Listesi (Karışık)
                 ctx.font = 'italic 16px Arial';
                 ctx.fillText(`${texts[currentLang].requirements}:`, 20, currentTextY);
                 currentTextY += 20;
                 // TARİFİN KOPYASINI ALIP KARIŞTIR
                 const shuffledClicks = shuffleArray(currentLevelData.clicks);
                 for (const item of shuffledClicks) { // Karışık listeyi yazdır
                     ctx.fillText(`- ${item}`, 30, currentTextY);
                     currentTextY += 18;
                 }
                 // YENİ: Uyarı Metni
                 currentTextY += 5; // Biraz boşluk
                 ctx.fillStyle = 'orange'; // Uyarı rengi
                 ctx.font = 'bold 14px Arial';
                 ctx.fillText(texts[currentLang].mixedOrderWarning, 20, currentTextY);
                 // --- Uyarı Metni Sonu ---

            }
            ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
        }
         // Geçici Hata/Başarı Mesajı (Canvas'a)
        if (feedbackMessage.text && Date.now() < feedbackMessage.expiryTime) { /*...*/ ctx.fillStyle=feedbackMessage.color;ctx.font='bold 28px Arial';ctx.textAlign='center';ctx.shadowColor='black';ctx.shadowBlur=5;ctx.shadowOffsetX=2;ctx.shadowOffsetY=2;ctx.fillText(feedbackMessage.text,canvas.width/2,canvas.height-30); /* Mesajı alta aldık */ ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;ctx.textAlign='left';} else { feedbackMessage.text='';}

    } else if (gameState === 'NO_ATTEMPTS' || gameState === 'GAME_OVER') {
        // Hak Bitti veya Oyun Bitti Mesajları (Canvas'a)
         /* ... öncekiyle aynı ... */ ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,canvas.height/2-40,canvas.width,80); const title=(gameState==='NO_ATTEMPTS')?texts[currentLang].noAttemptsTitle:texts[currentLang].gameOverTitle; const message=(gameState==='NO_ATTEMPTS')?texts[currentLang].noAttemptsMessage:texts[currentLang].gameOverMessage; const titleColor=(gameState==='NO_ATTEMPTS')?'red':'gold'; ctx.fillStyle=titleColor; ctx.font='bold 30px Arial'; ctx.textAlign='center'; ctx.fillText(title,canvas.width/2,canvas.height/2); ctx.fillStyle='white'; ctx.font='18px Arial'; ctx.fillText(message,canvas.width/2,canvas.height/2+30); ctx.textAlign='left';
    }

    // --- DEBUG KUTULARI KALDIRILDI ---
    // Artık debug kutularını çizmiyoruz.
    // --- DEBUG SONU ---


    // Döngüyü devam ettir
    if (gameLoopStarted && (gameState === 'PLAYING' || gameState === 'TUTORIAL')) {
         requestAnimationFrame(drawGame);
    }
}


// Tıklama İşleyici Fonksiyon (Aynı)
function handleClick(event) { /* ... Önceki mesajdaki tam kod ... */
    const rect=canvas.getBoundingClientRect();const clickX=event.clientX-rect.left;const clickY=event.clientY-rect.top;
    if(gameState==='TUTORIAL'){const itemToClick=clickableItems[tutorialStep];if(itemToClick&&clickX>=itemToClick.x&&clickX<=itemToClick.x+itemToClick.width&&clickY>=itemToClick.y&&clickY<=itemToClick.y+itemToClick.height){console.log(`Öğretici: ${itemToClick.name} tıklandı.`);tutorialStep++;if(tutorialStep>=clickableItems.length){console.log("Öğretici bitti!");isTutorialComplete=true;gameState='PLAYING';currentLevelIndex=0;currentRecipeStep=0;canPlay=true;if(gameLoopStarted)requestAnimationFrame(drawGame);}else{/*Sonraki adımı hemen çiz? Şimdilik loop çiziyor*/}}else{console.log("Öğretici: Yanlış yere tıklandı.");}}
    else if(gameState==='PLAYING'){if(!canPlay||currentLevelIndex>=levels.length-1)return;let clickedItemName=null;for(const item of clickableItems){if(clickX>=item.x&&clickX<=item.x+item.width&&clickY>=item.y&&clickY<=item.y+item.height){clickedItemName=item.name;break;}} if(clickedItemName){console.log(`Oyun: Tıklandı: ${clickedItemName}`);const currentLevelData=levels[currentLevelIndex];const expectedClick=currentLevelData.clicks[currentRecipeStep];if(clickedItemName===expectedClick){console.log("Oyun: Doğru adım!");currentRecipeStep++;if(currentRecipeStep>=currentLevelData.clicks.length){const completedLevel=currentLevelData.level;console.log(`--- Seviye ${completedLevel} Bitti! ---`);const rewardAmountStr=getRewardForLevel(completedLevel,currentRegion);currentLevelIndex++;currentRecipeStep=0;if(rewardAmountStr){console.warn(`%cÖDÜL! Seviye ${completedLevel} (${rewardAmountStr})`,'color:green;font-weight:bold;');const isLevel10=completedLevel===10;const winMsgPart2=isLevel10?texts[currentLang].winMessagePart2_USDT:texts[currentLang].winMessagePart2_App.replace('{REWARD}',rewardAmountStr);const mailBodyBase=isLevel10?texts[currentLang].winMessageEmailBodyBase_USDT:texts[currentLang].winMessageEmailBodyBase_App;const mailBody=encodeURIComponent(mailBodyBase.replace('{LEVEL}',completedLevel).replace('{REWARD}',rewardAmountStr));const mailSubject=encodeURIComponent(`${texts[currentLang].winMessageEmailSubjectBase}${completedLevel}${isLevel10?' - NAKIT ODUL':''}`);const mailtoLink=`mailto:${texts[currentLang].winMessageEmailAddress}?subject=${mailSubject}&body=${mailBody}`;const winHtml=`<p>${texts[currentLang].winMessagePart1}${completedLevel}${winMsgPart2}</p><hr><p>${texts[currentLang].winMessageEmailPrompt}<br><a href="${mailtoLink}" target="_blank"><b>${texts[currentLang].winMessageEmailAddress}</b></a><br>${texts[currentLang].winMessageEmailInstructions}</p>`;showMessage(texts[currentLang].winTitle,winHtml,'win');} const nextLevelData=levels[currentLevelIndex];if(!nextLevelData||nextLevelData.clicks.length===0){console.log("OYUN TAMAMLANDI!");gameState='GAME_OVER';}}else{/*Doğru adım feedback?*/}}else{console.log("Oyun: Yanlış! Baştan başla.");currentRecipeStep=0;failedAttemptsToday++;saveGameData();console.log(`Kalan hak: ${3-failedAttemptsToday}/3`);feedbackMessage={text:texts[currentLang].errorMessage,color:'red',expiryTime:Date.now()+2500};if(failedAttemptsToday>=3){canPlay=false;console.error("Hak bitti!");gameState='NO_ATTEMPTS';}}}else{console.log("Oyun: Boş alan tıklandı.");}}
}


// Fare Hareketi Dinleyicisi (Koordinatlar için hala aktif)
function handleMouseMove(event) { const rect=canvas.getBoundingClientRect();mouseX=Math.round(event.clientX-rect.left);mouseY=Math.round(event.clientY-rect.top);}
canvas.addEventListener('mousemove', handleMouseMove);

// Tıklama Olay dinleyicisi
canvas.addEventListener('click', handleClick);
// Hata logları
bgImage.onerror = () => { console.error("BG Yüklenemedi!"); }
logoImage.onerror = () => { console.error("Logo Yüklenemedi!"); }

// İlk veri yüklemesini yap ve oyunu başlatmayı dene
loadGameData();
tryStartGame();
console.log("script.js yüklendi ve çalıştırıldı.");
