// --- Global Değişken Tanımları ---
let canvas, ctx;
let startScreenDiv, gameTitleEl, gameSloganEl, langTRButton, langENButton, regionSelect, regionLabelEl, rewardTitleEl, rewardListEl, startButton, gsmInput, kvkkCheck, gsmError, gsmLabel, kvkkLabel;
let messageOverlay, messageTitle, messageBody, closeButton;
const bgImage = new Image();
const logoImage = new Image();
let bgLoaded = false, logoLoaded = false;
let gameState = 'LOADING';
let tutorialStep = 0;
let isTutorialComplete = false;
let currentLevelIndex = 0;
let currentRecipeStep = 0;
let canPlay = false;
let gameLoopStarted = false;
let currentShuffledRecipe = [];
let currentLang = 'TR';
let currentRegion = 'TR';
let failedAttemptsToday = 0;
let lastPlayDate = '';
let feedbackMessage = { text: '', color: 'red', expiryTime: 0 };

// --- Sabit Veriler ---
const texts = {
    TR: { /* Aynı sabit veriler burada kalabilir, kısaltıyorum */ gameTitle:"Kyrosil Starbucks Barista", slogan:"En İyi Barista Ol!", regionLabel:"Bölge:", rewardTitle:"Seviye Ödülleri", startButton:"Oyuna Başla!", attemptsLeft:"Kalan Hata Hakkı", errorTitle:"Hata!", errorMessage:"Yanlış malzeme veya sıra!", closeButton:"Tamam" },
    EN: { gameTitle:"Kyrosil Starbucks Barista", slogan:"Be the Best Barista!", regionLabel:"Region:", rewardTitle:"Level Rewards", startButton:"Start Game!", attemptsLeft:"Attempts Left", errorTitle:"Error!", errorMessage:"Wrong item or sequence!", closeButton:"OK" }
};
const rewardTiers = { TR:{2:"200 TL",4:"600 TL",6:"2.000 TL",8:"5.000 TL",10:"500 USDT"}, EU:{2:"5 USD",4:"15 USD",6:"40 USD",8:"100 USD",10:"500 USDT"} };
const clickableItems = [{name:'Espresso Makinesi',x:605,y:300,width:50,height:60},{name:'Yeşil Şişe',x:300,y:245,width:30,height:55},{name:'Şurup Pompası',x:340,y:245,width:30,height:55},{name:'Süt Kutusu',x:390,y:245,width:30,height:55},{name:'Bardak Alanı',x:330,y:357,width:50,height:50},{name:'Tezgahtaki Kedi',x:442,y:352,width:70,height:40},{name:'Kasa',x:700,y:300,width:60,height:60},{name:'Sipariş Fişi',x:780,y:240,width:15,height:30},{name:'Buzdolabı',x:445,y:305,width:70,height:40},{name:'Tatlı Dolabı',x:700,y:450,width:80,height:60},{name:'Fiyat Listesi',x:500,y:80,width:100,height:200}];
const levels = [{level:1,recipeName:"İlk Sipariş",clicks:['Sipariş Fişi','Espresso Makinesi']},{level:2,recipeName:"Caffè Latte",clicks:['Espresso Makinesi','Süt Kutusu']},{level:3,recipeName:"Soğuk Kahve",clicks:['Bardak Alanı','Buzdolabı','Espresso Makinesi']}]; // Kısaltılmış versiyon
const logoWidth = 80;
const logoHeight = 80;
let logoX = 0;
const logoY = 20;

// --- Yardımcı Fonksiyon Tanımları ---
function loadGameData() {
    try {
        const today = new Date().toISOString().split('T')[0];
        lastPlayDate = localStorage.getItem('barista_lastPlayDate') || today;
        failedAttemptsToday = parseInt(localStorage.getItem('barista_failedAttempts') || '0', 10);
        if (lastPlayDate !== today) {
            failedAttemptsToday = 0;
            lastPlayDate = today;
            saveGameData();
        }
        canPlay = failedAttemptsToday < 3;
    } catch (e) { console.error("loadGameData Hatası:", e); canPlay = false; }
}

