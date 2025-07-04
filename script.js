// --- Global Değişken Tanımları ---
let canvas, ctx;
let startScreenDiv, gameTitleEl, gameSloganEl, langTRButton, langENButton, regionSelect, regionLabelEl, rewardTitleEl, rewardListEl, startButton, gsmInput, kvkkCheck, gsmError, gsmLabel, kvkkLabel;
let messageOverlay, messageTitle, messageBody, closeButton;
const bgImage = new Image(); const logoImage = new Image();
let bgLoaded = false, logoLoaded = false;
let assetsReady = false; // Görsellerin hazır olup olmadığını belirten bayrak
let gameState = 'LOADING';
let tutorialStep = 0; let isTutorialComplete = false;
let currentLevelIndex = 0; let currentRecipeStep = 0; let canPlay = true;
let gameLoopStarted = false; let currentShuffledRecipe = [];
let currentLang = 'TR'; let currentRegion = 'TR';
let failedAttemptsToday = 0; let lastPlayDate = '';
let feedbackMessage = { text: '', color: 'red', expiryTime: 0 };
const logoWidth = 80; const logoHeight = 80; let logoX = 0; const logoY = 20;

// --- Sabit Veriler ---
const texts = { TR:{gameTitle:"Kyrosil Starbucks Barista",slogan:"En İyi Barista Ol! Siparişleri doğru sırayla hazırla, ödülleri kap!",regionLabel:"Bölge:",rewardTitle:"Seviye Ödülleri",startButton:"Oyuna Başla!",loadingText:"Yükleniyor...",level:"Seviye",order:"Sipariş",requirements:"Gerekenler",attemptsLeft:"Kalan Hata Hakkı",errorTitle:"Hata!",errorMessage:"Yanlış malzeme veya sıra! Baştan başla.",winTitle:"Tebrikler!",winMessagePart1:"Seviye ",winMessagePart2_App:" **{REWARD}** değerinde Starbucks Mobil Uygulaması ödülü kazandın!",winMessagePart2_USDT:" **NAKİT ÖDÜL (500 USDT)** kazandın!",winMessageEmailPrompt:"Ödülünü almak için aşağıdaki linke tıklayarak veya manuel olarak",winMessageEmailAddress:"giveaways@kyrosil.eu",winMessageEmailSubjectBase:"Kyrosil Starbucks Oyun Ödülü - Seviye ",winMessageEmailBodyBase_App:"Merhaba,\n\nSeviye {LEVEL} Starbucks Mobil Uygulaması ödülünü ({REWARD}) kazandım.\nUygulama kodumu bekliyorum.\n\nEkran görüntüm ektedir.\n\nTeşekkürler.",winMessageEmailBodyBase_USDT:"Merhaba,\n\nSeviye 10 Büyük Ödülünü (500 USDT) kazandım.\nÖdül gönderimi için detayları bekliyorum.\n\nEkran görüntüm ektedir.\n\nTeşekkürler.",winMessageEmailInstructions:"adresine bu ekranın görüntüsüyle birlikte mail atabilirsin.",gameOverTitle:"Oyun Bitti!",gameOverMessage:"Tüm seviyeleri tamamladın! Harikasın!",noAttemptsTitle:"Hakların Bitti!",noAttemptsMessage:"Bugünkü 3 hata yapma hakkını doldurdun. Yarın tekrar oynamak için geri gel!",closeButton:"Tamam",tutorialIntro:"Oyuna Hoş Geldin! İşte Tıklama Alanları:",tutorialItemIntro:"Bu: ",tutorialItemAction_Default:". Tarifte adı geçince buraya tıklayacaksın.",tutorialItemAction_Cat:". Önemli bir mola!",tutorialItemAction_Register:". Siparişi bitirmek için.",tutorialItemAction_OrderSlip:". Siparişi almak için.",tutorialItemAction_PriceList:". Fiyatları görmek için.",tutorialItemAction_Fridge:". Soğuk malzemeler burada.",tutorialItemAction_Dessert:". Tatlılar burada.",tutorialItemPrompt:"Devam etmek için vurgulanan alana tıkla.",tutorialComplete:"Harika! Başlıyoruz!",tutorialOutOfAttempts:"Hakların bittiği için bugünlük bu kadar!",mixedOrderWarning:"Not: Malzemeler karışık, doğru sırada hazırla!",priceCheckWarning:"Müşteri fiyatı da sordu!",gsmLabel:"Starbucks Mobile Kayıtlı GSM No:",gsmPlaceholder:"Numaranızı Girin",kvkkLabel:" KVKK kapsamında numaramın sadece ödül aktarımı ve çoklu katılımı engellemek için istendiğini anladım, onaylıyorum.",gsmError:"Lütfen numara girip kutuyu işaretleyin.",rewardTypeApp:"(Starbucks App Kodu)",rewardTypeCash:"(NAKİT ÖDÜL!)"},EN:{gameTitle:"Kyrosil Starbucks Barista",slogan:"Be the Best Barista! Prepare orders correctly and grab rewards!",regionLabel:"Region:",rewardTitle:"Level Rewards",startButton:"Start Game!",loadingText:"Loading...",level:"Level",order:"Order",requirements:"Required",attemptsLeft:"Attempts Left",errorTitle:"Error!",errorMessage:"Wrong item or sequence! Start over.",winTitle:"Congratulations!",winMessagePart1:"You won the Level ",winMessagePart2_App:" Starbucks Mobile App reward ({REWARD})!",winMessagePart2_USDT:" CASH PRIZE (500 USDT)!",winMessageEmailPrompt:"To claim your reward, click the link below or manually email",winMessageEmailAddress:"giveaways@kyrosil.eu",winMessageEmailSubjectBase:"Kyrosil Starbucks Game Reward - Level ",winMessageEmailBodyBase_App:"Hello,\n\nI won the Level {LEVEL} Starbucks Mobile App reward ({REWARD})...",winMessageEmailBodyBase_USDT:"Hello,\n\nI won the Level 10 Grand Prize (500 USDT)...",winMessageEmailInstructions:"with a screenshot.",gameOverTitle:"Game Over!",gameOverMessage:"You completed all levels! Awesome!",noAttemptsTitle:"No Attempts Left!",noAttemptsMessage:"You've used your 3 attempts for today. Come back tomorrow!",closeButton:"OK",tutorialIntro:"Welcome! Let's show you the interaction areas:",tutorialItemIntro:"This is the: ",tutorialItemAction_Default:". Click here when it's in the recipe.",tutorialItemAction_Cat:". An important break!",tutorialItemAction_Register:". To finish the order.",tutorialItemAction_OrderSlip:". To get the order.",tutorialItemAction_PriceList:". To check prices.",tutorialItemAction_Fridge:". Cold items are here.",tutorialItemAction_Dessert:". Desserts are here.",tutorialItemPrompt:"Click the highlighted area to continue.",tutorialComplete:"Great! Let's begin!",tutorialOutOfAttempts:"You are out of attempts for today!",mixedOrderWarning:"Note: Ingredients listed randomly, prepare in correct order!",priceCheckWarning:"Customer asked for the price!",gsmLabel:"Starbucks Mobile Registered GSM No:",gsmPlaceholder:"Enter your phone number",kvkkLabel:" I agree my number is requested symbolically for reward transfer under GDPR & Privacy Policy (Applies to USA users selecting Europe too).",gsmError:"Please enter a number and check the box.",rewardTypeApp:"(Starbucks App Code)",rewardTypeCash:"(CASH PRIZE!)"} };
const rewardTiers = {TR:{2:"200 TL",4:"600 TL",6:"2.000 TL",8:"5.000 TL",10:"500 USDT"},EU:{2:"5 USD",4:"15 USD",6:"40 USD",8:"100 USD",10:"500 USDT"}};
const clickableItems = [
    { nameTR: 'Espresso Makinesi', nameEN: 'Espresso Machine', x: 605, y: 300, width: 50, height: 60 },
    { nameTR: 'Yeşil Şişe', nameEN: 'Green Bottle', x: 300, y: 245, width: 30, height: 55 },
    { nameTR: 'Şurup Pompası', nameEN: 'Syrup Pump', x: 340, y: 245, width: 30, height: 55 },
    { nameTR: 'Süt Kutusu', nameEN: 'Milk Carton', x: 390, y: 245, width: 30, height: 55 },
    { nameTR: 'Bardak Alanı', nameEN: 'Cup Area', x: 330, y: 357, width: 50, height: 50 },
    { nameTR: 'Tezgahtaki Kedi', nameEN: 'Cat on Counter', x: 442, y: 352, width: 70, height: 40 },
    { nameTR: 'Kasa', nameEN: 'Cash Register', x: 700, y: 300, width: 60, height: 60 },
    { nameTR: 'Sipariş Fişi', nameEN: 'Order Slip', x: 770, y: 230, width: 30, height: 50 },
    { nameTR: 'Buzdolabı', nameEN: 'Fridge', x: 445, y: 305, width: 70, height: 40 },
    { nameTR: 'Tatlı Dolabı', nameEN: 'Dessert Case', x: 700, y: 450, width: 80, height: 60 },
    { nameTR: 'Fiyat Listesi', nameEN: 'Price List', x: 500, y: 80, width: 100, height: 200 }
];
const levels = [
    {level:1,recipeNameTR:"İlk Sipariş (Espresso)",recipeNameEN:"First Order (Espresso)",clicks:['Sipariş Fişi','Espresso Makinesi']},
    {level:2,recipeNameTR:"Caffè Latte (Fiyatlı)",recipeNameEN:"Caffè Latte (With Price)",clicks:['Espresso Makinesi','Süt Kutusu','Fiyat Listesi']},
    {level:3,recipeNameTR:"Vanilya Şur. Soğuk Kahve",recipeNameEN:"Vanilla Syrup Cold Coffee",clicks:['Bardak Alanı','Buzdolabı','Espresso Makinesi','Şurup Pompası']},
    {level:4,recipeNameTR:"Kedi Molası & Yeşil Çay",recipeNameEN:"Cat Break & Green Tea",clicks:['Tezgahtaki Kedi','Yeşil Şişe','Bardak Alanı']},
    {level:5,recipeNameTR:"Yoğun Talep",recipeNameEN:"High Demand",clicks:['Sipariş Fişi','Espresso Makinesi','Süt Kutusu','Espresso Makinesi']},
    {level:6,recipeNameTR:"Hesaplı Şuruplu Latte",recipeNameEN:"Budget Syrup Latte",clicks:['Bardak Alanı','Espresso Makinesi','Şurup Pompası','Süt Kutusu','Fiyat Listesi','Kasa']},
    {level:7,recipeNameTR:"Yeşil & Vanilya & Buz",recipeNameEN:"Green & Vanilla & Ice",clicks:['Yeşil Şişe','Şurup Pompası','Buzdolabı','Bardak Alanı']},
    {level:8,recipeNameTR:"Tam Menü (Basit)",recipeNameEN:"Full Menu (Simple)",clicks:['Sipariş Fişi','Bardak Alanı','Espresso Makinesi','Süt Kutusu','Tatlı Dolabı','Kasa']},
    {level:9,recipeNameTR:"Pati Deluxe Özel",recipeNameEN:"Paw Deluxe Special",clicks:['Bardak Alanı','Buzdolabı','Yeşil Şişe','Şurup Pompası','Espresso Makinesi','Tezgahtaki Kedi','Kasa']},
    {level:10,recipeNameTR:"USTALIK ESERİ!",recipeNameEN:"MASTERPIECE!",clicks:['Sipariş Fişi','Fiyat Listesi','Bardak Alanı','Buzdolabı','Yeşil Şişe','Şurup Pompası','Espresso Makinesi','Süt Kutusu','Tatlı Dolabı','Tezgahtaki Kedi','Kasa']},
    {level:11,recipeNameTR:"OYUN BİTTİ!",recipeNameEN:"GAME OVER!",clicks:[]}
];

