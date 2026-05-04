/**
 * Generate AI thumbnail for a room using reliable image providers
 * Searches for images based on the debate/room name
 * @param {string} roomName - The name of the room to generate image for
 * @param {string} style - Optional style/theme for the image (default: debate theme)
 * @param {string} provider - Optional provider: 'loremflickr', 'unsplash', 'dicebear'
 * @returns {string} URL to the generated image
 */
export const generateRoomThumbnail = (roomName, style = "debate", provider = "loremflickr") => {
  if (!roomName) {
    return generateDefaultThumbnail(provider);
  }

  // LoremFlickr - Searches for images based on keywords (BEST FOR TOPIC-BASED IMAGES)
  if (provider === "loremflickr" || provider === "auto") {
    return generateLoremFlickrImage(roomName, style);
  }

  // Unsplash - Search API for relevant images
  if (provider === "unsplash") {
    return generateUnsplashImage(roomName, style);
  }

  // DiceBear - Generates unique avatars
  if (provider === "dicebear") {
    return generateDiceBearImage(roomName);
  }

  return generateLoremFlickrImage(roomName, style);
};

/**
 * Generate image using Unsplash Search API
 * Searches for images based on the debate topic/room name
 * @param {string} roomName - Room name used as search query
 * @param {string} style - Style/theme (not used, room name is primary)
 * @returns {string} Unsplash image URL with search query
 */
const generateUnsplashImage = (roomName, style) => {
  // Use room name as search query directly
  const query = encodeURIComponent(roomName);
  // Unsplash search endpoint - returns random image from search results
  return `https://source.unsplash.com/600x400/?${query}`;
};

/**
 * Generate image using LoremFlickr - SEARCHES BY KEYWORDS
 * Searches Flickr for images matching the debate topic/room name
 * @param {string} roomName - Room name used as search keywords
 * @param {string} style - Style/theme
 * @returns {string} LoremFlickr image URL with search query
 */
const generateLoremFlickrImage = (roomName, style) => {
  // Use the full room name as search keywords for topically relevant images
  // LoremFlickr searches Flickr based on the keywords provided
  return `https://loremflickr.com/600/400/${encodeURIComponent(roomName)}`;
};

/**
 * Generate image using DiceBear Avatars
 * Creates unique, consistent avatars based on room name
 * @param {string} roomName - Room name (used as seed)
 * @returns {string} DiceBear image URL
 */
const generateDiceBearImage = (roomName) => {
  const seed = encodeURIComponent(roomName);
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&scale=80&backgroundColor=random`;
};

/**
 * Generate a default thumbnail when room name is not available
 * @param {string} provider - Image provider preference
 * @returns {string} URL to the generated default image
 */
export const generateDefaultThumbnail = (provider = "unsplash") => {
  if (provider === "picsum") {
    return `https://picsum.photos/seed/debate/600/400`;
  } else if (provider === "placeholder") {
    return `https://picsum.photos/600/400?random=default`;
  }
  
  // Default to Unsplash
  return `https://source.unsplash.com/600x400/?debate,discussion`;
};

/**
 * Generate multiple thumbnails for rooms
 * @param {Array} rooms - Array of room objects with roomName property
 * @param {string} style - Optional style/theme for images
 * @param {string} provider - Optional provider preference
 * @returns {Array} Array of URLs corresponding to rooms
 */
export const generateRoomThumbnails = (rooms, style = "debate", provider = "unsplash") => {
  return rooms.map((room) => generateRoomThumbnail(room.roomName, style, provider));
};
