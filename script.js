// --- Global Değişkenler ---
// Canvas & Context (DOM Yüklendikten sonra atanacak)
let canvas, ctx;
// Giriş Ekranı Elementleri (DOM Yüklendikten sonra atanacak)
let startScreenDiv, gameTitleEl, gameSloganEl, langTRButton, langENButton, regionSelect, regionLabelEl, rewardTitleEl, rewardListEl, startButton, gsmInput, kvkkCheck, gsmError, gsmLabel, kvkkLabel;
// Mesajlaşma Elementleri (DOM Yüklendikten sonra atanacak)
let messageOverlay, messageTitle, messageBody, closeButton;
// Görsel Nesneleri ve Yükleme Durumları
const bgImage = new Image(); const logoImage = new Image();
let bgLoaded = false, logoLoaded = false;
// Oyun Durumları ('LOADING', 'START_SCREEN', 'TUTORIAL', 'PLAYING', 'MESSAGE', 'GAME_OVER', 'NO_ATTEMPTS')
let gameState = 'LOADING'; let tutorialStep = 0; let isTutorialComplete = false;
// Oyun Değişkenleri
let currentLevelIndex = 0; let currentRecipeStep = 0; let canPlay = false; let gameLoopStarted = false; let currentShuffledRecipe = [];
// Dil ve Bölge
let currentLang = 'TR'; let currentRegion = 'TR';
// localStorage ve Günlük Hak Takibi
let failedAttemptsToday = 0; let lastPlayDate = '';
// Geri Bildirim Mesajı Değişkenleri (Canvas için)
let feedbackMessage = { text: '', color: 'red', expiryTime: 0 };

