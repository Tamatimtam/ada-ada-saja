export const GEOJSON_URL = '/static/indonesia-38-provinsi.geojson';

export const provinceNameMapping = {
    "Nanggroe Aceh Darusalam": "Aceh",
    "DI Yogyakarta": "Daerah Istimewa Yogyakarta",
    "DKI Jakarta": "DKI Jakarta"
};

export const reverseNameMapping = Object.fromEntries(
    Object.entries(provinceNameMapping).map(([csv, geo]) => [geo, csv])
);

// Colors for fintech app logos (pattern map)
export const appColors = {
    Dana: '#118EEA',
    OVO: '#4C3494',
    GoPay: '#00AA13',
    ShopeePay: '#FF6A3D',
    LinkAja: '#C92A2A',
    Kredivo: '#B33A1C',
    Akulaku: '#FF866B'
};

export const datasetsConfig = {
    regional: {
        endpoint: '/api/data',
        titlePrefix: 'Indikator Ekonomi Regional',
        keyColumn: 'provinsi',
        metrics: {
            outstanding_pinjaman_miliar: { label: 'Outstanding Pinjaman (Rp miliar)', vizType: 'choropleth', type: 'logarithmic', minColor: '#FFF5E6', maxColor: '#FF6B35' },
            dana_diberikan_miliar: { label: 'Jumlah Dana Diberikan (Rp miliar)', vizType: 'choropleth', type: 'logarithmic', minColor: '#E8F5E9', maxColor: '#2E7D32' },
            rekening_penerima_aktif: { label: 'Rekening Penerima Pinjaman Aktif', vizType: 'choropleth', type: 'logarithmic', minColor: '#F0F9FF', maxColor: '#0C4A6E' },
            twp_90: { label: 'TWP 90 (%)', vizType: 'choropleth', type: 'linear', minColor: '#FCE4EC', maxColor: '#C62828' },
            pdrb_ribu_rp: { label: 'PDRB (Ribu Rp)', vizType: 'choropleth', type: 'logarithmic', minColor: '#5DE2E7', maxColor: '#6A0DAD' },
            urbanisasi_persen: { label: 'Tingkat Urbanisasi (%)', vizType: 'choropleth', type: 'linear', minColor: '#FFF3E0', maxColor: '#EF6C00' },
            jumlah_penduduk_ribu: { label: 'Jumlah Penduduk (Ribu Jiwa)', vizType: 'choropleth', type: 'logarithmic', minColor: '#E0F2F1', maxColor: '#00695C' }
        }
    },
    financial: {
        endpoint: '/api/financial-profile',
        titlePrefix: 'Profil Finansial Gen Z',
        keyColumn: 'provinsi',
        metrics: {
            financial_balance: {
                label: 'Status Keuangan (Surplus/Defisit)',
                vizType: 'choropleth',
                dataClasses: [
                    { to: -0.01, color: '#C62828', name: 'Defisit' },
                    { from: 0, color: '#1565C0', name: 'Surplus' }
                ],
                nullColor: '#E0E0E0'
            },
            avg_anxiety_score: { label: 'Rata-rata Skor Kecemasan Finansial', vizType: 'choropleth', type: 'linear', minColor: '#FCE4EC', maxColor: '#C62828' },
            avg_digital_time: { label: 'Rata-rata Waktu Digital Harian (Jam)', vizType: 'choropleth', type: 'linear', minColor: '#E3F2FD', maxColor: '#1565C0' },
            mode_fintech_app: { label: 'Fintech Populer (Logo)', vizType: 'pattern' }
        }
    }
};
