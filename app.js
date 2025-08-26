// Published Google Sheet (Excel format)
const EXCEL_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSSZZRocj7CqWIVydfoVMwF6lvsckGoJ2UY-762KqVV4mFe1HQJQafqZwD4vfB0q6djwJOGMpTo6KVG/pub?output=xlsx";

const CACHE_KEY = "restaurantMenuData";
const CACHE_TIME = 60 * 60 * 1000; // 1 hour

// Fetch Excel & parse
async function fetchMenuFromExcel() {
    const resp = await fetch(EXCEL_URL);
    const data = await resp.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet);
}

// Render menu items
function renderMenu(menuData) {
    document.querySelectorAll(".menu-grid").forEach(el => (el.innerHTML = ""));
    menuData.forEach(item => {
        const categoryId = (item.Category || "").toLowerCase();
        const grid = document.querySelector(`#${categoryId} .menu-grid`);
        if (grid) {
            grid.innerHTML += `
        <div class="menu-item">
          <div class="item-image">
            <div class="image-placeholder">${item.Emoji || "🍽️"}</div>
          </div>
          <div class="item-details">
            <h3 class="item-name">${item.Name}</h3>
            <p class="item-description">${item.Description}</p>
            <span class="item-price">$${item.Price}</span>
          </div>
        </div>`;
        }
    });
}

// Load menu with caching
async function loadMenu() {
    const cached = localStorage.getItem(CACHE_KEY);
    let menuData = null;

    if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TIME) {
            console.log("✅ Using cached menu");
            menuData = data;
            renderMenu(menuData);
        }
    }

    try {
        const freshData = await fetchMenuFromExcel();
        renderMenu(freshData);
        localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ timestamp: Date.now(), data: freshData })
        );
        console.log("🔄 Menu updated from Excel");
    } catch (err) {
        console.error("❌ Error loading menu:", err);
        if (!menuData) {
            document.querySelector(".menu-content").innerHTML =
                "<p>Failed to load menu. Please try again later.</p>";
        }
    }
}

// Tabs
function setupTabs() {
    document.querySelectorAll(".menu-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            const category = tab.dataset.category;
            document.querySelectorAll(".menu-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            document.querySelectorAll(".menu-category").forEach(c => c.classList.remove("active"));
            document.getElementById(category).classList.add("active");
        });
    });
}

// Theme Toggle
function setupThemeToggle() {
    const btn = document.getElementById("themeToggle");
    const saved = localStorage.getItem("theme");
    if (saved) {
        document.documentElement.setAttribute("data-color-scheme", saved);
        btn.textContent = saved === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode";
    }
    btn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-color-scheme") || "light";
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-color-scheme", next);
        localStorage.setItem("theme", next);
        btn.textContent = next === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode";
    });
}

// Init
document.addEventListener("DOMContentLoaded", async () => {
    await loadMenu();
    setupTabs();
    setupThemeToggle();

    // Landing → Menu transition
    setTimeout(() => {
        document.getElementById("landing").classList.add("fade-out");
        setTimeout(() => {
            document.getElementById("landing").style.display = "none";
            document.getElementById("menu").classList.remove("hidden");
            document.getElementById("menu").classList.add("visible");
        }, 800);
    }, 3500);
});
