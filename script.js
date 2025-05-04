// Canvas elementini ve 2D çizim bağlamını alalım
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Görsel nesnelerini oluşturalım
const bgImage = new Image();
const logoImage = new Image();

// Görsellerin yüklenip yüklenmediğini takip edelim
let bgLoaded = false;
let logoLoaded = false;

// Oyun Durumları
let gameState = 'LOADING';
let tutorialStep = 0;
let isTutorialComplete = false;

// Oyun Değişkenleri
let currentLevelIndex = 0;
let currentRecipeStep = 0;
let canPlay = false;
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

// --- YENİ: Fare Koordinatları ---
let mouseX = 0;
let mouseY = 0;
// --- Fare Koordinatları Sonu ---

function loadGameData() { /* ... öncekiyle aynı ... */ const today=new Date().toISOString().split('T')[0];lastPlayDate=localStorage.getItem('barista_lastPlayDate')||today;failedAttemptsToday=parseInt(localStorage.getItem('barista_failedAttempts')||'0',10);if(lastPlayDate!==today){console.log("Yeni gün!");failedAttemptsToday=0;lastPlayDate=today;saveGameData();} if(failedAttemptsToday>=3){canPlay=false;console.warn("Hak bitti.");}else{canPlay=true;} console.log(`Bugünkü hata hakkı: ${3-failedAttemptsToday}/3`); }
function saveGameData() { /* ... öncekiyle aynı ... */ localStorage.setItem('barista_lastPlayDate',lastPlayDate);localStorage.setItem('barista_failedAttempts',failedAttemptsToday.toString()); }

// Geri Bildirim Mesajı Değişkenleri
let feedbackMessage = { text: '', color: 'red', expiryTime: 0 };

// Metinler Objesi (Aynı)
const texts = { TR: { /*...*/ level:"Seviye", order:"Sipariş", requirements:"Gerekenler", attemptsLeft:"Kalan Hata Hakkı", errorTitle:"Hata!", errorMessage:"Yanlış malzeme veya sıra! Baştan başla.", winTitle:"Tebrikler!", winMessagePart1:"Seviye ", winMessagePart2_App:" **{REWARD}** değerinde Starbucks Mobil Uygulaması ödülü kazandın!", winMessagePart2_USDT:" **NAKİT ÖDÜL (500 USDT)** kazandın!", winMessageEmailPrompt:"Ödülünü almak için...", winMessageEmailAddress:"giveaways@kyrosil.eu", winMessageEmailSubjectBase:"Kyrosil Starbucks Oyun Ödülü - Seviye ", winMessageEmailBodyBase_App:"Merhaba,\n\nSeviye {LEVEL}...(vb)", winMessageEmailBodyBase_USDT:"Merhaba,\n\nSeviye 10 Büyük Ödülü (500 USDT)...(vb)", winMessageEmailInstructions:"...", gameOverTitle:"Oyun Bitti!", gameOverMessage:"Tüm seviyeleri tamamladın!", noAttemptsTitle:"Hakların Bitti!", noAttemptsMessage:"Bugünkü 3 hata hakkını doldurdun...", closeButton:"Tamam", tutorialIntro:"Oyuna Hoş Geldin!", tutorialItemIntro:"Bu: ", tutorialItemAction_Default:". Tarifte adı geçince buraya tıklayacaksın.", tutorialItemAction_Cat:". Bazen mola vermek gerekir! 😉", tutorialItemAction_Register:". Siparişi tamamlamak için buraya.", tutorialItemPrompt:"Devam etmek için vurgulanan alana tıkla.", tutorialComplete:"Harika! Başlıyoruz!", tutorialOutOfAttempts:"Hakların bitmiş..." }, EN: { /*...*/ } };

// Ödül Seviyeleri (Aynı)
const rewardTiers = { TR:{2:"200 TL",/*...*/10:"500 USDT"}, EU:{2:"5 USD",/*...*/10:"500 USDT"} };
function getRewardForLevel(level, region) { return rewardTiers[region]?.[level] || null; }

