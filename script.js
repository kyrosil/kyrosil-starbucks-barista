// Canvas ve Context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Görsel Nesneleri ve Yükleme Durumları
const bgImage = new Image(); const logoImage = new Image();
let bgLoaded = false, logoLoaded = false;

// --- YENİ: Oyun Durumları ---
let gameState = 'LOADING'; // 'LOADING', 'TUTORIAL', 'PLAYING', 'MESSAGE', 'GAME_OVER'
let tutorialStep = 0; // Öğreticinin hangi adımında olduğumuz
let isTutorialComplete = false; // Öğretici bitti mi?
// --- Oyun Durumları Sonu ---

// Oyun Değişkenleri
let currentLevelIndex = 0; let currentRecipeStep = 0;
let canPlay = false; // Oyun başlangıçta oynanamaz, öğretici bitince true olacak
let gameLoopStarted = false;

// Dil ve Bölge
let currentLang = 'TR'; let currentRegion = 'TR';

// Mesajlaşma Elementleri
const messageOverlay = document.getElementById('messageOverlay');
const messageTitle = document.getElementById('messageTitle');
const messageBody = document.getElementById('messageBody');
const closeButton = document.getElementById('closeButton');

// localStorage ve Günlük Hak Takibi
let failedAttemptsToday = 0; let lastPlayDate = '';
function loadGameData() { /* ... öncekiyle aynı ... */ const today=new Date().toISOString().split('T')[0];lastPlayDate=localStorage.getItem('barista_lastPlayDate')||today;failedAttemptsToday=parseInt(localStorage.getItem('barista_failedAttempts')||'0',10);if(lastPlayDate!==today){console.log("Yeni gün!");failedAttemptsToday=0;lastPlayDate=today;saveGameData();} if(failedAttemptsToday>=3){canPlay=false;console.warn("Hak bitti.");}else{canPlay=true;} console.log(`Bugünkü hata hakkı: ${3-failedAttemptsToday}/3`); }
function saveGameData() { /* ... öncekiyle aynı ... */ localStorage.setItem('barista_lastPlayDate',lastPlayDate);localStorage.setItem('barista_failedAttempts',failedAttemptsToday.toString()); }

// Geri Bildirim Mesajı Değişkenleri
let feedbackMessage = { text: '', color: 'red', expiryTime: 0 };

// Metinler Objesi (YENİ: Öğretici metinleri eklendi)
const texts = {
    TR: {
        // ... (Önceki tüm metinler aynı) ...
        level: "Seviye", order: "Sipariş", requirements: "Gerekenler", attemptsLeft: "Kalan Hata Hakkı",
        errorTitle: "Hata!", errorMessage: "Yanlış malzeme veya sıra! Baştan başla.",
        winTitle: "Tebrikler!", winMessagePart1: "Seviye ",
        winMessagePart2_App: " **{REWARD}** değerinde Starbucks Mobil Uygulaması ödülü kazandın!",
        winMessagePart2_USDT: " **NAKİT ÖDÜL (500 USDT)** kazandın!",
        winMessageEmailPrompt: "Ödülünü almak için...", winMessageEmailAddress: "giveaways@kyrosil.eu",
        winMessageEmailSubjectBase: "Kyrosil Starbucks Oyun Ödülü - Seviye ",
        winMessageEmailBodyBase_App: "Merhaba,\n\nSeviye {LEVEL} Starbucks Mobil Uygulaması ödülünü ({REWARD}) kazandım...\n(Kalanı aynı)",
        winMessageEmailBodyBase_USDT: "Merhaba,\n\nSeviye 10 Büyük Ödülünü (500 USDT) kazandım...\n(Kalanı aynı)",
        winMessageEmailInstructions: "adresine ekran görüntüsüyle mail atabilirsin.",
        gameOverTitle: "Oyun Bitti!", gameOverMessage: "Tüm seviyeleri tamamladın! Harikasın!",
        noAttemptsTitle: "Hakların Bitti!", noAttemptsMessage: "Bugünkü 3 hata yapma hakkını doldurdun...",
        closeButton: "Tamam",
        // YENİ ÖĞRETİCİ METİNLERİ
        tutorialIntro: "Oyuna Hoş Geldin! Önce sana önemli yerleri gösterelim.",
        tutorialItemIntro: "Bu: ", // Öğe adından önce gelecek
        tutorialItemAction_Default: ". Tarifte adı geçince buraya tıklayacaksın.", // Genel eylem
        tutorialItemAction_Cat: ". Bazen mola vermek gerekir! 😉", // Kediye özel
        tutorialItemAction_Register: ". Siparişi tamamlamak için buraya tıklayacaksın.", // Kasaya özel
        tutorialItemPrompt: "Devam etmek için vurgulanan alana tıkla.",
        tutorialComplete: "Harika! Artık hazırsın. Oyun başlıyor!",
        tutorialOutOfAttempts: "Önce bugünkü hakların bitmiş görünüyor. Yarın tekrar dene!" // Hak bittiğinde öğreticiyi atlamak için
    },
    EN: { /* ... İngilizce metinler (Tutorial kısımları da eklenecek) ... */ }
};