// --- Metinler Objesi ---
const texts = {
    TR: {
        gameTitle: "Kyrosil Starbucks Barista", slogan: "En Hızlı ve Dikkatli Barista Ol! Malzemelere doğru sırada tıklayarak siparişleri hazırla, ödülleri kap!", regionLabel: "Bölge:",
        rewardTitle: "Seviye Ödülleri", startButton: "Oyuna Başla!",
        level: "Seviye", order: "Sipariş", requirements: "Gerekenler", attemptsLeft: "Kalan Hata Hakkı",
        errorTitle: "Hata!", errorMessage: "Yanlış malzeme veya sıra! Baştan başla.", winTitle: "Tebrikler!", winMessagePart1: "Seviye ",
        winMessagePart2_App: " **{REWARD}** değerinde Starbucks Mobil Uygulaması ödülü kazandın!", winMessagePart2_USDT: " **NAKİT ÖDÜL (500 USDT)** kazandın!",
        winMessageEmailPrompt: "Ödülünü almak için aşağıdaki linke tıklayarak veya manuel olarak", winMessageEmailAddress: "giveaways@kyrosil.eu", winMessageEmailSubjectBase: "Kyrosil Starbucks Oyun Ödülü - Seviye ",
        winMessageEmailBodyBase_App: "Merhaba,\n\nSeviye {LEVEL} Starbucks Mobil Uygulaması ödülünü ({REWARD}) kazandım.\nUygulama kodumu bekliyorum.\n\nEkran görüntüm ektedir.\n\nTeşekkürler.",
        winMessageEmailBodyBase_USDT: "Merhaba,\n\nSeviye 10 Büyük Ödülünü (500 USDT) kazandım.\nÖdül gönderimi için detayları bekliyorum.\n\nEkran görüntüm ektedir.\n\nTeşekkürler.",
        winMessageEmailInstructions: "adresine bu ekranın görüntüsüyle birlikte mail atabilirsin.",
        gameOverTitle: "Oyun Bitti!", gameOverMessage: "Tüm seviyeleri tamamladın! Harikasın!",
        noAttemptsTitle: "Hakların Bitti!", noAttemptsMessage: "Bugünkü 3 hata yapma hakkını doldurdun. Yarın tekrar oynamak için geri gel!",
        closeButton: "Tamam",
        tutorialIntro:"Oyuna Hoş Geldin! İşte Tıklama Alanları:", tutorialItemIntro:"Bu: ", tutorialItemAction_Default:". Tarifte adı geçince buraya tıklayacaksın.", tutorialItemAction_Cat:". Önemli bir mola!", tutorialItemAction_Register:". Siparişi bitirmek için.", tutorialItemAction_OrderSlip:". Siparişi almak için.", tutorialItemAction_PriceList:". Fiyatları görmek için.", tutorialItemAction_Fridge: ". Soğuk malzemeler burada.", tutorialItemAction_Dessert: ". Tatlılar burada.", tutorialItemPrompt:"Devam etmek için vurgulanan alana tıkla.", tutorialComplete:"Harika! Başlıyoruz!", tutorialOutOfAttempts:"Hakların bittiği için bugünlük bu kadar!",
        mixedOrderWarning: "Not: Malzemeler karışık, doğru sırada hazırla!", priceCheckWarning: "Müşteri fiyatı da sordu!",
        gsmLabel: "Starbucks Mobile Kayıtlı GSM No:", gsmPlaceholder: "Numaranızı Girin (Kontrol Edilmez)",
        kvkkLabel: " KVKK kapsamında numaramın sadece ödül aktarımı için göstermelik olarak istendiğini anladım, onaylıyorum.", // Güncellendi
        gsmError: "Lütfen numara girip kutuyu işaretleyin.",
        rewardTypeApp: "(Starbucks App Kodu)", rewardTypeCash: "(NAKİT ÖDÜL!)"
    },
    EN: {
        gameTitle: "Kyrosil Starbucks Barista", slogan: "Be the Best Barista! Prepare orders by clicking ingredients in the correct sequence and grab rewards!", regionLabel: "Region:",
        rewardTitle: "Level Rewards", startButton: "Start Game!",
        level: "Level", order: "Order", requirements: "Required", attemptsLeft: "Attempts Left",
        errorTitle: "Error!", errorMessage: "Wrong item or sequence! Start over.", winTitle: "Congratulations!", winMessagePart1: "You won the Level ",
        winMessagePart2_App: " Starbucks Mobile App reward ({REWARD})!", winMessagePart2_USDT: " CASH PRIZE (500 USDT)!",
        winMessageEmailPrompt: "To claim your reward, click the link below or manually email", winMessageEmailAddress: "giveaways@kyrosil.eu", winMessageEmailSubjectBase: "Kyrosil Starbucks Game Reward - Level ",
        winMessageEmailBodyBase_App: "Hello,\n\nI won the Level {LEVEL} Starbucks Mobile App reward ({REWARD})...", winMessageEmailBodyBase_USDT: "Hello,\n\nI won the Level 10 Grand Prize (500 USDT)...",
        winMessageEmailInstructions: "with a screenshot.",
        gameOverTitle: "Game Over!", gameOverMessage: "You completed all levels! Awesome!",
        noAttemptsTitle: "No Attempts Left!", noAttemptsMessage: "You've used your 3 attempts for today. Come back tomorrow!",
        closeButton: "OK", tutorialIntro:"Welcome! Let's show you the interaction areas:", tutorialItemIntro:"This is the: ", tutorialItemAction_Default:". Click here when it's in the recipe.", /*...*/ tutorialComplete:"Great! Let's begin!", tutorialOutOfAttempts:"You are out of attempts for today!",
        mixedOrderWarning: "Note: Ingredients listed randomly, prepare in correct order!", priceCheckWarning: "Customer asked for the price!",
        gsmLabel: "Starbucks Mobile Registered GSM No:", gsmPlaceholder: "Enter phone number (Not verified)",
        kvkkLabel: " I agree my number is requested symbolically for reward transfer under GDPR & Privacy Policy (Applies to USA users selecting Europe too).", // GDPR Metni
        gsmError: "Please enter a number and check the box.",
        rewardTypeApp: "(Starbucks App Code)", rewardTypeCash: "(CASH PRIZE!)"
     }
};

