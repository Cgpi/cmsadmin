// Dummy image data for the Sub-Admin "My Images" section. UI-only.

export const locations = ['Home', 'Gallery', 'About', 'Services']

// 12 dummy images spread across the four locations, using real Pexels stock photos.
export const images = [
  { id: 1, title: 'Riverside Tower — Aerial', location: 'Home', active: true, order: 1, url: 'https://images.pexels.com/photos/25461690/pexels-photo-25461690.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { id: 2, title: 'Steel Framework', location: 'Home', active: true, order: 2, url: 'https://images.pexels.com/photos/31197870/pexels-photo-31197870.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { id: 3, title: 'Urban Site Overview', location: 'Home', active: false, order: 3, url: 'https://images.pexels.com/photos/13758319/pexels-photo-13758319.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },

  { id: 4, title: 'Scaffolding Detail', location: 'Gallery', active: true, order: 1, url: 'https://images.pexels.com/photos/37031068/pexels-photo-37031068.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { id: 5, title: 'High-Rise Construction', location: 'Gallery', active: true, order: 2, url: 'https://images.pexels.com/photos/13094084/pexels-photo-13094084.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { id: 6, title: 'Concrete Structure', location: 'Gallery', active: true, order: 3, url: 'https://images.pexels.com/photos/7108785/pexels-photo-7108785.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { id: 7, title: 'Cranes at Dusk', location: 'Gallery', active: false, order: 4, url: 'https://images.pexels.com/photos/35632880/pexels-photo-35632880.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },

  { id: 8, title: 'Our Team On-Site', location: 'About', active: true, order: 1, url: 'https://images.pexels.com/photos/69483/pexels-photo-69483.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { id: 9, title: 'Project in Progress', location: 'About', active: true, order: 2, url: 'https://images.pexels.com/photos/9562581/pexels-photo-9562581.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },

  { id: 10, title: 'Excavation Services', location: 'Services', active: true, order: 1, url: 'https://images.pexels.com/photos/17638341/pexels-photo-17638341.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { id: 11, title: 'Crane Operations', location: 'Services', active: true, order: 2, url: 'https://images.pexels.com/photos/10176177/pexels-photo-10176177.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { id: 12, title: 'Steel Erection', location: 'Services', active: false, order: 3, url: 'https://images.pexels.com/photos/35155685/pexels-photo-35155685.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
]

// Sub-admin dashboard stats derived from the images array.
export function computeImageStats(imageList) {
  return {
    totalImages: imageList.length,
    activeImages: imageList.filter((i) => i.active).length,
    newMessages: 7,
  }
}

export function countByLocation(imageList) {
  return imageList.reduce((acc, img) => {
    acc[img.location] = (acc[img.location] || 0) + 1
    return acc
  }, {})
}

// Placeholder preview image used by the upload modal's "selected" state.
export const placeholderPreview =
  'https://images.pexels.com/photos/33628380/pexels-photo-33628380.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
