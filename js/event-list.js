import { events } from "./data.js";

// Tarihi GG-AA-YYYY formatından "12 Ekim 2026" gibi okunur Türkçe formata çeviren yardımcı fonksiyon
function formatTurkishDate(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    // parts[0]: gün, parts[1]: ay, parts[2]: yıl
    const dateObj = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    }
  }
  return dateStr;
}

// Bir etkinlik nesnesinden kart HTML şablonu üreten fonksiyon
function createCard(event) {
  const okunurTarih = formatTurkishDate(event.date);
  return `
    <article class="kart">
      <h2>${event.title}</h2>
      <p>${event.category} &middot; ${okunurTarih}</p>
      <a href="etkinlik-detay.html?id=${event.id}" class="detay-link">Detayları gör &rarr;</a>
    </article>
  `;
}

const list = document.querySelector("#etkinlik-listesi");

function render(dizi) {
  if (!list) return;
  list.innerHTML = dizi.map(createCard).join("");
}

// Ana sayfa kontrolü (data-limit)
if (list) {
  if (list.dataset.limit) {
    // Slayt Adım 5: Orijinal diziyi bozmamak için [...events] ile kopyala, tarihe göre sırala, ilk 2'sini al
    // Tarih sıralaması: GG-AA-YYYY stringini YYYY-AA-GG formatına çevirip localeCompare ile karşılaştırıyoruz
    const yaklasan = [...events]
      .sort((a, b) => {
        const da = a.date.split("-").reverse().join("-");
        const db = b.date.split("-").reverse().join("-");
        return da.localeCompare(db);
      })
      .slice(0, Number(list.dataset.limit));

    render(yaklasan);
  } else {
    // Etkinlikler listesi sayfası (Filtreleme ve arama desteği)
    render(events);

    const arama = document.querySelector("#arama");
    const kategoriFiltre = document.querySelector("#kategori-filtre");
    const sonucSatiri = document.querySelector("#sonuc");
    const filtreFormu = document.querySelector("#filtre-formu");

    // Enter tuşuna basıldığında sayfanın yenilenmesini engelle (preventDefault)
    if (filtreFormu) {
      filtreFormu.addEventListener("submit", (e) => e.preventDefault());
    }

    // Kategorileri veriden tekil olarak üretip select içine ekleme (new Set)
    if (kategoriFiltre) {
      const kategoriler = [...new Set(events.map((e) => e.category))];
      kategoriler.forEach((kat) => {
        const option = document.createElement("option");
        option.value = kat;
        option.textContent = kat;
        kategoriFiltre.appendChild(option);
      });
    }

    function filtrele() {
      const aranan = arama ? arama.value.trim().toLocaleLowerCase("tr-TR") : "";
      const secilenKategori = kategoriFiltre ? kategoriFiltre.value : "";

      const sonuc = events.filter((e) => {
        const baslikUyuyor = e.title.toLocaleLowerCase("tr-TR").includes(aranan);
        const aciklamaUyuyor = e.description.toLocaleLowerCase("tr-TR").includes(aranan);
        const metinUyuyor = aranan === "" || baslikUyuyor || aciklamaUyuyor;

        const kategoriUyuyor = secilenKategori === "" || e.category === secilenKategori;

        return metinUyuyor && kategoriUyuyor;
      });

      render(sonuc);

      if (sonucSatiri) {
        if (sonuc.length === 0) {
          sonucSatiri.textContent = "Aramanıza uygun etkinlik bulunamadı.";
        } else {
          sonucSatiri.textContent = `${sonuc.length} etkinlik listeleniyor.`;
        }
      }
    }

    if (arama) {
      arama.addEventListener("input", filtrele);
    }
    if (kategoriFiltre) {
      kategoriFiltre.addEventListener("change", filtrele);
    }

    if (sonucSatiri) {
      sonucSatiri.textContent = `${events.length} etkinlik listeleniyor.`;
    }
  }
}

