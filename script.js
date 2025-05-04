// --- Global Değişken Tanımları ---
let canvas, ctx;
let startScreenDiv, gameTitleEl, gameSloganEl, langTRButton, langENButton, regionSelect, regionLabelEl, rewardTitleEl, rewardListEl, startButton, gsmInput, kvkkCheck, gsmError, gsmLabel, kvkkLabel;
let messageOverlay, messageTitle, messageBody, closeButton;
const bgImage = new Image(); const logoImage = new Image();
let bgLoaded = false, logoLoaded = false;
let assetsReady = false; // <<<--- YENİ: Görsellerin yüklendiğini belirten bayrak
let gameState = 'LOADING';
let tutorialStep = 0; let isTutorialComplete = false;
let currentLevelIndex = 0; let currentRecipeStep = 0; let canPlay = true;
let gameLoopStarted = false; let currentShuffledRecipe = [];
let currentLang = 'TR'; let currentRegion = 'TR';
let failedAttemptsToday = 0; let lastPlayDate = '';
let feedbackMessage = { text: '', color: 'red', expiryTime: 0 };
const logoWidth = 80; const logoHeight = 80; let logoX = 0; const logoY = 20;

// --- Sabit Veriler ---
const texts = { TR: { /*...*/ }, EN: { /*...*/ } }; // Önceki koddan tam halleri
const rewardTiers = { TR:{/*...*/}, EU:{/*...*/} };
const clickableItems = [ /* ... 11 öğe ... */ ];
const levels = [ /* ... 10 seviye + bitiş ... */ ];

// --- Yardımcı Fonksiyon Tanımları ---
function loadGameData(){/*...*/} function saveGameData(){/*...*/} function getRewardForLevel(level, region){/*...*/} function showMessage(title, bodyHtml, type='info'){/*...*/} function hideMessage(){/*...*/} function shuffleArray(array){/*...*/}

function updateTexts(lang, region) { /* ... Önceki koddan tam fonksiyon ... */ }

// Başlat Butonu Durum Kontrolü (GÜNCELLENDİ - assetsReady kontrolü eklendi)
function checkStartButtonState() {
    try {
        const numberEntered = gsmInput?.value.trim().length > 0;
        const kvkkValid = kvkkCheck?.checked;
        // YENİ: assetsReady kontrolü
        const canEnable = numberEntered && kvkkValid && assetsReady;
        console.log(`checkStartButtonState: num=${numberEntered}, kvkk=${kvkkValid}, assetsReady=${assetsReady} => canEnable=${canEnable}`);

        if(startButton){
            if (canEnable) {
                startButton.disabled = false;
                if(gsmError)gsmError.style.display = 'none';
                console.log(`checkStartButtonState: Aktif!`);
            } else {
                startButton.disabled = true;
                console.log(`checkStartButtonState: Pasif!`);
                if (gsmError && (!numberEntered || !kvkkValid) && ((gsmInput && gsmInput.value.length > 0) || (kvkkCheck && kvkkCheck.checked)) && assetsReady /* Sadece varlıklar yüklendikten sonra hata göster */) {
                    gsmError.innerText = texts[currentLang]?.gsmError || "Gerekli alanları doldurun.";
                    gsmError.style.display = 'block';
                } else if (gsmError) {
                    gsmError.style.display = 'none';
                }
            }
        } else { console.warn("Buton yok!"); }
    } catch(e){ console.error("checkStartButtonState hatası:", e); }
}

// Görsel Yükleme Kontrolü (GÜNCELLENDİ - assetsReady ayarlar ve checkStartButtonState çağırır)
function checkAssetsLoaded(){
    try{
        console.log(`checkAssetsLoaded: bgLoaded=${bgLoaded}, logoLoaded=${logoLoaded}, assetsReady=${assetsReady}`);
        // Sadece İKİSİ de yüklendiğinde ve DAHA ÖNCE ayarlanmadıysa çalıştır
        if (bgLoaded && logoLoaded && !assetsReady) {
            console.log(">>> Tüm görseller yüklendi! (checkAssetsLoaded) <<<");
            assetsReady = true; // Bayrağı ayarla
            gameState = 'START_SCREEN'; // Başlangıç ekranı hazır
            console.log(">>> assetsReady = true yapıldı. Buton durumu kontrol ediliyor...");
            checkStartButtonState(); // Buton durumunu GÜNCELLE (artık aktif olabilir)
        }
    } catch(e){ console.error("checkAssetsLoaded Hatası:", e); }
}

