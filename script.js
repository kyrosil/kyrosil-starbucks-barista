// --- Global Değişken Tanımları ---
let canvas, ctx;
let startScreenDiv, gameTitleEl, gameSloganEl, langTRButton, langENButton, regionSelect, regionLabelEl, rewardTitleEl, rewardListEl, startButton, gsmInput, kvkkCheck, gsmError, gsmLabel, kvkkLabel;
let messageOverlay, messageTitle, messageBody, closeButton;
const bgImage = new Image(); const logoImage = new Image();
let bgLoaded = false, logoLoaded = false;
let assetsReady = false; // <<<--- BU ÖNEMLİ
let gameState = 'LOADING';
let tutorialStep = 0; let isTutorialComplete = false;
let currentLevelIndex = 0; let currentRecipeStep = 0; let canPlay = true;
let gameLoopStarted = false; let currentShuffledRecipe = [];
let currentLang = 'TR'; let currentRegion = 'TR';
let failedAttemptsToday = 0; let lastPlayDate = '';
let feedbackMessage = { text: '', color: 'red', expiryTime: 0 };
const logoWidth = 80; const logoHeight = 80; let logoX = 0; const logoY = 20;

// --- Sabit Veriler ---
const texts = {
    TR: { gameTitle:"Kyrosil Starbucks Barista", slogan:"En İyi Barista Ol! Siparişleri doğru sırayla hazırla, ödülleri kap!", regionLabel:"Bölge:", rewardTitle:"Seviye Ödülleri", startButton:"Oyuna Başla!", loadingText: "Yükleniyor...", /* Diğer metinler... */ kvkkLabel:" KVKK kapsamında...", gsmError:"Lütfen numara girip kutuyu işaretleyin.", rewardTypeApp:"(Starbucks App Kodu)", rewardTypeCash:"(NAKİT ÖDÜL!)" },
    EN: { gameTitle:"Kyrosil Starbucks Barista", slogan:"Be the Best Barista! Prepare orders correctly and grab rewards!", regionLabel:"Region:", rewardTitle:"Level Rewards", startButton:"Start Game!", loadingText: "Loading...", /* Diğer metinler... */ kvkkLabel:" I agree my number... (USA users too)", gsmError:"Please enter a number and check the box.", rewardTypeApp:"(Starbucks App Code)", rewardTypeCash:"(CASH PRIZE!)" }
    // Tüm metinleri buraya ekle (önceki koddan)
};
const rewardTiers = { TR:{/*...*/}, EU:{/*...*/} };
const clickableItems = [ /* ... 11 öğe ... */ ];
const levels = [ /* ... 10 seviye + bitiş ... */ ];

// --- Yardımcı Fonksiyon Tanımları ---
function loadGameData(){/*...*/} function saveGameData(){/*...*/} function getRewardForLevel(level, region){/*...*/} function showMessage(title, bodyHtml, type='info'){/*...*/} function hideMessage(){/*...*/} function shuffleArray(array){/*...*/}

function updateTexts(lang, region) { /* ... Önceki koddan kopyala (Detaylı ödül listesi dahil) ... */ }

// Başlat Butonu Durum Kontrolü (GÜNCELLENDİ)
function checkStartButtonState() {
    try {
        const numberEntered = gsmInput?.value.trim().length > 0;
        const kvkkValid = kvkkCheck?.checked;
        // assetsReady global değişkenine bakıyoruz
        console.log(`checkStartButtonState: num=${numberEntered}, kvkk=${kvkkValid}, assetsReady=${assetsReady}`);

        if (startButton) {
            const formOk = numberEntered && kvkkValid;

            if (formOk && assetsReady) { // Form TAMAM, Varlıklar HAZIR
                startButton.disabled = false;
                startButton.innerText = texts[currentLang]?.startButton || "Start Game!";
                if(gsmError) gsmError.style.display = 'none';
                console.log(`checkStartButtonState: Aktif!`);
            } else { // Ya form eksik YA DA varlıklar yükleniyor
                startButton.disabled = true;
                if (formOk && !assetsReady) { // Form tamam ama yükleniyor
                     startButton.innerText = texts[currentLang]?.loadingText || "Loading...";
                     console.log(`checkStartButtonState: Pasif! (Varlıklar bekleniyor)`);
                     if(gsmError) gsmError.style.display = 'none';
                } else { // Form eksik (veya hem form eksik hem yükleniyor)
                    startButton.innerText = texts[currentLang]?.startButton || "Start Game!";
                    console.log(`checkStartButtonState: Pasif! (Form eksik veya varlıklar bekleniyor)`);
                    // Hata mesajını sadece gerekli durumda göster
                    if (gsmError && (!numberEntered || !kvkkValid) && ((gsmInput && gsmInput.value.length > 0) || (kvkkCheck && kvkkCheck.checked))) {
                        gsmError.innerText = texts[currentLang]?.gsmError || "Gerekli alanları doldurun.";
                        gsmError.style.display = 'block';
                    } else if (gsmError) {
                        gsmError.style.display = 'none';
                    }
                }
            }
        } else { console.warn("Buton yok!"); }
    } catch(e) { console.error("checkStartButtonState hatası:", e); }
}