// Mesaj Gösterme Fonksiyonları (Aynı)
function showMessage(title, bodyHtml, type='info') { console.log(`showMessage: Tip=${type}, Başlık=${title}`); messageTitle.innerText=title; messageBody.innerHTML=bodyHtml; messageOverlay.className=`overlay message-${type}`; messageOverlay.style.display='flex'; canPlay=false; }
function hideMessage() { messageOverlay.style.display='none'; if(failedAttemptsToday<3 && currentLevelIndex<levels.length-1 && gameState!=='TUTORIAL'){canPlay=true;} }
closeButton.addEventListener('click', hideMessage);

// Tıklanabilir Alanlar (Koordinatlar hala tahmini!)
const clickableItems = [
    { name: 'Espresso Makinesi', x: 605, y: 300, width: 50, height: 60 },
    { name: 'Yeşil Şişe',        x: 300, y: 245, width: 30, height: 55 },
    { name: 'Şurup Pompası',     x: 340, y: 245, width: 30, height: 55 },
    { name: 'Süt Kutusu',        x: 450, y: 330, width: 40, height: 60 }, // Tahmini
    { name: 'Bardak Alanı',      x: 540, y: 310, width: 50, height: 50 }, // Tahmini
    { name: 'Tezgahtaki Kedi',   x: 470, y: 305, width: 70, height: 40 }, // Tahmini (SAÇMA OLAN)
    { name: 'Kasa',              x: 700, y: 300, width: 60, height: 60 }  // Tahmini
];

// Seviye Tarifleri (Aynı)
const levels = [ /* ... 10 seviye + bitiş ... */ {level:1,recipeName:"Espresso",clicks:['Espresso Makinesi']},{level:2,recipeName:"Caffè Latte",clicks:['Espresso Makinesi','Süt Kutusu']},{level:3,recipeName:"Vanilya Şuruplu Kahve",clicks:['Espresso Makinesi','Şurup Pompası']},{level:4,recipeName:"Kedi Molası & Espresso",clicks:['Tezgahtaki Kedi','Espresso Makinesi']},{level:5,recipeName:"Yeşil Çaylı İçecek",clicks:['Yeşil Şişe','Bardak Alanı']},{level:6,recipeName:"Şuruplu Latte",clicks:['Espresso Makinesi','Şurup Pompası','Süt Kutusu']},{level:7,recipeName:"Yeşil & Vanilya Mix",clicks:['Yeşil Şişe','Espresso Makinesi','Şurup Pompası']},{level:8,recipeName:"Tam Sipariş",clicks:['Bardak Alanı','Espresso Makinesi','Süt Kutusu','Kasa']},{level:9,recipeName:"Pati Deluxe",clicks:['Bardak Alanı','Espresso Makinesi','Yeşil Şişe','Şurup Pompası','Tezgahtaki Kedi']},{level:10,recipeName:"Barista Finali!",clicks:['Bardak Alanı','Espresso Makinesi','Yeşil Şişe','Şurup Pompası','Süt Kutusu','Tezgahtaki Kedi','Kasa']},{level:11,recipeName:"OYUN BİTTİ!",clicks:[]} ];

// Görsel yükleme olayları
bgImage.onload = function() { console.log("BG yüklendi"); bgLoaded=true; if(logoLoaded) tryStartGame();};
logoImage.onload = function() { console.log("Logo yüklendi"); logoLoaded=true; if(bgLoaded) tryStartGame();};
bgImage.src = 'original.gif'; logoImage.src = 'Starbucks_Corporation.png';
const logoWidth = 80; const logoHeight = 80; const logoX = canvas.width/2-logoWidth/2; const logoY = 20;

