// Canvas elementini ve 2D çizim bağlamını alalım
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Görsel nesnelerini oluşturalım
const bgImage = new Image();
const logoImage = new Image();

// Görsellerin yüklenip yüklenmediğini takip edelim
let bgLoaded = false;
let logoLoaded = false;

// Oyun Durumu Değişkenleri
let currentLevelIndex = 0;
let currentRecipeStep = 0;
let canPlay = true;
let gameLoopStarted = false;

// Dil ve Bölge
let currentLang = 'TR';
let currentRegion = 'TR';

// Mesajlaşma için HTML Element Referansları
const messageOverlay = document.getElementById('messageOverlay');
const messageTitle = document.getElementById('messageTitle');
const messageBody = document.getElementById('messageBody');
const closeButton = document.getElementById('closeButton');

// localStorage ve Günlük Hak Takibi
let failedAttemptsToday = 0;
let lastPlayDate = '';

function loadGameData() { /* ... öncekiyle aynı ... */ const today=new Date().toISOString().split('T')[0];lastPlayDate=localStorage.getItem('barista_lastPlayDate')||today;failedAttemptsToday=parseInt(localStorage.getItem('barista_failedAttempts')||'0',10);if(lastPlayDate!==today){console.log("Yeni gün!");failedAttemptsToday=0;lastPlayDate=today;saveGameData();} if(failedAttemptsToday>=3){canPlay=false;console.warn("Hak bitti.");}else{canPlay=true;} console.log(`Bugünkü hata hakkı: ${3-failedAttemptsToday}/3`); }
function saveGameData() { /* ... öncekiyle aynı ... */ localStorage.setItem('barista_lastPlayDate',lastPlayDate);localStorage.setItem('barista_failedAttempts',failedAttemptsToday.toString()); }

// Geri Bildirim Mesajı Değişkenleri
let feedbackMessage = { text: '', color: 'red', expiryTime: 0 };

// Metinler Objesi (Aynı)
const texts = { TR: { level:"Seviye", order:"Sipariş", requirements:"Gerekenler", attemptsLeft:"Kalan Hata Hakkı", errorTitle:"Hata!", errorMessage:"Yanlış malzeme veya sıra! Baştan başla.", winTitle:"Tebrikler!", winMessagePart1:"Seviye ", winMessagePart2_App:" **{REWARD}** değerinde Starbucks Mobil Uygulaması ödülü kazandın!", winMessagePart2_USDT:" **NAKİT ÖDÜL (500 USDT)** kazandın!", winMessageEmailPrompt:"Ödülünü almak için aşağıdaki linke tıklayarak veya manuel olarak", winMessageEmailAddress:"giveaways@kyrosil.eu", winMessageEmailSubjectBase:"Kyrosil Starbucks Oyun Ödülü - Seviye ", winMessageEmailBodyBase_App:"Merhaba,\n\nSeviye {LEVEL} Starbucks Mobil Uygulaması ödülünü ({REWARD}) kazandım.\nUygulama kodumu bekliyorum.\n\nEkran görüntüm ektedir.\n\nTeşekkürler.", winMessageEmailBodyBase_USDT:"Merhaba,\n\nSeviye 10 Büyük Ödülünü (500 USDT) kazandım.\nÖdül gönderimi için detayları bekliyorum.\n\nEkran görüntüm ektedir.\n\nTeşekkürler.", winMessageEmailInstructions:"adresine bu ekranın görüntüsüyle birlikte mail atabilirsin.", gameOverTitle:"Oyun Bitti!", gameOverMessage:"Tüm seviyeleri tamamladın! Harikasın!", noAttemptsTitle:"Hakların Bitti!", noAttemptsMessage:"Bugünkü 3 hata yapma hakkını doldurdun. Yarın tekrar oynamak için geri gel!", closeButton:"Tamam" }, EN: { /*...*/ } };

// Ödül Seviyeleri (Aynı)
const rewardTiers = { TR:{2:"200 TL",4:"600 TL",6:"2.000 TL",8:"5.000 TL",10:"500 USDT"}, EU:{2:"5 USD",4:"15 USD",6:"40 USD",8:"100 USD",10:"500 USDT"} };
function getRewardForLevel(level, region) { return rewardTiers[region]?.[level] || null; }

