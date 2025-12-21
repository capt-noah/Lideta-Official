
// Import all logic using Vite's glob import
// We load them eagerly so we can return the URL synchronously
// For logos (checking common image extensions)
const logos = import.meta.glob('../../data/logos/*.{png,jpg,jpeg,svg,webp}', { eager: true, as: 'url' });

// For department heads
const heads = import.meta.glob('../../data/department heads/*.{png,jpg,jpeg,svg,webp}', { eager: true, as: 'url' });

/**
 * Helper to match a department ID to a file path regardless of extension
 * @param {string} id - The department ID (e.g. "d-001")
 * @param {object} collection - The glob import collection
 * @returns {string|null} - The image URL or null
 */
const findImageById = (id, collection) => {
  if (!id) return null;
  // Iterate through the keys (paths) to find one that includes the ID
  // e.g. "../../data/logos/d-001.png" includes "d-001"
  for (const path in collection) {
    // Check if the filename (without extension) matches the ID
    // We split by '/' to get filename, then split by '.' to get name
    const filename = path.split('/').pop().split('.')[0];
    if (filename === id) {
      return collection[path];
    }
  }
  return null;
};

export const getDepartmentLogo = (id) => findImageById(id, logos);
export const getDepartmentHead = (id) => findImageById(id, heads);
