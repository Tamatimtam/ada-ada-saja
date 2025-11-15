
# Laporan Analisis Perilaku Gen Z (Panel Kiri Dashboard)

## 1. Data Garis Dasar (Baseline - Tidak Terfilter)

- **Skor Rata-rata Kecemasan Finansial:** 3.023
- **Pilar Kekuatan Teratas:**
  1. Disiplin Finansial: 67
  2. Pengelolaan Keuangan: 63
- **Pilar Kelemahan Terbawah:**
  1. Kesejahteraan Finansial: 52
  2. Investasi Aset: 58

---

## 2. Analisis Berdasarkan Status Pekerjaan (`employment_status`)

### Temuan 1: "Wirausahawan (Entrepreneur) Menunjukkan Kecemasan Finansial Tertinggi di Antara Kelompok Bekerja"
- **Observasi:** Kelompok 'Entrepreneur' memiliki skor kecemasan finansial tertinggi (3.111), bahkan lebih tinggi dari baseline (3.023) dan kelompok 'Not Working' (3.102). Sebaliknya, 'Civil Servant/BUMN' memiliki kecemasan terendah (2.760).
- **Data Pendukung:**
  - Skor Kecemasan 'Entrepreneur': 3.111
  - Skor Kecemasan 'Not Working': 3.102
  - Skor Kecemasan 'Private Employee': 3.036
  - Skor Kecemasan 'Civil Servant/BUMN': 2.760
- **Hipotesis Analitis:** Tingginya kecemasan pada wirausahawan kemungkinan besar disebabkan oleh ketidakpastian pendapatan dan tanggung jawab penuh atas kelangsungan bisnis. Skor 'Literasi Finansial' mereka yang justru di bawah baseline (59 vs 62) mungkin memperkuat kecemasan ini. Stabilitas pendapatan dan jaminan kerja pada 'Civil Servant/BUMN' secara signifikan mengurangi tingkat kecemasan finansial mereka.

### Temuan 2: "Kelompok 'Not Working' Memiliki Persepsi Kompetensi Finansial Terendah"
- **Observasi:** Kelompok 'Not Working' secara konsisten melaporkan skor terendah di hampir semua pilar kompetensi, terutama 'Literasi Finansial' (57) dan 'Literasi Keuangan Digital' (58). Namun, persepsi 'Disiplin Finansial' mereka justru yang tertinggi (68).
- **Data Pendukung:**
  - Skor 'Not Working' (Literasi Finansial): 57 vs. Baseline: 62
  - Skor 'Not Working' (Literasi Keuangan Digital): 58 vs. Baseline: 62
  - Skor 'Not Working' (Disiplin Finansial): 68 vs. Baseline: 67
- **Hipotesis Analitis:** Rendahnya skor kompetensi masuk akal karena kurangnya paparan terhadap produk dan keputusan finansial aktif. Tingginya skor 'Disiplin Finansial' bisa jadi merupakan anomali persepsi: karena tidak memiliki pendapatan, mereka 'merasa' sangat disiplin (misalnya, tidak jajan, tidak belanja) yang sebenarnya merupakan akibat dari ketiadaan dana, bukan pilihan sadar untuk menabung atau berhemat dari pendapatan.

### Data Lengkap Berdasarkan Status Pekerjaan
| Kategori | Kecemasan | Literasi Finansial | Literasi Digital | Pengelolaan | Sikap | Disiplin | Kesejahteraan | Investasi |
|---|---|---|---|---|---|---|---|---|
| **Baseline** | **3.023** | **62** | **62** | **63** | **60** | **67** | **52** | **58** |
| Student | 3.046 | 62 | 62 | 63 | 60 | 67 | 52 | 57 |
| Private Employee | 3.036 | 64 | 63 | 65 | 60 | 66 | 51 | 60 |
| Civil Servant/BUMN | 2.760 | 63 | 62 | 64 | 59 | 65 | 53 | 57 |
| Entrepreneur | 3.111 | 59 | 64 | 63 | 59 | 67 | 55 | 61 |
| Not Working | 3.102 | 57 | 58 | 63 | 58 | 68 | 50 | 55 |
| Others | 2.929 | 65 | 63 | 65 | 60 | 67 | 53 | 59 |

---

## 3. Analisis Berdasarkan Tingkat Pendidikan (`education_level`)

### Temuan 1: "Anomali Kepercayaan Diri: Lulusan SMP Melaporkan Kompetensi Lebih Tinggi dari Lulusan SMA"
- **Observasi:** Ditemukan anomali signifikan di mana responden dengan pendidikan 'Junior High School' melaporkan skor 'Literasi Finansial' (65), 'Pengelolaan Keuangan' (68), dan 'Literasi Keuangan Digital' (67) yang lebih tinggi dibandingkan lulusan 'Senior High School' (62, 62, 61).
- **Data Pendukung:**
  - Skor SMP (Literasi Finansial): 65 vs. Skor SMA: 62
  - Skor SMP (Pengelolaan Keuangan): 68 vs. Skor SMA: 62