// --- Yardımcı Fonksiyon Tanımları ---
function loadGameData(){try{const today=new Date().toISOString().split('T')[0];lastPlayDate=localStorage.getItem('barista_lastPlayDate')||today;failedAttemptsToday=parseInt(localStorage.getItem('barista_failedAttempts')||'0',10);if(lastPlayDate!==today){console.log("Yeni gün!");failedAttemptsToday=0;lastPlayDate=today;saveGameData();} if(failedAttemptsToday>=3){canPlay=false;console.warn("Hak bitti (loadGameData).");}else{canPlay=true;} console.log(`BG Hata Hakkı: ${3-failedAttemptsToday}/3`);}catch(e){console.error("loadGameData Hatası:",e);canPlay=true;}}
function saveGameData(){try{localStorage.setItem('barista_lastPlayDate',lastPlayDate);localStorage.setItem('barista_failedAttempts',failedAttemptsToday.toString());}catch(e){console.error("saveGameData Hatası:",e);}}
function getRewardForLevel(level, region) { return rewardTiers[region]?.[level] || null; }
function showMessage(title, bodyHtml, type='info'){ try{ console.log(`showMessage Çağrıldı: Tip=${type}, Başlık=${title}`); if(!messageOverlay||!messageTitle||!messageBody) {console.error("Mesaj elementleri bulunamadı!"); return;} messageTitle.innerText=title; messageBody.innerHTML=bodyHtml; messageOverlay.className=`overlay message-${type}`; messageOverlay.style.display='flex'; console.log("Mesaj gösterildi, canPlay=false yapılıyor."); canPlay=false; } catch(e) { console.error("showMessage Hatası:", e); }}
function hideMessage(){ try{ if(!messageOverlay) {console.error("Mesaj overlay elementi bulunamadı!"); return;} messageOverlay.style.display='none'; if(failedAttemptsToday<3 && currentLevelIndex<levels.length-1 && gameState==='PLAYING'){canPlay=true; console.log("Mesaj kapatıldı, canPlay=true.");} else { console.log("Mesaj kapatıldı, canPlay false."); canPlay = false; } } catch(e) { console.error("hideMessage Hatası:", e); }}
function shuffleArray(array){ if (!array || array.length === 0) return []; let ci=array.length,ri;const na=array.slice();while(ci!==0){ri=Math.floor(Math.random()*ci);ci--;[na[ci],na[ri]]=[na[ri],na[ci]];} return na; }