// Oyunu Başlatmayı Deneme Fonksiyonu (Aynı)
function tryStartGame() { /* ... önceki kod ... */ if(gameState==='LOADING'){console.log("Görseller yüklendi...");loadGameData();if(!canPlay){gameState='NO_ATTEMPTS';}else{gameState='TUTORIAL';tutorialStep=0;isTutorialComplete=false;} if(!gameLoopStarted){requestAnimationFrame(drawGame);gameLoopStarted=true;}} }

// Ana oyun döngüsü fonksiyonu (GÜNCELLENDİ - Fare Koordinatları Eklendi)
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bgLoaded) ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    if (logoLoaded) { /* ... logo ve daire çizimi ... */ const cX=logoX+logoWidth/2;const cY=logoY+logoHeight/2;const r=logoWidth/2;ctx.fillStyle='white';ctx.beginPath();ctx.arc(cX,cY,r,0,Math.PI*2);ctx.fill();ctx.drawImage(logoImage,logoX,logoY,logoWidth,logoHeight);}

    let currentTextY = 30; // Yazıların Y pozisyonunu takip etmek için

    // --- Sol Üst: Kalan Haklar (Yeni Konum) ---
    ctx.fillStyle='white';ctx.font='bold 16px Arial';ctx.textAlign='left'; // SOLA HİZALA
    ctx.shadowColor='black';ctx.shadowBlur=3;ctx.shadowOffsetX=1;ctx.shadowOffsetY=1;
    ctx.fillText(`${texts[currentLang].attemptsLeft}: ${3 - failedAttemptsToday}`, 20, currentTextY); // Sol üst köşe
    currentTextY += 25; // Sonraki yazı için Y'yi artır
    ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;
    // --- Kalan Haklar Sonu ---

    // --- YENİ: Fare Koordinatlarını Göster ---
    ctx.fillStyle = 'yellow'; // Farklı bir renk olsun
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Fare X: ${mouseX} Y: ${mouseY}`, 20, currentTextY);
    currentTextY += 20; // Sonraki yazı için Y'yi artır
    // --- Fare Koordinatları Sonu ---


    // Oyun Durumuna Göre Çizim
    if (gameState === 'TUTORIAL') {
        const itemToShow = clickableItems[tutorialStep];
        if (itemToShow) {
            // Vurgulama
            ctx.strokeStyle = (Math.sin(Date.now() * 0.005) > 0) ? 'yellow' : 'orange'; ctx.lineWidth = 3;
            ctx.strokeRect(itemToShow.x - 2, itemToShow.y - 2, itemToShow.width + 4, itemToShow.height + 4);
            // Açıklama Metni (Alta)
            ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,canvas.height-60,canvas.width,60);
            ctx.fillStyle='white'; ctx.font='bold 16px Arial'; ctx.textAlign='center';
            let itemActionText = texts[currentLang].tutorialItemAction_Default;
            if(itemToShow.name==='Tezgahtaki Kedi')itemActionText=texts[currentLang].tutorialItemAction_Cat;
            if(itemToShow.name==='Kasa')itemActionText=texts[currentLang].tutorialItemAction_Register;
            ctx.fillText(texts[currentLang].tutorialItemIntro+itemToShow.name+itemActionText, canvas.width/2, canvas.height-35);
            ctx.font='14px Arial'; ctx.fillText(texts[currentLang].tutorialItemPrompt, canvas.width/2, canvas.height-15);
        }
    } else if (gameState === 'PLAYING') {
        // --- Sol Üst: Seviye, Sipariş ve Gerekenler ---
        if (levels[currentLevelIndex]) {
            const currentLevelData = levels[currentLevelIndex];
            ctx.fillStyle = 'white'; ctx.textAlign = 'left'; // Hizalama zaten sol
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

                 // Gerekenler Listesi
                 ctx.font = 'italic 16px Arial';
                 ctx.fillText(`${texts[currentLang].requirements}:`, 20, currentTextY);
                 currentTextY += 20; // Liste başlığı sonrası boşluk
                 for (const item of currentLevelData.clicks) {
                     ctx.fillText(`- ${item}`, 30, currentTextY); // Alt alta liste
                     currentTextY += 18; // Liste elemanları arası boşluk
                 }
            } else { /* Oyun Bitti durumu drawGame'de ayrıca ele alınacak */ }
            ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
        }
         // Geçici Hata/Başarı Mesajı
        if (feedbackMessage.text && Date.now() < feedbackMessage.expiryTime) { /*...*/ ctx.fillStyle=feedbackMessage.color; ctx.font='bold 28px Arial'; ctx.textAlign='center'; ctx.shadowColor = 'black'; ctx.shadowBlur = 5; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; ctx.fillText(feedbackMessage.text, canvas.width/2, 240); ctx.shadowColor = 'transparent';ctx.shadowBlur = 0;ctx.shadowOffsetX = 0;ctx.shadowOffsetY = 0; } else { feedbackMessage.text=''; }

    } else if (gameState === 'NO_ATTEMPTS' || gameState === 'GAME_OVER') {
        // Hak Bitti veya Oyun Bitti Mesajları
         ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,canvas.height/2-40,canvas.width,80);
         const title = (gameState === 'NO_ATTEMPTS') ? texts[currentLang].noAttemptsTitle : texts[currentLang].gameOverTitle;
         const message = (gameState === 'NO_ATTEMPTS') ? texts[currentLang].noAttemptsMessage : texts[currentLang].gameOverMessage;
         const titleColor = (gameState === 'NO_ATTEMPTS') ? 'red' : 'gold';
         ctx.fillStyle=titleColor; ctx.font='bold 30px Arial'; ctx.textAlign='center'; ctx.fillText(title, canvas.width/2, canvas.height/2);
         ctx.fillStyle='white'; ctx.font='18px Arial'; ctx.fillText(message, canvas.width/2, canvas.height/2+30);
    }

    // DEBUG Çizimi (Yorumlu)...
    /* ... */

    // Döngüyü devam ettir
    if (gameLoopStarted && (gameState === 'PLAYING' || gameState === 'TUTORIAL')) {
         requestAnimationFrame(drawGame);
    } else {
        // Döngüyü durdurmak için bir şey yapmaya gerek yok, tekrar çağrılmayacak.
        // Ama mesaj ekranı gösteriliyorsa belki hala çizim gerekiyordur?
        // Mesaj ekranı HTML olduğu için gerekmiyor.
    }
}


// Tıklama İşleyici Fonksiyon (Aynı)
function handleClick(event) { /* ... Önceki mesajdaki tam kod ... */
    const rect = canvas.getBoundingClientRect(); const clickX = event.clientX - rect.left; const clickY = event.clientY - rect.top;
    if (gameState === 'TUTORIAL') { const itemToClick = clickableItems[tutorialStep]; if (itemToClick && clickX>=itemToClick.x && clickX<=itemToClick.x+itemToClick.width && clickY>=itemToClick.y && clickY<=itemToClick.y+itemToClick.height) { console.log(`Öğretici: ${itemToClick.name} tıklandı.`); tutorialStep++; if (tutorialStep >= clickableItems.length) { console.log("Öğretici bitti!"); isTutorialComplete = true; gameState = 'PLAYING'; currentLevelIndex = 0; currentRecipeStep = 0; canPlay = true; if(gameLoopStarted) requestAnimationFrame(drawGame); } } else { console.log("Öğretici: Yanlış yere tıklandı."); }
    } else if (gameState === 'PLAYING') { if (!canPlay || currentLevelIndex >= levels.length - 1) return; let clickedItemName = null; for (const item of clickableItems) { if (clickX>=item.x && clickX<=item.x+item.width && clickY>=item.y && clickY<=item.y+item.height){clickedItemName=item.name;break;}} if (clickedItemName) { console.log(`Oyun: Tıklandı: ${clickedItemName}`); const currentLevelData = levels[currentLevelIndex]; const expectedClick = currentLevelData.clicks[currentRecipeStep]; if (clickedItemName === expectedClick) { console.log("Oyun: Doğru adım!"); currentRecipeStep++; if (currentRecipeStep >= currentLevelData.clicks.length) { const completedLevel = currentLevelData.level; console.log(`--- Seviye ${completedLevel} Bitti! ---`); const rewardAmountStr = getRewardForLevel(completedLevel, currentRegion); currentLevelIndex++; currentRecipeStep = 0; if (rewardAmountStr) { console.warn(`%cÖDÜL! Seviye ${completedLevel} (${rewardAmountStr})`, 'color:green;font-weight:bold;'); const isLevel10=completedLevel===10; const winMsgPart2=isLevel10?texts[currentLang].winMessagePart2_USDT:texts[currentLang].winMessagePart2_App.replace('{REWARD}',rewardAmountStr); const mailBodyBase=isLevel10?texts[currentLang].winMessageEmailBodyBase_USDT:texts[currentLang].winMessageEmailBodyBase_App; const mailBody=encodeURIComponent(mailBodyBase.replace('{LEVEL}',completedLevel).replace('{REWARD}',rewardAmountStr)); const mailSubject=encodeURIComponent(`${texts[currentLang].winMessageEmailSubjectBase}${completedLevel}${isLevel10?' - NAKIT ODUL':''}`); const mailtoLink=`mailto:${texts[currentLang].winMessageEmailAddress}?subject=${mailSubject}&body=${mailBody}`; const winHtml=`<p>${texts[currentLang].winMessagePart1}${completedLevel}${winMsgPart2}</p><hr><p>${texts[currentLang].winMessageEmailPrompt}<br><a href="${mailtoLink}" target="_blank"><b>${texts[currentLang].winMessageEmailAddress}</b></a><br>${texts[currentLang].winMessageEmailInstructions}</p>`; showMessage(texts[currentLang].winTitle,winHtml,'win'); } const nextLevelData=levels[currentLevelIndex]; if(!nextLevelData||nextLevelData.clicks.length===0){console.log("OYUN TAMAMLANDI!"); gameState='GAME_OVER';/* showMessage(texts[currentLang].gameOverTitle,texts[currentLang].gameOverMessage,'info'); */ } } } else { console.log("Oyun: Yanlış! Baştan başla."); currentRecipeStep=0; failedAttemptsToday++; saveGameData(); console.log(`Kalan hak: ${3-failedAttemptsToday}/3`); feedbackMessage={text:texts[currentLang].errorMessage,color:'red',expiryTime:Date.now()+2500}; if(failedAttemptsToday>=3){canPlay=false;console.error("Hak bitti!"); gameState='NO_ATTEMPTS';/* setTimeout(()=>{if(!canPlay){showMessage(texts[currentLang].noAttemptsTitle,texts[currentLang].noAttemptsMessage,'error');}},2550); */} } } else { console.log("Oyun: Boş alan tıklandı."); } }
}

// --- YENİ: Fare Hareketi Dinleyicisi ---
function handleMouseMove(event) {
    const rect = canvas.getBoundingClientRect();
    mouseX = Math.round(event.clientX - rect.left);
    mouseY = Math.round(event.clientY - rect.top);
}
canvas.addEventListener('mousemove', handleMouseMove);
// --- Fare Hareketi Sonu ---


// Olay dinleyicisi (Aynı)
canvas.addEventListener('click', handleClick);
// Hata logları (Aynı)
bgImage.onerror = () => { console.error("BG Yüklenemedi!"); }
logoImage.onerror = () => { console.error("Logo Yüklenemedi!"); }

// İlk veri yüklemesini yap
loadGameData();
// Oyunu başlatmayı dene (Görsellerin yüklenmesi tryStartGame içinde bekleniyor)
console.log("script.js yüklendi ve çalıştırıldı. Görseller yükleniyor...");
// Görsel yükleme olayları oyunu başlatacak (tryStartGame ile)