// Ödül Seviyeleri (Aynı)
const rewardTiers = { /* ... */ TR:{2:"200 TL",/*...*/10:"500 USDT"}, EU:{2:"5 USD",/*...*/10:"500 USDT"} };
function getRewardForLevel(level, region) { return rewardTiers[region]?.[level] || null; }

// Mesaj Gösterme Fonksiyonları (Aynı)
function showMessage(title, bodyHtml, type='info') { console.log(`showMessage: Tip=${type}, Başlık=${title}`); messageTitle.innerText=title; messageBody.innerHTML=bodyHtml; messageOverlay.className=`overlay message-${type}`; messageOverlay.style.display='flex'; canPlay=false; }
function hideMessage() { messageOverlay.style.display='none'; if(failedAttemptsToday<3 && currentLevelIndex<levels.length-1 && gameState !== 'TUTORIAL'){ canPlay = true; /* Öğretici bitmediyse oynanamaz */ } }
closeButton.addEventListener('click', hideMessage);

// --- Tıklanabilir Alanlar (Genişletildi - Aynı Liste) ---
const clickableItems = [ { name: 'Espresso Makinesi', x: 605, y: 300, width: 50, height: 60 }, { name: 'Yeşil Şişe', x: 300, y: 245, width: 30, height: 55 }, { name: 'Şurup Pompası', x: 340, y: 245, width: 30, height: 55 }, { name: 'Süt Kutusu', x: 450, y: 330, width: 40, height: 60 }, { name: 'Bardak Alanı', x: 540, y: 310, width: 50, height: 50 }, { name: 'Tezgahtaki Kedi', x: 470, y: 305, width: 70, height: 40 }, { name: 'Kasa', x: 700, y: 300, width: 60, height: 60 }];

// --- Seviye Tarifleri (10 Seviye + Bitiş - Aynı Liste) ---
const levels = [ {level:1,recipeName:"Espresso",clicks:['Espresso Makinesi']},{level:2,recipeName:"Caffè Latte",clicks:['Espresso Makinesi','Süt Kutusu']},{level:3,recipeName:"Vanilya Şuruplu Kahve",clicks:['Espresso Makinesi','Şurup Pompası']},{level:4,recipeName:"Kedi Molası & Espresso",clicks:['Tezgahtaki Kedi','Espresso Makinesi']},{level:5,recipeName:"Yeşil Çaylı İçecek",clicks:['Yeşil Şişe','Bardak Alanı']},{level:6,recipeName:"Şuruplu Latte",clicks:['Espresso Makinesi','Şurup Pompası','Süt Kutusu']},{level:7,recipeName:"Yeşil & Vanilya Mix",clicks:['Yeşil Şişe','Espresso Makinesi','Şurup Pompası']},{level:8,recipeName:"Tam Sipariş",clicks:['Bardak Alanı','Espresso Makinesi','Süt Kutusu','Kasa']},{level:9,recipeName:"Pati Deluxe",clicks:['Bardak Alanı','Espresso Makinesi','Yeşil Şişe','Şurup Pompası','Tezgahtaki Kedi']},{level:10,recipeName:"Barista Finali!",clicks:['Bardak Alanı','Espresso Makinesi','Yeşil Şişe','Şurup Pompası','Süt Kutusu','Tezgahtaki Kedi','Kasa']},{level:11,recipeName:"OYUN BİTTİ!",clicks:[]} ];

// Görsel yükleme olayları (GÜNCELLENDİ - Oyun durumunu ayarla)
bgImage.onload = function() { console.log("BG yüklendi"); bgLoaded=true; if(logoLoaded) tryStartGame();};
logoImage.onload = function() { console.log("Logo yüklendi"); logoLoaded=true; if(bgLoaded) tryStartGame();};

// Görsel kaynakları, logo konumu vs... (Aynı)
bgImage.src = 'original.gif'; logoImage.src = 'Starbucks_Corporation.png';
const logoWidth = 80; const logoHeight = 80; const logoX = canvas.width/2-logoWidth/2; const logoY = 20;