// Mesaj Gösterme Fonksiyonları (Aynı)
function showMessage(title, bodyHtml, type='info') { console.log(`showMessage: Tip=${type}, Başlık=${title}`); messageTitle.innerText=title; messageBody.innerHTML=bodyHtml; messageOverlay.className=`overlay message-${type}`; messageOverlay.style.display='flex'; canPlay=false; }
function hideMessage() { messageOverlay.style.display='none'; if(failedAttemptsToday<3 && currentLevelIndex<levels.length-1){canPlay=true;} }
closeButton.addEventListener('click', hideMessage);

// --- YENİ: Tıklanabilir Alanlar (Genişletildi) ---
const clickableItems = [
    { name: 'Espresso Makinesi', x: 605, y: 300, width: 50, height: 60 }, // Ana makine alanı
    { name: 'Yeşil Şişe',        x: 300, y: 245, width: 30, height: 55 }, // Soldan 2. şişe
    { name: 'Şurup Pompası',     x: 340, y: 245, width: 30, height: 55 }, // Soldan 3. şişe (Yeşilin yanı)
    { name: 'Süt Kutusu',        x: 450, y: 330, width: 40, height: 60 }, // Tezgahın ortasına yakın hayali kutu
    { name: 'Bardak Alanı',      x: 540, y: 310, width: 50, height: 50 }, // Makinenin solu, bardağın konacağı yer
    { name: 'Tezgahtaki Kedi',   x: 470, y: 305, width: 70, height: 40 }, // Turuncu kedi alanı
    { name: 'Kasa',              x: 700, y: 300, width: 60, height: 60 }  // En sağdaki kasa/ekran alanı
];

// --- YENİ: Seviye Tarifleri (10 Seviye + Bitiş) ---
const levels = [
    { level: 1, recipeName: "Espresso",                 clicks: ['Espresso Makinesi'] },
    { level: 2, recipeName: "Caffè Latte",              clicks: ['Espresso Makinesi', 'Süt Kutusu'] }, // ÖDÜL 1
    { level: 3, recipeName: "Vanilya Şuruplu Kahve",    clicks: ['Espresso Makinesi', 'Şurup Pompası'] },
    { level: 4, recipeName: "Kedi Molası & Espresso",   clicks: ['Tezgahtaki Kedi', 'Espresso Makinesi'] }, // ÖDÜL 2
    { level: 5, recipeName: "Yeşil Çaylı İçecek",       clicks: ['Yeşil Şişe', 'Bardak Alanı'] }, // Farklı mekanik
    { level: 6, recipeName: "Şuruplu Latte",            clicks: ['Espresso Makinesi', 'Şurup Pompası', 'Süt Kutusu'] }, // ÖDÜL 3
    { level: 7, recipeName: "Yeşil & Vanilya Mix",      clicks: ['Yeşil Şişe', 'Espresso Makinesi', 'Şurup Pompası'] },
    { level: 8, recipeName: "Tam Sipariş",              clicks: ['Bardak Alanı', 'Espresso Makinesi', 'Süt Kutusu', 'Kasa'] }, // ÖDÜL 4
    { level: 9, recipeName: "Pati Deluxe",              clicks: ['Bardak Alanı', 'Espresso Makinesi', 'Yeşil Şişe', 'Şurup Pompası', 'Tezgahtaki Kedi'] },
    { level: 10, recipeName: "Barista Finali!",         clicks: ['Bardak Alanı', 'Espresso Makinesi', 'Yeşil Şişe', 'Şurup Pompası', 'Süt Kutusu', 'Tezgahtaki Kedi', 'Kasa']}, // ÖDÜL 5 (USDT)
    { level: 11, recipeName: "OYUN BİTTİ!",             clicks: [] } // Oyun sonu işaretçisi
];
// ---------------------------------

// Görsel yükleme olayları... (Aynı)
bgImage.onload = function() { console.log("BG yüklendi"); bgLoaded=true; if(logoLoaded) startGameLoop();};
logoImage.onload = function() { console.log("Logo yüklendi"); logoLoaded=true; if(bgLoaded) startGameLoop();};
bgImage.src = 'original.gif'; logoImage.src = 'Starbucks_Corporation.png';
const logoWidth = 80; const logoHeight = 80; const logoX = canvas.width/2-logoWidth/2; const logoY = 20;

