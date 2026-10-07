import { events } from "./data.js";

const form = document.querySelector("#etkinlik-formu");
const mesaj = document.querySelector("#form-mesaj");

if (form) {
  const isGuncelle = form.dataset.mode === "guncelle";

  // Eğer Güncelleme modundaysak URL'deki id'yi kontrol et
  if (isGuncelle) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const etkinlik = events.find((e) => e.id === id);

    if (!etkinlik) {
      // Adım 11 kuralı: İlgili id bulunamazsa formu kaldır, uyarı göster
      form.outerHTML = `
        <div class="hata-kutusu">
          <h3>Güncellenecek etkinlik bulunamadı!</h3>
          <p>Lütfen geçerli bir etkinlik seçerek güncellemeyi deneyin.</p>
        </div>
        <a href="etkinlikler.html" class="sayfa-link">&larr; Etkinliklere git</a>
      `;
    } else {
      // Alanları var olan verilerle doldur
      if (form.elements.ad) form.elements.ad.value = etkinlik.title;
      if (form.elements.kategori) form.elements.kategori.value = etkinlik.category;
      if (form.elements.tarih) form.elements.tarih.value = etkinlik.date;
      if (form.elements.saat) form.elements.saat.value = etkinlik.time;
      if (form.elements.yer) form.elements.yer.value = etkinlik.location;
      if (form.elements.kontenjan) form.elements.kontenjan.value = etkinlik.capacity;
      if (form.elements.aciklama) form.elements.aciklama.value = etkinlik.description;
    }
  }

  // Form submit olayını dinle
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fd = new FormData(form);

    const data = {
      title: (fd.get("ad") || "").toString().trim(),
      category: (fd.get("kategori") || "").toString().trim(),
      date: (fd.get("tarih") || "").toString().trim(),
      time: (fd.get("saat") || "").toString().trim(),
      location: (fd.get("yer") || "").toString().trim(),
      capacity: fd.get("kontenjan") ? Number(fd.get("kontenjan")) : undefined,
      description: (fd.get("aciklama") || "").toString().trim()
    };

    // Eğer güncelleme modundaysak etkinliğin orijinal id'sini de nesnede koruyalım
    if (isGuncelle) {
      const params = new URLSearchParams(window.location.search);
      data.id = params.get("id");
    }

    // Doğrulama (Validation) Kuralları
    // Adım 10 tablosu:
    // Ad: 3 karakterden kısa
    // Kategori: seçilmemiş
    // Tarih, saat: boş
    // Yer: boş
    // Kontenjan: girildiyse 1-1000 dışı
    const errors = {};

    if (data.title.length < 3) {
      errors.ad = "Etkinlik adı en az 3 karakter olmalıdır.";
    }

    if (!data.category) {
      errors.kategori = "Lütfen bir kategori seçiniz.";
    }

    if (!data.date) {
      errors.tarih = "Tarih alanı boş bırakılamaz.";
    }

    if (!data.time) {
      errors.saat = "Saat alanı boş bırakılamaz.";
    }

    if (!data.location) {
      errors.yer = "Yer alanı boş bırakılamaz.";
    }

    if (fd.get("kontenjan") !== null && fd.get("kontenjan") !== "") {
      const cap = Number(fd.get("kontenjan"));
      if (isNaN(cap) || cap < 1 || cap > 1000) {
        errors.kontenjan = "Kontenjan 1 ile 1000 arasında olmalıdır.";
      }
    }

    // Hata mesajlarını ve aria-invalid durumlarını arayüzde güncelle
    const tumAlanlar = ["ad", "kategori", "tarih", "saat", "yer", "kontenjan", "aciklama"];

    tumAlanlar.forEach((alanAdi) => {
      const el = form.elements[alanAdi];
      const hataSpan = document.querySelector(`#${alanAdi}-hata`);

      if (errors[alanAdi]) {
        if (el) el.setAttribute("aria-invalid", "true");
        if (hataSpan) hataSpan.textContent = errors[alanAdi];
      } else {
        if (el) el.removeAttribute("aria-invalid");
        if (hataSpan) hataSpan.textContent = "";
      }
    });

    if (Object.keys(errors).length > 0) {
      if (mesaj) {
        mesaj.innerHTML = `
          <div class="hata-kutusu">
            <strong>Formda hatalı alanlar var!</strong> Lütfen yukarıdaki kırmızı uyarıları düzeltin.
          </div>
        `;
      }
      return;
    }

    // Hata yoksa başarılı mesaj ve oluşturulan nesnenin JSON hali
    const durumMetni = isGuncelle ? "Etkinlik başarıyla güncellendi!" : "Etkinlik başarıyla oluşturuldu!";
    if (mesaj) {
      mesaj.innerHTML = `
        <div class="basari-kutusu">
          <strong>${durumMetni}</strong>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </div>
      `;
    }
  });
}

