document.addEventListener('DOMContentLoaded', () => {
    const startTourBtn = document.getElementById('start-tour-btn');
    if (!startTourBtn) return;

    // Configure the tour steps with warm, natural Indonesian narration
    const tourSteps = [
        {
            element: '#tour-step-1',
            popover: {
                title: 'Selamat Datang di Dashboard Keuangan Gen Z!',
                description: `
                    <p>Tur singkat ini akan memandu Anda memahami fitur utama dashboard.</p>
                    <p>Dashboard ini menganalisis <strong>tiga dataset utama</strong> untuk memetakan kondisi finansial Gen Z di Indonesia:</p>
                    <ul>
                        <li>Indikator Ekonomi Regional</li>
                        <li>Profil Finansial Gen Z (Peta)</li>
                        <li>Profil Finansial Gen Z (Demografi)</li>
                    </ul>
                    <p>Tujuannya adalah untuk memahami <strong>perilaku, kecemasan, dan ketahanan finansial</strong> Gen Z secara mendalam.</p>
                `,
                side: 'right',
                align: 'start'
            }
        },
        {
            element: '#tour-step-2',
            popover: {
                title: 'Panel Kecemasan Finansial',
                description: `
                    <p>Di sini, kita bisa melihat kelompok Gen Z mana yang paling cemas secara finansial.</p>
                    <p>Coba klik <strong>Filter Kategori</strong> (misal: 💼 Pekerjaan) untuk melihat bagaimana demografi yang berbeda menunjukkan pola sentimen yang unik. Ini adalah kunci untuk memahami akar masalah kecemasan finansial.</p>
                `,
                side: 'right',
                align: 'start'
            }
        },
        {
            element: '#tour-step-3',
            popover: {
                title: 'Analisis Dampak Interaktif',
                description: `
                    <p>Perhatikan ketiga panel ini: <strong>Financial Knowledge</strong>, <strong>Financial Behavior</strong>, dan <strong>Financial Wellbeing</strong>.</p>
                    <p>Setiap kali Anda mengubah filter di atas atau mengklik bar di grafik, angka-angka di sini akan <strong>berubah secara dinamis!</strong></p>
                    <p>Ini sangat berguna untuk melihat bagaimana tingkat pendidikan atau status pekerjaan memengaruhi literasi dan kebiasaan keuangan mereka secara langsung.</p>
                `,
                side: 'right',
                align: 'start'
            }
        },
        {
            element: '#diverging-bar-chart',
            popover: {
                title: 'Keseimbangan Income vs. Expense',
                description: `
                    <p>Grafik ini membandingkan distribusi pendapatan dan pengeluaran. Anda bisa langsung melihat kategori mana yang paling dominan.</p>
                    <p><strong>Klik pada salah satu bar</strong> (misalnya, kategori '>15jt') untuk memfilter seluruh data di panel kanan berdasarkan kategori tersebut. Lihat bagaimana profil pinjaman dan penggunaan waktu digital mereka berubah!</p>
                `,
                side: 'bottom',
                align: 'center'
            }
        },
         {
            element: '#map_panel_container',
            popover: {
                title: 'Wawasan Regional',
                description: `
                    <p>Terakhir, peta interaktif ini memberikan wawasan finansial berbasis lokasi.</p>
                    <p>Gunakan <strong>dropdown menu</strong> untuk beralih antara data ekonomi regional dan profil finansial Gen Z per provinsi. Ini membantu kita melihat korelasi antara kondisi ekonomi daerah dengan kesehatan finansial anak muda di sana.</p>
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
        steps: tourSteps
    });

    // Bind the start button to run the tour
    startTourBtn.addEventListener('click', () => {
        driver.drive();
    });
});