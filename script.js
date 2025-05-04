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
let tutorialStep = 0;
let isTutorialComplete = false;

// Oyun Değişkenleri
let currentLevelIndex = 0;
let currentRecipeStep = 0;
let canPlay = false;
let gameLoopStarted = false;
let currentShuffledRecipe = []; // <<<--- YENİ: Mevcut seviyenin karışık listesini tutacak

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

// Metinler Objesi (Aynı)
const texts = { TR: { /*...*/ }, EN: { /*...*/ } }; // Önceki koddan kopyala

// Ödül Seviyeleri (Aynı)
const rewardTiers = { TR:{2:"200 TL",4:"600 TL",/*...*/10:"500 USDT"}, EU:{2:"5 USD",4:"15 USD",/*...*/10:"500 USDT"} };
function getRewardForLevel(level, region) { return rewardTiers[region]?.[level] || null; }

// Mesaj Gösterme Fonksiyonları (Aynı)
function showMessage(title, bodyHtml, type='info') { /* ... */ console.log(`showMessage: Tip=${type}, Başlık=${title}`); messageTitle.innerText=title; messageBody.innerHTML=bodyHtml; messageOverlay.className=`overlay message-${type}`; messageOverlay.style.display='flex'; canPlay=false; }
function hideMessage() { /* ... */ messageOverlay.style.display='none'; if(failedAttemptsToday<3 && currentLevelIndex<levels.length-1 && gameState==='PLAYING'){canPlay=true;} }
closeButton.addEventListener('click', hideMessage);

// Tıklanabilir Alanlar (Aynı)
const clickableItems = [ /* ... önceki koddan kopyala ... */
    { name: 'Espresso Makinesi', x: 605, y: 300, width: 50, height: 60 }, { name: 'Yeşil Şişe', x: 300, y: 245, width: 30, height: 55 }, { name: 'Şurup Pompası', x: 340, y: 245, width: 30, height: 55 }, { name: 'Süt Kutusu', x: 390, y: 245, width: 30, height: 55 }, { name: 'Bardak Alanı', x: 330, y: 357, width: 50, height: 50 }, { name: 'Tezgahtaki Kedi', x: 442, y: 352, width: 70, height: 40 }, { name: 'Kasa', x: 700, y: 300, width: 60, height: 60 }, { name: 'Sipariş Fişi', x: 780, y: 240, width: 15, height: 30 }, { name: 'Buzdolabı', x: 445, y: 305, width: 70, height: 40 }, { name: 'Tatlı Dolabı', x: 700, y: 450, width: 80, height: 60 }, { name: 'Fiyat Listesi', x: 500, y: 80, width: 100, height: 200 }
];

// Seviye Tarifleri (Aynı)
const levels = [ /* ... önceki koddan 10 seviye + bitiş ... */
    {level:1,recipeName:"İlk Sipariş (Espresso)",clicks:['Sipariş Fişi','Espresso Makinesi']},{level:2,recipeName:"Caffè Latte (Fiyatlı)",clicks:['Espresso Makinesi','Süt Kutusu','Fiyat Listesi']},{level:3,recipeName:"Vanilya Şur. Soğuk Kahve",clicks:['Bardak Alanı','Buzdolabı','Espresso Makinesi','Şurup Pompası']},{level:4,recipeName:"Kedi Molası & Yeşil Çay",clicks:['Tezgahtaki Kedi','Yeşil Şişe','Bardak Alanı']},{level:5,recipeName:"Yoğun Talep",clicks:['Sipariş Fişi','Espresso Makinesi','Süt Kutusu','Espresso Makinesi']},{level:6,recipeName:"Hesaplı Şuruplu Latte",clicks:['Bardak Alanı','Espresso Makinesi','Şurup Pompası','Süt Kutusu','Fiyat Listesi','Kasa']},{level:7,recipeName:"Yeşil & Vanilya & Buz",clicks:['Yeşil Şişe','Şurup Pompası','Buzdolabı','Bardak Alanı']},{level:8,recipeName:"Tam Menü (Basit)",clicks:['Sipariş Fişi','Bardak Alanı','Espresso Makinesi','Süt Kutusu','Tatlı Dolabı','Kasa']},{level:9,recipeName:"Pati Deluxe Özel",clicks:['Bardak Alanı','Buzdolabı','Yeşil Şişe','Şurup Pompası','Espresso Makinesi','Tezgahtaki Kedi','Kasa']},{level:10,recipeName:"USTALIK ESERİ!",clicks:['Sipariş Fişi','Fiyat Listesi','Bardak Alanı','Buzdolabı','Yeşil Şişe','Şurup Pompası','Espresso Makinesi','Süt Kutusu','Tatlı Dolabı','Tezgahtaki Kedi','Kasa']},{level:11,recipeName:"OYUN BİTTİ!",clicks:[]}
];

