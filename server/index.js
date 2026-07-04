import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mock data untuk musim F1 2026 (Driver, Team, dan sirkuit)
const drivers = [
  { id: 'verstappen', name: 'Max Verstappen', team: 'Red Bull Racing', points: 0, code: 'VER' },
  { id: 'hamilton', name: 'Lewis Hamilton', team: 'Ferrari', points: 0, code: 'HAM' },
  { id: 'leclerc', name: 'Charles Leclerc', team: 'Ferrari', points: 0, code: 'LEC' },
  { id: 'norris', name: 'Lando Norris', team: 'McLaren', points: 0, code: 'NOR' },
  { id: 'piastri', name: 'Oscar Piastri', team: 'McLaren', points: 0, code: 'PIA' },
  { id: 'russell', name: 'George Russell', team: 'Mercedes', points: 0, code: 'RUS' },
  { id: 'antonelli', name: 'Kimi Antonelli', team: 'Mercedes', points: 0, code: 'ANT' },
  { id: 'alonso', name: 'Fernando Alonso', team: 'Aston Martin', points: 0, code: 'ALO' }
];

app.get('/api/drivers', (req, res) => {
  res.json(drivers);
});

// Endpoint untuk melakukan prediksi grid P1 - P20
app.post('/api/predict', (req, res) => {
  const { weather, trackType, qualifying } = req.body;

  // Algoritma Weighted Scoring sederhana untuk memprediksi hasil race
  // 1. Basis poin dari performa tim & driver historis (mock value)
  const baseStrength = {
    verstappen: 95,
    hamilton: 92,
    leclerc: 90,
    norris: 91,
    piastri: 88,
    russell: 87,
    antonelli: 82,
    alonso: 85
  };

  // Hitung skor akhir untuk setiap pembalap
  const scores = drivers.map(driver => {
    let score = baseStrength[driver.id] || 75;

    // Tambah bobot berdasarkan posisi kualifikasi (jika dikirim oleh client)
    if (qualifying && qualifying[driver.id]) {
      const qualyPos = qualifying[driver.id];
      // Posisi 1 dapet tambahan besar, posisi bawah dapet lebih sedikit
      score += (21 - qualyPos) * 1.5; 
    }

    // Penyesuaian cuaca (wet race menguntungkan driver berpengalaman/bagus di hujan)
    if (weather === 'rainy') {
      if (['verstappen', 'hamilton', 'alonso'].includes(driver.id)) {
        score += 5; // Rainmasters
      }
    }

    // Penyesuaian tipe trek
    if (trackType === 'street') {
      if (['leclerc', 'perez', 'hamilton'].includes(driver.id)) {
        score += 3; // Bagus di street circuit
      }
    }

    return { ...driver, predictionScore: score };
  });

  // Urutkan dari skor tertinggi ke terendah untuk mendapatkan urutan finish (P1 - P8+)
  const predictedOrder = scores.sort((a, b) => b.predictionScore - a.predictionScore);

  res.json({
    predictedOrder,
    weather,
    trackType,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server F1 Predictor backend berjalan di http://localhost:${PORT}`);
});