function updateTexts(lang, region) {
    try { console.log(`updateTexts: Lang=${lang}, Region=${region}`); const t = texts[lang]; if (!t) throw new Error(`Metinler bulunamadı: ${lang}`);
        document.title = t.gameTitle || "Barista Game";
        if(gameTitleEl) gameTitleEl.innerText = t.gameTitle; else console.warn("gameTitleEl yok");
        if(gameSloganEl) gameSloganEl.innerText = t.slogan; else console.warn("gameSloganEl yok");
        if(regionLabelEl) regionLabelEl.innerText = t.regionLabel; else console.warn("regionLabelEl yok");
        if(rewardTitleEl) rewardTitleEl.innerText = t.rewardTitle; else console.warn("rewardTitleEl yok");
        if(startButton) startButton.innerText = t.startButton; else console.warn("startButton yok");
        if(closeButton) closeButton.innerText = t.closeButton; else console.warn("closeButton yok");
        if(gsmLabel) gsmLabel.innerText = t.gsmLabel; else console.warn("gsmLabel yok");
        if(kvkkLabel) kvkkLabel.innerHTML = t.kvkkLabel; else console.warn("kvkkLabel yok");
        if(gsmError) gsmError.innerText = t.gsmError; else console.warn("gsmError yok");
        if(gsmInput && t.gsmPlaceholder) gsmInput.placeholder = t.gsmPlaceholder; else if(!gsmInput) console.warn("gsmInput yok");
        // Detaylı Ödül Listesi
        if(rewardListEl) { rewardListEl.innerHTML = ''; const currentRewards = rewardTiers[region]; if(currentRewards){ const levelsToShow=[2,4,6,8,10]; levelsToShow.forEach(level => { const reward=currentRewards[level]; if(reward){const li=document.createElement('li'); const isCash=level===10; const rewardType=isCash?t.rewardTypeCash:t.rewardTypeApp; li.innerHTML=`<strong>${t.level} ${level}:</strong> <span>${reward}</span> <span class="prize-type">${rewardType}</span>`; rewardListEl.appendChild(li);}}); } else {console.warn("Ödül yok:", region);} } else {console.warn("rewardListEl yok");}
        if(langTRButton) langTRButton.classList.toggle('active', lang === 'TR'); else console.warn("langTRButton yok");
        if(langENButton) langENButton.classList.toggle('active', lang === 'EN'); else console.warn("langENButton yok");
        document.documentElement.lang = lang.toLowerCase(); console.log(`Metinler ${lang} (${region}) güncellendi.`);
    } catch (error) { console.error("updateTexts hatası:", error); }
}