// Görsel yükleme olayları
bgImage.onload = function() { console.log("BG yüklendi"); bgLoaded=true; if(logoLoaded) tryStartGame();};
logoImage.onload = function() { console.log("Logo yüklendi"); logoLoaded=true; if(bgLoaded) tryStartGame();};
bgImage.src = 'original.gif'; logoImage.src = 'Starbucks_Corporation.png';
const logoWidth = 80; const logoHeight = 80; const logoX = canvas.width/2-logoWidth/2; const logoY = 20;


// Oyunu Başlatmayı Deneme Fonksiyonu (GÜNCELLENDİ - İlk tarifi karıştır)
function tryStartGame() {
    if (gameState === 'LOADING') {
        console.log("Görseller yüklendi...");
        loadGameData();
        if (!canPlay) {
            gameState = 'NO_ATTEMPTS';
        } else {
            gameState = 'TUTORIAL';
            tutorialStep = 0;
            isTutorialComplete = false;
            // İlk seviyenin tarifini de burada karıştıralım (Oyuna geçince hazır olsun)
            if (levels[0] && levels[0].clicks.length > 0) {
                currentShuffledRecipe = shuffleArray(levels[0].clicks);
            } else {
                currentShuffledRecipe = [];
            }
        }
        if (!gameLoopStarted) {
            requestAnimationFrame(drawGame);
            gameLoopStarted = true;
        }
    }
}

// Fisher-Yates Shuffle Algoritması (Aynı)
function shuffleArray(array){let ci=array.length,ri;const na=array.slice();while(ci!==0){ri=Math.floor(Math.random()*ci);ci--;[na[ci],na[ri]]=[na[ri],na[ci]];} return na;}

