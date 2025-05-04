// Canvas ve Context...
const canvas = document.getElementById('gameCanvas'); const ctx = canvas.getContext('2d');
// Giriş Ekranı Elementleri...
const startScreenDiv=document.getElementById('startScreen'); const gameTitleEl=document.getElementById('gameTitle'); /*...*/ const startButton=document.getElementById('startButton'); const gsmInput=document.getElementById('gsmInput'); const kvkkCheck=document.getElementById('kvkkCheck'); const gsmError=document.getElementById('gsmError'); /*...*/
// Mesajlaşma Elementleri ...
const messageOverlay=document.getElementById('messageOverlay'); /*...*/ const closeButton=document.getElementById('closeButton');
// Görsel Nesneleri ve Yükleme Durumları ...
const bgImage = new Image(); const logoImage = new Image(); let bgLoaded = false, logoLoaded = false;
// Oyun Durumları ...
let gameState = 'LOADING'; let tutorialStep = 0; let isTutorialComplete = false;
// Oyun Değişkenleri ...
let currentLevelIndex = 0; let currentRecipeStep = 0; let canPlay = false; let gameLoopStarted = false; let currentShuffledRecipe = [];
// Dil ve Bölge ...
let currentLang = 'TR'; let currentRegion = 'TR';
// localStorage ve Günlük Hak Takibi ...
let failedAttemptsToday = 0; let lastPlayDate = '';
function loadGameData(){/*...*/} function saveGameData(){/*...*/}
// Geri Bildirim Mesajı Değişkenleri ...
let feedbackMessage = { text: '', color: 'red', expiryTime: 0 };
// Metinler Objesi ...
const texts = { TR: { /*...*/ }, EN: { /*...*/ } }; // Önceki koddan kopyala
// Ödül Seviyeleri ...
const rewardTiers = { TR:{/*...*/}, EU:{/*...*/} }; function getRewardForLevel(level, region) { return rewardTiers[region]?.[level] || null; }
// Mesaj Gösterme Fonksiyonları ...
function showMessage(title, bodyHtml, type='info'){/*...*/} function hideMessage(){/*...*/} closeButton.addEventListener('click', hideMessage);
// Tıklanabilir Alanlar ...
const clickableItems = [ /* ... 11 öğe ... */ ];
// Seviye Tarifleri ...
const levels = [ /* ... 10 seviye + bitiş ... */ ];
// Görsel yükleme olayları...
bgImage.onload = function(){console.log("BG yüklendi");bgLoaded=true;if(logoLoaded)checkAssetsLoaded();};
logoImage.onload = function(){console.log("Logo yüklendi");logoLoaded=true;if(bgLoaded)checkAssetsLoaded();};
const logoWidth = 80; const logoHeight = 80; const logoX = canvas.width/2-logoWidth/2; const logoY = 20;

// Tüm Görseller Yüklendi Mi Kontrolü ...
function checkAssetsLoaded(){if(bgLoaded&&logoLoaded&&gameState==='LOADING'){console.log("Görseller yüklendi...");gameState='START_SCREEN';loadGameData();updateTexts(currentLang,currentRegion);checkStartButtonState();/*Butonu kontrol et*/}}

// Fisher-Yates Shuffle Algoritması ...
function shuffleArray(array){/*...*/}

// Ana oyun döngüsü fonksiyonu ...
function drawGame() { /* ... Önceki koddan kopyala ... */ }

// Metin Güncelleme Fonksiyonu ...
function updateTexts(lang, region) { /* ... Önceki koddan kopyala ... */ }

// Olay Dinleyicileri (Giriş Ekranı) ...
langTRButton.addEventListener('click', () => { if(currentLang!=='TR'){currentLang='TR';updateTexts(currentLang, currentRegion);}});
langENButton.addEventListener('click', () => { if(currentLang!=='EN'){currentLang='EN';updateTexts(currentLang, currentRegion);}});
regionSelect.addEventListener('change', (event) => { currentRegion=event.target.value; console.log("Bölge seçildi:",currentRegion); updateTexts(currentLang, currentRegion); });
startButton.addEventListener('click', startGame); // <<<--- startGame'i çağırıyor

// Başlat Butonu Durum Kontrolü (GÜNCELLENDİ - Loglar eklendi)
function checkStartButtonState() {
    const numberEntered = gsmInput.value.trim().length > 0;
    const kvkkValid = kvkkCheck.checked;
    console.log(`checkStartButtonState: numberEntered=${numberEntered}, kvkkValid=${kvkkValid}`); // <<<--- DEBUG LOG 1

    if (numberEntered && kvkkValid) {
        startButton.disabled = false;
        gsmError.style.display = 'none';
        console.log(`checkStartButtonState: Buton Aktif Edildi! (disabled=false)`); // <<<--- DEBUG LOG 2
    } else {
        startButton.disabled = true;
        console.log(`checkStartButtonState: Buton Pasif Edildi! (disabled=true)`); // <<<--- DEBUG LOG 3
        if ( (!numberEntered || !kvkkValid) && (gsmInput.value.length > 0 || kvkkCheck.checked) ) {
             gsmError.innerText = texts[currentLang].gsmError;
             gsmError.style.display = 'block';
        } else {
             gsmError.style.display = 'none';
        }
    }
}
gsmInput.addEventListener('input', checkStartButtonState);
kvkkCheck.addEventListener('change', checkStartButtonState);
// --- Başlat Butonu Kontrol Sonu ---


// tryStartGame Fonksiyonu (Aynı)
function tryStartGame() { /* ... Önceki koddan kopyala ... */ }

// Oyunu Başlatma Fonksiyonu (GÜNCELLENDİ - Log eklendi)
function startGame() {
    console.log("startGame fonksiyonu ÇAĞRILDI!"); // <<<--- DEBUG LOG 4
    checkStartButtonState(); // Son durumu kontrol et
    if (startButton.disabled) {
        console.warn("Başlatma engellendi: Buton hala pasif.");
        gsmError.style.display = 'block';
        return;
    }
    console.log("Başlatma Kontrolleri Geçildi.");
    startScreenDiv.style.display = 'none';
    canvas.style.display = 'block';
    tryStartGame(); // Oyun durumunu ayarla ve döngüyü tetikle
}

// Tıklama İşleyici Fonksiyon (Aynı)
function handleClick(event) { /* ... Önceki koddan kopyala ... */ }

// Olay dinleyicileri
canvas.addEventListener('click', handleClick);
// Hata logları
bgImage.onerror = () => { console.error("BG Yüklenemedi!"); }
logoImage.onerror = () => { console.error("Logo Yüklenemedi!"); }

// Başlangıç Ayarları (DOMContentLoaded - tryStartGame çağrısı yok artık)
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Yüklendi.");
    loadGameData();
    updateTexts(currentLang, currentRegion);
    checkStartButtonState(); // Butonun ilk durumunu ayarla
    console.log("Görseller yükleniyor...");
    bgImage.src = 'original.gif';
    logoImage.src = 'Starbucks_Corporation.png';
});

console.log("script.js dosyası okundu.");
