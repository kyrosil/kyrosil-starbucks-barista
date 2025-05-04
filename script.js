// --- Global Değişken Tanımları ---
let canvas, ctx;
let startScreenDiv, gameTitleEl, gameSloganEl, langTRButton, langENButton, regionSelect, regionLabelEl, rewardTitleEl, rewardListEl, startButton, gsmInput, kvkkCheck, gsmError, gsmLabel, kvkkLabel;
let messageOverlay, messageTitle, messageBody, closeButton;
const bgImage = new Image(); const logoImage = new Image();
let bgLoaded = false, logoLoaded = false;
let gameState = 'LOADING';
let tutorialStep = 0; let isTutorialComplete = false;
let currentLevelIndex = 0; let currentRecipeStep = 0; let canPlay = true;
let gameLoopStarted = false; let currentShuffledRecipe = [];
let currentLang = 'TR'; let currentRegion = 'TR';
let failedAttemptsToday = 0; let lastPlayDate = '';
let feedbackMessage = { text: '', color: 'red', expiryTime: 0 };
const logoWidth = 80; const logoHeight = 80; let logoX = 0; const logoY = 20;

// --- Sabit Veriler ---
const texts = { TR:{gameTitle:"Kyrosil Starbucks Barista",slogan:"En İyi Barista Ol! Siparişleri doğru sırayla hazırla, ödülleri kap!",regionLabel:"Bölge:",rewardTitle:"Seviye Ödülleri",startButton:"Oyuna Başla!",level:"Seviye",order:"Sipariş",requirements:"Gerekenler",attemptsLeft:"Kalan Hata Hakkı",errorTitle:"Hata!",errorMessage:"Yanlış malzeme veya sıra! Baştan başla.",winTitle:"Tebrikler!",winMessagePart1:"Seviye ",winMessagePart2_App:" **{REWARD}** değerinde Starbucks Mobil Uygulaması ödülü kazandın!",winMessagePart2_USDT:" **NAKİT ÖDÜL (500 USDT)** kazandın!",winMessageEmailPrompt:"Ödülünü almak için aşağıdaki linke tıklayarak veya manuel olarak",winMessageEmailAddress:"giveaways@kyrosil.eu",winMessageEmailSubjectBase:"Kyrosil Starbucks Oyun Ödülü - Seviye ",winMessageEmailBodyBase_App:"Merhaba,\n\nSeviye {LEVEL} Starbucks Mobil Uygulaması ödülünü ({REWARD}) kazandım.\nUygulama kodumu bekliyorum.\n\nEkran görüntüm ektedir.\n\nTeşekkürler.",winMessageEmailBodyBase_USDT:"Merhaba,\n\nSeviye 10 Büyük Ödülünü (500 USDT) kazandım.\nÖdül gönderimi için detayları bekliyorum.\n\nEkran görüntüm ektedir.\n\nTeşekkürler.",winMessageEmailInstructions:"adresine bu ekranın görüntüsüyle birlikte mail atabilirsin.",gameOverTitle:"Oyun Bitti!",gameOverMessage:"Tüm seviyeleri tamamladın! Harikasın!",noAttemptsTitle:"Hakların Bitti!",noAttemptsMessage:"Bugünkü 3 hata yapma hakkını doldurdun. Yarın tekrar oynamak için geri gel!",closeButton:"Tamam",tutorialIntro:"Oyuna Hoş Geldin! İşte Tıklama Alanları:",tutorialItemIntro:"Bu: ",tutorialItemAction_Default:". Tarifte adı geçince buraya tıklayacaksın.",tutorialItemAction_Cat:". Önemli bir mola!",tutorialItemAction_Register:". Siparişi bitirmek için.",tutorialItemAction_OrderSlip:". Siparişi almak için.",tutorialItemAction_PriceList:". Fiyatları görmek için.",tutorialItemAction_Fridge:". Soğuk malzemeler burada.",tutorialItemAction_Dessert:". Tatlılar burada.",tutorialItemPrompt:"Devam etmek için vurgulanan alana tıkla.",tutorialComplete:"Harika! Başlıyoruz!",tutorialOutOfAttempts:"Hakların bittiği için bugünlük bu kadar!",mixedOrderWarning:"Not: Malzemeler karışık, doğru sırada hazırla!",priceCheckWarning:"Müşteri fiyatı da sordu!",gsmLabel:"Starbucks Mobile Kayıtlı GSM No:",gsmPlaceholder:"Numaranızı Girin",kvkkLabel:" KVKK kapsamında numaramın sadece ödül aktarımı için göstermelik olarak istendiğini anladım, onaylıyorum.",gsmError:"Lütfen numara girip kutuyu işaretleyin.",rewardTypeApp:"(Starbucks App Kodu)",rewardTypeCash:"(NAKİT ÖDÜL!)"},EN:{/* İngilizce Metinler */} };
const rewardTiers = { TR:{2:"200 TL",4:"600 TL",6:"2.000 TL",8:"5.000 TL",10:"500 USDT"}, EU:{2:"5 USD",4:"15 USD",6:"40 USD",8:"100 USD",10:"500 USDT"} };
const clickableItems = [{name:'Espresso Makinesi',x:605,y:300,width:50,height:60},{name:'Yeşil Şişe',x:300,y:245,width:30,height:55},{name:'Şurup Pompası',x:340,y:245,width:30,height:55},{name:'Süt Kutusu',x:390,y:245,width:30,height:55},{name:'Bardak Alanı',x:330,y:357,width:50,height:50},{name:'Tezgahtaki Kedi',x:442,y:352,width:70,height:40},{name:'Kasa',x:700,y:300,width:60,height:60},{name:'Sipariş Fişi',x:780,y:240,width:15,height:30},{name:'Buzdolabı',x:445,y:305,width:70,height:40},{name:'Tatlı Dolabı',x:700,y:450,width:80,height:60},{name:'Fiyat Listesi',x:500,y:80,width:100,height:200}];
const levels = [{level:1,recipeName:"İlk Sipariş (Espresso)",clicks:['Sipariş Fişi','Espresso Makinesi']},{level:2,recipeName:"Caffè Latte (Fiyatlı)",clicks:['Espresso Makinesi','Süt Kutusu','Fiyat Listesi']},/*...*/{level:11,recipeName:"OYUN BİTTİ!",clicks:[]}];

