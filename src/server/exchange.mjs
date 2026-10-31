// Daily CNY -> JPY reference rate. The control panel shows the date supplied by
// the provider and never invents a fixed conversion when the lookup fails.
const DAY = 24 * 60 * 60 * 1000;
const RETRY = 5 * 60 * 1000;

const sources = [
  {
    name: 'open.er-api.com',
    url: 'https://open.er-api.com/v6/latest/CNY',
    rate: json => json.rates?.JPY,
    time: json => Number(json.time_last_update_unix) > 0 ? Number(json.time_last_update_unix) * 1000 : null
  },
  {
    name: 'frankfurter.app',
    url: 'https://api.frankfurter.app/latest?from=CNY&to=JPY',
    rate: json => json.rates?.JPY,
    time: json => typeof json.date === 'string' ? Date.parse(json.date) : null
  },
  {
    name: 'exchangerate-api.com',
    url: 'https://api.exchangerate-api.com/v4/latest/CNY',
    rate: json => json.rates?.JPY,
    time: json => Number(json.time_last_updated) > 0 ? Number(json.time_last_updated) * 1000 : null
  }
];

export class ExchangeRates {
  state = {rate: null, rateTime: null, fetchedAt: null, source: null, error: null};
  fetching = null;
  nextAttempt = 0;

  async get(now = Date.now(), force = false) {
    if (!force && this.state.rate && this.state.fetchedAt && now - this.state.fetchedAt < DAY) return this.state;
    if (this.fetching) return this.fetching;
    if (!force && now < this.nextAttempt) return this.state;
    this.fetching = this.refresh(now).finally(() => { this.fetching = null; });
    return this.fetching;
  }

  async refresh(now) {
    for (const source of sources) {
      try {
        const response = await fetch(source.url, {
          headers: {'User-Agent': 'BiliGiftDrop', Accept: 'application/json'},
          signal: AbortSignal.timeout(8000)
        });
        if (!response.ok) continue;
        const json = await response.json();
        const rate = Number(source.rate(json));
        if (!Number.isFinite(rate) || rate <= 0 || rate > 1000) continue;
        const rateTime = source.time(json);
        this.state = {
          rate,
          rateTime: Number.isFinite(rateTime) && rateTime > 0 ? rateTime : now,
          fetchedAt: now,
          source: source.name,
          error: null
        };
        return this.state;
      } catch {}
    }
    this.nextAttempt = now + RETRY;
    this.state = {...this.state, error: 'unavailable'};
    return this.state;
  }
}
