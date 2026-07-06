# Git Commit Mesajı Otomatik Oluşturucu

## Proje Özeti

Git diff çıktısını analiz ederek **AI tarafından otomatik olarak standart format commit mesajları** oluşturan CLI aracı.

### Temel Özellikler
- 🤖 **Groq AI** ile hızlı AI-powered commit mesajı oluşturma
- 🧠 **Akıllı fallback modu** - API hatası olsa bile istatistik-bazlı mesaj üretimi
- 🏷️ **Conventional Commits** standardına uygun (feat, fix, docs, refactor, test, chore, style, perf)
- 📊 **Git diff analizi** - dosya sayısı, eklemeler, silmeler istatistikleri
- 💾 **SQLite database** - tüm oluşturulan mesajların geçmişi
- 📜 **Geçmiş görüntüleme** - `--history` ile son 50 commit mesajı
- 📋 **Otomatik pano kopyalama**
- 🚀 **Git entegrasyonu** - `--commit` ile stage+commit, `--all` ile stage+commit+push

---

## Mimari Tasarım

### Klasör Yapısı
```
commit-msg-generator/
├── src/
│   ├── groqApi.js            # Groq AI entegrasyonu
│   ├── fallbackGenerator.js  # API hatası durumunda fallback mesaj üretici
│   ├── diffParser.js         # Git diff parsing ve analiz
│   ├── msgFormatter.js       # Commit mesajı formatı
│   └── database.js           # SQLite database işlemleri
├── tests/
│   ├── diffParser.test.js    # Diff ayrıştırıcı testleri
│   ├── msgFormatter.test.js  # Formatlayıcı testleri
│   ├── groqApi.test.js       # Groq API + fallback testleri
│   └── database.test.js      # Veritabanı testleri
├── db/
│   └── schema.sql            # Database şeması
├── data/
│   └── commits.db            # SQLite database dosyası (runtime)
├── cli.js                    # CLI aracı
├── package.json              # Proje bağımlılıkları
├── .env.example              # Ortam değişkenleri şablonu
└── README.md                 # Bu dosya
```

### Teknoloji Stack

| Layer | Teknoloji |
|-------|-----------|
| **Runtime** | Node.js |
| **Database** | SQLite3 |
| **AI Model** | Groq (Llama 3.3 70B) |
| **Testing** | Jest |

---

## Kurulum

### Gereksinimler
- Node.js 18+
- Groq API Anahtarı ([console.groq.com](https://console.groq.com))

```bash
git clone https://github.com/OsmanBzdmr/Git_Commit_Generator.git
cd Git_Commit_Generator
npm install
cp .env.example .env
# .env dosyasına GROQ_API_KEY ekle
```

### Global Kurulum (Önerilen)

```bash
npm link
```

Ardından herhangi bir git projesinde:

```bash
git diff | git-commit-gen
```

---

## Kullanım

| Bayrak | Kısa | Açıklama |
|--------|------|----------|
| _(bayraksız)_ | — | Pipe ile diff alır, mesaj oluşturur, panoya kopyalar |
| `--commit` | `-c` | Tüm değişiklikleri stage'ler, mesaj oluşturur, commit yapar |
| `--all` | `-a` | Stage + commit + push (upstream otomatik ayarlanır) |
| `--history` | `-h` | Son 50 commit kaydını gösterir |

```bash
# Sadece mesaj oluştur (pipe ile)
git diff | git-commit-gen

# Stage et + commit yap
git-commit-gen --commit

# Stage et + commit + push yap
git-commit-gen --all

# Geçmişi görüntüle
git-commit-gen --history
```

### Örnek Çıktı

```
feat: Add user input

Introduced a variable to store user input from the console, enhancing the hello function's functionality.
(panoya kopyalandi)
```

Commit mesajı hem terminale yazdırılır hem de otomatik olarak panoya kopyalanır.

### Geçmiş Görüntüleme

```bash
git-commit-gen --history
# [6.07.2026 14:30] feat: Add user input
#   files: 2  +15  -3
#
# [6.07.2026 14:25] fix: Fix login validation
#   files: 1  +5  -2
```

### Fallback Modu

`.env`'de `GROQ_API_KEY` tanımlı değilse veya API hatası alınırsa **fallback modu** devreye girer:
- Diff içeriğini regex ile analiz eder
- İstatistik-bazlı mesaj üretir (dosya sayısı, ekleme/silme)
- Hiçbir ek konfigürasyon gerektirmez

---

## Conventional Commits Türleri

| Tür | Açıklama |
|-----|----------|
| `feat` | Yeni özellik |
| `fix` | Hata düzeltmesi |
| `docs` | Dokümantasyon değişikliği |
| `refactor` | Kod iyileştirmesi (yeni özellik yok) |
| `test` | Test ekleme/düzeltme |
| `chore` | Bakım görevleri |
| `style` | Kod stili düzenlemesi |
| `perf` | Performans iyileştirmesi |

---

## Testing

```bash
npm test
```

**Test Kapsamı (76 test, 4 suite):**

| Modül | Coverage | Test Sayısı |
|-------|:--------:|:-----------:|
| `diffParser.js` | %100 | 30 |
| `msgFormatter.js` | %100 | 20 |
| `groqApi.js` | %100 | 19 |
| `database.js` | %83 | 7 |
| **Toplam** | **%96** | **76** |

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

> 🧠 *Bu proje, yapay zeka araçlarından faydalanılarak geliştirilmiştir.*
