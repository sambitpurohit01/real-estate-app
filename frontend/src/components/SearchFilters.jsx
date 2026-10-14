import { useState } from 'react';

const PROPERTY_TYPES = ['HOUSE', 'APARTMENT', 'CONDO', 'TOWNHOUSE', 'LAND', 'COMMERCIAL'];

export default function SearchFilters({ initial, onSearch }) {
  const [form, setForm] = useState({
    keyword: initial?.keyword || '',
    city: initial?.city || '',
    listingType: initial?.listingType || '',
    propertyType: initial?.propertyType || '',
    minPrice: initial?.minPrice || '',
    maxPrice: initial?.maxPrice || '',
    minBedrooms: initial?.minBedrooms || '',
  });

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    onSearch(form);
  };

  const reset = () => {
    const cleared = {
      keyword: '', city: '', listingType: '', propertyType: '',
      minPrice: '', maxPrice: '', minBedrooms: '',
    };
    setForm(cleared);
    onSearch(cleared);
  };

  return (
    <form className="filters" onSubmit={submit}>
      <div className="field">
        <label htmlFor="keyword">Keyword</label>
        <input id="keyword" placeholder="Garden, villa, metro..." value={form.keyword} onChange={update('keyword')} />
      </div>

      <div className="field">
        <label htmlFor="city">City</label>
        <input id="city" placeholder="e.g. Bengaluru" value={form.city} onChange={update('city')} />
      </div>

      <div className="field">
        <label htmlFor="listingType">Listing</label>
        <select id="listingType" value={form.listingType} onChange={update('listingType')}>
          <option value="">Any</option>
          <option value="SALE">For Sale</option>
          <option value="RENT">For Rent</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="propertyType">Type</label>
        <select id="propertyType" value={form.propertyType} onChange={update('propertyType')}>
          <option value="">Any</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="minPrice">Min Price</label>
        <input id="minPrice" type="number" min="0" value={form.minPrice} onChange={update('minPrice')} />
      </div>

      <div className="field">
        <label htmlFor="maxPrice">Max Price</label>
        <input id="maxPrice" type="number" min="0" value={form.maxPrice} onChange={update('maxPrice')} />
      </div>

      <div className="field">
        <label htmlFor="minBedrooms">Min Beds</label>
        <input id="minBedrooms" type="number" min="0" value={form.minBedrooms} onChange={update('minBedrooms')} />
      </div>

      <div className="filter-actions">
        <button type="submit" className="btn btn-primary">Search</button>
        <button type="button" className="btn btn-outline" onClick={reset}>Clear</button>
      </div>
    </form>
  );
}