function checkStartButtonState() {
    try {
        const numberEntered = gsmInput?.value.trim().length > 0;
        const kvkkValid = kvkkCheck?.checked;
        const canEnable = numberEntered && kvkkValid && assetsReady;
        console.log(`checkStartButtonState: num=${numberEntered}, kvkk=${kvkkValid}, assetsReady=${assetsReady} => canEnable=${canEnable}`);
        if (startButton) {
            if (canEnable) {
                startButton.disabled = false;
                startButton.innerText = texts[currentLang]?.startButton || "Start Game!";
                if(gsmError) gsmError.style.display = 'none';
                console.log(`checkStartButtonState: Aktif!`);
            } else {
                startButton.disabled = true;
                console.log(`checkStartButtonState: Pasif!`);
                if (numberEntered && kvkkValid && !assetsReady) {
                    startButton.innerText = texts[currentLang]?.loadingText || "Loading...";
                } else {
                    startButton.innerText = texts[currentLang]?.startButton || "Start Game!";
                }
                if (gsmError && (!numberEntered || !kvkkValid) && ((gsmInput && gsmInput.value.length > 0) || (kvkkCheck && kvkkCheck.checked)) ) {
                    gsmError.innerText = texts[currentLang]?.gsmError || "Gerekli alanları doldurun.";
                    gsmError.style.display = 'block';
                } else if (gsmError) {
                    gsmError.style.display = 'none';
                }
            }
        } else { console.warn("Start butonu bulunamadı!"); }
    } catch(e){ console.error("checkStartButtonState hatası:", e); }
}

