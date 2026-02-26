import { supabase } from './supabaseClient';

const ITEM_COLUMNS =
  'id, type, title, description, image_url, contact_info, current_location, date_event, event_location, created_at';

const FALLBACK_TEXT = 'N/A';

export const ITEM_IMAGE_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22400%22 viewBox=%220 0 600 400%22%3E%3Crect width=%22600%22 height=%22400%22 fill=%22%23e5e7eb%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial,sans-serif%22 font-size=%2224%22 fill=%22%236b7280%22%3ENo Image%3C/text%3E%3C/svg%3E';

function normalizeText(value) {
  if (typeof value !== 'string') {
    return value ?? FALLBACK_TEXT;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : FALLBACK_TEXT;
}

export function formatItemDate(value) {
  if (!value) {
    return FALLBACK_TEXT;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return FALLBACK_TEXT;
  }

  return parsedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function mapItemRowToCardItem(row) {
  return {
    id: String(row.id),
    image: row.image_url || null,
    title: normalizeText(row.title),
    currentLocation: normalizeText(row.current_location),
    dateEvent: formatItemDate(row.date_event),
    eventLocation: normalizeText(row.event_location),
  };
}

export function mapItemRowToDetailItem(row) {
  return {
    id: String(row.id),
    image: row.image_url || null,
    title: normalizeText(row.title),
    type: normalizeText(row.type),
    description: normalizeText(row.description),
    contactInfo: normalizeText(row.contact_info),
    currentLocation: normalizeText(row.current_location),
    dateEvent: formatItemDate(row.date_event),
    eventLocation: normalizeText(row.event_location),
  };
}

async function uploadItemImage(file) {
  const fileName = `${Date.now()}_${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('lost-found-images')
    .upload(fileName, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data: urlData } = supabase.storage
    .from('lost-found-images')
    .getPublicUrl(fileName);

  return urlData?.publicUrl || null;
}

export async function createItem(formData) {
  let imageUrl = null;

  if (formData.image && formData.image[0]) {
    imageUrl = await uploadItemImage(formData.image[0]);
  }

  const payload = {
    type: formData.itemType,
    title: formData.title,
    description: formData.description || null,
    image_url: imageUrl,
    contact_info: formData.contactInfo,
    current_location: formData.currentLocation || null,
    date_event: formData.dateEvent || null,
    event_location: formData.eventLocation || null,
  };

  const { data, error } = await supabase
    .from('items')
    .insert([payload])
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function fetchItemsWithOrder(orderColumn, type) {
  let query = supabase.from('items').select(ITEM_COLUMNS).order(orderColumn, { ascending: false });

  if (type) {
    query = query.eq('type', type);
  }

  return query;
}

export async function fetchItems({ type } = {}) {
  const orderColumns = ['created_at', 'date_event', 'id'];

  for (let index = 0; index < orderColumns.length; index += 1) {
    const { data, error } = await fetchItemsWithOrder(orderColumns[index], type);

    if (!error) {
      return (data || []).map(mapItemRowToCardItem);
    }

    if (index === orderColumns.length - 1) {
      throw error;
    }
  }

  return [];
}

export async function fetchItemById(id) {
  const { data, error } = await supabase
    .from('items')
    .select(ITEM_COLUMNS)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116' || error.details?.includes('0 rows')) {
      return null;
    }

    throw error;
  }

  return mapItemRowToDetailItem(data);
}