// --- Temel Fonksiyonlar ---
function loadGameData(){const today=new Date().toISOString().split('T')[0];lastPlayDate=localStorage.getItem('barista_lastPlayDate')||today;failedAttemptsToday=parseInt(localStorage.getItem('barista_failedAttempts')||'0',10);if(lastPlayDate!==today){console.log("Yeni gün!");failedAttemptsToday=0;lastPlayDate=today;saveGameData();} if(failedAttemptsToday>=3){canPlay=false;console.warn("Hak bitti.");}else{canPlay=true;} console.log(`Bugünkü hata hakkı: ${3-failedAttemptsToday}/3`);}
function saveGameData(){localStorage.setItem('barista_lastPlayDate',lastPlayDate);localStorage.setItem('barista_failedAttempts',failedAttemptsToday.toString());}
const rewardTiers={TR:{2:"200 TL",4:"600 TL",6:"2.000 TL",8:"5.000 TL",10:"500 USDT"},EU:{2:"5 USD",4:"15 USD",6:"40 USD",8:"100 USD",10:"500 USDT"}};
function getRewardForLevel(level,region){return rewardTiers[region]?.[level]||null;}
function showMessage(title,bodyHtml,type='info'){console.log(`showMessage: Tip=${type}, Başlık=${title}`);if(messageOverlay&&messageTitle&&messageBody){messageTitle.innerText=title;messageBody.innerHTML=bodyHtml;messageOverlay.className=`overlay message-${type}`;messageOverlay.style.display='flex';canPlay=false;}else{console.error("Mesaj kutusu elementleri bulunamadı!");}}
function hideMessage(){if(messageOverlay){messageOverlay.style.display='none';if(failedAttemptsToday<3&&currentLevelIndex<levels.length-1&&gameState==='PLAYING'){canPlay=true;}}else{console.error("Mesaj kutusu overlay elementi bulunamadı!");}}
function shuffleArray(array){let ci=array.length,ri;const na=array.slice();while(ci!==0){ri=Math.floor(Math.random()*ci);ci--;[na[ci],na[ri]]=[na[ri],na[ci]];}return na;}

// --- Tıklanabilir Alanlar ve Seviyeler ---
const clickableItems=[{name:'Espresso Makinesi',x:605,y:300,width:50,height:60},{name:'Yeşil Şişe',x:300,y:245,width:30,height:55},{name:'Şurup Pompası',x:340,y:245,width:30,height:55},{name:'Süt Kutusu',x:390,y:245,width:30,height:55},{name:'Bardak Alanı',x:330,y:357,width:50,height:50},{name:'Tezgahtaki Kedi',x:442,y:352,width:70,height:40},{name:'Kasa',x:700,y:300,width:60,height:60},{name:'Sipariş Fişi',x:780,y:240,width:15,height:30},{name:'Buzdolabı',x:445,y:305,width:70,height:40},{name:'Tatlı Dolabı',x:700,y:450,width:80,height:60},{name:'Fiyat Listesi',x:500,y:80,width:100,height:200}];
const levels=[{level:1,recipeName:"İlk Sipariş (Espresso)",clicks:['Sipariş Fişi','Espresso Makinesi']},{level:2,recipeName:"Caffè Latte (Fiyatlı)",clicks:['Espresso Makinesi','Süt Kutusu','Fiyat Listesi']},{level:3,recipeName:"Vanilya Şur. Soğuk Kahve",clicks:['Bardak Alanı','Buzdolabı','Espresso Makinesi','Şurup Pompası']},{level:4,recipeName:"Kedi Molası & Yeşil Çay",clicks:['Tezgahtaki Kedi','Yeşil Şişe','Bardak Alanı']},{level:5,recipeName:"Yoğun Talep",clicks:['Sipariş Fişi','Espresso Makinesi','Süt Kutusu','Espresso Makinesi']},{level:6,recipeName:"Hesaplı Şuruplu Latte",clicks:['Bardak Alanı','Espresso Makinesi','Şurup Pompası','Süt Kutusu','Fiyat Listesi','Kasa']},{level:7,recipeName:"Yeşil & Vanilya & Buz",clicks:['Yeşil Şişe','Şurup Pompası','Buzdolabı','Bardak Alanı']},{level:8,recipeName:"Tam Menü (Basit)",clicks:['Sipariş Fişi','Bardak Alanı','Espresso Makinesi','Süt Kutusu','Tatlı Dolabı','Kasa']},{level:9,recipeName:"Pati Deluxe Özel",clicks:['Bardak Alanı','Buzdolabı','Yeşil Şişe','Şurup Pompası','Espresso Makinesi','Tezgahtaki Kedi','Kasa']},{level:10,recipeName:"USTALIK ESERİ!",clicks:['Sipariş Fişi','Fiyat Listesi','Bardak Alanı','Buzdolabı','Yeşil Şişe','Şurup Pompası','Espresso Makinesi','Süt Kutusu','Tatlı Dolabı','Tezgahtaki Kedi','Kasa']},{level:11,recipeName:"OYUN BİTTİ!",clicks:[]}];

