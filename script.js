// --- Global Değişkenler ---
let canvas, ctx;
let startScreenDiv, gameTitleEl, gameSloganEl, langTRButton, langENButton, regionSelect, regionLabelEl, rewardTitleEl, rewardListEl, startButton, gsmInput, kvkkCheck, gsmError, gsmLabel, kvkkLabel;
let messageOverlay, messageTitle, messageBody, closeButton;
const bgImage = new Image(); const logoImage = new Image();
let bgLoaded = false, logoLoaded = false;
let gameState = 'LOADING';
let tutorialStep = 0; let isTutorialComplete = false;
let currentLevelIndex = 0; let currentRecipeStep = 0; let canPlay = false; let gameLoopStarted = false; let currentShuffledRecipe = [];
let currentLang = 'TR'; let currentRegion = 'TR';
let failedAttemptsToday = 0; let lastPlayDate = '';
let feedbackMessage = { text: '', color: 'red', expiryTime: 0 };
const logoWidth = 80; const logoHeight = 80; let logoX = 0; const logoY = 20;

// --- Sabit Veriler (texts, rewardTiers, clickableItems, levels - Önceki koddan tam halleri) ---
const texts = { TR: { gameTitle:"Kyrosil Starbucks Barista", slogan:"En İyi Barista Ol! Siparişleri doğru sırayla hazırla, ödülleri kap!", regionLabel:"Bölge:", rewardTitle:"Seviye Ödülleri", startButton:"Oyuna Başla!", level:"Seviye", order:"Sipariş", requirements:"Gerekenler", attemptsLeft:"Kalan Hata Hakkı", errorTitle:"Hata!", errorMessage:"Yanlış malzeme veya sıra! Baştan başla.", winTitle:"Tebrikler!", winMessagePart1:"Seviye ", winMessagePart2_App:" **{REWARD}** değerinde Starbucks Mobil Uygulaması ödülü kazandın!", winMessagePart2_USDT:" **NAKİT ÖDÜL (500 USDT)** kazandın!", winMessageEmailPrompt:"Ödülünü almak için aşağıdaki linke tıklayarak veya manuel olarak", winMessageEmailAddress:"giveaways@kyrosil.eu", winMessageEmailSubjectBase:"Kyrosil Starbucks Oyun Ödülü - Seviye ", winMessageEmailBodyBase_App:"Merhaba,\n\nSeviye {LEVEL} Starbucks Mobil Uygulaması ödülünü ({REWARD}) kazandım.\nUygulama kodumu bekliyorum.\n\nEkran görüntüm ektedir.\n\nTeşekkürler.", winMessageEmailBodyBase_USDT:"Merhaba,\n\nSeviye 10 Büyük Ödülünü (500 USDT) kazandım.\nÖdül gönderimi için detayları bekliyorum.\n\nEkran görüntüm ektedir.\n\nTeşekkürler.", winMessageEmailInstructions:"adresine bu ekranın görüntüsüyle birlikte mail atabilirsin.", gameOverTitle:"Oyun Bitti!", gameOverMessage:"Tüm seviyeleri tamamladın! Harikasın!", noAttemptsTitle:"Hakların Bitti!", noAttemptsMessage:"Bugünkü 3 hata yapma hakkını doldurdun. Yarın tekrar oynamak için geri gel!", closeButton:"Tamam", tutorialIntro:"Oyuna Hoş Geldin! İşte Tıklama Alanları:", tutorialItemIntro:"Bu: ", tutorialItemAction_Default:". Tarifte adı geçince buraya tıklayacaksın.", tutorialItemAction_Cat:". Önemli bir mola!", tutorialItemAction_Register:". Siparişi bitirmek için.", tutorialItemAction_OrderSlip:". Siparişi almak için.", tutorialItemAction_PriceList:". Fiyatları görmek için.", tutorialItemAction_Fridge:". Soğuk malzemeler burada.", tutorialItemAction_Dessert:". Tatlılar burada.", tutorialItemPrompt:"Devam etmek için vurgulanan alana tıkla.", tutorialComplete:"Harika! Başlıyoruz!", tutorialOutOfAttempts:"Hakların bittiği için bugünlük bu kadar!", mixedOrderWarning:"Not: Malzemeler karışık, doğru sırada hazırla!", priceCheckWarning:"Müşteri fiyatı da sordu!", gsmLabel:"Starbucks Mobile Kayıtlı GSM No:", gsmPlaceholder:"Numaranızı Girin", kvkkLabel:" KVKK kapsamında numaramın sadece ödül aktarımı için göstermelik olarak istendiğini anladım, onaylıyorum.", gsmError:"Lütfen numara girip kutuyu işaretleyin.", rewardTypeApp:"(Starbucks App Kodu)", rewardTypeCash:"(NAKİT ÖDÜL!)" }, EN: { gameTitle:"Kyrosil Starbucks Barista", slogan:"Be the Best Barista! Prepare orders correctly and grab rewards!", regionLabel:"Region:", rewardTitle:"Level Rewards", startButton:"Start Game!", level:"Level", order:"Order", requirements:"Required", attemptsLeft:"Attempts Left", errorTitle:"Error!", errorMessage:"Wrong item or sequence! Start over.", winTitle:"Congratulations!", winMessagePart1:"You won the Level ", winMessagePart2_App:" Starbucks Mobile App reward ({REWARD})!", winMessagePart2_USDT:" CASH PRIZE (500 USDT)!", winMessageEmailPrompt:"To claim your reward, click the link below or manually email", winMessageEmailAddress:"giveaways@kyrosil.eu", winMessageEmailSubjectBase:"Kyrosil Starbucks Game Reward - Level ", winMessageEmailBodyBase_App:"Hello,\n\nI won the Level {LEVEL} Starbucks Mobile App reward ({REWARD})...", winMessageEmailBodyBase_USDT:"Hello,\n\nI won the Level 10 Grand Prize (500 USDT)...", winMessageEmailInstructions:"with a screenshot.", gameOverTitle:"Game Over!", gameOverMessage:"You completed all levels! Awesome!", noAttemptsTitle:"No Attempts Left!", noAttemptsMessage:"You've used your 3 attempts for today. Come back tomorrow!", closeButton:"OK", tutorialIntro:"Welcome! Let's show you the interaction areas:", tutorialItemIntro:"This is the: ", tutorialItemAction_Default:". Click here when it's in the recipe.", tutorialItemAction_Cat:". An important break!", tutorialItemAction_Register:". To finish the order.", tutorialItemAction_OrderSlip:". To get the order.", tutorialItemAction_PriceList:". To check prices.", tutorialItemAction_Fridge:". Cold items are here.", tutorialItemAction_Dessert:". Desserts are here.", tutorialItemPrompt:"Click the highlighted area to continue.", tutorialComplete:"Great! Let's begin!", tutorialOutOfAttempts:"You are out of attempts for today!", mixedOrderWarning:"Note: Ingredients listed randomly, prepare in correct order!", priceCheckWarning:"Customer asked for the price!", gsmLabel:"Starbucks Mobile Registered GSM No:", gsmPlaceholder:"Enter your phone number", kvkkLabel:" I agree my number is requested symbolically for reward transfer under GDPR & Privacy Policy (Applies to USA users selecting Europe too).", gsmError:"Please enter a number and check the box.", rewardTypeApp:"(Starbucks App Code)", rewardTypeCash:"(CASH PRIZE!)" } };
const rewardTiers = { TR:{2:"200 TL",4:"600 TL",6:"2.000 TL",8:"5.000 TL",10:"500 USDT"}, EU:{2:"5 USD",4:"15 USD",6:"40 USD",8:"100 USD",10:"500 USDT"} };
const clickableItems = [{name:'Espresso Makinesi',x:605,y:300,width:50,height:60},{name:'Yeşil Şişe',x:300,y:245,width:30,height:55},{name:'Şurup Pompası',x:340,y:245,width:30,height:55},{name:'Süt Kutusu',x:390,y:245,width:30,height:55},{name:'Bardak Alanı',x:330,y:357,width:50,height:50},{name:'Tezgahtaki Kedi',x:442,y:352,width:70,height:40},{name:'Kasa',x:700,y:300,width:60,height:60},{name:'Sipariş Fişi',x:780,y:240,width:15,height:30},{name:'Buzdolabı',x:445,y:305,width:70,height:40},{name:'Tatlı Dolabı',x:700,y:450,width:80,height:60},{name:'Fiyat Listesi',x:500,y:80,width:100,height:200}];
const levels = [{level:1,recipeName:"İlk Sipariş (Espresso)",clicks:['Sipariş Fişi','Espresso Makinesi']},{level:2,recipeName:"Caffè Latte (Fiyatlı)",clicks:['Espresso Makinesi','Süt Kutusu','Fiyat Listesi']},{level:3,recipeName:"Vanilya Şur. Soğuk Kahve",clicks:['Bardak Alanı','Buzdolabı','Espresso Makinesi','Şurup Pompası']},{level:4,recipeName:"Kedi Molası & Yeşil Çay",clicks:['Tezgahtaki Kedi','Yeşil Şişe','Bardak Alanı']},{level:5,recipeName:"Yoğun Talep",clicks:['Sipariş Fişi','Espresso Makinesi','Süt Kutusu','Espresso Makinesi']},{level:6,recipeName:"Hesaplı Şuruplu Latte",clicks:['Bardak Alanı','Espresso Makinesi','Şurup Pompası','Süt Kutusu','Fiyat Listesi','Kasa']},{level:7,recipeName:"Yeşil & Vanilya & Buz",clicks:['Yeşil Şişe','Şurup Pompası','Buzdolabı','Bardak Alanı']},{level:8,recipeName:"Tam Menü (Basit)",clicks:['Sipariş Fişi','Bardak Alanı','Espresso Makinesi','Süt Kutusu','Tatlı Dolabı','Kasa']},{level:9,recipeName:"Pati Deluxe Özel",clicks:['Bardak Alanı','Buzdolabı','Yeşil Şişe','Şurup Pompası','Espresso Makinesi','Tezgahtaki Kedi','Kasa']},{level:10,recipeName:"USTALIK ESERİ!",clicks:['Sipariş Fişi','Fiyat Listesi','Bardak Alanı','Buzdolabı','Yeşil Şişe','Şurup Pompası','Espresso Makinesi','Süt Kutusu','Tatlı Dolabı','Tezgahtaki Kedi','Kasa']},{level:11,recipeName:"OYUN BİTTİ!",clicks:[]}];

