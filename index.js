// index.js
const API_BASE_URL = 'https://api.weather.gov/alerts/active?area=';
// Requirement: input must be exactly two capital letters
function isValidStateAbbr(stateAbbr) {
  return /^[A-Z]{2}$/.test(stateAbbr);
}

// Fetch alerts for a state from the National Weather Service API
async function fetchWeatherAlerts(stateAbbr) {
  const response = await fetch(`${API_BASE_URL}${stateAbbr}`);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}. Check the state abbreviation and try again.`);
  }

  return response.json();
}

function showLoadingSpinner() {
  const spinnerElement = document.getElementById('loading-spinner');
  spinnerElement.style.display = 'block';
}

function hideLoadingSpinner() {
  const spinnerElement = document.getElementById('loading-spinner');
  spinnerElement.style.display = 'none';
}

function displayError(message) {
  const errorElement = document.getElementById('error-message');
  errorElement.textContent = message;
  errorElement.classList.add('error');
  errorElement.style.display = 'block';
}

function clearError() {
  const errorElement = document.getElementById('error-message');
  errorElement.textContent = '';
  errorElement.classList.remove('error');
  errorElement.style.display = 'none';
}

function clearAlerts() {
  document.getElementById('alerts-summary').textContent = '';
  document.getElementById('alerts-list').innerHTML = '';
}

// Show the summary title, alert count, and each alert headline
function displayAlerts(data) {
  const features = data.features || [];
  const summaryElement = document.getElementById('alerts-summary');
  const listElement = document.getElementById('alerts-list');

  summaryElement.textContent = `${data.title}: ${features.length}`;

  features.forEach((feature) => {
    const item = document.createElement('li');
    item.textContent = feature.properties?.headline || 'No headline provided';
    listElement.appendChild(item);
  });
}

async function handleGetAlerts() {
  const input = document.getElementById('state-input');
  const stateAbbr = input.value.trim();

  // Reset the UI before each request
  clearError();
  clearAlerts();
  input.value = '';

  if (!isValidStateAbbr(stateAbbr)) {
    displayError('Please enter a valid two-letter state abbreviation (e.g., NY).');
    return;
  }

  showLoadingSpinner();

  try {
    const data = await fetchWeatherAlerts(stateAbbr);
    displayAlerts(data);
  } catch (errorObject) {
    console.log(errorObject.message);
    displayError(
      errorObject instanceof TypeError
        ? 'Network error: unable to reach the weather service. Check your connection.'
        : errorObject.message
    );
  } finally {
    hideLoadingSpinner();
  }
}

// Wire up the DOM only in the browser, so Jest can import the functions
if (typeof document !== 'undefined') {
  document.getElementById('get-alerts-button').addEventListener('click', handleGetAlerts);
}

if (typeof module !== 'undefined') {
  module.exports = {
    isValidStateAbbr,
    fetchWeatherAlerts,
    displayAlerts,
    displayError,
    clearError,
    handleGetAlerts,
  };
}