// --- Yardımcı Fonksiyon Tanımları ---
// (loadGameData, saveGameData, getRewardForLevel, showMessage, hideMessage, shuffleArray, updateTexts, checkStartButtonState - Tüm bu fonksiyonların tanımları önceki koddan (#159/#161) alınmalı ve buraya DOĞRU şekilde yerleştirilmeli)
function loadGameData(){try{const today=new Date().toISOString().split('T')[0];lastPlayDate=localStorage.getItem('barista_lastPlayDate')||today;failedAttemptsToday=parseInt(localStorage.getItem('barista_failedAttempts')||'0',10);if(lastPlayDate!==today){console.log("Yeni gün!");failedAttemptsToday=0;lastPlayDate=today;saveGameData();} if(failedAttemptsToday>=3){canPlay=false;console.warn("Hak bitti (loadGameData).");}else{canPlay=true;} console.log(`Bugünkü hata hakkı: ${3-failedAttemptsToday}/3`);}catch(e){console.error("loadGameData Hatası:",e);canPlay=false;}}
function saveGameData(){try{localStorage.setItem('barista_lastPlayDate',lastPlayDate);localStorage.setItem('barista_failedAttempts',failedAttemptsToday.toString());}catch(e){console.error("saveGameData Hatası:",e);}}
function getRewardForLevel(level, region) { return rewardTiers[region]?.[level] || null; }
function showMessage(title, bodyHtml, type='info'){ try{ console.log(`showMessage Çağrıldı: Tip=${type}, Başlık=${title}`); if(!messageOverlay||!messageTitle||!messageBody) throw new Error("Mesaj elementleri bulunamadı!"); messageTitle.innerText=title; messageBody.innerHTML=bodyHtml; messageOverlay.className=`overlay message-${type}`; messageOverlay.style.display='flex'; console.log("Mesaj gösterildi, canPlay=false yapılıyor."); canPlay=false; } catch(e) { console.error("showMessage Hatası:", e); }}
function hideMessage(){ try{ if(!messageOverlay) throw new Error("Mesaj overlay elementi bulunamadı!"); messageOverlay.style.display='none'; if(failedAttemptsToday<3 && currentLevelIndex<levels.length-1 && gameState==='PLAYING'){canPlay=true; console.log("Mesaj kapatıldı, canPlay=true (Oyun Devam).");} else { console.log("Mesaj kapatıldı, canPlay false kalıyor veya oyun bitti.");} } catch(e) { console.error("hideMessage Hatası:", e); }}
function shuffleArray(array){ let ci=array.length,ri;const na=array.slice();while(ci!==0){ri=Math.floor(Math.random()*ci);ci--;[na[ci],na[ri]]=[na[ri],na[ci]];} return na; }
function updateTexts(lang, region) { /* ... */ } // Önceki koddan tam fonksiyon
function checkStartButtonState() { /* ... */ } // Önceki koddan tam fonksiyon