- **Hipotesis Analitis:** Ini adalah contoh klasik dari **Dunning-Kruger Effect**. Responden dengan tingkat pendidikan formal yang lebih rendah mungkin memiliki pemahaman yang terbatas tentang kompleksitas dunia finansial, sehingga mereka cenderung melebih-lebihkan (overestimate) kemampuan mereka sendiri. Sebaliknya, lulusan SMA yang mulai terpapar pada konsep ekonomi yang lebih luas mungkin lebih sadar akan apa yang tidak mereka ketahui, sehingga memberikan penilaian diri yang lebih realistis (dan lebih rendah).

### Temuan 2: "Pendidikan Pascasarjana: Kompetensi Tinggi, Kecemasan Rendah, namun Kesejahteraan Finansial Terendah"
- **Observasi:** Kelompok 'Postgraduate' menunjukkan skor kompetensi tertinggi di beberapa area seperti 'Disiplin Finansial' (69) dan 'Pengelolaan Keuangan' (69), serta memiliki tingkat kecemasan terendah (2.717). Namun, mereka melaporkan skor 'Kesejahteraan Finansial' yang paling rendah di antara semua kelompok pendidikan (49).
- **Data Pendukung:**
  - Skor 'Postgraduate' (Kesejahteraan Finansial): 49 vs. Baseline: 52
  - Skor 'Postgraduate' (Kecemasan): 2.717 vs. Baseline: 3.023
- **Hipotesis Analitis:** Rendahnya skor 'Kesejahteraan Finansial' meskipun kompetensi tinggi bisa jadi karena "goal-post shifting". Individu dengan pendidikan tinggi cenderung memiliki ekspektasi finansial (gaya hidup, target investasi, dll.) yang lebih tinggi. Meskipun secara objektif mereka mungkin lebih mampu, kesenjangan antara realita dan ekspektasi yang tinggi ini membuat mereka 'merasa' kurang sejahtera secara finansial.

### Data Lengkap Berdasarkan Tingkat Pendidikan
| Kategori | Kecemasan | Literasi Finansial | Literasi Digital | Pengelolaan | Sikap | Disiplin | Kesejahteraan | Investasi |
|---|---|---|---|---|---|---|---|---|
| **Baseline** | **3.023** | **62** | **62** | **63** | **60** | **67** | **52** | **58** |
| Elementary School | 3.204 | 63 | 67 | 67 | 51 | 65 | 51 | 58 |
| Junior High School | 3.049 | 65 | 67 | 68 | 62 | 68 | 53 | 63 |
| Senior High School | 2.977 | 62 | 61 | 62 | 59 | 67 | 51 | 57 |
| Diploma I/II/III | 3.034 | 61 | 61 | 63 | 59 | 68 | 53 | 57 |
| Bachelor (S1)/Diploma IV | 3.145 | 64 | 63 | 65 | 61 | 68 | 52 | 59 |
| Postgraduate | 2.717 | 63 | 65 | 69 | 62 | 69 | 49 | 65 |

---

## 4. Analisis Berdasarkan Gender

### Temuan 1: "Perbedaan Persepsi Kompetensi dan Kesejahteraan Antara Gender"
- **Observasi:** Responden 'Male' secara konsisten melaporkan skor persepsi kompetensi yang lebih tinggi di semua pilar, terutama pada 'Investasi Aset' (61 vs 56) dan 'Literasi Finansial' (64 vs 62). Sebaliknya, responden 'Female' melaporkan skor 'Kesejahteraan Finansial' yang sedikit lebih tinggi (52 vs 51) meskipun skor kompetensi mereka lebih rendah.
- **Data Pendukung:**
  - Skor 'Male' (Investasi Aset): 61 vs. 'Female': 56
  - Skor 'Male' (Literasi Finansial): 64 vs. 'Female': 62
  - Skor 'Female' (Kesejahteraan Finansial): 52 vs. 'Male': 51
- **Hipotesis Analitis:** Ini bisa mengindikasikan adanya *overconfidence bias* pada pria dalam hal finansial. Mereka 'merasa' lebih kompeten. Di sisi lain, skor kesejahteraan yang sedikit lebih tinggi pada wanita meskipun kompetensi yang dirasakan lebih rendah bisa berarti mereka memiliki ekspektasi finansial yang lebih realistis atau lebih efektif dalam mencapai rasa aman finansial dengan sumber daya yang ada.

