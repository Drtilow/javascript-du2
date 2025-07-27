const ZOZNAM_ELEMENT = document.getElementById("zoznam");
const DETAIL_ELEMENT = document.getElementById("detail");
const genderFilterElement = document.getElementById("genderFilter");

const LOCAL_STORAGE_KEY = "poslednaPostava";

let postavy = [];
let aktualnaStrankaURL = "https://swapi.py4e.com/api/people";
let dalsiaStrankaURL = null;
let predoslaStrankaURL = null;

// Načítání dat ze SWAPI
async function nacitajPostavy(url = aktualnaStrankaURL) {
  try {
    const odpoved = await fetch(url);
    const data = await odpoved.json();

    postavy = data.results;
    dalsiaStrankaURL = data.next;
    predoslaStrankaURL = data.previous;

    zobrazZoznam(postavy);
    zobrazPagination();

    if (url === aktualnaStrankaURL) {
      skontrolujLocalStorage();
    }

    aktualnaStrankaURL = url;
  } catch (error) {
    console.error("Chyba při načítání dat:", error);
    DETAIL_ELEMENT.innerHTML = "<p>Chyba při načítání dat.</p>";
  }
}

// Zobrazí seznam postav (s filtrem)
function zobrazZoznam(zoznam) {
  const filtrovanie = aplikujFilter(zoznam);
  ZOZNAM_ELEMENT.innerHTML = "";

  if (filtrovanie.length === 0) {
    ZOZNAM_ELEMENT.innerHTML = "<li>Žádné postavy neodpovídají filtru.</li>";
    return;
  }

  filtrovanie.forEach((postava) => {
    const li = document.createElement("li");
    li.textContent = postava.name;
    li.addEventListener("click", () => {
      zobrazDetail(postava);
      localStorage.setItem(LOCAL_STORAGE_KEY, postava.name);
    });
    ZOZNAM_ELEMENT.appendChild(li);
  });
}

// Zobrazí detail vybrané postavy
function zobrazDetail(postava) {
  DETAIL_ELEMENT.innerHTML = `
    <h2>${postava.name}</h2>
    <p><strong>Výška:</strong> ${postava.height} cm</p>
    <p><strong>Hmotnosť:</strong> ${postava.mass} kg</p>
    <p><strong>Farba očí:</strong> ${postava.eye_color}</p>
    <p><strong>Farba vlasov:</strong> ${postava.hair_color}</p>
    <p><strong>Pohlavie:</strong> ${postava.gender}</p>
  `;
}

// Zkontroluje localStorage a zobrazí uloženou postavu
function skontrolujLocalStorage() {
  const ulozeneMeno = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (ulozeneMeno) {
    const najdena = postavy.find(p => p.name === ulozeneMeno);
    if (najdena) {
      zobrazDetail(najdena);
    }
  }
}

// Aplikuje filtr podle pohlaví
function aplikujFilter(zoznam) {
  const vybranyGender = genderFilterElement.value;
  if (vybranyGender === "all") {
    return zoznam;
  }
  return zoznam.filter(postava => postava.gender === vybranyGender);
}

// Vytvoří tlačítka stránkování
function zobrazPagination() {
  const paginationDiv = document.getElementById("pagination");
  if (!paginationDiv) return;

  paginationDiv.innerHTML = "";

  if (predoslaStrankaURL) {
    const predoslaBtn = document.createElement("button");
    predoslaBtn.textContent = "← Předchozí";
    predoslaBtn.addEventListener("click", () => nacitajPostavy(predoslaStrankaURL));
    paginationDiv.appendChild(predoslaBtn);
  }

  if (dalsiaStrankaURL) {
    const dalsiaBtn = document.createElement("button");
    dalsiaBtn.textContent = "Další →";
    dalsiaBtn.addEventListener("click", () => nacitajPostavy(dalsiaStrankaURL));
    paginationDiv.appendChild(dalsiaBtn);
  }
}

// Spuštění po načtení stránky
window.addEventListener("DOMContentLoaded", () => {
  nacitajPostavy();

  // Sleduj změnu filtru
  genderFilterElement.addEventListener("change", () => {
    zobrazZoznam(postavy); // přegeneruj seznam
  });
});