// Görsel Yükleme Kontrolü (tryStartGame'i ÇAĞIRMAYACAK)
function checkAssetsLoaded(){
    console.log(`checkAssetsLoaded: bgLoaded=${bgLoaded}, logoLoaded=${logoLoaded}`);
    if(bgLoaded && logoLoaded && gameState === 'LOADING') {
        console.log("Görseller yüklendi, giriş ekranı aktif.");
        gameState = 'START_SCREEN';
        // DOMContentLoaded içinde ilk ayarlar yapıldı zaten.
    }
}

// Oyunu Başlatma Tetikleyicisi (SADECE DURUMU AYARLAR)
function tryStartGame() {
    try { console.log("tryStartGame çağrıldı, hak kontrolü."); loadGameData();
        if (!canPlay) { gameState = 'NO_ATTEMPTS'; showMessage(texts[currentLang]?.noAttemptsTitle||"Hata", texts[currentLang]?.noAttemptsMessage||"Hak bitti.", 'error'); }
        else { gameState = 'TUTORIAL'; tutorialStep = 0; isTutorialComplete = false;
            currentLevelIndex = 0; currentRecipeStep = 0;
            if (levels[currentLevelIndex]?.clicks.length > 0) { currentShuffledRecipe = shuffleArray(levels[currentLevelIndex].clicks); } else { currentShuffledRecipe = []; }
            console.log("Oyun durumu TUTORIAL olarak ayarlandı. Döngü başlatılıyor...");
            if (!gameLoopStarted) { gameLoopStarted = true; requestAnimationFrame(drawGame); } // Döngüyü başlat
            else { requestAnimationFrame(drawGame); } // Zaten başlamışsa bile çizimi tetikle
        }
    } catch(e){ console.error("tryStartGame hatası:",e); alert("Oyunu başlatırken hata!"); }
}

// Başlat Butonu Fonksiyonu (Sadece ekranları değiştirir ve tryStartGame'i çağırır)
function startGame() {
    try { console.log("startGame ÇAĞRILDI!"); checkStartButtonState(); if (startButton.disabled) { console.warn("Başlatma engellendi."); gsmError.style.display = 'block'; return; } console.log("Başlatma Kontrolleri Geçildi.");
        if (startScreenDiv) startScreenDiv.style.display = 'none'; else throw new Error("startScreenDiv null!");
        if (canvas) canvas.style.display = 'block'; else throw new Error("canvas null!");
        // Doğrudan tryStartGame çağırmadan önce görsellerin yüklendiğinden emin olalım
        if (bgLoaded && logoLoaded) {
             tryStartGame();
        } else {
             console.warn("Start'a basıldı ama görseller henüz yüklenmedi, bekleniyor...");
             // Yüklenince tryStartGame otomatik çağrılacak mı? Hayır, checkAssetsLoaded çağırmıyor.
             // O zaman burada bir bekleme mekanizması veya uyarı lazım.
             // Şimdilik basitçe yüklenmesini umalım veya kullanıcıya mesaj verelim.
             alert("Görseller henüz yükleniyor, lütfen biraz bekleyip tekrar Başlat'a basın."); // Basit çözüm
             // Daha iyisi: Start butonu görsel yüklenene kadar pasif kalmalı.
             // Bunu checkAssetsLoaded içinde yapalım.
        }
    } catch (e) { console.error("startGame Hatası:", e); alert("Oyun başlatılamadı!"); }
}


