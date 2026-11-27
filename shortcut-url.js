/* ============================================================
   PINTASAN DI HALAMAN PROFIL — edit file ini saja.
   Tidak perlu menyentuh index.html kalau cuma mau ganti alamat.
   ============================================================ */
window.SHORTCUT_URLS = {
    // DI HP: domain ini terverifikasi untuk aplikasi Binance, jadi langsung masuk app
    //         ke halaman Kelola Copy.
    // DI DESKTOP: otomatis diarahkan ke https://www.binance.info/id/copy-trading/copy-management
    binance: 'https://app.binance.info/id/copy-trading/copy-management',

    // Sheet data trading. Bisa ditimpa lewat menu "Atur tautan Sheet" di profil.
    sheet: 'https://docs.google.com/spreadsheets/d/1kyPR5ieTBolTvKK9lOe63tz91PrBnkt0yP4oGbf8l34/edit?gid=2139518546#gid=2139518546',

    // Host yang dibolehkan di menu "Atur tautan Binance".
    // Daftar eksplisit (bukan regex longgar) supaya domain palsu seperti
    // binance.info.evil.com tidak bisa masuk.
    binanceHosts: [
        'binance.com', 'www.binance.com', 'app.binance.com', 'accounts.binance.com',
        'binance.info', 'www.binance.info', 'app.binance.info', 'accounts.binance.info'
    ]
};