// Oyunu Başlatma Tetikleyicisi (Aynı)
function tryStartGame() { /* ... Önceki koddan kopyala ... */ }

// Başlat Butonu Fonksiyonu (GÜNCELLENDİ - Görsel yükleme kontrolü KALDIRILDI)
function startGame() {
    try {
        console.log("startGame ÇAĞRILDI!");
        // checkStartButtonState(); // Zaten input/check olaylarında çağrılıyor, butona basmadan önce tekrar kontrol etmeye gerek yok
        if (startButton.disabled) { // Buton pasifse (yani ya şartlar sağlanmadı ya da görseller yüklenmedi)
            console.warn("Başlatma engellendi (Buton pasif).");
            // Gerekirse gsmError'u tekrar göster? checkStartButtonState zaten yapıyor olmalı.
            // if(gsmError && !startButton.disabled) gsmError.style.display = 'block';
            return;
        }
        console.log("Başlatma Kontrolleri Geçildi.");
        // Buton aktifse, görsellerin yüklenmiş olması GARANTİ. Kontrole gerek yok.
        if(startScreenDiv) startScreenDiv.style.display = 'none'; else throw new Error("startScreenDiv null!");
        if(canvas) canvas.style.display = 'block'; else throw new Error("canvas null!");
        tryStartGame(); // Oyunu başlat
    } catch (e) {
        console.error("startGame Hatası:", e);
        alert("Oyun başlatılamadı!");
    }
}

// Ana Oyun Çizim Döngüsü (Aynı)
function drawGame() { /* ... Önceki koddan kopyala ... */ }

// Tıklama İşleyici Fonksiyon (Aynı)
function handleClick(event) { /* ... Önceki koddan kopyala ... */ }


// --- Başlangıç Kodu (DOMContentLoaded) ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Yüklendi.");
    try {
        // Element Referanslarını Al
        canvas = document.getElementById('gameCanvas'); ctx = canvas?.getContext('2d');
        startScreenDiv=document.getElementById('startScreen'); /*...*/ startButton=document.getElementById('startButton'); /*...*/ gsmInput=document.getElementById('gsmInput'); kvkkCheck=document.getElementById('kvkkCheck'); /*...*/ messageOverlay=document.getElementById('messageOverlay'); /*...*/ closeButton=document.getElementById('closeButton'); /*...*/
        if (!canvas||!ctx||!startScreenDiv||!startButton||!gsmInput||!kvkkCheck||!messageOverlay||!closeButton||/*!...*/ ) { throw new Error("Kritik HTML elementleri bulunamadı!"); }
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
        loadGameData();
        updateTexts(currentLang, currentRegion); // İlk metinleri yükle
        // Görseller yüklenmeden buton pasif olmalı, checkAssetsLoaded halledecek.
        checkStartButtonState(); // İlk durumu ayarla (pasif olacak başta)
        console.log("Başlangıç ayarları yapıldı.");

        // Görsel yüklemelerini başlat
        console.log("Görseller yükleniyor...");
        bgImage.src = './arka_plan.png'; // PNG KULLANILIYOR!
        logoImage.src = 'Starbucks_Corporation.png';

    } catch (error) { console.error("DOMContentLoaded hatası:", error); alert("Sayfa yüklenirken kritik hata!"); }
});

// Hata logları
bgImage.onerror = () => { console.error("!!! Arka Plan YÜKLENEMEDİ! Dosya adı/yolu: ./arka_plan.png"); bgLoaded = false; checkAssetsLoaded(); alert("Arka Plan PNG yüklenemedi!"); }
logoImage.onerror = () => { console.error("!!! Logo YÜKLENEMEDİ!"); logoLoaded = false; checkAssetsLoaded(); alert("Logo yüklenemedi!"); } // Logo YÜKLENEMEZSE DE assetsReady true OLMAZ!

console.log("script.js dosyası tamamen okundu.");

// --- Tüm Fonksiyon Tanımları Buraya Eklenecek ---
// ÖNEMLİ: updateTexts, checkStartButtonState, drawGame, handleClick gibi TÜM fonksiyonların
// TAM ve DOĞRU içeriklerini buraya yerleştirmelisin (Önceki mesajdaki #169 gibi).
// Yukarıdaki kod sadece yapıyı ve DÜZELTMELERİ gösteriyor.