function checkAssetsLoaded(){
    try{
        console.log(`checkAssetsLoaded: bgLoaded=${bgLoaded}, logoLoaded=${logoLoaded}, assetsReady=${assetsReady}`);
        if (bgLoaded && logoLoaded && !assetsReady) {
            console.log(">>> Tüm görseller yüklendi! (checkAssetsLoaded) <<<");
            assetsReady = true;
            gameState = 'START_SCREEN';
            console.log(">>> assetsReady = true yapıldı. Buton durumu kontrol ediliyor...");
            checkStartButtonState();
        }
    } catch(e){ console.error("checkAssetsLoaded Hatası:", e); }
}

function tryStartGame() {
    try { console.log("tryStartGame çağrıldı.");
        loadGameData();
        if (!canPlay) { gameState = 'NO_ATTEMPTS'; showMessage(texts[currentLang]?.noAttemptsTitle||"Hata", texts[currentLang]?.noAttemptsMessage||"Hak bitti.", 'error'); return; }
        gameState = 'TUTORIAL'; tutorialStep = 0; isTutorialComplete = false;
        currentLevelIndex = 0; currentRecipeStep = 0;
        if (levels[currentLevelIndex]?.clicks.length > 0) { currentShuffledRecipe = shuffleArray(levels[currentLevelIndex].clicks); } else { currentShuffledRecipe = []; }
        console.log("Oyun durumu TUTORIAL olarak ayarlandı. Döngü başlatılıyor...");
        if (!gameLoopStarted) { gameLoopStarted = true; requestAnimationFrame(drawGame); }
    } catch(e){ console.error("tryStartGame hatası:",e); alert("Oyunu başlatırken hata!"); gameLoopStarted = false; }
}

function startGame() {
    try { console.log("startGame ÇAĞRILDI!");
        if (!assetsReady || startButton.disabled) {
             console.warn(`Başlatma engellendi. Disabled: ${startButton.disabled}, Assets Ready: ${assetsReady}`);
             if (!assetsReady) alert("Görseller hala yükleniyor, lütfen bekleyin.");
             return;
        }
        console.log("Başlatma Kontrolleri Geçildi.");
        if(startScreenDiv) startScreenDiv.style.display = 'none'; else throw new Error("startScreenDiv null!");
        if(canvas) canvas.style.display = 'block'; else throw new Error("canvas null!");
        tryStartGame();
    } catch (e) { console.error("startGame Hatası:", e); alert("Oyun başlatılamadı!"); }
}

