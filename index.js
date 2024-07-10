import DerivAPIBasic from 'https://cdn.skypack.dev/@deriv/deriv-api/dist/DerivAPIBasic';

const app_id = 1089; // Replace with your app_id or leave as 1089 for testing.
const connection = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${app_id}`);
const api = new DerivAPIBasic({ connection });
const tickStream = () => api.subscribe({ ticks: 'R_100' });

// Array para contar la frecuencia de los últimos dígitos
let lastDigitCounts = new Array(10).fill(0);

const tickResponse = async (res) => {
  const data = JSON.parse(res.data);
  if (data.error !== undefined) {
    console.log('Error : ', data.error.message);
    connection.removeEventListener('message', tickResponse, false);
    await api.disconnect();
  }
  if (data.msg_type === 'tick') {
    const quote = parseFloat(data.tick.quote).toFixed(3); // Formatear a 3 decimales
    const lastDigit = parseInt(quote.charAt(quote.length - 1)); // Obtener el último dígito como número entero
    lastDigitCounts[lastDigit]++; // Incrementar el contador del último dígito correspondiente
    
    // Mostrar en la consola para verificar
    console.log(`Quote: ${quote}, Last Digit: ${lastDigit}, Counts: `, lastDigitCounts);

    // Actualizar HTML
    updateHTML();
  }
};

const subscribeTicks = async () => {
  await tickStream();
  connection.addEventListener('message', tickResponse);
};

const unsubscribeTicks = () => {
  connection.removeEventListener('message', tickResponse, false);
  tickStream().unsubscribe();
};

const updateHTML = () => {
  const outputDiv = document.querySelector('#output');
  outputDiv.innerHTML = ''; // Limpiar contenido anterior

  lastDigitCounts.forEach((count, index) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = `Último dígito ${index}: ${count}`;
    outputDiv.appendChild(paragraph);
  });
};

const ticks_button = document.querySelector('#ticks');
ticks_button.addEventListener('click', subscribeTicks);

const unsubscribe_ticks_button = document.querySelector('#ticks-unsubscribe');
unsubscribe_ticks_button.addEventListener('click', unsubscribeTicks);