// --- Ana Oyun Fonksiyonları ---

// Metin Güncelleme Fonksiyonu
function updateTexts(lang, region) {
    try {
        console.log(`updateTexts: Lang=${lang}, Region=${region}`);
        const t = texts[lang];
        if (!t) { console.error("Metinler bulunamadı:", lang); return; }

        document.title = t.gameTitle || "Barista Game";
        if(gameTitleEl) gameTitleEl.innerText = t.gameTitle; else console.warn("gameTitleEl bulunamadı");
        if(gameSloganEl) gameSloganEl.innerText = t.slogan; else console.warn("gameSloganEl bulunamadı");
        if(regionLabelEl) regionLabelEl.innerText = t.regionLabel; else console.warn("regionLabelEl bulunamadı");
        if(rewardTitleEl) rewardTitleEl.innerText = t.rewardTitle; else console.warn("rewardTitleEl bulunamadı");
        if(startButton) startButton.innerText = t.startButton; else console.warn("startButton bulunamadı");
        if(closeButton) closeButton.innerText = t.closeButton; else console.warn("closeButton bulunamadı");
        if(gsmLabel) gsmLabel.innerText = t.gsmLabel; else console.warn("gsmLabel bulunamadı");
        if(kvkkLabel) kvkkLabel.innerHTML = t.kvkkLabel; else console.warn("kvkkLabel bulunamadı");
        if(gsmError) gsmError.innerText = t.gsmError; else console.warn("gsmError bulunamadı");
        if(gsmInput && t.gsmPlaceholder) gsmInput.placeholder = t.gsmPlaceholder; else if(!gsmInput) console.warn("gsmInput bulunamadı");

        // Detaylı Ödül Listesi
        if(rewardListEl) {
            rewardListEl.innerHTML = ''; const currentRewards = rewardTiers[region];
            if (currentRewards) {
                const levelsToShow = [2, 4, 6, 8, 10];
                levelsToShow.forEach(level => {
                    const reward = currentRewards[level];
                    if (reward) {
                        const li = document.createElement('li');
                        const isCash = level === 10; const rewardType = isCash ? t.rewardTypeCash : t.rewardTypeApp;
                        li.innerHTML = `<strong>${t.level} ${level}:</strong> <span>${reward}</span> <span class="prize-type">${rewardType}</span>`;
                        rewardListEl.appendChild(li);
                    }
                });
            } else { console.warn("Bölge için ödül bulunamadı:", region); }
        } else { console.warn("rewardListEl bulunamadı"); }

        if(langTRButton) langTRButton.classList.toggle('active', lang === 'TR'); else console.warn("langTRButton bulunamadı");
        if(langENButton) langENButton.classList.toggle('active', lang === 'EN'); else console.warn("langENButton bulunamadı");
        document.documentElement.lang = lang.toLowerCase();
        console.log(`Metinler ${lang} (${region}) olarak güncellendi.`);
    } catch (error) { console.error("updateTexts hatası:", error); }
}

