# Git Commit Mesajı Otomatik Oluşturucu

## Proje Özeti

Yazılımcıların kod değişikliklerini (Git diff) yapıştırarak, **AI tarafından otomatik olarak standart format commit mesajları** oluşturmasını sağlayan web uygulaması.

### Temel Özellikler
- 🤖 **Groq AI** ile hızlı AI-powered commit mesajı oluşturma
- 🧠 **Akıllı fallback modu** - API hatası olsa bile istatistik-bazlı mesaj üretimi
- 🏷️ **Conventional Commits** standardına uygun (feat, fix, docs, refactor, test, chore, style, perf)
- 📊 **Git diff analizi** - dosya sayısı, eklemeler, silmeler istatistikleri
- 💾 **SQLite database** - tüm oluşturulan mesajların geçmişi
- 🎨 **Modern web arayüzü** - kullanıcı dostu, responsive design
- 📜 **Geçmiş görüntüleme** - son oluşturulan 5 commit mesajı

---

## Mimari Tasarım

### Klasör Yapısı
```
commit-msg-generator/
├── src/
│   ├── groqApi.js          # Groq AI entegrasyonu
│   ├── fallbackGenerator.js # API hatası durumunda fallback mesaj üretici
│   ├── diffParser.js       # Git diff parsing ve analiz
│   ├── msgFormatter.js     # Commit mesajı formatı
│   └── database.js         # SQLite database işlemleri
├── tests/
│   ├── diffParser.test.js  # Diff ayrıştırıcı testleri
│   ├── msgFormatter.test.js# Formatlayıcı testleri
│   ├── groqApi.test.js     # Groq API + fallback testleri
│   └── database.test.js    # Veritabanı testleri
├── routes/
│   └── api.js              # Express API endpoints
├── public/
│   ├── index.html          # Web arayüzü
│   ├── style.css           # Stiller
│   └── script.js           # İstemci taraflı JavaScript
├── db/
│   └── schema.sql          # Database şeması
├── data/
│   └── commits.db          # SQLite database dosyası (runtime)
├── server.js               # Express sunucusu
├── package.json            # Proje bağımlılıkları
├── .env.example            # Ortam değişkenleri şablonu
└── README.md               # Bu dosya
```

### Teknoloji Stack

| Layer | Teknoloji |
|-------|-----------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | SQLite3 |
| **AI Model** | Groq (Llama 3.3 70B) |
| **Testing** | Jest |

---

## Başlangıç

### Gereksinimler
- Node.js 18+
- Groq API Anahtarı ([console.groq.com](https://console.groq.com))

### Kurulum

1. **Depoyu klonla ve bağımlılıkları yükle:**
```bash
cd commit-msg-generator
npm install
```

2. **.env dosyası oluştur:**
```bash
cp .env.example .env
```

3. **.env dosyasına Groq API anahtarını ekle:**
```
GROQ_API_KEY=api-anahtarini-buraya-yaz
GROQ_MODEL=llama-3.3-70b-versatile
PORT=3000
NODE_ENV=development
```

4. **Sunucuyu başlat:**
```bash
npm start
```

5. **Tarayıcında aç:**
```
http://localhost:3000
```
---

## Testing

Jest ile unit testleri çalıştır:

```bash
npm test
```

**Test Kapsamı (76 test, 4 suite):**

| Modül | Coverage | Test Sayısı |
|-------|:--------:|:-----------:|
| `diffParser.js` | %100 | 30 |
| `msgFormatter.js` | %100 | 20 |
| `groqApi.js` | %100 | 19 |
| `fallbackGenerator.js` | %100 | — |
| `database.js` | %83 | 7 |
| **Toplam** | **%96** | **76** |

**Kapsanan Alanlar:**
- ✅ Diff parser: boş/null/undefined girdi, çoklu dosya, ekleme/silme sayma, tip tespiti
- ✅ Message formatter: tüm tipler, geçersiz tipler, boş açıklama, çok satırlı body
- ✅ Groq API: mock fetch ile başarılı/hatalı yanıtlar, rate-limit, 401, network hatası
- ✅ Fallback: tüm type detection pattern'leri (feat, fix, docs, refactor, test, chore, style, perf)
- ✅ Database: kaydetme, sorgulama, null/undefined stats koruması

---

## AI Model: Groq

### Model Seçimi
- **Llama 3.3 70B** - yüksek kaliteli çıktı, çok hızlı inference
- **Fallback modu** - API hatası olsa bile istatistik-bazlı mesaj

### Fallback Modu
Groq API hatası veya anahtar bulunamazsa, diff content'ini analiz ederek otomatik olarak:
- **Type** belirler (regex pattern matching)
- **Message** oluşturur
- **Stats** ekler (dosya sayısı, +/- satırlar)

Fallback motoru `src/fallbackGenerator.js`'de bağımsız bir modül olarak çalışır.

---

## SOLID Prensiplerine Uygunluk

### Single Responsibility Principle
- `groqApi.js` - AI API çağrıları (yalnızca)
- `fallbackGenerator.js` - Fallback mesaj üretimi (yalnızca)
- `diffParser.js` - Sadece diff analiz
- `msgFormatter.js` - Sadece format işlemleri
- `database.js` - Sadece DB işlemleri

### Error Handling
- Try-catch blokları tüm async operasyonlarda
- Anlamlı hata mesajları
- Graceful degradation (fallback modu)

---

## Veritabanı Şeması

```sql
CREATE TABLE commits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  diff_input TEXT NOT NULL,
  generated_message TEXT,
  message_type TEXT,
  files_changed INTEGER DEFAULT 0,
  additions INTEGER DEFAULT 0,
  deletions INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_created_at ON commits(created_at DESC);
CREATE INDEX idx_message_type ON commits(message_type);
```
