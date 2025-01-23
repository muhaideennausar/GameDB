const IMAGE_TYPES = {
    logo: 'logo.png',
    header: 'header.jpg',
    capsule: 'capsule_231x87.jpg',
    background: 'library_hero.jpg'
};

let currentPhase = localStorage.getItem('visited') ? 2 : 1;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById(`phase${currentPhase}`).classList.add('active');
});

function nextPhase(isInitial = false) {
    if (isInitial) localStorage.setItem('visited', 'true');

    document.querySelectorAll('.phase').forEach(phase => {
        phase.classList.remove('active');
    });

    currentPhase = isInitial ? 2 : currentPhase + 1;
    document.getElementById(`phase${currentPhase}`).classList.add('active');
}

function prevPhase() {
    document.querySelectorAll('.phase').forEach(phase => {
        phase.classList.remove('active');
    });

    currentPhase--;
    document.getElementById(`phase${currentPhase}`).classList.add('active');
}

function extractAppId(input) {
    const urlMatch = input.match(/store\.steampowered\.com\/app\/(\d+)/);
    return urlMatch?.[1] || (/^\d+$/.test(input) ? input : null);
}

async function copyImageToClipboard(url) {
    try {
        const proxyUrl = 'https://corsproxy.io/?';
        const response = await fetch(proxyUrl + encodeURIComponent(url));

        if (!response.ok) throw new Error('Failed to fetch image');

        const blob = await response.blob();
        await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob })
        ]);
        alert('Image copied to clipboard!');
    } catch (err) {
        alert('Failed to copy. Please use Chrome/Firefox with HTTPS.');
    }
}

function downloadImage(url, type) {
    fetch(url)
        .then(res => res.blob())
        .then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `steam_${type}_${Date.now()}.${blob.type.split('/')[1]}`;
            link.click();
            URL.revokeObjectURL(link.href);
        });
}

function createImageCard(type, url) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <h3>${type.toUpperCase()}</h3>
        <img src="${url}" alt="${type}" onerror="this.remove()">
        <div class="card-actions">
            <button onclick="copyImageToClipboard('${url}')">📋 Copy Image</button>
            <button onclick="downloadImage('${url}', '${type}')">💾 Download</button>
        </div>
    `;
    return card;
}

function handleSearch() {
    const input = document.getElementById('gameInput').value.trim();
    const appId = extractAppId(input);
    const results = document.getElementById('results');

    if (!appId) {
        alert('Please enter a valid Steam URL or App ID');
        return;
    }

    results.innerHTML = '';
    Object.entries(IMAGE_TYPES).forEach(([type, path]) => {
        const url = `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/${path}`;
        results.appendChild(createImageCard(type, url));
    });

    nextPhase();
}