// --- Yardımcı Fonksiyon Tanımları ---
function loadGameData(){try{const today=new Date().toISOString().split('T')[0];lastPlayDate=localStorage.getItem('barista_lastPlayDate')||today;failedAttemptsToday=parseInt(localStorage.getItem('barista_failedAttempts')||'0',10);if(lastPlayDate!==today){console.log("Yeni gün!");failedAttemptsToday=0;lastPlayDate=today;saveGameData();} if(failedAttemptsToday>=3){canPlay=false;console.warn("Hak bitti (loadGameData).");}else{canPlay=true;} console.log(`Bugünkü hata hakkı: ${3-failedAttemptsToday}/3`);}catch(e){console.error("loadGameData Hatası:",e);canPlay=false;}}
function saveGameData(){try{localStorage.setItem('barista_lastPlayDate',lastPlayDate);localStorage.setItem('barista_failedAttempts',failedAttemptsToday.toString());}catch(e){console.error("saveGameData Hatası:",e);}}
function getRewardForLevel(level, region) { return rewardTiers[region]?.[level] || null; }
function showMessage(title, bodyHtml, type='info'){ try{ console.log(`showMessage Çağrıldı: Tip=${type}, Başlık=${title}`); if(!messageOverlay||!messageTitle||!messageBody) throw new Error("Mesaj elementleri bulunamadı!"); messageTitle.innerText=title; messageBody.innerHTML=bodyHtml; messageOverlay.className=`overlay message-${type}`; messageOverlay.style.display='flex'; console.log("Mesaj gösterildi, canPlay=false yapılıyor."); canPlay=false; } catch(e) { console.error("showMessage Hatası:", e); }}
function hideMessage(){ try{ if(!messageOverlay) throw new Error("Mesaj overlay elementi bulunamadı!"); messageOverlay.style.display='none'; if(failedAttemptsToday<3 && currentLevelIndex<levels.length-1 && (gameState==='PLAYING' || gameState==='TUTORIAL')){canPlay=true; console.log("Mesaj kapatıldı, canPlay=true yapıldı.");} else { console.log("Mesaj kapatıldı, canPlay false kalıyor veya oyun bitti.");} } catch(e) { console.error("hideMessage Hatası:", e); }}
function shuffleArray(array){ let ci=array.length,ri;const na=array.slice();while(ci!==0){ri=Math.floor(Math.random()*ci);ci--;[na[ci],na[ri]]=[na[ri],na[ci]];} return na; }