// Başlat Butonu Durum Kontrolü
function checkStartButtonState() {
    try {
        const numberEntered = gsmInput && gsmInput.value.trim().length > 0; // Boş olmasın yeterli
        const kvkkValid = kvkkCheck && kvkkCheck.checked;
        console.log(`checkStartButtonState: numberEntered=${numberEntered}, kvkkValid=${kvkkValid}`);

        if (startButton) { // Buton varsa işlem yap
             if (numberEntered && kvkkValid) {
                 startButton.disabled = false;
                 if(gsmError) gsmError.style.display = 'none';
                 console.log(`checkStartButtonState: Aktif!`);
             } else {
                 startButton.disabled = true;
                 console.log(`checkStartButtonState: Pasif!`);
                 if ( gsmError && (!numberEntered || !kvkkValid) && ( (gsmInput && gsmInput.value.length > 0) || (kvkkCheck && kvkkCheck.checked) ) ) {
                     gsmError.innerText = texts[currentLang]?.gsmError || "Lütfen numara girip kutuyu işaretleyin."; // Dil yüklenmemişse diye fallback
                     gsmError.style.display = 'block';
                 } else if (gsmError) {
                     gsmError.style.display = 'none';
                 }
             }
        } else { console.warn("Başlat butonu check sırasında bulunamadı!"); }
    } catch (error) { console.error("checkStartButtonState hatası:", error); }
}

// Oyunu Başlatmayı Deneme Fonksiyonu
function tryStartGame() {
    try {
        console.log("tryStartGame çağrıldı, hak kontrolü yapılıyor.");
        loadGameData();
        if (!canPlay) {
            gameState = 'NO_ATTEMPTS';
            showMessage(texts[currentLang].noAttemptsTitle, texts[currentLang].noAttemptsMessage, 'error'); // HTML mesajını göster
            if (gameLoopStarted) requestAnimationFrame(drawGame); // Eğer döngü başlamışsa çizimi güncelle
        } else {
            gameState = 'TUTORIAL'; tutorialStep = 0; isTutorialComplete = false;
            if (levels[currentLevelIndex]?.clicks.length > 0) { // İlk seviye için karıştır
                 currentShuffledRecipe = shuffleArray(levels[currentLevelIndex].clicks);
            } else { currentShuffledRecipe = []; }
            if (!gameLoopStarted) {
                 console.log("Oyun döngüsü başlatılıyor..."); gameLoopStarted = true;
            }
            requestAnimationFrame(drawGame); // Her durumda çizimi/döngüyü başlat/devam et
        }
    } catch (error) { console.error("tryStartGame hatası:", error); }
}


// Oyunu Başlatma Fonksiyonu
function startGame() {
    try {
        console.log("startGame fonksiyonu ÇAĞRILDI!");
        checkStartButtonState();
        if (startButton.disabled) { console.warn("Başlatma engellendi."); gsmError.style.display='block'; return; }
        console.log("Başlatma Kontrolleri Geçildi.");
        if(startScreenDiv) startScreenDiv.style.display = 'none'; else console.error("startScreenDiv bulunamadı!");
        if(canvas) canvas.style.display = 'block'; else console.error("canvas bulunamadı!");
        tryStartGame();
    } catch (error) { console.error("startGame hatası:", error); }
}

