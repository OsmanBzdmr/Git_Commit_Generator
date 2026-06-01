# Git Commit Mesajı Otomatik Oluşturucu

## 📋 Proje Özeti

Yazılımcıların kod değişikliklerini (Git diff) yapıştırarak, **AI tarafından otomatik olarak standart format commit mesajları** oluşturmasını sağlayan web uygulaması.

### ✨ Temel Özellikler
- 🤖 **Ollama AI** ile yerel ve hızlı AI-powered commit mesajı oluşturma
- 🧠 **Akıllı fallback modu** - AI hataları olsa bile istatistik-bazlı mesaj üretimi
- 🏷️ **Conventional Commits** standardına uygun (feat, fix, docs, refactor, test, chore, style, perf)
- 📊 **Git diff analizi** - dosya sayısı, eklemeler, silmeler istatistikleri
- 💾 **SQLite database** - tüm oluşturulan mesajların geçmişi
- 🎨 **Modern web arayüzü** - kullanıcı dostu, responsive design
- 📜 **Geçmiş görüntüleme** - son oluşturulan 5 commit mesajı

---

## 🏗️ Mimari Tasarım

### Klasör Yapısı
```
commit-msg-generator/
├── src/
│   ├── ollamaApi.js      # Ollama AI entegrasyon + fallback
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
| **AI Model** | Ollama (Mistral 7B) - Yerel çalışan model |
| **Testing** | Jest |

---

## 🚀 Başlangıç

### Gereksinimler
- Node.js 18+
- Ollama ([https://ollama.ai](https://ollama.ai))
- 16GB RAM (Mistral 7B modeli için önerilen)

### Kurulum

1. **Ollama kur ve Mistral modelini indir:**
```bash
# Ollama'yı indir ve kur (https://ollama.ai)
ollama pull mistral:7b
ollama serve
```

2. **Depoyu klonla ve bağımlılıkları yükle:**
```bash
cd commit-msg-generator
npm install
```

3. **.env dosyası oluştur:**
```bash
cp .env.example .env
```

4. **.env dosyasını kontrol et (varsayılan değerler çoğunlukla çalışır):**
```
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=mistral:7b
PORT=3000
NODE_ENV=development
DB_PATH=./data/commits.db
```

5. **Sunucuyu başlat (Ollama zaten çalışıyorken):**
```bash
npm start
```

6. **Tarayıcında aç:**
```
http://localhost:3000
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
- ✅ Ollama API entegrasyon hata yönetimi yapıyor
- ✅ Commit type detection çalışıyor

---

## 🤖 AI Model: Ollama + Mistral

### Model Seçimi
- **Yerel çalışan** - API key veya internet bağlantısı lazım değil
- **Hızlı yanıt** - 16GB RAM ile 3-5 saniye
- **Fallback modu** - Ollama kapalı olsa bile istatistik-bazlı mesaj
- **Ucuz** - Tamamen ücretsiz

### Model Parametreleri
```
Model: mistral:7b
Boyut: ~8GB RAM
Hız: ~3-5 saniye (16GB RAM'de)
Temperature: 0.5 (dengeli yaratıcılık)
```

### Fallback Modu
Ollama kapalı veya bağlantı sorunları varsa, diff content'ini analiz ederek otomatik olarak:
- **Type** belirle (regex pattern matching)
- **Message** oluştur
- **Stats** ekle (dosya sayısı, +/- satırlar)

---

## 🏆 Clean Code & SOLID Prensiplerine Uygunluk

### Single Responsibility Principle
- `ollamaApi.js` - AI API çağrıları ve fallback
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

### 1. **AI API Entegrasyonları**
**Problem:** Grok API'nin isimler uyumsuzluğu ve entegrasyon problemleri

**Çözüm:** Ollama yerel modeline geçildi - daha hızlı, güvenilir ve ücretsiz

### 2. **API Hataları & Fallback**
**Problem:** API limitler veya hata durumlarında sistemin tamamen başarısız olması

**Çözüm:** Akıllı fallback modu - diff analiz ederek otomatik mesaj üretimi

---