function updateTexts(lang, region) { /* ... Önceki koddan kopyala (Detaylı ödül listesi dahil) ... */ }
function checkStartButtonState() { /* ... Önceki koddan kopyala (Hane kontrolsüz) ... */ }

function checkAssetsLoaded(){
    console.log(`checkAssetsLoaded: bgLoaded=${bgLoaded}, logoLoaded=${logoLoaded}, gameState=${gameState}`);
    if (bgLoaded && logoLoaded && gameState === 'LOADING') {
        console.log("Görseller yüklendi, başlangıç ekranına geçiliyor.");
        gameState = 'START_SCREEN';
        // DOMContentLoaded içinde çağrıldığı için burada tekrar çağırmaya gerek yok
        // loadGameData(); updateTexts(currentLang,currentRegion); checkStartButtonState();
    }
}

function tryStartGame() {
    try { console.log("tryStartGame çağrıldı, hak kontrolü."); loadGameData();
        if (!canPlay) { gameState = 'NO_ATTEMPTS'; showMessage(texts[currentLang]?.noAttemptsTitle||"Hata", texts[currentLang]?.noAttemptsMessage||"Hak bitti.", 'error'); }
        else { gameState = 'TUTORIAL'; tutorialStep = 0; isTutorialComplete = false;
            if (levels[currentLevelIndex]?.clicks.length > 0) { currentShuffledRecipe = shuffleArray(levels[currentLevelIndex].clicks); } else { currentShuffledRecipe = []; }
            console.log("Oyun durumu TUTORIAL olarak ayarlandı. Döngü başlatılıyor...");
            if (!gameLoopStarted) { gameLoopStarted = true; }
            requestAnimationFrame(drawGame); // Döngüyü başlat/devam et
        }
    } catch(e){ console.error("tryStartGame hatası:",e); alert("Oyunu başlatırken hata!"); }
}