// Ana oyun döngüsü fonksiyonu (GÜNCELLENDİ - Karışık Liste Çizimi)
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bgLoaded) ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    if (logoLoaded) { /* ... logo ve daire ... */ const cX=logoX+logoWidth/2;const cY=logoY+logoHeight/2;const r=logoWidth/2;ctx.fillStyle='white';ctx.beginPath();ctx.arc(cX,cY,r,0,Math.PI*2);ctx.fill();ctx.drawImage(logoImage,logoX,logoY,logoWidth,logoHeight);}

    let currentTextY = 30; // Sol üst yazıların başlangıç Y'si

    // Sol Üst: Kalan Haklar
    /* ... */ ctx.fillStyle='white';ctx.font='bold 16px Arial';ctx.textAlign='left'; ctx.shadowColor='black';ctx.shadowBlur=3;ctx.shadowOffsetX=1;ctx.shadowOffsetY=1; ctx.fillText(`${texts[currentLang].attemptsLeft}: ${3-failedAttemptsToday}`,20,currentTextY); currentTextY+=25; ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;

    // Oyun Durumuna Göre Çizim
    if (gameState === 'TUTORIAL') { /* ... Öğretici çizimi aynı ... */ const itemToShow=clickableItems[tutorialStep]; if(itemToShow){ ctx.strokeStyle=(Math.sin(Date.now()*0.005)>0)?'yellow':'orange';ctx.lineWidth=3;ctx.strokeRect(itemToShow.x-2,itemToShow.y-2,itemToShow.width+4,itemToShow.height+4); ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,canvas.height-60,canvas.width,60); ctx.fillStyle='white';ctx.font='bold 16px Arial';ctx.textAlign='center'; let iAT=texts[currentLang].tutorialItemAction_Default; if(itemToShow.name==='Tezgahtaki Kedi')iAT=texts[currentLang].tutorialItemAction_Cat; if(itemToShow.name==='Kasa')iAT=texts[currentLang].tutorialItemAction_Register; if(itemToShow.name==='Sipariş Fişi')iAT=texts[currentLang].tutorialItemAction_OrderSlip; if(itemToShow.name==='Fiyat Listesi')iAT=texts[currentLang].tutorialItemAction_PriceList; if(itemToShow.name==='Buzdolabı')iAT=texts[currentLang].tutorialItemAction_Fridge; if(itemToShow.name==='Tatlı Dolabı')iAT=texts[currentLang].tutorialItemAction_Dessert; ctx.fillText(texts[currentLang].tutorialItemIntro+itemToShow.name+iAT,canvas.width/2,canvas.height-35); ctx.font='14px Arial'; ctx.fillText(texts[currentLang].tutorialItemPrompt,canvas.width/2,canvas.height-15); ctx.textAlign='left';}
    } else if (gameState === 'PLAYING') {
        // --- Sol Üst: Seviye, Sipariş ve KARIŞIK Gerekenler ---
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

                 // Gerekenler Listesi (Karışık ve Sabit)
                 ctx.font = 'italic 16px Arial';
                 ctx.fillText(`${texts[currentLang].requirements}:`, 20, currentTextY);
                 currentTextY += 20;
                 // ÖNCEDEN KARIŞTIRILMIŞ LİSTEYİ KULLAN
                 for (const item of currentShuffledRecipe) {
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
         /* ... */ ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,canvas.height/2-40,canvas.width,80); const title=(gameState==='NO_ATTEMPTS')?texts[currentLang].noAttemptsTitle:texts[currentLang].gameOverTitle; const message=(gameState==='NO_ATTEMPTS')?texts[currentLang].noAttemptsMessage:texts[currentLang].gameOverMessage; const titleColor=(gameState==='NO_ATTEMPTS')?'red':'gold'; ctx.fillStyle=titleColor; ctx.font='bold 30px Arial'; ctx.textAlign='center'; ctx.fillText(title,canvas.width/2,canvas.height/2); ctx.fillStyle='white'; ctx.font='18px Arial'; ctx.fillText(message,canvas.width/2,canvas.height/2+30); ctx.textAlign='left';
    }

    // Debug kutuları kaldırıldı

    // Döngüyü devam ettir
    if (gameLoopStarted && (gameState === 'PLAYING' || gameState === 'TUTORIAL')) {
         requestAnimationFrame(drawGame);
    }
}