// Ana oyun döngüsü fonksiyonu
function drawGame() {
    try { // Ana çizim döngüsünü de try-catch içine alalım
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (bgLoaded) ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        if (logoLoaded) { const cX=logoX+logoWidth/2;const cY=logoY+logoHeight/2;const r=logoWidth/2;ctx.fillStyle='white';ctx.beginPath();ctx.arc(cX,cY,r,0,Math.PI*2);ctx.fill();ctx.drawImage(logoImage,logoX,logoY,logoWidth,logoHeight);}

        let currentTextY = 30;
        ctx.fillStyle='white';ctx.font='bold 16px Arial';ctx.textAlign='left'; ctx.shadowColor='black';ctx.shadowBlur=3;ctx.shadowOffsetX=1;ctx.shadowOffsetY=1; ctx.fillText(`${texts[currentLang].attemptsLeft}: ${3-failedAttemptsToday}`,20,currentTextY); currentTextY+=25; ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;

        if (gameState === 'TUTORIAL') {
            const itemToShow=clickableItems[tutorialStep]; if(itemToShow){ ctx.strokeStyle=(Math.sin(Date.now()*0.005)>0)?'yellow':'orange';ctx.lineWidth=3;ctx.strokeRect(itemToShow.x-2,itemToShow.y-2,itemToShow.width+4,itemToShow.height+4); ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,canvas.height-60,canvas.width,60); ctx.fillStyle='white';ctx.font='bold 16px Arial';ctx.textAlign='center'; let iAT=texts[currentLang].tutorialItemAction_Default; if(itemToShow.name==='Tezgahtaki Kedi')iAT=texts[currentLang].tutorialItemAction_Cat; if(itemToShow.name==='Kasa')iAT=texts[currentLang].tutorialItemAction_Register; if(itemToShow.name==='Sipariş Fişi')iAT=texts[currentLang].tutorialItemAction_OrderSlip; if(itemToShow.name==='Fiyat Listesi')iAT=texts[currentLang].tutorialItemAction_PriceList; if(itemToShow.name==='Buzdolabı')iAT=texts[currentLang].tutorialItemAction_Fridge; if(itemToShow.name==='Tatlı Dolabı')iAT=texts[currentLang].tutorialItemAction_Dessert; ctx.fillText(texts[currentLang].tutorialItemIntro+itemToShow.name+iAT,canvas.width/2,canvas.height-35); ctx.font='14px Arial'; ctx.fillText(texts[currentLang].tutorialItemPrompt,canvas.width/2,canvas.height-15); ctx.textAlign='left';}
        } else if (gameState === 'PLAYING') {
             if (levels[currentLevelIndex]) { const d=levels[currentLevelIndex]; ctx.fillStyle='white';ctx.textAlign='left'; ctx.shadowColor='black';ctx.shadowBlur=4;ctx.shadowOffsetX=2;ctx.shadowOffsetY=2; ctx.font='bold 20px Arial'; ctx.fillText(`${texts[currentLang].level}: ${d.level}`,20,currentTextY); currentTextY+=25; if(d.clicks.length>0){ ctx.font='18px Arial'; ctx.fillText(`${texts[currentLang].order}: ${d.recipeName}`,20,currentTextY); currentTextY+=25; ctx.font='italic 16px Arial'; ctx.fillText(`${texts[currentLang].requirements}:`,20,currentTextY); currentTextY+=20; const sC=currentShuffledRecipe; for(const i of sC){ctx.fillText(`- ${i}`,30,currentTextY); currentTextY+=18;} currentTextY+=5;ctx.fillStyle='orange'; ctx.font='bold 14px Arial'; ctx.fillText(texts[currentLang].mixedOrderWarning,20,currentTextY); currentTextY+=20; if(d.clicks.includes('Fiyat Listesi')){ctx.fillStyle='lightblue';ctx.fillText(texts[currentLang].priceCheckWarning,20,currentTextY);currentTextY+=20;} } ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;}
            if (feedbackMessage.text && Date.now() < feedbackMessage.expiryTime) { ctx.fillStyle=feedbackMessage.color;ctx.font='bold 28px Arial';ctx.textAlign='center';ctx.shadowColor='black';ctx.shadowBlur=5;ctx.shadowOffsetX=2;ctx.shadowOffsetY=2;ctx.fillText(feedbackMessage.text,canvas.width/2,canvas.height-30); ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;ctx.textAlign='left';} else { feedbackMessage.text='';}
        } else if (gameState === 'NO_ATTEMPTS' || gameState === 'GAME_OVER') {
             // Hak bitti / Oyun bitti durumları (HTML overlay ile gösteriliyor, burada çizmeye gerek yok)
             // İstersek burada da çizebiliriz ama HTML overlay daha mantıklı
             console.log("Oyun Bitti veya Hak Kalmadı durumu, çizim atlanıyor (Mesaj Overlay aktif olmalı).");
        }

        // Döngüyü devam ettir
        if (gameLoopStarted && (gameState === 'PLAYING' || gameState === 'TUTORIAL')) {
             requestAnimationFrame(drawGame);
        }
    } catch (e) { console.error("Draw HATA:",e); gameLoopStarted = false; } // Hata olursa döngüyü durdur
}


// Tıklama İşleyici Fonksiyon (Aynı)
function handleClick(event) { /* ... Önceki mesajdaki tam kod ... */ }