function startGame() {
    try { console.log("startGame ÇAĞRILDI!"); checkStartButtonState(); if (startButton.disabled) { console.warn("Başlatma engellendi."); gsmError.style.display='block'; return; } console.log("Başlatma Kontrolleri Geçildi.");
        if(startScreenDiv) startScreenDiv.style.display = 'none'; else throw new Error("startScreenDiv null!");
        if(canvas) canvas.style.display = 'block'; else throw new Error("canvas null!");
        tryStartGame();
    } catch (e) { console.error("startGame Hatası:", e); alert("Oyun başlatılamadı!"); }
}

// --- Ana Oyun Çizim Döngüsü (DAHA GARANTİCİ) ---
function drawGame() {
    // Önce context'in varlığından emin olalım
    if (!ctx) {
        console.error("drawGame: CTX geçerli değil, çizim yapılamıyor.");
        // Belki burada döngüyü durdurmak daha iyi?
        gameLoopStarted = false;
        return;
    }

    try {
        // 1. Ekranı Temizle
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 2. Arka Planı Çiz (Yüklenmişse ve çizilebiliyorsa)
        if (bgLoaded && bgImage.complete && bgImage.naturalWidth > 0) {
            ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        } else {
            // Arka plan yoksa veya yüklenemediyse, en azından bir zemin çizelim
            ctx.fillStyle = '#E0E0E0'; // Daha açık gri
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            console.warn("Arka plan çizilemedi veya yükleniyor...");
        }

        // 3. Logoyu Çiz (Yüklenmişse)
        if (logoLoaded && logoImage.complete && logoImage.naturalWidth > 0) {
            logoX = canvas.width / 2 - logoWidth / 2;
            const cX=logoX+logoWidth/2; const cY=logoY+logoHeight/2; const r=logoWidth/2;
            ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(cX,cY,r,0,Math.PI*2); ctx.fill();
            ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
        } else {
             console.warn("Logo çizilemedi veya yükleniyor...");
        }

        // --- Diğer tüm çizimler burada (State'e göre) ---
        let currentTextY = 30;
        // Kalan Haklar
        ctx.fillStyle='black'; ctx.font='bold 16px Arial'; ctx.textAlign='left'; ctx.shadowColor='white'; ctx.shadowBlur=2; ctx.shadowOffsetX=1; ctx.shadowOffsetY=1;
        ctx.fillText(`${texts[currentLang]?.attemptsLeft||'Attempts Left'}: ${3-failedAttemptsToday}`, 20, currentTextY); cTY+=25;
        ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;

        if (gameState === 'TUTORIAL') { /* ... Öğretici çizimi ... */ }
        else if (gameState === 'PLAYING') { /* ... Oyun ekranı çizimi (Seviye, Sipariş, Karışık Gerekenler, Uyarılar)... */ }
        // Hak bitti / Oyun bitti mesajları artık HTML overlay ile

        // Geçici feedback mesajı çizimi (Canvas'a)
        if (feedbackMessage.text && Date.now() < feedbackMessage.expiryTime) { /*...*/ ctx.fillStyle=feedbackMessage.color;ctx.font='bold 28px Arial';ctx.textAlign='center';ctx.shadowColor='black';ctx.shadowBlur=5;ctx.shadowOffsetX=2;ctx.shadowOffsetY=2;ctx.fillText(feedbackMessage.text,canvas.width/2,canvas.height-30); ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;ctx.textAlign='left';} else { feedbackMessage.text='';}

        // --- Çizimler Sonu ---

        // Döngüyü devam ettir
        if (gameLoopStarted && (gameState === 'PLAYING' || gameState === 'TUTORIAL')) {
             requestAnimationFrame(drawGame);
        } else {
             console.log("Oyun döngüsü durdu/devam etmiyor. State:", gameState);
             gameLoopStarted = false; // Durduğunda flag'i sıfırla
        }

    } catch (e) {
        console.error("Draw HATA:", e);
        gameLoopStarted = false; // Hata olursa döngüyü durdur
        alert("Oyun çizimi sırasında kritik hata! Konsola bakın.");
    }
}

// Tıklama İşleyici Fonksiyon
function handleClick(event) { /* ... Önceki koddan kopyala ... */ }

// --- Başlangıç Kodu (DOMContentLoaded) ---
document.addEventListener('DOMContentLoaded', () => { /* ... Önceki koddan kopyala ... */ });

// Hata logları
bgImage.onerror = () => { console.error("!!! BG Yüklenemedi! Kontrol edin: ./original.gif"); bgLoaded = false; checkAssetsLoaded(); } // false yapalım
logoImage.onerror = () => { console.error("!!! Logo Yüklenemedi!"); logoLoaded = true; checkAssetsLoaded(); } // Logo olmasa da olur?

console.log("script.js dosyası tamamen okundu.");
