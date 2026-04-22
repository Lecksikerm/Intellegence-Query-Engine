# 🧠 Intelligence Query Engine

> Turning raw demographic data into actionable insights through intelligent querying.

A production-ready backend API built for Insighta Labs that enables advanced filtering, sorting, pagination, and rule-based natural language search over large profile datasets.

---

## 🚀 Live API

Base URL:

```
https://your-deployed-url.com
```

---

## 🛠️ Tech Stack

* Backend: Node.js, Express
* Database: PostgreSQL
* ORM: Prisma
* Architecture: RESTful API
* Language: JavaScript

---

## 📊 Database Schema

The `profiles` table follows the required structure:

| Field               | Type      | Description                    |
| ------------------- | --------- | ------------------------------ |
| id                  | UUID      | Primary key                    |
| name                | String    | Unique name                    |
| gender              | String    | male/female                    |
| gender_probability  | Float     | Confidence score               |
| age                 | Integer   | Exact age                      |
| age_group           | String    | child, teenager, adult, senior |
| country_id          | String(2) | ISO country code               |
| country_name        | String    | Full country name              |
| country_probability | Float     | Confidence score               |
| created_at          | Timestamp | Auto-generated                 |

---

## 🌱 Data Seeding

* Dataset contains 2026 profiles
* Seeding is idempotent (no duplicates)
* Uses `name` as unique constraint

### Run seed:

```
npm run seed
```

---

## 📡 API Endpoints

### 🔹 Get Profiles

```
GET /api/profiles
```

### Query Parameters

| Param                   | Description                           |
| ----------------------- | ------------------------------------- |
| page                    | Page number (default: 1)              |
| limit                   | Max 50 (default: 10)                  |
| gender                  | male / female                         |
| age_group               | child / teenager / adult / senior     |
| country_id              | ISO code (NG, KE, etc.)               |
| min_age                 | Minimum age                           |
| max_age                 | Maximum age                           |
| min_gender_probability  | Float (0–1)                           |
| min_country_probability | Float (0–1)                           |
| sort_by                 | age / created_at / gender_probability |
| order                   | asc / desc                            |

---

### ✅ Example

```
GET /api/profiles?gender=male&country_id=NG&min_age=25&sort_by=age&order=desc
```

---

### 📦 Response

```
{
  "status": "success",
  "page": 1,
  "limit": 10,
  "total": 2026,
  "data": []
}
```

---

## 🔍 Natural Language Search

```
GET /api/profiles/search?q=...
```

Supports rule-based query interpretation.

---

### ✅ Examples

| Query                              | Interpretation                              |
| ---------------------------------- | ------------------------------------------- |
| young males                        | gender=male, age 16–24                      |
| females above 30                   | gender=female, min_age=30                   |
| people from angola                 | country_id=AO                               |
| adult males from kenya             | gender=male, age_group=adult, country_id=KE |
| male and female teenagers above 17 | age_group=teenager, min_age=17              |

---

### ❌ Invalid Query

```
{
  "status": "error",
  "message": "Unable to interpret query"
}
```

---

## ⚠️ Error Handling

All errors follow this format:

```
{
  "status": "error",
  "message": "..."
}
```

### Status Codes

| Code | Meaning                    |
| ---- | -------------------------- |
| 400  | Missing or empty parameter |
| 422  | Invalid query parameters   |
| 404  | Not found                  |
| 500  | Server error               |

---

## ⚡ Performance Considerations

* Database-level filtering and pagination
* Indexed fields for fast queries
* Efficient Prisma queries

---

## 🏗️ Project Structure

```
src/
  config/
  controllers/
  routes/
  services/
  utils/
  middleware/
prisma/
  schema.prisma
  seed.js
```

---

## ▶️ Run Locally

### 1. Install dependencies

```
npm install
```

### 2. Setup environment

Create `.env`:

```
DATABASE_URL=your_postgres_url
PORT=5000
```

### 3. Run migration

```
npx prisma migrate dev
```

### 4. Seed database

```
npm run seed
```

### 5. Start server

```
npm run dev
```

---

## 📌 Key Features

* Advanced filtering
* Combined query conditions
* Pagination
* Sorting support
* Natural language search
* Strong validation
* Clean architecture

---

## 🎯 Submission Checklist

* [x] Database seeded with 2026 profiles
* [x] Filtering works correctly
* [x] Combined filters supported
* [x] Pagination implemented
* [x] Sorting implemented
* [x] Natural language search working
* [x] Proper validation and error handling
* [x] README complete
* [ ] Deployed API URL added

---

## 👨‍💻 Kareem Idris

Built as part of Stage 2 Backend Task — Intelligence Query Engine.