function drawGame() {
    try { if (!ctx) { console.warn("drawGame: CTX yok!"); return; }
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (bgLoaded && bgImage.complete && bgImage.naturalWidth > 0) { ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height); }
        else { ctx.fillStyle='#BBB';ctx.fillRect(0,0,canvas.width,canvas.height); ctx.fillStyle='red';ctx.font='20px Arial';ctx.textAlign='center'; ctx.fillText("ARKA PLAN HATASI/YÜKLENİYOR", canvas.width / 2, canvas.height / 2); ctx.textAlign='left'; return; }

        if (logoLoaded && logoImage.complete && logoImage.naturalWidth > 0) { logoX=canvas.width/2-logoWidth/2; const cX=logoX+logoWidth/2; const cY=logoY+logoHeight/2; const r=logoWidth/2; ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(cX,cY,r,0,Math.PI*2); ctx.fill(); ctx.drawImage(logoImage,logoX,logoY,logoWidth,logoHeight); }

        let cTY=30; const langText = texts[currentLang] || texts['TR'];
        ctx.fillStyle='white';ctx.font='bold 16px Arial';ctx.textAlign='left'; ctx.shadowColor='black';ctx.shadowBlur=3;ctx.shadowOffsetX=1;ctx.shadowOffsetY=1; ctx.fillText(`${langText.attemptsLeft}: ${3-failedAttemptsToday}`,20,cTY); cTY+=25; ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;

        if (gameState === 'TUTORIAL') {
            const iTS = clickableItems[tutorialStep];
            if (iTS) {
                ctx.strokeStyle = (Math.sin(Date.now() * 0.005) > 0) ? 'yellow' : 'orange';
                ctx.lineWidth = 3;
                ctx.strokeRect(iTS.x - 2, iTS.y - 2, iTS.width + 4, iTS.height + 4);
                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
                ctx.fillStyle = 'white';
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                let iAT = langText.tutorialItemAction_Default;
                if (iTS.nameTR === 'Tezgahtaki Kedi') iAT = langText.tutorialItemAction_Cat;
                else if (iTS.nameTR === 'Kasa') iAT = langText.tutorialItemAction_Register;
                else if (iTS.nameTR === 'Sipariş Fişi') iAT = langText.tutorialItemAction_OrderSlip;
                else if (iTS.nameTR === 'Fiyat Listesi') iAT = langText.tutorialItemAction_PriceList;
                else if (iTS.nameTR === 'Buzdolabı') iAT = langText.tutorialItemAction_Fridge;
                else if (iTS.nameTR === 'Tatlı Dolabı') iAT = langText.tutorialItemAction_Dessert;
                const itemName = currentLang === 'EN' ? iTS.nameEN : iTS.nameTR;
                ctx.fillText(langText.tutorialItemIntro + itemName + iAT, canvas.width / 2, canvas.height - 35);
                ctx.font = '14px Arial';
                ctx.fillText(langText.tutorialItemPrompt, canvas.width / 2, canvas.height - 15);
                ctx.textAlign = 'left';
            } else {
                console.warn("Öğretici adımı geçersiz:", tutorialStep);
                gameState = 'PLAYING';
                currentShuffledRecipe = shuffleArray(levels[currentLevelIndex]?.clicks || []);
            }
        } else if (gameState === 'PLAYING') {
            if (levels[currentLevelIndex]) {
                const d = levels[currentLevelIndex];
                ctx.fillStyle = 'white';
                ctx.textAlign = 'left';
                ctx.shadowColor = 'black';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                ctx.font = 'bold 20px Arial';
                ctx.fillText(`${langText.level}: ${d.level}`, 20, cTY);
                cTY += 25;
                if (d.clicks.length > 0) {
                    ctx.font = '18px Arial';
                    const recipeName = currentLang === 'EN' ? d.recipeNameEN : d.recipeNameTR;
                    ctx.fillText(`${langText.order}: ${recipeName}`, 20, cTY);
                    cTY += 25;
                    ctx.font = 'italic 16px Arial';
                    ctx.fillText(`${langText.requirements}:`, 20, cTY);
                    cTY += 20;
                    const sC = currentShuffledRecipe;
                    for (const itemNameTR of sC) {
                        const item = clickableItems.find(item => item.nameTR === itemNameTR);
                        const displayName = currentLang === 'EN' ? item?.nameEN : item?.nameTR;
                        ctx.fillText(`- ${displayName || itemNameTR}`, 30, cTY);
                        cTY += 18;
                    }
                    cTY += 5;
                    ctx.fillStyle = 'orange';
                    ctx.font = 'bold 14px Arial';
                    ctx.fillText(langText.mixedOrderWarning, 20, cTY);
                    cTY += 20;
                    if (d.clicks.includes('Fiyat Listesi')) {
                        ctx.fillStyle = 'lightblue';
                        ctx.fillText(langText.priceCheckWarning, 20, cTY);
                        cTY += 20;
                    }
                }
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
            } else {
                console.warn("Geçerli seviye yok:", currentLevelIndex);
            }
            if (feedbackMessage.text && Date.now() < feedbackMessage.expiryTime) {
                ctx.fillStyle = feedbackMessage.color;
                ctx.font = 'bold 28px Arial';
                ctx.textAlign = 'center';
                ctx.shadowColor = 'black';
                ctx.shadowBlur = 5;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                ctx.fillText(feedbackMessage.text, canvas.width / 2, canvas.height - 30);
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.textAlign = 'left';
            } else {
                feedbackMessage.text = '';
            }
        }

        if (gameLoopStarted && (gameState === 'PLAYING' || gameState === 'TUTORIAL')) { requestAnimationFrame(drawGame); }
        else { console.log("Oyun döngüsü durdu. State:", gameState); gameLoopStarted = false;}
    } catch (e) { console.error("Draw HATA:", e); gameLoopStarted = false; }
}