// Ana oyun döngüsü fonksiyonu (GÜNCELLENDİ - Yazı yerleşimi)
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bgLoaded) ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    if (logoLoaded) { /* ... logo ve daire ... */ const cX=logoX+logoWidth/2;const cY=logoY+logoHeight/2;const r=logoWidth/2;ctx.fillStyle='white';ctx.beginPath();ctx.arc(cX,cY,r,0,Math.PI*2);ctx.fill();ctx.drawImage(logoImage,logoX,logoY,logoWidth,logoHeight);}

    // --- Sağ Üst: Kalan Haklar (Aynı) ---
    ctx.fillStyle='white';ctx.font='bold 18px Arial';ctx.textAlign='right'; ctx.shadowColor='black';ctx.shadowBlur=3;ctx.shadowOffsetX=1;ctx.shadowOffsetY=1; ctx.fillText(`${texts[currentLang].attemptsLeft}: ${3-failedAttemptsToday}`,canvas.width-20,30); ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;

    // --- Sol Üst: Seviye, Sipariş ve Gerekenler ---
     if (levels[currentLevelIndex] && canPlay) {
        const currentLevelData = levels[currentLevelIndex];
        let currentY = 30; // Yazıların başlangıç Y konumu
        const lineHeight = 25; // Satır yüksekliği

        ctx.fillStyle = 'white'; ctx.textAlign = 'left'; // SOLA HİZALA
        ctx.shadowColor = 'black'; ctx.shadowBlur = 4; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2;

        // Seviye
        ctx.font = 'bold 20px Arial';
        ctx.fillText(`${texts[currentLang].level}: ${currentLevelData.level}`, 20, currentY);
        currentY += lineHeight;

        if (currentLevelData.clicks.length > 0) { // Oyun bitmediyse
             // Sipariş Adı
             ctx.font = '18px Arial';
             ctx.fillText(`${texts[currentLang].order}: ${currentLevelData.recipeName}`, 20, currentY);
             currentY += lineHeight;

             // Gerekenler Listesi
             ctx.font = 'italic 16px Arial';
             ctx.fillText(`${texts[currentLang].requirements}:`, 20, currentY);
             currentY += lineHeight * 0.8; // Liste başlığı sonrası biraz daha az boşluk
             for (const item of currentLevelData.clicks) {
                 ctx.fillText(`- ${item}`, 30, currentY); // Alt alta liste şeklinde
                 currentY += lineHeight * 0.7; // Liste elemanları arası boşluk
             }
        } else { // Oyun Bitti ise
             ctx.font = 'bold 28px Arial';
             ctx.fillText(texts[currentLang].gameOverTitle, 20, currentY); // Sol üste yaz
        }
        ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
     }
     // --- Yazıların Sonu ---


    // Geçici feedback mesajı çizimi (drawGame içinden kaldırıldı, HTML overlay'de)
    // if (feedbackMessage.text && Date.now() < feedbackMessage.expiryTime) { /* ... */ } else { feedbackMessage.text = ''; }

    // Hak Bitti mesajı (HTML overlay'e taşındı)
    // if (!canPlay && ...) { /* ... */ }

    // DEBUG Çizimi (Tıklanabilir alanları görmek için yorumu kaldır)
    /*
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'; ctx.lineWidth = 2;
    for (const item of clickableItems) { ctx.strokeRect(item.x, item.y, item.width, item.height); }
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)'; // Logo merkezi için
    ctx.strokeRect(logoX + logoWidth / 2 - 2, logoY + logoHeight / 2 - 2, 4, 4);
    */

    requestAnimationFrame(drawGame);
}

// Oyun döngüsünü başlatan fonksiyon (Aynı)
function startGameLoop() { if(!gameLoopStarted){loadGameData();if(!canPlay){showMessage(texts[currentLang].noAttemptsTitle,texts[currentLang].noAttemptsMessage,'error');}else{console.log("Oyun döngüsü...");gameLoopStarted=true;drawGame();}}else if(canPlay){requestAnimationFrame(drawGame);}}

