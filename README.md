# NWP-LV7 – Upravljanje projektima

Ova Node.js aplikacija omogućuje upravljanje projektima s podrškom za registraciju korisnika, dodjeljivanje uloga i suradnju unutar timova. Aplikacija je nastavak prethodne vježbe "projects" te proširuje funkcionalnosti sustava za upravljanje projektnim radom.

## 🔧 Tehnologije
- Node.js
- Express.js
- MongoDB + Mongoose
- EJS (za prikaz korisničkog sučelja)
- Express-session (upravljanje sesijama)
- Bcrypt (hashiranje lozinki)

## 👥 Korisničke funkcionalnosti

### ✅ Registracija i prijava
- Svaki korisnik se može sam registrirati i prijaviti u aplikaciju.

### 📁 Projekti
- Svaki projekt sadrži:
  - Naziv
  - Opis
  - Cijenu
  - Obavljene poslove
  - Datum početka i završetka
  - Status arhiviranosti
- Na projekt se mogu dodati članovi tima (od već registriranih korisnika).
- Projekt može imati jednog voditelja.

### 📄 Korisničke stranice
- **Voditelj projekata:** korisnik vidi projekte kojima je on voditelj i može njima u potpunosti upravljati.
- **Član projekata:** korisnik vidi projekte na kojima sudjeluje kao član i može uređivati samo atribut *obavljeni poslovi*.
- **Arhiva:** korisnik vidi sve projekte (voditelj i član) koji su označeni kao arhivirani.

## 🗂️ Struktura direktorija

```
NWP-LV7/
├── controllers/
├── models/
├── routes/
├── views/
├── public/
├── app.js
└── .env
```
## 📄 Licenca
MIT License

---

*Projekt izrađen u sklopu kolegija "Napredno web programiranje"*