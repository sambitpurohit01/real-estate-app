import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { propertyService } from '../api/propertyService';
import ImageDropzone from '../components/ImageDropzone';
import LocationPicker from '../components/LocationPicker';

const emptyForm = {
  title: '',
  description: '',
  price: '',
  propertyType: 'HOUSE',
  listingType: 'SALE',
  addressLine: '',
  city: '',
  state: '',
  zipCode: '',
  bedrooms: '',
  bathrooms: '',
  areaSqft: '',
  yearBuilt: '',
  images: [],
  amenities: '',
  latitude: null,
  longitude: null,
};

export default function PropertyForm({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode !== 'edit') return;
    propertyService
      .getById(id)
      .then((p) => {
        setForm({
          title: p.title || '',
          description: p.description || '',
          price: p.price ?? '',
          propertyType: p.propertyType || 'HOUSE',
          listingType: p.listingType || 'SALE',
          addressLine: p.addressLine || '',
          city: p.city || '',
          state: p.state || '',
          zipCode: p.zipCode || '',
          bedrooms: p.bedrooms ?? '',
          bathrooms: p.bathrooms ?? '',
          areaSqft: p.areaSqft ?? '',
          yearBuilt: p.yearBuilt ?? '',
          images: p.images || [],
          amenities: (p.amenities || []).join(', '),
          latitude: p.latitude ?? null,
          longitude: p.longitude ?? null,
        });
      })
      .catch(() => setError('Could not load this listing for editing.'))
      .finally(() => setLoading(false));
  }, [id, mode]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      propertyType: form.propertyType,
      listingType: form.listingType,
      addressLine: form.addressLine,
      city: form.city,
      state: form.state,
      zipCode: form.zipCode,
      bedrooms: form.bedrooms === '' ? null : Number(form.bedrooms),
      bathrooms: form.bathrooms === '' ? null : Number(form.bathrooms),
      areaSqft: form.areaSqft === '' ? null : Number(form.areaSqft),
      yearBuilt: form.yearBuilt === '' ? null : Number(form.yearBuilt),
      images: form.images,
      amenities: form.amenities.split(',').map((s) => s.trim()).filter(Boolean),
      latitude: form.latitude,
      longitude: form.longitude,
    };

    try {
      if (mode === 'edit') {
        const updated = await propertyService.update(id, payload);
        navigate(`/properties/${updated.id}`);
      } else {
        const created = await propertyService.create(payload);
        navigate(`/properties/${created.id}`);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save this listing. Check the fields and try again.');
      setSaving(false);
    }
  };

  if (loading) return <main className="page"><div className="container spinner-row">Loading&hellip;</div></main>;

  return (
    <main className="page">
      <div className="container">
        <div className="page-header">
          <h1>{mode === 'edit' ? 'Edit Listing' : 'New Listing'}</h1>
        </div>

        <div className="form-card wide">
          {error && <div className="form-error">{error}</div>}

          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="title">Title</label>
              <input id="title" required value={form.title} onChange={update('title')} placeholder="Sunlit 3BHK with Garden View" />
            </div>

            <div className="field">
              <label htmlFor="description">Description</label>
              <textarea id="description" value={form.description} onChange={update('description')} placeholder="Describe the property..." />
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="price">Price</label>
                <input id="price" type="number" min="0" required value={form.price} onChange={update('price')} />
              </div>
              <div className="field">
                <label htmlFor="propertyType">Property Type</label>
                <select id="propertyType" value={form.propertyType} onChange={update('propertyType')}>
                  <option value="HOUSE">House</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="CONDO">Condo</option>
                  <option value="TOWNHOUSE">Townhouse</option>
                  <option value="LAND">Land</option>
                  <option value="COMMERCIAL">Commercial</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="listingType">Listing Type</label>
                <select id="listingType" value={form.listingType} onChange={update('listingType')}>
                  <option value="SALE">For Sale</option>
                  <option value="RENT">For Rent</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="addressLine">Address</label>
              <input id="addressLine" required value={form.addressLine} onChange={update('addressLine')} />
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="city">City</label>
                <input id="city" required value={form.city} onChange={update('city')} />
              </div>
              <div className="field">
                <label htmlFor="state">State</label>
                <input id="state" required value={form.state} onChange={update('state')} />
              </div>
              <div className="field">
                <label htmlFor="zipCode">Zip Code</label>
                <input id="zipCode" required value={form.zipCode} onChange={update('zipCode')} />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="bedrooms">Bedrooms</label>
                <input id="bedrooms" type="number" min="0" value={form.bedrooms} onChange={update('bedrooms')} />
              </div>
              <div className="field">
                <label htmlFor="bathrooms">Bathrooms</label>
                <input id="bathrooms" type="number" min="0" value={form.bathrooms} onChange={update('bathrooms')} />
              </div>
              <div className="field">
                <label htmlFor="areaSqft">Area (sqft)</label>
                <input id="areaSqft" type="number" min="0" value={form.areaSqft} onChange={update('areaSqft')} />
              </div>
              <div className="field">
                <label htmlFor="yearBuilt">Year Built</label>
                <input id="yearBuilt" type="number" min="0" value={form.yearBuilt} onChange={update('yearBuilt')} />
              </div>
            </div>

            <ImageDropzone
              label="Photos"
              multiple
              value={form.images}
              onChange={(urls) => setForm({ ...form, images: urls })}
            />

            <LocationPicker
              latitude={form.latitude}
              longitude={form.longitude}
              onChange={(lat, lng) => setForm({ ...form, latitude: lat, longitude: lng })}
            />

            <div className="field">
              <label htmlFor="amenities">Amenities (comma separated)</label>
              <input id="amenities" value={form.amenities} onChange={update('amenities')} placeholder="Parking, Gym, Lift" />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
              {saving ? 'Saving\u2026' : mode === 'edit' ? 'Save Changes' : 'Publish Listing'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