function handleClick(event) {
    try {
        if (messageOverlay?.style.display === 'flex') return;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const clickX = event.offsetX;
        const clickY = event.offsetY;
        console.log(`handleClick - State: ${gameState}, Click: ${clickX},${clickY}`);
        if (gameState === 'TUTORIAL') {
            const iTC = clickableItems[tutorialStep];
            if (iTC && clickX >= iTC.x && clickX <= iTC.x + iTC.width && clickY >= iTC.y && clickY <= iTC.y + iTC.height) {
                console.log(`Öğretici: ${iTC.nameTR} tıklandı.`);
                tutorialStep++;
                if (tutorialStep >= clickableItems.length) {
                    console.log("Öğretici bitti!");
                    isTutorialComplete = true;
                    gameState = 'PLAYING';
                    currentLevelIndex = 0;
                    currentRecipeStep = 0;
                    canPlay = true;
                    if (levels[currentLevelIndex]?.clicks.length > 0) {
                        currentShuffledRecipe = shuffleArray(levels[currentLevelIndex].clicks);
                    } else {
                        currentShuffledRecipe = [];
                    }
                    console.log("Oyun durum PLAYING olarak ayarlandı.");
                } else {
                    console.log("Öğretici: Sonraki adıma geçiliyor.");
                }
            } else {
                console.log("Öğretici: Vurgulanan alan dışına tıklandı.");
            }
        } else if (gameState === 'PLAYING') {
            if (!canPlay || currentLevelIndex >= levels.length - 1) return;
            let cIN = null;
            const padding = 10;
            for (const item of clickableItems) {
                if (
                    clickX >= item.x - padding &&
                    clickX <= item.x + item.width + padding &&
                    clickY >= item.y - padding &&
                    clickY <= item.y + item.height + padding
                ) {
                    cIN = item.nameTR;
                    break;
                }
            }
            if (cIN) {
                console.log(`Oyun: Tıklandı: ${cIN}`);
                const cLD = levels[currentLevelIndex];
                const eC = cLD.clicks[currentRecipeStep];
                if (cIN === eC) {
                    console.log("Oyun: Doğru adım!");
                    currentRecipeStep++;
                    feedbackMessage = { text: 'Doğru!', color: 'lime', expiryTime: Date.now() + 1000 };
                    if (currentRecipeStep >= cLD.clicks.length) {
                        const cL = cLD.level;
                        console.log(`--- Seviye ${cL} Bitti! ---`);
                        const rAS = getRewardForLevel(cL, currentRegion);
                        currentLevelIndex++;
                        currentRecipeStep = 0;
                        if (levels[currentLevelIndex]?.clicks.length > 0) {
                            currentShuffledRecipe = shuffleArray(levels[currentLevelIndex].clicks);
                        } else {
                            currentShuffledRecipe = [];
                        }
                        if (rAS) {
                            console.warn(`%cÖDÜL! Seviye ${cL} (${rAS})`, 'color:green;font-weight:bold;');
                            const iL10 = cL === 10;
                            const winMsgPart2 = iL10 ? texts[currentLang].winMessagePart2_USDT : texts[currentLang].winMessagePart2_App.replace('{REWARD}', rAS);
                            const mBB = iL10 ? texts[currentLang].winMessageEmailBodyBase_USDT : texts[currentLang].winMessageEmailBodyBase_App;
                            const mB = encodeURIComponent(mBB.replace('{LEVEL}', cL).replace('{REWARD}', rAS));
                            const mS = encodeURIComponent(`${texts[currentLang].winMessageEmailSubjectBase}${cL}${iL10 ? ' - NAKIT ODUL' : ''}`);
                            const mTL = `mailto:${texts[currentLang].winMessageEmailAddress}?subject=${mS}&body=${mB}`;
                            const wH = `<p>${texts[currentLang].winMessagePart1}${cL}${winMsgPart2}</p><hr><p>${texts[currentLang].winMessageEmailPrompt}<br><a href="${mTL}" target="_blank"><b>${texts[currentLang].winMessageEmailAddress}</b></a><br>${texts[currentLang].winMessageEmailInstructions}</p>`;
                            showMessage(texts[currentLang].winTitle, wH, 'win');
                        }
                        const nLD = levels[currentLevelIndex];
                        if (!nLD || nLD.clicks.length === 0) {
                            console.log("OYUN TAMAMLANDI!");
                            gameState = 'GAME_OVER';
                            showMessage(texts[currentLang].gameOverTitle, texts[currentLang].gameOverMessage, 'info');
                        }
                    }
                } else {
                    console.log("Oyun: Yanlış! Baştan başla.");
                    currentRecipeStep = 0;
                    failedAttemptsToday++;
                    saveGameData();
                    console.log(`Kalan hak: ${3 - failedAttemptsToday}/3`);
                    feedbackMessage = { text: texts[currentLang]?.errorMessage || "Wrong!", color: 'red', expiryTime: Date.now() + 2500 };
                    if (failedAttemptsToday >= 3) {
                        canPlay = false;
                        console.error("Hak bitti!");
                        gameState = 'NO_ATTEMPTS';
                        setTimeout(() => {
                            if (!canPlay) {
                                showMessage(texts[currentLang]?.noAttemptsTitle || "Attempts Done", texts[currentLang]?.noAttemptsMessage || "Try tomorrow", 'error');
                            }
                        }, 500);
                    }
                }
            } else {
                console.log("Oyun: Boş alan tıklandı.");
            }
        }
    } catch (e) { console.error("handleClick Hatası:", e); }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Yüklendi.");
    try {
        canvas = document.getElementById('gameCanvas'); ctx = canvas?.getContext('2d');
        startScreenDiv=document.getElementById('startScreen'); gameTitleEl=document.getElementById('gameTitle'); gameSloganEl=document.getElementById('gameSlogan'); langTRButton=document.getElementById('langTR'); langENButton=document.getElementById('langEN'); regionSelect=document.getElementById('regionSelect'); regionLabelEl=document.getElementById('regionLabel'); rewardTitleEl=document.getElementById('rewardTitle'); rewardListEl=document.getElementById('rewardList'); startButton=document.getElementById('startButton'); gsmInput=document.getElementById('gsmInput'); kvkkCheck=document.getElementById('kvkkCheck'); gsmError=document.getElementById('gsmError'); gsmLabel=document.getElementById('gsmLabel'); kvkkLabel=document.getElementById('kvkkLabel');
        messageOverlay=document.getElementById('messageOverlay'); messageTitle=document.getElementById('messageTitle'); messageBody=document.getElementById('messageBody'); closeButton=document.getElementById('closeButton');
        if (!canvas||!ctx||!startScreenDiv||!startButton||!gsmInput||!kvkkCheck||!messageOverlay||!closeButton||!langTRButton||!langENButton||!regionSelect||!rewardListEl) { throw new Error("Kritik HTML elementleri bulunamadı!"); }
        console.log("Tüm element referansları alındı.");

        langTRButton.addEventListener('click', () => { if(currentLang!=='TR'){currentLang='TR';localStorage.setItem('barista_lang', currentLang);updateTexts(currentLang, currentRegion);}});
        langENButton.addEventListener('click', () => { if(currentLang!=='EN'){currentLang='EN';localStorage.setItem('barista_lang', currentLang);updateTexts(currentLang, currentRegion);}});
        regionSelect.addEventListener('change', (event) => { currentRegion=event.target.value; localStorage.setItem('barista_region', currentRegion); updateTexts(currentLang, currentRegion); });
        startButton.addEventListener('click', startGame);
        gsmInput.addEventListener('input', checkStartButtonState);
        kvkkCheck.addEventListener('change', checkStartButtonState);
        closeButton.addEventListener('click', hideMessage);
        canvas.addEventListener('click', handleClick);

        canvas.addEventListener('touchstart', (event) => {
            event.preventDefault();
            try {
                if (messageOverlay?.style.display === 'flex') return;
                if (!canvas) return;

                const rect = canvas.getBoundingClientRect();
                const touch = event.touches[0];

                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                const clickX = (touch.clientX - rect.left) * scaleX;
                const clickY = (touch.clientY - rect.top) * scaleY;

                console.log(`handleTouch - State: ${gameState}, Touch: ${clickX},${clickY}, Canvas: ${canvas.width}x${canvas.height}, Rect: ${rect.width}x${rect.height}`);

                const syntheticEvent = {
                    offsetX: clickX,
                    offsetY: clickY,
                    preventDefault: () => {}
                };
                handleClick(syntheticEvent);
            } catch (e) {
                console.error("handleTouch Hatası:", e);
            }
        }, { passive: false });

        console.log("Tüm olay dinleyicileri eklendi.");

        currentLang = localStorage.getItem('barista_lang') || 'TR'; currentRegion = localStorage.getItem('barista_region') || 'TR'; if(regionSelect) regionSelect.value = currentRegion; if(langTRButton) langTRButton.classList.toggle('active', currentLang === 'TR'); if(langENButton) langENButton.classList.toggle('active', currentLang === 'EN');
        loadGameData(); updateTexts(currentLang, currentRegion); checkStartButtonState();
        console.log("Başlangıç ayarları yapıldı.");

        console.log("Görseller yükleniyor (PNG)...");
        bgImage.src = './arka_plan.png';
        logoImage.src = 'Starbucks_Corporation.png';

    } catch (error) { console.error("DOMContentLoaded hatası:", error); alert("Sayfa yüklenirken kritik hata!"); }
});

bgImage.onload = function() { console.log(">>> BG Yüklendi (PNG) - Onload <<<"); bgLoaded = true; checkAssetsLoaded(); };
logoImage.onload = function() { console.log(">>> Logo Yüklendi - Onload <<<"); logoLoaded = true; checkAssetsLoaded(); };
bgImage.onerror = () => { console.error("!!! Arka Plan YÜKLENEMEDİ!"); bgLoaded = false; assetsReady = false; checkStartButtonState(); alert("Arka Plan PNG yüklenemedi!"); }
logoImage.onerror = () => { console.error("!!! Logo YÜKLENEMEDİ!"); logoLoaded = false; assetsReady = false; checkStartButtonState(); alert("Logo yüklenemedi!"); }

console.log("script.js dosyası tamamen okundu.");
