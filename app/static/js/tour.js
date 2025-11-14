document.addEventListener('DOMContentLoaded', () => {
    const startTourBtn = document.getElementById('start-tour-btn');
    if (!startTourBtn) return;

    // Configure the tour steps with warm, natural Indonesian narration
    const tourSteps = [
        {
            element: '#tour-step-1',
            popover: {
                title: 'Selamat Datang di Dasbor Finansial Gen Z!',
                description: `
                    <p>Tur singkat ini akan memandu Anda memahami semua fitur utama di dasbor ini.</p>
                    <p>Dasbor ini menganalisis data untuk memetakan kondisi finansial Gen Z di Indonesia, dengan tujuan memahami <strong>perilaku, kecemasan, dan ketahanan finansial</strong> mereka secara mendalam.</p>
                    <p>Mari kita mulai!</p>
                `,
                side: 'right',
                align: 'start'
            }
        },
        {
            element: '#tour-step-2',
            popover: {
                title: 'Analisis Kecemasan Finansial',
                description: `
                    <p>Di sini, kita bisa melihat kelompok Gen Z mana yang paling cemas secara finansial.</p>
                    <p>Skor kecemasan rata-rata ditampilkan di kanan atas. Panel ini memungkinkan Anda untuk <strong>memfilter berdasarkan kategori</strong> seperti 💼 Pekerjaan, 🎓 Pendidikan, dan lainnya untuk melihat siapa yang paling terdampak.</p>
                    <p>Klik salah satu bar untuk melihat dampaknya ke seluruh dasbor!</p>
                `,
                side: 'right',
                align: 'start'
            }
        },
        {
            element: '#tour-step-3',
            popover: {
                title: 'Metrik Kesehatan Finansial',
                description: `
                    <p>Ketiga kartu ini (Pengetahuan, Perilaku, dan Kesejahteraan Finansial) menampilkan skor kesehatan finansial Gen Z.</p>
                    <p>Setiap kali Anda menerapkan filter dari panel di atas, angka-angka di sini akan <strong>berubah secara dinamis!</strong> Ini membantu Anda melihat bagaimana faktor demografis memengaruhi literasi dan kebiasaan finansial mereka.</p>
                    <p>Klik pada salah satu kartu untuk melihat detail pertanyaan survei.</p>
                `,
                side: 'right',
                align: 'start'
            }
        },
        {
            element: '#diverging-bar-chart',
            popover: {
                title: 'Keseimbangan Pendapatan vs. Pengeluaran',
                description: `
                    <p>Grafik ini membandingkan distribusi pendapatan dan pengeluaran. Anda bisa langsung melihat kategori mana yang dominan.</p>
                    <p><strong>Klik pada salah satu bar</strong> (misalnya, kategori '>15jt') untuk memfilter data di panel kanan (pinjaman & waktu digital) berdasarkan kategori tersebut. Sangat berguna untuk analisis mendalam! (Fungsi filter ini akan aktif setelah tur selesai.)</p>
                `,
                side: 'bottom',
                align: 'center'
            }
        },
        {
            element: '#map_panel_container',
            popover: {
                title: 'Wawasan Finansial Regional',
                description: `
                    <p>Terakhir, peta interaktif ini memberikan wawasan finansial berbasis lokasi.</p>
                    <p>Gunakan <strong>menu dropdown</strong> untuk beralih antara data ekonomi regional dan profil finansial Gen Z per provinsi. Ini membantu kita melihat korelasi antara kondisi ekonomi daerah dengan kesehatan finansial anak muda di sana.</p>
                `,
                side: 'top',
                align: 'center'
            }
        }
    ];

    // Initialize Driver.js
    const driver = window.driver.js.driver({
        showProgress: true,
        popoverClass: 'driverjs-theme', // A custom class for styling
        nextBtnText: 'Lanjut →',
        prevBtnText: '← Kembali',
        doneBtnText: 'Selesai',
        steps: tourSteps
    });

    // Bind the start button to run the tour manually at any time.
    startTourBtn.addEventListener('click', () => {
        driver.drive();
    });

    // --- MODIFICATION: Auto-start tour on every page load ---
    // The tour will now start automatically on every page load after a short delay.
    // The localStorage check has been removed.
    setTimeout(() => {
        driver.drive();
    }, 500); // 0.5 second delay before starting the tour.
});