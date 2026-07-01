// Przed zmianą: const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
// Po zmianie: używamy ścieżek relatywnych (ten sam host/domena)
const BACKEND_URL = '';

// 1. Pobieranie listy wszystkich miesięcy (do dropdownu)
export async function fetchAllMonths() {
  const res = await fetch(`${BACKEND_URL}/dashboard/months`);
  if (!res.ok) throw new Error('Błąd podczas pobierania miesięcy');
  return res.json();
}

// 2. Pobieranie głównego podsumowania miesiąca
export async function fetchMonthSummary(monthId: string) {
  const res = await fetch(`${BACKEND_URL}/dashboard/summary/${monthId}`);
  if (!res.ok) throw new Error('Błąd podczas pobierania podsumowania miesiąca');
  return res.json();
}

// 3. Pobieranie podziału wydatków na kategorie
export async function fetchCategoryBreakdown(monthId: string) {
  const res = await fetch(`${BACKEND_URL}/dashboard/categories/${monthId}`);
  if (!res.ok) throw new Error('Błąd podczas pobierania podziału na kategorie');
  return res.json();
}

// 4. Pobieranie sald wszystkich kont bankowych
export async function fetchAccountBalances() {
  const res = await fetch(`${BACKEND_URL}/dashboard/accounts`);
  if (!res.ok) throw new Error('Błąd podczas pobierania sald kont');
  return res.json();
}

// 5. Pobieranie feedu ostatnich transakcji
export async function fetchRecentTransactions() {
  const res = await fetch(`${BACKEND_URL}/dashboard/recent`);
  if (!res.ok) throw new Error('Błąd podczas pobierania ostatnich transakcji');
  return res.json();
}

// 6. Pobieranie trendu historycznego z 6 miesięcy
export async function fetchMonthlyTrend() {
  const res = await fetch(`${BACKEND_URL}/dashboard/trend`);
  if (!res.ok) throw new Error('Błąd podczas pobierania trendu finansowego');
  return res.json();
}

// 7. Pobieranie prognozy planów finansowych na przyszłość
export async function fetchFutureForecast() {
  const res = await fetch(`${BACKEND_URL}/dashboard/forecast`);
  if (!res.ok) throw new Error('Błąd podczas pobierania prognozy planów');
  return res.json();
}

// 8. Ręczne wywołanie pełnej synchronizacji z Notion
export async function triggerSyncAll() {
  const res = await fetch(`${BACKEND_URL}/sync/all`);
  if (!res.ok) throw new Error('Błąd podczas synchronizacji z Notion');
  return res.json();
}