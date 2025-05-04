// --- Global Değişkenler (Referanslar null/undefined başlayacak) ---
let canvas, ctx;
let startScreenDiv, gameTitleEl, gameSloganEl, langTRButton, langENButton, regionSelect, regionLabelEl, rewardTitleEl, rewardListEl, startButton, gsmInput, kvkkCheck, gsmError, gsmLabel, kvkkLabel;
let messageOverlay, messageTitle, messageBody, closeButton;

console.log("--- MINIMAL script.js BAŞLADI (Hata Testi) ---");

// --- SAYFA YÜKLENDİĞİNDE ÇALIŞACAK KODLAR ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Yüklendi.");
    try {
        // 1. Element Referanslarını Almayı Dene
        console.log("Element referansları alınıyor...");
        canvas = document.getElementById('gameCanvas');
        ctx = canvas?.getContext('2d'); // Canvas varsa context al
        startScreenDiv = document.getElementById('startScreen');
        gameTitleEl = document.getElementById('gameTitle');
        gameSloganEl = document.getElementById('gameSlogan');
        langTRButton = document.getElementById('langTR'); // <<<--- Hata burada mı?
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
        console.log("Element referansları alma işlemi bitti.");
        console.log("langTRButton değişkeninin değeri:", langTRButton); // <<<--- Değeri kontrol et

        // 2. Kritik Element Kontrolü
        if (!langTRButton) {
             console.error("KRİTİK HATA: 'langTR' ID'li buton bulunamadı!");
             alert("Kritik Hata: TR Dil Butonu HTML'de 'langTR' ID'si ile bulunamadı!");
        } else {
             console.log("'langTR' butonu başarıyla bulundu.");
        }
        // Diğer element kontrolleri şimdilik yapılmadı

        // 3. SADECE İLK Olay Dinleyicisini Ekle (Hata veren)
        console.log("langTRButton'a listener eklenmeye çalışılıyor...");
        if (langTRButton) { // Sadece element varsa listener ekle
             langTRButton.addEventListener('click', () => { console.log(">>> TR Buton Tıklandı! <<<"); });
             console.log(">>> langTRButton listener Başarıyla EKLENDİ.");
        } else {
             console.error("langTRButton null/undefined olduğu için listener EKLENEMEDİ.");
        }

        // Diğer tüm kodlar (oyun mantığı, diğer listenerlar vs.) kaldırıldı.
        console.log("Minimal test script'i çalıştı.");

    } catch (error) {
        console.error("DOMContentLoaded içinde KRİTİK HATA:", error);
        alert("Sayfa yüklenirken çok önemli bir hata oluştu! Lütfen konsolu kontrol edin.");
    }
});

console.log("script.js dosyası tamamen okundu.");