### Data Lengkap Berdasarkan Gender
| Kategori | Kecemasan | Literasi Finansial | Literasi Digital | Pengelolaan | Sikap | Disiplin | Kesejahteraan | Investasi |
|---|---|---|---|---|---|---|---|---|
| **Baseline** | **3.023** | **62** | **62** | **63** | **60** | **67** | **52** | **58** |
| Male | 3.037 | 64 | 63 | 65 | 61 | 68 | 51 | 61 |
| Female | 3.008 | 62 | 61 | 62 | 59 | 67 | 52 | 56 |

---

## 5. Analisis Berdasarkan Usia (`age`)

### Temuan 1: "Anomali 'Puncak Kompetensi' di Usia 14 Tahun"
- **Observasi:** Ditemukan anomali yang sangat menonjol pada kelompok usia 14 tahun, yang melaporkan skor 'Literasi Finansial' (70) dan 'Pengelolaan Keuangan' (70) yang ekstrem tinggi, bahkan melampaui kelompok usia kerja (26-28 tahun). Skor ini kemudian turun drastis pada usia-usia berikutnya (15-19 tahun).
- **Data Pendukung:**
  - Skor Usia 14 (Literasi Finansial): 70
  - Skor Usia 14 (Pengelolaan Keuangan): 70
  - Skor Usia 26 (Literasi Finansial): 67
- **Hipotesis Analitis:** Ini adalah manifestasi paling jelas dari **Dunning-Kruger Effect** dalam dataset ini. Responden yang sangat muda (14 tahun), yang kemungkinan besar baru pertama kali diperkenalkan pada konsep dasar uang saku atau tabungan, merasa sangat menguasai subjek tersebut karena lingkup pemahaman mereka yang masih sangat sempit. Ketika mereka bertambah usia dan dihadapkan pada realitas finansial yang lebih kompleks (misalnya di usia 17-19), kepercayaan diri mereka terkoreksi secara signifikan ke tingkat yang lebih realistis.

### Temuan 2: "Kecemasan Finansial Memuncak di Usia Transisi (17-19 Tahun)"
- **Observasi:** Tingkat kecemasan finansial tertinggi terlihat pada rentang usia 17-19 tahun, dengan puncak pada usia 19 tahun (3.382). Kecemasan ini kemudian cenderung menurun saat memasuki usia 20-an.
- **Data Pendukung:**
  - Skor Kecemasan Usia 17: 3.193
  - Skor Kecemasan Usia 18: 3.246
  - Skor Kecemasan Usia 19: 3.382
  - Skor Kecemasan Usia 21: 2.582
- **Hipotesis Analitis:** Usia 17-19 adalah periode transisi krusial dari sekolah menengah ke perguruan tinggi atau dunia kerja. Ketidakpastian tentang masa depan, tekanan untuk mandiri secara finansial, dan paparan pertama pada tanggung jawab keuangan yang nyata (biaya kuliah, biaya hidup) kemungkinan besar menjadi pemicu utama lonjakan kecemasan ini.

### Data Lengkap Berdasarkan Usia
| Usia | Kecemasan | Literasi Finansial | Literasi Digital | Pengelolaan | Sikap | Disiplin | Kesejahteraan | Investasi |
|---|---|---|---|---|---|---|---|---|
| 13 | 2.868 | 57 | 60 | 55 | 47 | 60 | 49 | 54 |
| 14 | 3.289 | 70 | 57 | 70 | 59 | 70 | 56 | 61 |
| 15 | 2.929 | 57 | 67 | 65 | 53 | 68 | 41 | 70 |
| 16 | 3.000 | 63 | 59 | 62 | 51 | 62 | 50 | 57 |
| 17 | 3.193 | 62 | 59 | 61 | 62 | 70 | 54 | 51 |
| 18 | 3.246 | 59 | 59 | 61 | 58 | 64 | 49 | 59 |
| 19 | 3.382 | 56 | 57 | 58 | 53 | 62 | 49 | 60 |
| 20 | 2.780 | 61 | 61 | 61 | 59 | 68 | 52 | 58 |
| 21 | 2.582 | 63 | 61 | 64 | 61 | 67 | 53 | 57 |
| 22 | 3.059 | 62 | 62 | 64 | 60 | 68 | 51 | 56 |
| 23 | 2.933 | 63 | 63 | 65 | 61 | 68 | 51 | 59 |
| 24 | 3.000 | 60 | 60 | 61 | 58 | 65 | 50 | 55 |
| 25 | 3.196 | 62 | 63 | 63 | 60 | 69 | 52 | 57 |
| 26 | 2.654 | 67 | 66 | 66 | 62 | 70 | 53 | 63 |
| 27 | 2.980 | 67 | 60 | 65 | 61 | 69 | 52 | 59 |
| 28 | 3.159 | 62 | 62 | 63 | 56 | 64 | 52 | 60 |