// --- YENİ: Oyunu Başlatmayı Deneme Fonksiyonu ---
function tryStartGame() {
    if (gameState === 'LOADING') { // Sadece yükleme durumundaysa başlatmayı dene
        console.log("Görseller yüklendi, oyun durumu kontrol ediliyor.");
        loadGameData(); // Hak kontrolü için veriyi yükle
        if (!canPlay) {
            gameState = 'NO_ATTEMPTS'; // Hak yoksa özel durum
        } else {
            gameState = 'TUTORIAL'; // Hak varsa öğreticiyi başlat
            tutorialStep = 0; // Öğretici adımını sıfırla
            isTutorialComplete = false;
        }
        // Oyun döngüsünü başlat (çizim için)
        if (!gameLoopStarted) {
            requestAnimationFrame(drawGame);
            gameLoopStarted = true;
        }
    }
}

// Ana oyun döngüsü fonksiyonu (GÜNCELLENDİ - Oyun Durumlarına Göre Çizim)
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bgLoaded) ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    // Logo ve daire çizimi... (Aynı)
    if (logoLoaded) { /* ... */ const cX=logoX+logoWidth/2;const cY=logoY+logoHeight/2;const r=logoWidth/2;ctx.fillStyle='white';ctx.beginPath();ctx.arc(cX,cY,r,0,Math.PI*2);ctx.fill();ctx.drawImage(logoImage,logoX,logoY,logoWidth,logoHeight);}

    // --- OYUN DURUMUNA GÖRE FARKLI ÇİZİM ---

    if (gameState === 'TUTORIAL') {
        // --- ÖĞRETİCİ MODU ÇİZİMİ ---
        const itemToShow = clickableItems[tutorialStep];
        if (itemToShow) {
            // Öğeyi vurgula (yanıp sönen çerçeve)
            ctx.strokeStyle = (Math.sin(Date.now() * 0.005) > 0) ? 'yellow' : 'orange'; // Renk değiştir
            ctx.lineWidth = 3;
            ctx.strokeRect(itemToShow.x - 2, itemToShow.y - 2, itemToShow.width + 4, itemToShow.height + 4); // Biraz dışına çiz

            // Açıklama metnini yaz (alta ortalı)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Yarı saydam siyah arka plan
            ctx.fillRect(0, canvas.height - 60, canvas.width, 60); // Altta bant
            ctx.fillStyle = 'white';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            let itemActionText = texts[currentLang].tutorialItemAction_Default;
            if(itemToShow.name === 'Tezgahtaki Kedi') itemActionText = texts[currentLang].tutorialItemAction_Cat;
            if(itemToShow.name === 'Kasa') itemActionText = texts[currentLang].tutorialItemAction_Register;
            ctx.fillText(texts[currentLang].tutorialItemIntro + itemToShow.name + itemActionText, canvas.width / 2, canvas.height - 35);
            ctx.font = '14px Arial';
            ctx.fillText(texts[currentLang].tutorialItemPrompt, canvas.width / 2, canvas.height - 15);
        }
        // --- ÖĞRETİCİ SONU ---

    } else if (gameState === 'PLAYING') {
        // --- NORMAL OYUN ÇİZİMİ ---
        // Kalan Hakları Yazdır
        ctx.fillStyle='white';ctx.font='bold 18px Arial';ctx.textAlign='right'; ctx.shadowColor='black';ctx.shadowBlur=3;ctx.shadowOffsetX=1;ctx.shadowOffsetY=1; ctx.fillText(`${texts[currentLang].attemptsLeft}: ${3-failedAttemptsToday}`,canvas.width-20,30); ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;

        // Seviye, Sipariş ve Gerekenler Listesi (Sol Üst)
        if (levels[currentLevelIndex]) { /* ... öncekiyle aynı ... */
            const d=levels[currentLevelIndex]; let cY=30; const lH=25; ctx.fillStyle='white'; ctx.textAlign='left'; ctx.shadowColor='black'; ctx.shadowBlur=4; ctx.shadowOffsetX=2; ctx.shadowOffsetY=2; ctx.font='bold 20px Arial'; ctx.fillText(`${texts[currentLang].level}: ${d.level}`,20,cY); cY+=lH;
            if(d.clicks.length>0){ ctx.font='18px Arial'; ctx.fillText(`${texts[currentLang].order}: ${d.recipeName}`,20,cY); cY+=lH; ctx.font='italic 16px Arial'; ctx.fillText(`${texts[currentLang].requirements}:`,20,cY); cY+=lH*0.8; for(const item of d.clicks){ ctx.fillText(`- ${item}`,30,cY); cY+=lH*0.7; } } else { ctx.font='bold 28px Arial'; ctx.fillText(texts[currentLang].gameOverTitle,20,cY); } ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;
        }
        // Geçici Hata/Başarı Mesajı (feedbackMessage ile)
        if (feedbackMessage.text && Date.now() < feedbackMessage.expiryTime) { ctx.fillStyle=feedbackMessage.color; ctx.font='bold 28px Arial'; ctx.textAlign='center'; ctx.shadowColor='black'; ctx.shadowBlur=5; ctx.shadowOffsetX=2; ctx.shadowOffsetY=2; ctx.fillText(feedbackMessage.text, canvas.width/2, 240); ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0; } else { feedbackMessage.text=''; }
        // --- NORMAL OYUN SONU ---

    } else if (gameState === 'NO_ATTEMPTS') {
         // Hak bitti mesajı (HTML yerine Canvas'ta)
         ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,canvas.height/2-40,canvas.width,80);
         ctx.fillStyle='red'; ctx.font='bold 30px Arial'; ctx.textAlign='center';
         ctx.fillText(texts[currentLang].noAttemptsTitle, canvas.width/2, canvas.height/2);
         ctx.fillStyle='white'; ctx.font='18px Arial';
         ctx.fillText(texts[currentLang].noAttemptsMessage, canvas.width/2, canvas.height/2+30);
    } else if (gameState === 'GAME_OVER') {
        // Oyun Bitti Mesajı (HTML yerine Canvas'ta)
        ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,canvas.height/2-40,canvas.width,80);
         ctx.fillStyle='gold'; ctx.font='bold 30px Arial'; ctx.textAlign='center';
         ctx.fillText(texts[currentLang].gameOverTitle, canvas.width/2, canvas.height/2);
         ctx.fillStyle='white'; ctx.font='18px Arial';
         ctx.fillText(texts[currentLang].gameOverMessage, canvas.width/2, canvas.height/2+30);
    }

    // DEBUG Çizimi (Yorumlu)...
    /* ... */

    // Döngüyü devam ettir (Eğer oyun durumu devam etmeyi gerektiriyorsa)
    if (gameState === 'PLAYING' || gameState === 'TUTORIAL') {
        requestAnimationFrame(drawGame);
    }
}