function saveGameData() {
    try {
        localStorage.setItem('barista_lastPlayDate', lastPlayDate);
        localStorage.setItem('barista_failedAttempts', failedAttemptsToday.toString());
    } catch (e) { console.error("saveGameData Hatası:", e); }
}

function showMessage(title, bodyHtml, type = 'info') {
    try {
        messageTitle.innerText = title;
        messageBody.innerHTML = bodyHtml;
        messageOverlay.className = `overlay message-${type}`;
        messageOverlay.style.display = 'flex';
        canPlay = false;
    } catch (e) { console.error("showMessage Hatası:", e); }
}

function hideMessage() {
    try {
        messageOverlay.style.display = 'none';
        if (failedAttemptsToday < 3 && currentLevelIndex < levels.length - 1 && gameState === 'PLAYING') canPlay = true;
    } catch (e) { console.error("hideMessage Hatası:", e); }
}

function shuffleArray(array) {
    let ci = array.length, ri;
    const na = array.slice();
    while (ci !== 0) {
        ri = Math.floor(Math.random() * ci);
        ci--;
        [na[ci], na[ri]] = [na[ri], na[ci]];
    }
    return na;
}

function updateTexts(lang, region) {
    try {
        const t = texts[lang];
        gameTitleEl.innerText = t.gameTitle;
        gameSloganEl.innerText = t.slogan;
        regionLabelEl.innerText = t.regionLabel;
        rewardTitleEl.innerText = t.rewardTitle;
        startButton.innerText = t.startButton;
        closeButton.innerText = t.closeButton;
    } catch (error) { console.error("updateTexts hatası:", error); }
}

function checkStartButtonState() {
    try {
        const numberEntered = gsmInput.value.trim().length > 0;
        const kvkkValid = kvkkCheck.checked;
        startButton.disabled = !(numberEntered && kvkkValid);
    } catch (e) { console.error("checkStartButtonState hatası:", e); }
}

function tryStartGame() {
    try {
        loadGameData();
        if (!canPlay) {
            gameState = 'NO_ATTEMPTS';
            showMessage("Hakların Bitti!", "Bugün 3 hata hakkın doldu.", 'error');
        } else {
            gameState = 'TUTORIAL';
            tutorialStep = 0;
            isTutorialComplete = false;
            if (levels[currentLevelIndex]?.clicks.length > 0) {
                currentShuffledRecipe = shuffleArray(levels[currentLevelIndex].clicks);
            }
            requestAnimationFrame(drawGame);
        }
    } catch (e) { console.error("tryStartGame hatası:", e); }
}

function startGame() {
    try {
        checkStartButtonState();
        if (startButton.disabled) return;
        startScreenDiv.style.display = 'none';
        canvas.style.display = 'block';
        tryStartGame();
    } catch (e) { console.error("startGame Hatası:", e); }
}