// Olay dinleyicileri (DOM Hazır Olduğunda Ekleniyor)
// canvas.addEventListener('click', handleClick); // DOMContentLoaded içine taşındı
// bgImage.onerror = ... // DOMContentLoaded dışına taşındı
// logoImage.onerror = ... // DOMContentLoaded dışına taşındı

// --- Başlangıç Ayarları (DOMContentLoaded) ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Yüklendi.");

    // Element referanslarını burada al (Hata olasılığını azaltır)
    canvas = document.getElementById('gameCanvas');
    ctx = canvas?.getContext('2d'); // Canvas bulunamazsa ctx null olur
    startScreenDiv=document.getElementById('startScreen'); gameTitleEl=document.getElementById('gameTitle'); gameSloganEl=document.getElementById('gameSlogan'); langTRButton=document.getElementById('langTR'); langENButton=document.getElementById('langEN'); regionSelect=document.getElementById('regionSelect'); regionLabelEl=document.getElementById('regionLabel'); rewardTitleEl=document.getElementById('rewardTitle'); rewardListEl=document.getElementById('rewardList'); startButton=document.getElementById('startButton'); gsmInput=document.getElementById('gsmInput'); kvkkCheck=document.getElementById('kvkkCheck'); gsmError=document.getElementById('gsmError'); gsmLabel=document.getElementById('gsmLabel'); kvkkLabel=document.getElementById('kvkkLabel');
    messageOverlay=document.getElementById('messageOverlay'); messageTitle=document.getElementById('messageTitle'); messageBody=document.getElementById('messageBody'); closeButton=document.getElementById('closeButton');

    // Kritik elementler yoksa hata ver ve dur
    if (!canvas || !ctx || !startScreenDiv || !startButton || !gsmInput || !kvkkCheck || !messageOverlay || !closeButton || !langTRButton || !langENButton || !regionSelect || !rewardListEl) {
        console.error("HATA: Gerekli HTML elementlerinden biri veya birkaçı sayfada bulunamadı! Lütfen index.html dosyasını ve ID'leri kontrol edin.");
        alert("Kritik bir hata oluştu! Gerekli elementler bulunamadı.");
        return;
    }

    // Olay Dinleyicilerini Ekle
    langTRButton.addEventListener('click', () => { if(currentLang!=='TR'){currentLang='TR';updateTexts(currentLang, currentRegion);}});
    langENButton.addEventListener('click', () => { if(currentLang!=='EN'){currentLang='EN';updateTexts(currentLang, currentRegion);}});
    regionSelect.addEventListener('change', (event) => { currentRegion=event.target.value; console.log("Bölge seçildi:",currentRegion); updateTexts(currentLang, currentRegion); });
    startButton.addEventListener('click', startGame);
    gsmInput.addEventListener('input', checkStartButtonState);
    kvkkCheck.addEventListener('change', checkStartButtonState);
    closeButton.addEventListener('click', hideMessage);
    canvas.addEventListener('click', handleClick);

    // Başlangıç Ayarları
    // localStorage'dan tercihleri oku (varsa)
    currentLang = localStorage.getItem('barista_lang') || 'TR';
    currentRegion = localStorage.getItem('barista_region') || 'TR';
    regionSelect.value = currentRegion; // Dropdown'ı ayarla
    langTRButton.classList.toggle('active', currentLang === 'TR'); // Butonları ayarla
    langENButton.classList.toggle('active', currentLang === 'EN'); // Butonları ayarla

    loadGameData();
    updateTexts(currentLang, currentRegion); // Metinleri ve ÖDÜL LİSTESİNİ ayarla
    checkStartButtonState(); // Butonun ilk durumunu ayarla

    // Görsel yüklemelerini başlat
    console.log("Görseller yükleniyor...");
    bgImage.src = 'original.gif';
    logoImage.src = 'Starbucks_Corporation.png';
});

// Hata logları (Globalde)
bgImage.onerror = () => { console.error("BG Yüklenemedi!"); }
logoImage.onerror = () => { console.error("Logo Yüklenemedi!"); }

console.log("script.js dosyası okundu."); // Scriptin sonuna ulaşıldığını gösterir
