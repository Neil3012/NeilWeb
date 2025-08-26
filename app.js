// Published Google Sheet (Excel format)
const EXCEL_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSSZZRocj7CqWIVydfoVMwF6lvsckGoJ2UY-762KqVV4mFe1HQJQafqZwD4vfB0q6djwJOGMpTo6KVG/pub?output=xlsx";
const CACHE_KEY = "restaurantMenuData";
const CACHE_TIME = 60 * 60 * 1000; // 1 hour in ms

// Fetch Excel & parse
async function fetchMenuFromExcel() {
    const resp = await fetch(EXCEL_URL);
    const data = await resp.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet); // [{Category, Name, Description, Price, Emoji}]
}

// Render menu items into DOM
function renderMenu(menuData) {
    // Clear existing
    document.querySelectorAll(".menu-grid").forEach(el => (el.innerHTML = ""));

    // Insert rows into correct category
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
        </div>
      `;
        }
    });
}

// Load menu with caching
async function loadMenu() {
    const cached = localStorage.getItem(CACHE_KEY);
    let menuData = null;

    if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        const age = Date.now() - timestamp;

        if (age < CACHE_TIME) {
            console.log("✅ Using cached menu data");
            menuData = data;
            renderMenu(menuData);
        }
    }

    // Always fetch in background to refresh
    try {
        const freshData = await fetchMenuFromExcel();
        renderMenu(freshData);
        localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ timestamp: Date.now(), data: freshData })
        );
        console.log("🔄 Menu updated from Google Excel");
    } catch (err) {
        console.error("❌ Error loading menu:", err);
        if (!menuData) {
            // Fallback if no cache available
            document.querySelector(".menu-content").innerHTML =
                "<p>Failed to load menu. Please try again later.</p>";
        }
    }
}

// Tabs
function setupTabs() {
    const tabs = document.querySelectorAll(".menu-tab");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const category = tab.dataset.category;
            document.querySelectorAll(".menu-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            document.querySelectorAll(".menu-category").forEach(c => c.classList.remove("active"));
            document.getElementById(category).classList.add("active");
        });
    });
}

// Init
document.addEventListener("DOMContentLoaded", async () => {
    await loadMenu();
    setupTabs();

    // Transition from landing → menu
    setTimeout(() => {
        document.getElementById("landing").classList.add("fade-out");
        setTimeout(() => {
            document.getElementById("landing").style.display = "none";
            document.getElementById("menu").classList.remove("hidden");
            document.getElementById("menu").classList.add("visible");
        }, 800);
    }, 3500);
});
