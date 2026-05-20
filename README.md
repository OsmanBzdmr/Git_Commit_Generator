# Git Commit Mesajı Otomatik Oluşturucu

## 📋 Proje Özeti

Yazılımcıların kod değişikliklerini (Git diff) yapıştırarak, **AI tarafından otomatik olarak standart format commit mesajları** oluşturmasını sağlayan web uygulaması.

### ✨ Temel Özellikler
- 🤖 **Grok AI (X.ai)** ile AI-powered commit mesajı oluşturma
- 🧠 **Akıllı fallback modu** - API hataları olsa bile istatistik-bazlı mesaj üretimi
- 🏷️ **Conventional Commits** standardına uygun (feat, fix, docs, refactor, test, chore, style, perf)
- 📊 **Git diff analizi** - dosya sayısı, eklemeler, silmeler istatistikleri
- 💾 **SQLite database** - tüm oluşturulan mesajların geçmişi
- 🎨 **Modern web arayüzü** - kullanıcı dostu, responsive design
- 📜 **Geçmiş görüntüleme** - son oluşturulan 50 commit mesajı

---

## 🏗️ Mimari Tasarım

### Klasör Yapısı
```
commit-msg-generator/
├── src/
│   ├── groqApi.js        # Grok AI entegrasyon + fallback
│   ├── diffParser.js     # Git diff parsing ve analiz
│   ├── msgFormatter.js   # Commit mesajı formatı
│   ├── database.js       # SQLite database işlemleri
│   └── tests.test.js     # Jest test dosyası
├── routes/
│   └── api.js            # Express API endpoints
├── public/
│   ├── index.html        # Web arayüzü
│   ├── style.css         # Stiller
│   └── script.js         # İstemci taraflı JavaScript
├── db/
│   └── schema.sql        # Database şeması
├── data/
│   └── commits.db        # SQLite database dosyası (runtime)
├── server.js             # Express sunucusu
├── package.json          # Proje bağımlılıkları
├── .env.example          # Ortam değişkenleri şablonu
└── README.md            # Bu dosya
```

### Teknoloji Stack

| Layer | Teknoloji |
|-------|-----------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | SQLite3 |
| **AI Model** | Grok AI (X.ai) - OpenAI uyumlu API |
| **Testing** | Jest |

---

## 🚀 Başlangıç

### Gereksinimler
- Node.js 18+
- Grok API Key ([https://console.x.ai/](https://console.x.ai/))

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

3. **.env içinde Grok API key'ini ekle:**
```
GROK_API_KEY=xai-your-api-key-here
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

## 📚 API Endpoints

### POST `/api/generate-message`
Git diff'ini gönder, commit mesajı al.

**Request:**
```json
{
  "diff": "diff --git a/file.js b/file.js\n..."
}
```

**Response:**
```json
{
  "success": true,
  "type": "feat",
  "message": "Add automatic commit message generation",
  "description": "Modified 1 file(s): +120 -35 lines",
  "formatted": "feat: Add automatic commit message generation\n\nModified 1 file(s): +120 -35 lines",
  "stats": {
    "filesChanged": 5,
    "additions": 120,
    "deletions": 35,
    "files": ["src/api.js", "routes/api.js", ...]
  }
}
```

### GET `/api/history`
Son 50 commit mesajının geçmişini getir.

**Response:**
```json
{
  "success": true,
  "commits": [
    {
      "id": 1,
      "diff_input": "...",
      "generated_message": "feat: Add feature",
      "message_type": "feat",
      "files_changed": 3,
      "additions": 50,
      "deletions": 10,
      "created_at": "2026-05-20T12:30:00Z"
    }
  ]
}
```

---

## 🧪 Testing

Jest ile unit testleri çalıştır:

```bash
npm test
```

**Test Kapsamı:**
- ✅ Diff parser doğru istatistik hesaplıyor
- ✅ Message formatter conventional commit standardına uyuyor
- ✅ Grok API entegrasyon hata yönetimi yapıyor
- ✅ Commit type detection çalışıyor

---

## 🤖 AI Model: Grok AI (X.ai)

### Model Seçimi
- **OpenAI uyumlu API** - kolay entegrasyon
- **Hızlı yanıt** - düşük latency
- **Fallback modu** - API hatalarında istatistik-bazlı mesaj

### Grok Prompt Engineering
```
1. Diff analiz et
2. Değişikliğin türünü belirle (feat/fix/docs vb.)
3. Angular convention uygun mesaj oluştur
4. Yapılandırılmış format döndür (TYPE, MESSAGE, DESCRIPTION)
```

### Fallback Modu
API başarısız olursa, diff content'ini analiz ederek otomatik olarak:
- **Type** belirle (regex pattern matching)
- **Message** oluştur
- **Stats** ekle (dosya sayısı, +/- satırlar)

---

## 🏆 Clean Code & SOLID Prensiplerine Uygunluk

### Single Responsibility Principle
- `groqApi.js` - AI API çağrıları ve fallback
- `diffParser.js` - Sadece diff analiz
- `msgFormatter.js` - Sadece format işlemleri
- `database.js` - Sadece DB işlemleri

### Open/Closed Principle
- Yeni commit tipleri eklemek için sadece formatter güncelle
- Yeni AI modeli eklemek kolay (fallback zaten aktif)

### Error Handling
- Try-catch blokları tüm async operasyonlarda
- Meaningful error messages
- Graceful degradation (fallback modu)

---

## 📊 Veritabanı Şeması

```sql
CREATE TABLE commits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  diff_input TEXT NOT NULL,
  generated_message TEXT,
  message_type TEXT,
  files_changed INTEGER DEFAULT 0,
  additions INTEGER DEFAULT 0,
  deletions INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_created_at ON commits(created_at DESC);
CREATE INDEX idx_message_type ON commits(message_type);
```
---

## 🔍 Karşılaşılan Zorluklar & Çözümler

### 1. **Groq → Grok API Migrasyon**
**Problem:** Groq API key ile model bulunamıyor hatası
**Çözüm:** Grok AI (X.ai) OpenAI uyumlu API'ye geçildi

### 2. **API Hataları & Fallback**
**Problem:** API limitler veya hata durumlarında sistemin tamamen başarısız olması
**Çözüm:** Akıllı fallback modu - diff analiz ederek otomatik mesaj üretimi

### 3. **Diff Parsing Edge Cases**
**Problem:** Farklı diff formatları (binary, merge, vb.)
**Çözüm:** Regex-based robust parser, safe fallback

### 4. **Port Konflikti**
**Problem:** Port 3000 zaten kullanımda
**Çözüm:** Process kill + restart mekanizması

---
