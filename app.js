// Published Google Sheet (Excel format)
const EXCEL_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSSZZRocj7CqWIVydfoVMwF6lvsckGoJ2UY-762KqVV4mFe1HQJQafqZwD4vfB0q6djwJOGMpTo6KVG/pub?output=xlsx";

// Load Excel, parse and inject into menu
async function loadExcelMenu() {
    try {
        const resp = await fetch(EXCEL_URL);
        const data = await resp.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array" });

        // Assume first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);

        console.log("Menu data loaded:", rows);

        // Clear old data
        document.querySelectorAll(".menu-grid").forEach(el => el.innerHTML = "");

        // Insert rows into correct category
        rows.forEach(item => {
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
    } catch (err) {
        console.error("Error loading menu:", err);
    }
}

// Tab switching
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
    await loadExcelMenu();
    setupTabs();
    // Show menu after landing animation
    setTimeout(() => {
        document.getElementById("landing").classList.add("fade-out");
        setTimeout(() => {
            document.getElementById("landing").style.display = "none";
            document.getElementById("menu").classList.remove("hidden");
            document.getElementById("menu").classList.add("visible");
        }, 800);
    }, 3500);
});