function drawGame() {
    try {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (bgLoaded) ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        else ctx.fillStyle = 'white'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (logoLoaded) {
            logoX = canvas.width / 2 - logoWidth / 2;
            ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
        }
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${texts[currentLang].attemptsLeft}: ${3 - failedAttemptsToday}`, 20, 30);

        if (gameState === 'TUTORIAL') {
            const iTS = clickableItems[tutorialStep];
            if (iTS) {
                ctx.strokeStyle = 'yellow';
                ctx.lineWidth = 3;
                ctx.strokeRect(iTS.x - 2, iTS.y - 2, iTS.width + 4, iTS.height + 4);
            }
        }
        if (gameLoopStarted) requestAnimationFrame(drawGame);
    } catch (e) { console.error("Draw HATA:", e); gameLoopStarted = false; }
}

function handleClick(event) {
    try {
        if (gameState === 'TUTORIAL') {
            const iTC = clickableItems[tutorialStep];
            if (iTC && event.offsetX >= iTC.x && event.offsetX <= iTC.x + iTC.width && event.offsetY >= iTC.y && event.offsetY <= iTC.y + iTC.height) {
                tutorialStep++;
                if (tutorialStep >= clickableItems.length) {
                    isTutorialComplete = true;
                    gameState = 'PLAYING';
                    currentLevelIndex = 0;
                    currentRecipeStep = 0;
                    if (levels[currentLevelIndex]?.clicks.length > 0) {
                        currentShuffledRecipe = shuffleArray(levels[currentLevelIndex].clicks);
                    }
                }
                requestAnimationFrame(drawGame);
            }
        }
    } catch (e) { console.error("handleClick Hatası:", e); }
}

// --- Başlangıç Kodu ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Yüklendi.");
    try {
        canvas = document.getElementById('gameCanvas');
        ctx = canvas?.getContext('2d');
        startScreenDiv = document.getElementById('startScreen');
        gameTitleEl = document.getElementById('gameTitle');
        gameSloganEl = document.getElementById('gameSlogan');
        langTRButton = document.getElementById('langTR');
        langENButton = document.getElementById('langEN');
        regionSelect = document.getElementById('regionSelect');
        regionLabelEl = document.getElementById('regionLabel');
        rewardTitleEl = document.getElementById('rewardTitle');
        rewardListEl = document.getElementById('rewardList');
        startButton = document.getElementById('startButton');
        gsmInput = document.getElementById('gsmInput');
        kvkkCheck = document.getElementById('kvkkCheck');
        gsmError = document.getElementById('gsmError');
        gsmLabel = document.getElementById('gsmLabel');
        kvkkLabel = document.getElementById('kvkkLabel');
        messageOverlay = document.getElementById('messageOverlay');
        messageTitle = document.getElementById('messageTitle');
        messageBody = document.getElementById('messageBody');
        closeButton = document.getElementById('closeButton');

        if (!canvas || !ctx || !startScreenDiv || !startButton || !gsmInput || !kvkkCheck || !messageOverlay || !closeButton) {
            throw new Error("Kritik HTML elementleri bulunamadı!");
        }

        langTRButton.addEventListener('click', () => { currentLang = 'TR'; updateTexts(currentLang, currentRegion); });
        langENButton.addEventListener('click', () => { currentLang = 'EN'; updateTexts(currentLang, currentRegion); });
        regionSelect.addEventListener('change', (event) => { currentRegion = event.target.value; updateTexts(currentLang, currentRegion); });
        startButton.addEventListener('click', startGame);
        gsmInput.addEventListener('input', checkStartButtonState);
        kvkkCheck.addEventListener('change', checkStartButtonState);
        closeButton.addEventListener('click', hideMessage);
        canvas.addEventListener('click', handleClick);

        currentLang = localStorage.getItem('barista_lang') || 'TR';
        currentRegion = localStorage.getItem('barista_region') || 'TR';
        regionSelect.value = currentRegion;
        langTRButton.classList.toggle('active', currentLang === 'TR');
        langENButton.classList.toggle('active', currentLang === 'EN');
        loadGameData();
        updateTexts(currentLang, currentRegion);
        checkStartButtonState();

        // Görsel yüklemeleri
        bgImage.onload = () => { bgLoaded = true; startGameLoopIfReady(); };
        logoImage.onload = () => { logoLoaded = true; startGameLoopIfReady(); };
        bgImage.onerror = () => { console.error("BG Yüklenemedi!"); bgLoaded = true; startGameLoopIfReady(); };
        logoImage.onerror = () => { console.error("Logo Yüklenemedi!"); logoLoaded = true; startGameLoopIfReady(); };
        bgImage.src = 'original.gif';
        logoImage.src = 'Starbucks_Corporation.png';
    } catch (error) { console.error("DOMContentLoaded hatası:", error); alert("Sayfa yüklenirken hata!"); }
});

function startGameLoopIfReady() {
    if (bgLoaded && logoLoaded) {
        gameLoopStarted = true;
        requestAnimationFrame(drawGame);
    }
}