// Görsel Yükleme Kontrolü (GÜNCELLENDİ - checkStartButtonState'i çağırır)
function checkAssetsLoaded(){
    try{
        console.log(`checkAssetsLoaded: bgLoaded=${bgLoaded}, logoLoaded=${logoLoaded}, assetsReady=${assetsReady}`);
        if (bgLoaded && logoLoaded && !assetsReady) { // Sadece İKİSİ de yüklendiğinde ve DAHA ÖNCE ayarlanmadıysa
            console.log(">>> Tüm görseller yüklendi! (checkAssetsLoaded) <<<");
            assetsReady = true; // Bayrağı ayarla
            gameState = 'START_SCREEN'; // Başlangıç ekranı durumu (zaten öyle olmalı)
            console.log(">>> assetsReady = true yapıldı. Buton durumu kontrol ediliyor...");
            checkStartButtonState(); // Buton durumunu GÜNCELLE (artık aktif olabilir)
        }
    } catch(e){ console.error("checkAssetsLoaded Hatası:", e); }
}

// Oyunu Başlatma Tetikleyicisi (Aynı)
function tryStartGame() { /* ... Önceki koddan kopyala ... */ }

// Başlat Butonu Fonksiyonu (GÜNCELLENDİ - Görsel kontrolü kaldırıldı)
function startGame() {
    try {
        console.log("startGame ÇAĞRILDI!");
        // Buton zaten sadece her şey hazırsa aktifleşiyor, ek kontrole gerek yok.
        if (startButton.disabled) { console.warn("Başlatma engellendi (Buton pasif)."); return; }
        console.log("Başlatma Kontrolleri Geçildi.");
        if(startScreenDiv) startScreenDiv.style.display = 'none'; else throw new Error("startScreenDiv null!");
        if(canvas) canvas.style.display = 'block'; else throw new Error("canvas null!");
        tryStartGame(); // Oyunu başlatmayı dene (artık görsellerin hazır olduğundan eminiz)
    } catch (e) { console.error("startGame Hatası:", e); alert("Oyun başlatılamadı!"); }
}

// Ana Oyun Çizim Döngüsü (Aynı)
function drawGame() { /* ... Önceki koddan kopyala ... */ }

// Tıklama İşleyici Fonksiyon (Aynı)
function handleClick(event) { /* ... Önceki koddan kopyala ... */ }

// --- Başlangıç Kodu (DOMContentLoaded) ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Yüklendi.");
    try {
        // Element Referansları
        canvas = document.getElementById('gameCanvas'); ctx = canvas?.getContext('2d');
        startScreenDiv=document.getElementById('startScreen'); /*...*/ startButton=document.getElementById('startButton'); /*...*/
        // ... Diğer tüm element referansları ...

        if (!canvas||!ctx||!startScreenDiv||!startButton /*...tümü...*/ ) { throw new Error("Kritik HTML elementleri bulunamadı!"); }
        console.log("Tüm element referansları alındı.");

        // Olay Dinleyicileri
        /* ... Tüm addEventListener kodları ... */
        closeButton.addEventListener('click', hideMessage); // Bu da eklensin

        console.log("Tüm olay dinleyicileri eklendi.");

        // Başlangıç Ayarları
        currentLang = localStorage.getItem('barista_lang') || 'TR'; currentRegion = localStorage.getItem('barista_region') || 'TR'; if(regionSelect) regionSelect.value = currentRegion; /*...*/
        loadGameData();
        updateTexts(currentLang, currentRegion);
        checkStartButtonState(); // İlk durumu ayarla (pasif olacak)
        console.log("Başlangıç ayarları yapıldı.");

        // Görsel yüklemelerini başlat
        console.log("Görseller yükleniyor...");
        bgImage.src = './arka_plan.png'; // PNG!
        logoImage.src = 'Starbucks_Corporation.png';

    } catch (error) { console.error("DOMContentLoaded hatası:", error); alert("Sayfa yüklenirken hata!"); }
});

// Hata logları
bgImage.onerror = () => { console.error("!!! Arka Plan YÜKLENEMEDİ!"); bgLoaded = false; assetsReady = false; checkAssetsLoaded(); alert("Arka Plan PNG yüklenemedi!"); }
logoImage.onerror = () => { console.error("!!! Logo YÜKLENEMEDİ!"); logoLoaded = false; assetsReady = false; checkAssetsLoaded(); alert("Logo yüklenemedi!"); } // Logo yüklenemezse de başlatma!

console.log("script.js dosyası tamamen okundu.");

// --- Tüm Fonksiyon Tanımlarını Buraya Ekle ---
// ÖNEMLİ: loadGameData, saveGameData, getRewardForLevel, showMessage, hideMessage,
// shuffleArray, updateTexts, tryStartGame, drawGame, handleClick fonksiyonlarının
// TAM ve DOĞRU içeriklerini buraya önceki kodlardan (#169 veya #171) DİKKATLİCE kopyala.
// Yukarıdaki kod sadece yapı ve DÜZELTMELERİ gösteriyor.
