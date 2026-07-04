import './styles/index.css';

// Driver list static (sama dengan backend) untuk form kualifikasi
const DRIVERS = [
  { id: 'verstappen', name: 'Max Verstappen', code: 'VER', team: 'Red Bull' },
  { id: 'hamilton', name: 'Lewis Hamilton', code: 'HAM', team: 'Ferrari' },
  { id: 'leclerc', name: 'Charles Leclerc', code: 'LEC', team: 'Ferrari' },
  { id: 'norris', name: 'Lando Norris', code: 'NOR', team: 'McLaren' },
  { id: 'piastri', name: 'Oscar Piastri', code: 'PIA', team: 'McLaren' },
  { id: 'russell', name: 'George Russell', code: 'RUS', team: 'Mercedes' },
  { id: 'antonelli', name: 'Kimi Antonelli', code: 'ANT', team: 'Mercedes' },
  { id: 'alonso', name: 'Fernando Alonso', code: 'ALO', team: 'Aston Martin' }
];

document.addEventListener('DOMContentLoaded', () => {
  const qualyContainer = document.getElementById('qualy-inputs-container');
  const predictionForm = document.getElementById('prediction-form');
  const resultsList = document.getElementById('results-list');
  const loader = document.getElementById('results-loader');

  // Render input grid kualifikasi secara dinamis
  if (qualyContainer) {
    qualyContainer.innerHTML = DRIVERS.map((driver, index) => `
      <div class="qualy-driver-row">
        <div class="driver-info-tag">
          ${driver.code} <span>(${driver.team})</span>
        </div>
        <input 
          type="number" 
          name="qualy-${driver.id}" 
          class="qualy-input" 
          min="1" 
          max="8" 
          value="${index + 1}"
          required
        />
      </div>
    `).join('');
  }

  // Handle form submission untuk prediksi
  if (predictionForm) {
    predictionForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Show loader & clear previous results
      loader.classList.remove('hidden');
      resultsList.classList.add('hidden');

      // Ambil data form
      const formData = new FormData(predictionForm);
      const weather = formData.get('weather');
      const trackType = formData.get('trackType');

      // Bangun objek kualifikasi
      const qualifying = {};
      DRIVERS.forEach(driver => {
        qualifying[driver.id] = parseInt(formData.get(`qualy-${driver.id}`), 10);
      });

      try {
        // Panggil backend API
        const response = await fetch('http://localhost:3000/api/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ weather, trackType, qualifying })
        });

        if (!response.ok) {
          throw new Error('Gagal terhubung ke API Server');
        }

        const data = await response.json();
        
        // Simulasikan delay loading agar UX terasa "berpikir" menghitung data
        setTimeout(() => {
          renderResults(data.predictedOrder);
          loader.classList.add('hidden');
          resultsList.classList.remove('hidden');
        }, 1200);

      } catch (err) {
        console.error(err);
        resultsList.innerHTML = `
          <div class="placeholder-results" style="border-color: var(--f1-red); color: var(--f1-red);">
            ❌ Terjadi kesalahan: Backend server belum dinyalakan atau tidak dapat dijangkau. <br/>
            Pastikan kamu telah menjalankan server backend dengan command <code>npm run dev</code>.
          </div>
        `;
        loader.classList.add('hidden');
        resultsList.classList.remove('hidden');
      }
    });
  }

  // Render hasil prediksi ke DOM
  function renderResults(predictedOrder) {
    if (!resultsList) return;

    resultsList.innerHTML = predictedOrder.map((driver, index) => {
      const position = index + 1;
      return `
        <div class="predicted-row" data-pos="${position}">
          <div class="predicted-pos">P${position}</div>
          <div class="predicted-details">
            <span class="predicted-driver">${driver.name}</span>
            <span class="predicted-team">${driver.team}</span>
          </div>
          <div class="predicted-score">${Math.round(driver.predictionScore)} pts</div>
        </div>
      `;
    }).join('');
  }
});
