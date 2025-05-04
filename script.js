// --- Global Değişkenler ---
let canvas, ctx;
let startScreenDiv, startButton; // Sadece gerekli HTML elementleri
const bgImage = new Image();      // Sadece arka plan resmi
let bgLoaded = false;

console.log("--- BASİTLEŞTİRİLMİŞ script.js BAŞLADI ---");

// --- Resim Yükleme Olayları ---
bgImage.onload = function() {
    console.log(">>> ARKA PLAN RESMİ YÜKLENDİ! (onload) <<<");
    bgLoaded = true;
    // Eğer Start'a basıldıktan sonra yüklendiyse, çizimi tekrar tetikle
    if (canvas && canvas.style.display === 'block') {
        console.log("BG Start sonrası yüklendi, çizim deneniyor...");
        drawJustBackground();
    }
};
bgImage.onerror = () => {
    console.error("!!! ARKA PLAN RESMİ YÜKLENEMEDİ !!! Yolu kontrol et: ./original.gif");
    alert("ARKA PLAN YÜKLENEMEDİ! 'original.gif' dosyasının doğru yerde olduğundan emin misin?");
    bgLoaded = false; // Yüklenmedi olarak işaretle
     // Yüklenemese bile gri ekran çizelim
    if (canvas && canvas.style.display === 'block') {
        drawJustBackground();
    }
};

// --- Çizim Fonksiyonu (Sadece Arka Plan) ---
function drawJustBackground() {
    console.log("--- drawJustBackground fonksiyonu çalıştı ---");
    try {
        if (!canvas) { console.error("Canvas elementi bulunamadı!"); return; }
        if (!ctx) { console.error("Canvas context (ctx) bulunamadı!"); return; }
        console.log(`Canvas Boyutları: ${canvas.width}x${canvas.height}`);

        // Ekranı temizle (Her ihtimale karşı)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        console.log("Canvas temizlendi.");

        if (bgLoaded && bgImage.complete && bgImage.naturalWidth > 0) {
            console.log(">>> Arka planı çizmeye çalışıyor...");
            // Arka planı çiz
            ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
            console.log(">>> drawImage(bgImage) komutu ÇALIŞTIRILDI! <<<");
            alert("ARKA PLAN GÖRÜNMELİ ŞİMDİ!"); // <<<--- KULLANICI İÇİN UYARI
        } else {
            console.warn("Arka plan çizilemedi çünkü yüklenmedi veya hazır değil.");
            console.warn(`Durum: bgLoaded=${bgLoaded}, bgImage.complete=${bgImage.complete}, bgImage.naturalWidth=${bgImage.naturalWidth}`);
            // Yüklenemediyse veya bekleniyorsa geçici bilgi yaz
            ctx.fillStyle = '#DDDDDD';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'black'; ctx.font = '24px Arial'; ctx.textAlign = 'center';
            ctx.fillText("Arka Plan Resmi Yükleniyor veya Yüklenemedi...", canvas.width / 2, canvas.height / 2);
            ctx.textAlign = 'left';
        }
        console.log("--- drawJustBackground fonksiyonu bitti ---");
    } catch (e) {
        console.error("!!! Çizim sırasında HATA:", e);
        alert("Arka plan çizilirken bir JavaScript hatası oluştu! Lütfen F12 konsoluna bakın.");
    }
    // Döngü yok, sadece tek kare çizilecek
}

// --- Oyunu Başlatma Fonksiyonu (Sadece Çizimi Tetikler) ---
function startGame() {
    try {
        console.log(">>> startGame ÇAĞRILDI! <<<");
        if (startScreenDiv) startScreenDiv.style.display = 'none'; else console.error("startScreenDiv yok!");
        if (canvas) canvas.style.display = 'block'; else console.error("canvas yok!");

        // Sadece çizim fonksiyonunu çağır
        drawJustBackground();

    } catch (e) {
        console.error("startGame Hatası:", e);
        alert("Oyun başlatılırken hata!");
    }
}

// --- SAYFA YÜKLENDİĞİNDE ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Yüklendi.");
    try {
        // Sadece gerekli elementleri al
        canvas = document.getElementById('gameCanvas');
        // Canvas veya Context alınamazsa kritik hata
        if (!canvas) throw new Error("Canvas elementi HTML'de bulunamadı!");
        ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("2D Context alınamadı!");

        startScreenDiv = document.getElementById('startScreen');
        startButton = document.getElementById('startButton');

        if (!startScreenDiv || !startButton) throw new Error("Başlangıç ekranı veya butonu bulunamadı!");

        console.log("Temel elementler bulundu.");

        // Başlat Butonu Dinleyicisi
        startButton.addEventListener('click', startGame);
        console.log("Start butonu dinleyicisi eklendi.");

        // Butonu manuel aktif et (Test için)
        startButton.disabled = false;
        if(texts && texts[currentLang]) { // texts objesi tanımlıysa kullan
             startButton.innerText = texts[currentLang]?.startButton || "Start Test";
        } else {
             startButton.innerText = "Start Background Test"; // Fallback
        }
        console.log("Start butonu aktif edildi.");

        // Arka plan görselini yüklemeyi başlat
        console.log("Arka plan yükleniyor (./original.gif)...");
        bgImage.src = './original.gif'; // Başına ./ ekledim, aynı klasörde olduğundan emin ol

    } catch (error) {
        console.error("DOMContentLoaded içinde KRİTİK HATA:", error);
        alert("Sayfa yüklenirken önemli bir hata oluştu! Lütfen konsolu (F12) kontrol edin.");
    }
});

console.log("script.js dosyası tamamen okundu.");
