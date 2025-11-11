export async function fetchApiData(endpoint) {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`Gagal mengambil data dari ${endpoint}`);
    return res.json();
}

export async function fetchGeoJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Gagal memuat file peta.');
    return res.json();
}