// Tıklama İşleyici Fonksiyon (Aynı mantık, sadece daha çok seviye var)
function handleClick(event) { /* ... Önceki mesajdaki TAM KOD ile aynı mantık ... */
    if (!canPlay || currentLevelIndex >= levels.length - 1 || messageOverlay.style.display === 'flex') return;
    const rect = canvas.getBoundingClientRect(); const clickX = event.clientX - rect.left; const clickY = event.clientY - rect.top;
    let clickedItemName = null; for (const item of clickableItems) { if (clickX>=item.x && clickX<=item.x+item.width && clickY>=item.y && clickY<=item.y+item.height){clickedItemName=item.name;break;}}
    if (clickedItemName) { console.log(`Tıklandı: ${clickedItemName}`); const currentLevelData = levels[currentLevelIndex]; const expectedClick = currentLevelData.clicks[currentRecipeStep];
        if (clickedItemName === expectedClick) { console.log("Doğru adım!"); currentRecipeStep++;
            if (currentRecipeStep >= currentLevelData.clicks.length) { const completedLevel = currentLevelData.level; console.log(`--- Seviye ${completedLevel} Bitti! ---`); const rewardAmountStr = getRewardForLevel(completedLevel, currentRegion); currentLevelIndex++; currentRecipeStep = 0;
                if (rewardAmountStr) { console.warn(`%cÖDÜL KAZANILDI! Seviye ${completedLevel} (${rewardAmountStr})`, 'color: green; font-weight: bold;'); const isLevel10 = completedLevel === 10; const winMsgPart2 = isLevel10 ? texts[currentLang].winMessagePart2_USDT : texts[currentLang].winMessagePart2_App.replace('{REWARD}', rewardAmountStr); const mailBodyBase = isLevel10 ? texts[currentLang].winMessageEmailBodyBase_USDT : texts[currentLang].winMessageEmailBodyBase_App; const mailBody = encodeURIComponent(mailBodyBase.replace('{LEVEL}', completedLevel).replace('{REWARD}', rewardAmountStr)); const mailSubject = encodeURIComponent(`${texts[currentLang].winMessageEmailSubjectBase}${completedLevel}${isLevel10 ? ' - NAKIT ODUL' : ''}`); const mailtoLink = `mailto:${texts[currentLang].winMessageEmailAddress}?subject=${mailSubject}&body=${mailBody}`; const winHtml = `<p>${texts[currentLang].winMessagePart1}${completedLevel}${winMsgPart2}</p><hr><p>${texts[currentLang].winMessageEmailPrompt}<br><a href="${mailtoLink}" target="_blank"><b>${texts[currentLang].winMessageEmailAddress}</b></a><br>${texts[currentLang].winMessageEmailInstructions}</p>`; showMessage(texts[currentLang].winTitle, winHtml, 'win'); }
                 const nextLevelData = levels[currentLevelIndex]; if (!nextLevelData || nextLevelData.clicks.length === 0) { console.log("OYUN TAMAMLANDI!"); canPlay = false; setTimeout(()=>{ showMessage(texts[currentLang].gameOverTitle, texts[currentLang].gameOverMessage, 'info'); }, 500); /* Ödül mesajı kapandıktan sonra göster */ }
            } else { /* Doğru adım mesajı? */ }
        } else { console.log("Yanlış! Baştan başla."); currentRecipeStep = 0; failedAttemptsToday++; saveGameData(); console.log(`Kalan hak: ${3 - failedAttemptsToday} / 3`);
            showMessage(texts[currentLang].errorTitle, texts[currentLang].errorMessage, 'error'); setTimeout(hideMessage, 2500);
            if (failedAttemptsToday >= 3) { canPlay = false; console.error("Hak bitti!"); setTimeout(() => { if (!canPlay) { showMessage(texts[currentLang].noAttemptsTitle, texts[currentLang].noAttemptsMessage, 'error'); } }, 2550); }
        }
    } else { console.log("Boş alan tıklandı."); }
}


// Olay dinleyicisi... (Aynı)
canvas.addEventListener('click', handleClick);
// Hata logları... (Aynı)
bgImage.onerror = () => { console.error("BG Yüklenemedi!"); }
logoImage.onerror = () => { console.error("Logo Yüklenemedi!"); }

// İlk veri yüklemesini yap ve oyunu başlatmayı dene
loadGameData();
startGameLoop();
console.log("script.js yüklendi ve çalıştırıldı.");
