import { events } from "./data.js";

function formatTurkishDate(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
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

const container = document.querySelector("#detay");

if (container) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const event = events.find((e) => e.id === id);

  if (!event) {
    document.title = "Etkinlik Bulunamadı";
    container.innerHTML = `
      <div class="hata-kutusu">
        <h3>Etkinlik bulunamadı!</h3>
        <p>Aradığınız etkinlik mevcut değil veya geçersiz bir bağlantı kullandınız.</p>
      </div>
      <a href="etkinlikler.html" class="sayfa-link">&larr; Listeye dön</a>
    `;
  } else {
    document.title = `${event.title} - Kampüs Etkinlikleri`;
    const okunurTarih = formatTurkishDate(event.date);

    container.innerHTML = `
      <div class="detay-konteyner">
        <div class="afis-kutusu">
          <strong>${event.title}</strong><br>
          <span>${event.category}</span>
        </div>

        <div>
          <dl class="detay-bilgi">
            <dt>Kategori</dt>
            <dd>${event.category}</dd>

            <dt>Tarih ve Saat</dt>
            <dd>${okunurTarih}, ${event.time}</dd>

            <dt>Yer</dt>
            <dd>${event.location}</dd>

            <dt>Kontenjan</dt>
            <dd>${event.capacity} kişi</dd>

            <dt>Açıklama</dt>
            <dd>${event.description}</dd>
          </dl>

          <a href="etkinlik-guncelle.html?id=${event.id}" class="buton-guncelle">Bu etkinliği güncelle &rarr;</a>
        </div>
      </div>
      <div style="margin-top: 1.5rem;">
        <a href="etkinlikler.html" class="sayfa-link">&larr; Listeye dön</a>
      </div>
    `;
  }
}

