// --- Global Değişkenler ---
let canvas, ctx;
let startScreenDiv, startButton;
const bgImage = new Image();
let bgLoaded = false;
let gameLoopStarted = false;
let gameState = 'LOADING'; // Başlangıç durumu
let currentLang = 'TR'; // updateTexts'in hata vermemesi için tanımlı olmalı

console.log("--- script.js BAŞLADI (texts düzeltmeli) ---");

// --- Metinler Objesi (GERİ EKLENDİ!) ---
// Sadece başlangıç ekranı buton metni için gerekli, kalanı sonra kullanılacak
const texts = {
    TR: { startButton:"TEST: Oyunu Başlat", gsmError: "...", kvkkLabel: "...", /* ... diğer TR metinleri ...*/ },
    EN: { startButton:"Start Background Test", gsmError: "...", kvkkLabel: "...", /* ... diğer EN metinleri ...*/ }
};
// --- Metinler Objesi Sonu ---


// --- Resim Yükleme Olayları ---
bgImage.onload = function() {
    console.log(">>> ARKA PLAN RESMİ YÜKLENDİ! (onload) <<<");
    bgLoaded = true;
    if (canvas && canvas.style.display === 'block') {
        console.log("BG loaded after Start click, attempting draw...");
        drawJustBackground();
    }
};
bgImage.onerror = () => {
    console.error("!!! ARKA PLAN RESMİ YÜKLENEMEDİ !!! Yol veya dosya adı doğru mu? (./original.gif)");
    alert("ARKA PLAN YÜKLENEMEDİ! 'original.gif' dosyasının doğru yerde olduğundan emin misin?");
    bgLoaded = false; // Yüklenmedi
    if (canvas && canvas.style.display === 'block') {
        drawJustBackground(); // Gri ekran çiz
    }
};

// --- Çizim Fonksiyonu (Sadece Arka Plan) ---
function drawJustBackground() {
    console.log("--- drawJustBackground fonksiyonu çalıştı ---");
    try {
        if (!canvas) { console.error("Canvas elementi bulunamadı!"); return; }
        if (!ctx) { console.error("Canvas context (ctx) bulunamadı!"); return; }
        console.log(`Canvas Boyutları: ${canvas.width}x${canvas.height}`);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        console.log("Canvas temizlendi.");

        if (bgLoaded && bgImage.complete && bgImage.naturalWidth > 0) {
            console.log(">>> Arka planı çizmeye çalışıyor...");
            ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
            console.log(">>> drawImage(bgImage) komutu ÇALIŞTIRILDI! Arka plan GÖRÜNMELİ! <<<");
            // alert("ARKA PLAN GÖRÜNMELİ ŞİMDİ!"); // Alert'ü kaldırdım, konsol yeterli
        } else {
            console.warn("Arka plan çizilemedi çünkü yüklenmedi veya hazır değil.");
            console.warn(`Durum: bgLoaded=${bgLoaded}, bgImage.complete=${bgImage.complete}, bgImage.naturalWidth=${bgImage.naturalWidth}`);
            ctx.fillStyle = '#DDDDDD'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'black'; ctx.font = '24px Arial'; ctx.textAlign = 'center';
            ctx.fillText("Arka Plan Yükleniyor/Çizilemiyor...", canvas.width / 2, canvas.height / 2);
            ctx.textAlign = 'left';
        }
        console.log("--- drawJustBackground fonksiyonu bitti ---");
    } catch (e) { console.error("!!! Çizim sırasında HATA:", e); alert("Arka plan çizilirken hata! Konsola bakın."); }
    gameLoopStarted = false; // Döngü yok, sadece bir kare çizildi
}

// --- Oyunu Başlatma Fonksiyonu ---
function startGame() {
    try {
        console.log(">>> startGame ÇAĞRILDI! <<<");
        if (startScreenDiv) startScreenDiv.style.display = 'none'; else console.error("startScreenDiv yok!");
        if (canvas) canvas.style.display = 'block'; else console.error("canvas yok!");
        // Sadece çizim fonksiyonunu çağır
        drawJustBackground();
    } catch (e) { console.error("startGame Hatası:", e); alert("Oyun başlatılırken hata!"); }
}

// --- SAYFA YÜKLENDİĞİNDE ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Yüklendi.");
    try {
        // Gerekli elementleri al
        canvas = document.getElementById('gameCanvas'); ctx = canvas?.getContext('2d');
        startScreenDiv = document.getElementById('startScreen'); startButton = document.getElementById('startButton');

        if (!canvas || !ctx || !startScreenDiv || !startButton ) { throw new Error("Kritik HTML elementleri bulunamadı!"); }
        console.log("Temel elementler bulundu.");

        // Başlat Butonu Dinleyicisi
        startButton.addEventListener('click', startGame);
        console.log("Start butonu dinleyicisi eklendi.");

        // Butonu manuel aktif et ve metnini ayarla
        startButton.disabled = false;
        // texts objesi artık tanımlı olduğu için hata vermemeli
        startButton.innerText = texts[currentLang]?.startButton || "Start Test";
        console.log("Start butonu aktif edildi.");

        // Arka plan görselini yüklemeyi başlat
        console.log("Arka plan yükleniyor (./original.gif)...");
        bgImage.src = './original.gif'; // Aynı klasörde olduğundan emin ol

    } catch (error) { console.error("DOMContentLoaded içinde KRİTİK HATA:", error); alert("Sayfa yüklenirken önemli bir hata oluştu!"); }
});

console.log("script.js dosyası tamamen okundu.");
