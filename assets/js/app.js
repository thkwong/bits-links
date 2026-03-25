// --- CONFIGURATION ---
const MAIN_SHEET = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XfQ7WZLrFEb8Z07Q0DEaP5zUYGBJIy8pfSSpEHNqdS0PEBkiWugYZOziadVliVMmZo9EA4NsGCbC/pub?output=csv";
const EVENTS_SHEET = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSLAX_TguHx2FXd0pxNxM5ViTiTnGnbZPsdrO7KGm98aekIxu4kkHHhAVwM2_W1xiB_WJTbPfSZLet2/pub?output=csv";

// --- THEME MANAGEMENT ---
const initTheme = () => {
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    // Check localStorage or system settings
    if (localStorage.getItem('color-theme') === 'dark' || 
        (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        if (themeToggleLightIcon) themeToggleLightIcon.classList.remove('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        if (themeToggleDarkIcon) themeToggleDarkIcon.classList.remove('hidden');
    }
};

const handleThemeToggle = () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    if (!themeToggleBtn) return;

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
};

// --- DATA FETCHING & PARSING ---
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const csvText = await response.text();
        
        // Simple CSV parser that handles quotes and commas
        const rows = csvText.split('\n').filter(row => row.trim() !== '');
        return rows.slice(1).map(row => {
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            return cols.map(c => c.replace(/"/g, '').trim());
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}

// --- UI RENDERING ---

function renderCarousel(data) {
    const container = document.getElementById('carousel-container');
    if (!container) return;

    let htmlContent = '';
    data.forEach(row => {
        const title = row[0] || "Workshop Session";
        const date = row[1] || "Date TBC";
        
        htmlContent += `
            <div class="swiper-slide h-auto">
                <div class="bg-cardLight dark:bg-cardDark border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col h-full justify-between outline-on-dark transition-all">
                    <div>
                        <h3 class="font-bold text-sm leading-tight mb-2 tracking-tight text-textLight dark:text-textDark">${title}</h3>
                        <p class="text-[10px] text-brandOlive font-mono font-bold uppercase">${date}</p>
                    </div>
                    <a href="https://bits-research.netlify.app/#/get-involved" class="btn-olive mt-6 outline-on-dark shadow-sm hover:brightness-110 transition-all">
                        More Details
                    </a>
                </div>
            </div>`;
    });
    container.innerHTML = htmlContent;
}

function renderMainLinks(data) {
    const container = document.getElementById('links-container');
    if (!container) return;

    // Remove loading spinner
    const loading = document.getElementById('loading');
    if (loading) loading.remove();

    // Map and Sort: YouTube first, then by numerical Order
    const items = data.map(cols => ({
        order: cols[0] || "",
        title: cols[1] || "",
        link: cols[2] || "",
        icon: cols[3] || "🔗"
    }));

    const sortedItems = items.sort((a, b) => {
        const aIsYT = a.order.toLowerCase().includes('youtube');
        const bIsYT = b.order.toLowerCase().includes('youtube');
        if (aIsYT && !bIsYT) return -1;
        if (!aIsYT && bIsYT) return 1;
        const numA = parseInt(a.order.replace(/\D/g, '')) || 999;
        const numB = parseInt(b.order.replace(/\D/g, '')) || 999;
        return numA - numB;
    });

    let htmlContent = '';
    sortedItems.forEach(item => {
        const isYoutube = item.order.toLowerCase().includes('youtube');
        
        if (isYoutube) {
            const videoId = item.link.split('v=')[1]?.split('&')[0] || item.link.split('/').pop();
            htmlContent += `
                <div class="rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md mb-2 outline-on-dark">
                    <iframe class="w-full aspect-video" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
                </div>`;
        } else {
            htmlContent += `
                <a href="${item.link}" target="_blank" class="flex items-center p-5 bg-cardLight dark:bg-cardDark border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:scale-[1.01] transition-transform shadow-sm outline-on-dark">
                    <span class="text-2xl mr-4">${item.icon}</span>
                    <span class="font-bold text-sm tracking-tight text-textLight dark:text-textDark">${item.title}</span>
                </a>`;
        }
    });
    container.innerHTML = htmlContent;
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Set Footer Year
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // 2. Initialize Theme
    initTheme();
    handleThemeToggle();

    // 3. Load Workshops (Carousel)
    const eventData = await fetchData(EVENTS_SHEET);
    if (eventData.length > 0) {
        renderCarousel(eventData);
        document.getElementById('workshop-section').classList.remove('hidden');
        
        // Initialize Swiper after DOM is updated
        new Swiper(".mySwiper", {
            slidesPerView: 1.1,
            spaceBetween: 16,
            centeredSlides: true,
            pagination: { 
                el: ".swiper-pagination", 
                clickable: true 
            },
            breakpoints: {
                640: { slidesPerView: 2, centeredSlides: false }
            }
        });
    }

    // 4. Load Main Directory
    const mainData = await fetchData(MAIN_SHEET);
    renderMainLinks(mainData);
});