// --- Ana Oyun Çizim Döngüsü ---
function drawGame() {
    try { if(!ctx){return;} ctx.clearRect(0,0,canvas.width,canvas.height);
        // ÖNCE Arka Planı Çiz
        if(bgLoaded && bgImage.complete && bgImage.naturalWidth > 0) {
            ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = 'lightgrey'; ctx.fillRect(0,0,canvas.width,canvas.height); // Fallback
        }
        // SONRA Logoyu Çiz
        if(logoLoaded && logoImage.complete && logoImage.naturalWidth > 0){ logoX=canvas.width/2-logoWidth/2; const cX=logoX+logoWidth/2; const cY=logoY+logoHeight/2; const r=logoWidth/2; ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(cX,cY,r,0,Math.PI*2); ctx.fill(); ctx.drawImage(logoImage,logoX,logoY,logoWidth,logoHeight); }

        // Sonra diğerlerini çiz...
        let cTY=30; /* ... Kalan Haklar çizimi ... */
        if (gameState === 'TUTORIAL') { /* ... Öğretici çizimi ... */ }
        else if (gameState === 'PLAYING') { /* ... Oyun ekranı çizimi ... */ }
        // Hak bitti / Oyun bitti mesajları HTML overlay ile...

        if (gameLoopStarted && (gameState === 'PLAYING' || gameState === 'TUTORIAL')) { requestAnimationFrame(drawGame); }
        else { gameLoopStarted=false; }
    } catch(e) { console.error("Draw HATA:", e); gameLoopStarted = false; }
}

// --- Tıklama İşleyici Fonksiyon ---
function handleClick(event) {
    // ÖNEMLİ: Koordinatları event.offsetX/Y ile alalım
    try{ if (messageOverlay?.style.display === 'flex') return;
        const rect = canvas.getBoundingClientRect();
        // const clickX = event.clientX - rect.left; // Eski yöntem
        // const clickY = event.clientY - rect.top;
        const clickX = event.offsetX; // Canvas'a göre direkt koordinat
        const clickY = event.offsetY;

        console.log(`handleClick - State: ${gameState}, Click: ${clickX},${clickY}`); // Tıklama logu

        if (gameState === 'TUTORIAL') {
            const itemToClick=clickableItems[tutorialStep];if(itemToClick&&clickX>=itemToClick.x&&clickX<=itemToClick.x+itemToClick.width&&clickY>=itemToClick.y&&clickY<=itemToClick.y+itemToClick.height){console.log(`Öğretici: ${itemToClick.name} tıklandı.`);tutorialStep++;if(tutorialStep>=clickableItems.length){console.log("Öğretici bitti!");isTutorialComplete=true;gameState='PLAYING';currentLevelIndex=0;currentRecipeStep=0;canPlay=true;if(levels[currentLevelIndex]?.clicks.length>0){currentShuffledRecipe=shuffleArray(levels[currentLevelIndex].clicks);}else{currentShuffledRecipe=[];}console.log("Oyun durum PLAYING olarak ayarlandı.");}else{console.log("Öğretici: Sonraki adıma geçiliyor.");}}else{console.log("Öğretici: Vurgulanan alan dışına tıklandı.");}
        } else if (gameState === 'PLAYING') {
             if (!canPlay || currentLevelIndex >= levels.length - 1) return; let clickedItemName=null; for(const item of clickableItems){if(clickX>=item.x&&clickX<=item.x+item.width&&clickY>=item.y&&clickY<=item.y+item.height){clickedItemName=item.name;break;}} if(clickedItemName){console.log(`Oyun: Tıklandı: ${clickedItemName}`);const currentLevelData=levels[currentLevelIndex];const expectedClick=currentLevelData.clicks[currentRecipeStep];if(clickedItemName===expectedClick){console.log("Oyun: Doğru adım!");currentRecipeStep++;feedbackMessage={text:'Doğru!',color:'lime',expiryTime:Date.now()+1000}; if(currentRecipeStep>=currentLevelData.clicks.length){const cL=currentLevelData.level;console.log(`--- Seviye ${cL} Bitti! ---`);const rAS=getRewardForLevel(cL,currentRegion);currentLevelIndex++;currentRecipeStep=0;if(levels[currentLevelIndex]?.clicks.length > 0){currentShuffledRecipe=shuffleArray(levels[currentLevelIndex].clicks);}else{currentShuffledRecipe=[];} if(rAS){/*... Ödül mesajı ve mailto ...*/ showMessage(/*...*/);} const nLD=levels[currentLevelIndex];if(!nLD||nLD.clicks.length===0){console.log("OYUN TAMAMLANDI!");gameState='GAME_OVER';showMessage(texts[currentLang].gameOverTitle,texts[currentLang].gameOverMessage,'info');}}}else{console.log("Oyun: Yanlış! Baştan başla.");currentRecipeStep=0;failedAttemptsToday++;saveGameData();console.log(`Kalan hak: ${3-failedAttemptsToday}/3`);feedbackMessage={text:texts[currentLang]?.errorMessage||"Wrong!",color:'red',expiryTime:Date.now()+2500};if(failedAttemptsToday>=3){canPlay=false;console.error("Hak bitti!");gameState='NO_ATTEMPTS';setTimeout(()=>{if(!canPlay){showMessage(texts[currentLang]?.noAttemptsTitle||"Attempts Done",texts[currentLang]?.noAttemptsMessage||"Try tomorrow",'error');}},500);}}}else{console.log("Oyun: Boş alan tıklandı.");}
        }
    }catch(e){console.error("handleClick Hatası:",e);}
}