// Oyun döngüsünü başlatan fonksiyon (Artık tryStartGame çağırıyor)
// function startGameLoop() { ... ESKİSİ SİLİNDİ ... }

// Tıklama İşleyici Fonksiyon (GÜNCELLENDİ - Oyun Durumlarına Göre)
function handleClick(event) {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    if (gameState === 'TUTORIAL') {
        // --- ÖĞRETİCİ TIKLAMA MANTIĞI ---
        const itemToClick = clickableItems[tutorialStep];
        if (itemToClick &&
            clickX >= itemToClick.x && clickX <= itemToClick.x + itemToClick.width &&
            clickY >= itemToClick.y && clickY <= itemToClick.y + itemToClick.height)
        {
            console.log(`Öğretici: ${itemToClick.name} tıklandı.`);
            tutorialStep++; // Sonraki adıma geç
            if (tutorialStep >= clickableItems.length) { // Öğretici bitti mi?
                console.log("Öğretici bitti!");
                isTutorialComplete = true;
                gameState = 'PLAYING'; // Normal oyuna geç
                currentLevelIndex = 0; // Seviye 1'den başla
                currentRecipeStep = 0;
                canPlay = true; // Oynamaya izin ver (hak kontrolü zaten yapıldı)
                // Ana oyun döngüsünü tekrar başlat (zaten çalışıyor olmalı ama garanti olsun)
                if(gameLoopStarted) requestAnimationFrame(drawGame);

            } else {
                // Sonraki adımı hemen çizmek için (opsiyonel, loop zaten çizecek)
                 // drawGame();
            }
        } else {
            console.log("Öğretici: Yanlış yere tıklandı.");
        }
        // --- ÖĞRETİCİ TIKLAMA SONU ---

    } else if (gameState === 'PLAYING') {
        // --- NORMAL OYUN TIKLAMA MANTIĞI ---
        if (!canPlay || currentLevelIndex >= levels.length - 1) return; // Hak yoksa veya oyun bittiyse çık

        let clickedItemName = null;
        for (const item of clickableItems) { if (clickX>=item.x && clickX<=item.x+item.width && clickY>=item.y && clickY<=item.y+item.height){clickedItemName=item.name;break;}}

        if (clickedItemName) {
            console.log(`Oyun: Tıklandı: ${clickedItemName}`);
            const currentLevelData = levels[currentLevelIndex];
            const expectedClick = currentLevelData.clicks[currentRecipeStep];

            if (clickedItemName === expectedClick) { // DOĞRU TIKLAMA
                console.log("Oyun: Doğru adım!"); currentRecipeStep++;
                // feedbackMessage = { text: 'Doğru!', color: 'lime', expiryTime: Date.now() + 1000 }; // İsteğe bağlı doğru mesajı

                if (currentRecipeStep >= currentLevelData.clicks.length) { // Seviye Bitti
                    const completedLevel = currentLevelData.level; console.log(`--- Seviye ${completedLevel} Bitti! ---`);
                    const rewardAmountStr = getRewardForLevel(completedLevel, currentRegion);
                    currentLevelIndex++; currentRecipeStep = 0;

                    if (rewardAmountStr) { // Ödül varsa
                        console.warn(`%cÖDÜL KAZANILDI! Seviye ${completedLevel} (${rewardAmountStr})`, 'color: green; font-weight: bold;');
                        const isLevel10 = completedLevel === 10; const winMsgPart2 = isLevel10 ? texts[currentLang].winMessagePart2_USDT : texts[currentLang].winMessagePart2_App.replace('{REWARD}', rewardAmountStr); const mailBodyBase = isLevel10 ? texts[currentLang].winMessageEmailBodyBase_USDT : texts[currentLang].winMessageEmailBodyBase_App; const mailBody = encodeURIComponent(mailBodyBase.replace('{LEVEL}', completedLevel).replace('{REWARD}', rewardAmountStr)); const mailSubject = encodeURIComponent(`${texts[currentLang].winMessageEmailSubjectBase}${completedLevel}${isLevel10 ? ' - NAKIT ODUL' : ''}`); const mailtoLink = `mailto:${texts[currentLang].winMessageEmailAddress}?subject=${mailSubject}&body=${mailBody}`; const winHtml = `<p>${texts[currentLang].winMessagePart1}${completedLevel}${winMsgPart2}</p><hr><p>${texts[currentLang].winMessageEmailPrompt}<br><a href="${mailtoLink}" target="_blank"><b>${texts[currentLang].winMessageEmailAddress}</b></a><br>${texts[currentLang].winMessageEmailInstructions}</p>`;
                        showMessage(texts[currentLang].winTitle, winHtml, 'win');
                    }

                    // Oyun Bitti mi kontrol et
                    const nextLevelData = levels[currentLevelIndex];
                    if (!nextLevelData || nextLevelData.clicks.length === 0) {
                         console.log("OYUN TAMAMLANDI!");
                         gameState = 'GAME_OVER'; // Oyun bitti durumuna geç
                         // Oyun bitti mesajını drawGame çizecek.
                         // showMessage(texts[currentLang].gameOverTitle, texts[currentLang].gameOverMessage, 'info'); // İstersek HTML ile de gösterebiliriz
                    }
                }
            } else { // YANLIŞ TIKLAMA
                console.log("Oyun: Yanlış malzeme/sıra! Baştan başla."); currentRecipeStep = 0; failedAttemptsToday++; saveGameData(); console.log(`Kalan hak: ${3 - failedAttemptsToday} / 3`);
                feedbackMessage = { text: texts[currentLang].errorMessage, color: 'red', expiryTime: Date.now() + 2500 }; // Canvas'a hata mesajı

                if (failedAttemptsToday >= 3) { // Hak bitti mi?
                    canPlay = false; console.error("Hak bitti!");
                    gameState = 'NO_ATTEMPTS'; // Hak bitti durumuna geç
                    // Hak bitti mesajını drawGame çizecek.
                    // showMessage(texts[currentLang].noAttemptsTitle, texts[currentLang].noAttemptsMessage, 'error'); // HTML ile de gösterebiliriz
                }
            }
        } else { console.log("Oyun: Boş alan tıklandı."); }
        // --- NORMAL OYUN TIKLAMA SONU ---
    }
}


// Olay dinleyicisi (Aynı)
canvas.addEventListener('click', handleClick);
// Hata logları (Aynı)
bgImage.onerror = () => { console.error("BG Yüklenemedi!"); }
logoImage.onerror = () => { console.error("Logo Yüklenemedi!"); }

// İlk veri yüklemesini yap ve oyunu başlatmayı dene (Artık tryStartGame çağrılıyor)
// loadGameData(); // tryStartGame içinde çağrılıyor
// startGameLoop(); // tryStartGame içinde çağrılıyor
console.log("script.js yüklendi ve çalıştırıldı. Görseller yükleniyor...");
// Görsel yükleme olayları oyunu başlatacak (tryStartGame ile)
