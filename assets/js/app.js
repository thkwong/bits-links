// --- CONSTANTS ---
const MAIN_SHEET = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XfQ7WZLrFEb8Z07Q0DEaP5zUYGBJIy8pfSSpEHNqdS0PEBkiWugYZOziadVliVMmZo9EA4NsGCbC/pub?output=csv";
const EVENTS_SHEET = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSLAX_TguHx2FXd0pxNxM5ViTiTnGnbZPsdrO7KGm98aekIxu4kkHHhAVwM2_W1xiB_WJTbPfSZLet2/pub?output=csv";

// --- THEME TOGGLE LOGIC ---
const themeToggleBtn = document.getElementById('theme-toggle');
const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

const setupTheme = () => {
    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        themeToggleLightIcon.classList.remove('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        themeToggleDarkIcon.classList.remove('hidden');
    }
};

themeToggleBtn.addEventListener('click', function() {
    themeToggleDarkIcon.classList.toggle('hidden');
    themeToggleLightIcon.classList.toggle('hidden');

    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('color-theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('color-theme', 'dark');
    }
});

// --- DATA FETCHING ---
async function fetchData(url) {
    try {
        const response = await fetch(url);
        const csvText = await response.text();
        const rows = csvText.split('\n').filter(row => row.trim() !== '');
        return rows.slice(1).map(row => {
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            return cols.map(c => c.replace(/"/g, '').trim());
        });
    } catch (e) { return []; }
}

function renderCarousel(data) {
    const container = document.getElementById('carousel-container');
    data.forEach(row => {
        container.innerHTML += `
            <div class="swiper-slide">
                <div class="bg-cardLight dark:bg-cardDark border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col h-full justify-between outline-on-dark">
                    <div>
                        <h3 class="font-bold text-sm leading-tight mb-2 tracking-tight">${row[0]}</h3>
                        <p class="text-[10px] text-brandOlive font-mono font-bold uppercase">${row[1]}</p>
                    </div>
                    <a href="https://bits-research.netlify.app/#/get-involved" class="mt-4 text-[10px] font-bold uppercase tracking-wider text-center py-3 bg-brandOlive text-white rounded-full hover:brightness-110 transition-all outline-on-dark">
                        More Details
                    </a>
                </div>
            </div>`;
    });
}

function renderMainLinks(data) {
    const container = document.getElementById('links-container');
    if(document.getElementById('loading')) document.getElementById('loading').remove();
    
    const items = data.map(cols => ({ order: cols[0] || "", title: cols[1] || "", link: cols[2] || "", icon: cols[3] || "🔗" }));
    const sorted = items.sort((a, b) => {
        const aIsYT = a.order.toLowerCase().includes('youtube');
        const bIsYT = b.order.toLowerCase().includes('youtube');
        if (aIsYT && !bIsYT) return -1;
        if (!aIsYT && bIsYT) return 1;
        const numA = parseInt(a.order.replace(/\D/g, '')) || 999;
        const numB = parseInt(b.order.replace(/\D/g, '')) || 999;
        return numA - numB;
    });

    sorted.forEach(item => {
        const isYoutube = item.order.toLowerCase().includes('youtube');
        if (isYoutube) {
            const videoId = item.link.split('v=')[1]?.split('&')[0] || item.link.split('/').pop();
            container.innerHTML += `<div class="rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md mb-2 outline-on-dark"><iframe class="w-full aspect-video" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`;
        } else {
            container.innerHTML += `<a href="${item.link}" target="_blank" class="flex items-center p-5 bg-cardLight dark:bg-cardDark border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:scale-[1.01] transition-transform shadow-sm outline-on-dark"><span class="text-2xl mr-4">${item.icon}</span><span class="font-bold text-sm tracking-tight">${item.title}</span></a>`;
        }
    });
}

// --- INITIALIZE ---
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('year').textContent = new Date().getFullYear();
    setupTheme();
    
    const eventData = await fetchData(EVENTS_SHEET);
    if (eventData.length > 0) {
        renderCarousel(eventData);
        document.getElementById('workshop-section').classList.remove('hidden');
        new Swiper(".mySwiper", {
            slidesPerView: 1.2, spaceBetween: 16, centeredSlides: true,
            pagination: { el: ".swiper-pagination", clickable: true },
            breakpoints: { 640: { slidesPerView: 2, centeredSlides: false } }
        });
    }
    
    const mainData = await fetchData(MAIN_SHEET);
    renderMainLinks(mainData);
});