// --- Başlangıç Kodu (DOMContentLoaded) ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Yüklendi.");
    try {
        canvas = document.getElementById('gameCanvas'); ctx = canvas?.getContext('2d');
        startScreenDiv=document.getElementById('startScreen'); gameTitleEl=document.getElementById('gameTitle'); /*...*/ startButton=document.getElementById('startButton'); gsmInput=document.getElementById('gsmInput'); kvkkCheck=document.getElementById('kvkkCheck'); /*...*/ messageOverlay=document.getElementById('messageOverlay'); /*...*/ closeButton=document.getElementById('closeButton');
        if (!canvas || !ctx || !startScreenDiv || !startButton /*...*/) { throw new Error("Kritik elementler bulunamadı!"); }
        console.log("Tüm element referansları alındı.");
        // Olay Dinleyicilerini Ekle
        langTRButton.addEventListener('click', () => { if(currentLang!=='TR'){currentLang='TR';localStorage.setItem('barista_lang', currentLang);updateTexts(currentLang, currentRegion);}});
        langENButton.addEventListener('click', () => { if(currentLang!=='EN'){currentLang='EN';localStorage.setItem('barista_lang', currentLang);updateTexts(currentLang, currentRegion);}});
        regionSelect.addEventListener('change', (event) => { currentRegion=event.target.value; localStorage.setItem('barista_region', currentRegion); updateTexts(currentLang, currentRegion); });
        startButton.addEventListener('click', startGame);
        gsmInput.addEventListener('input', checkStartButtonState);
        kvkkCheck.addEventListener('change', checkStartButtonState);
        closeButton.addEventListener('click', hideMessage);
        canvas.addEventListener('click', handleClick);
        console.log("Tüm olay dinleyicileri eklendi.");
        // Başlangıç Ayarları
        currentLang = localStorage.getItem('barista_lang') || 'TR'; currentRegion = localStorage.getItem('barista_region') || 'TR'; if(regionSelect) regionSelect.value = currentRegion; if(langTRButton) langTRButton.classList.toggle('active', currentLang === 'TR'); if(langENButton) langENButton.classList.toggle('active', currentLang === 'EN');
        loadGameData(); updateTexts(currentLang, currentRegion); checkStartButtonState();
        console.log("Başlangıç ayarları yapıldı.");
        // Görsel yüklemelerini başlat
        console.log("Görseller yükleniyor...");
        bgImage.src = './arka_plan.png'; // <<<--- PNG KULLANILIYOR
        logoImage.src = 'Starbucks_Corporation.png'; // <<<--- Logo adı doğru mu? Kontrol et.
    } catch (error) { console.error("DOMContentLoaded hatası:", error); alert("Sayfa yüklenirken hata!"); }
});

// Hata logları
bgImage.onerror = () => { console.error("!!! Arka Plan YÜKLENEMEDİ! Dosya adı/yolu: ./arka_plan.png"); bgLoaded = false; /*checkAssetsLoaded();*/ alert("Arka Plan resmi yüklenemedi!"); }
logoImage.onerror = () => { console.error("!!! Logo YÜKLENEMEDİ!"); logoLoaded = true; checkAssetsLoaded(); } // Logo olmasa da devam etsin?

console.log("script.js dosyası tamamen okundu.");