// Tıklama İşleyici Fonksiyon (GÜNCELLENDİ - Seviye atlayınca listeyi karıştır)
function handleClick(event) {
    const rect = canvas.getBoundingClientRect(); const clickX = event.clientX - rect.left; const clickY = event.clientY - rect.top;

    if (gameState === 'TUTORIAL') { // Öğretici Tıklama Mantığı...
        const itemToClick=clickableItems[tutorialStep]; if(itemToClick&&clickX>=itemToClick.x&&clickX<=itemToClick.x+itemToClick.width&&clickY>=itemToClick.y&&clickY<=itemToClick.y+itemToClick.height){console.log(`Öğretici: ${itemToClick.name} tıklandı.`); tutorialStep++; if(tutorialStep>=clickableItems.length){console.log("Öğretici bitti!"); isTutorialComplete=true; gameState='PLAYING'; currentLevelIndex=0; currentRecipeStep=0; canPlay=true; // YENİ: İlk seviyenin tarifini karıştır currentShuffledRecipe = shuffleArray(levels[currentLevelIndex].clicks); if(gameLoopStarted)requestAnimationFrame(drawGame);}else{requestAnimationFrame(drawGame);}}else{console.log("Öğretici: Yanlış yere tıklandı.");}}

    else if (gameState === 'PLAYING') { // Normal Oyun Tıklama Mantığı...
        if (!canPlay || currentLevelIndex >= levels.length - 1 || messageOverlay.style.display === 'flex') return; let clickedItemName=null; for(const item of clickableItems){if(clickX>=item.x&&clickX<=item.x+item.width&&clickY>=item.y&&clickY<=item.y+item.height){clickedItemName=item.name;break;}} if(clickedItemName){console.log(`Oyun: Tıklandı: ${clickedItemName}`); const currentLevelData=levels[currentLevelIndex]; const expectedClick=currentLevelData.clicks[currentRecipeStep]; if(clickedItemName===expectedClick){console.log("Oyun: Doğru adım!");currentRecipeStep++;
            if (currentRecipeStep >= currentLevelData.clicks.length) { // Seviye Bitti
                const completedLevel=currentLevelData.level; console.log(`--- Seviye ${completedLevel} Bitti! ---`); const rewardAmountStr=getRewardForLevel(completedLevel,currentRegion); currentLevelIndex++; currentRecipeStep=0;
                // YENİ: Bir sonraki seviyenin tarifini karıştır
                if(levels[currentLevelIndex] && levels[currentLevelIndex].clicks.length > 0) { currentShuffledRecipe = shuffleArray(levels[currentLevelIndex].clicks); } else { currentShuffledRecipe = []; }

                if (rewardAmountStr) { /* ... Ödül mesajı ve mailto linki ... */ console.warn(`%cÖDÜL! Seviye ${completedLevel} (${rewardAmountStr})`,'color:green;font-weight:bold;');const isLevel10=completedLevel===10;const winMsgPart2=isLevel10?texts[currentLang].winMessagePart2_USDT:texts[currentLang].winMessagePart2_App.replace('{REWARD}',rewardAmountStr);const mailBodyBase=isLevel10?texts[currentLang].winMessageEmailBodyBase_USDT:texts[currentLang].winMessageEmailBodyBase_App;const mailBody=encodeURIComponent(mailBodyBase.replace('{LEVEL}',completedLevel).replace('{REWARD}',rewardAmountStr));const mailSubject=encodeURIComponent(`${texts[currentLang].winMessageEmailSubjectBase}${completedLevel}${isLevel10?' - NAKIT ODUL':''}`);const mailtoLink=`mailto:${texts[currentLang].winMessageEmailAddress}?subject=${mailSubject}&body=${mailBody}`;const winHtml=`<p>${texts[currentLang].winMessagePart1}${completedLevel}${winMsgPart2}</p><hr><p>${texts[currentLang].winMessageEmailPrompt}<br><a href="${mailtoLink}" target="_blank"><b>${texts[currentLang].winMessageEmailAddress}</b></a><br>${texts[currentLang].winMessageEmailInstructions}</p>`;showMessage(texts[currentLang].winTitle,winHtml,'win'); }
                 const nextLevelData=levels[currentLevelIndex]; if(!nextLevelData||nextLevelData.clicks.length===0){console.log("OYUN TAMAMLANDI!"); gameState='GAME_OVER'; requestAnimationFrame(drawGame);} // Son durumu çiz
            } else {/*Doğru adım mesajı?*/}
        } else { /* ... Yanlış Tıklama Mantığı (Aynı)... */ console.log("Oyun: Yanlış! Baştan başla.");currentRecipeStep=0;failedAttemptsToday++;saveGameData();console.log(`Kalan hak: ${3-failedAttemptsToday}/3`);feedbackMessage={text:texts[currentLang].errorMessage,color:'red',expiryTime:Date.now()+2500};if(failedAttemptsToday>=3){canPlay=false;console.error("Hak bitti!");gameState='NO_ATTEMPTS';} requestAnimationFrame(drawGame);} } else { console.log("Oyun: Boş alan tıklandı."); } }
}


// Fare Hareketi Dinleyicisi (Kaldırıldı)
// canvas.addEventListener('mousemove', handleMouseMove);

// Tıklama Olay dinleyicisi
canvas.addEventListener('click', handleClick);
// Hata logları
bgImage.onerror = () => { console.error("BG Yüklenemedi!"); }
logoImage.onerror = () => { console.error("Logo Yüklenemedi!"); }

// İlk veri yüklemesini yap ve oyunu başlatmayı dene
loadGameData();
tryStartGame();
console.log("script.js yüklendi ve çalıştırıldı.");
