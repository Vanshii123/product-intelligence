export const CATEGORY_STYLES = {
  "Shoes":        { icon: "👟", tag: "#5B5FEF" },
  "Sports Shoes": { icon: "👟", tag: "#5B5FEF" },
  "Casual Shoes": { icon: "👞", tag: "#B4762A" },
  "Shirts":       { icon: "👔", tag: "#7C5CFF" },
  "Tshirts":      { icon: "👕", tag: "#12D6A0" },
  "Watches":      { icon: "⌚", tag: "#E8578A" },
  "Handbags":     { icon: "👜", tag: "#E29B3E" },
  "Jeans":        { icon: "👖", tag: "#3E7BE2" },
  "Sunglasses":   { icon: "🕶️", tag: "#5A5F73" },
  "Sarees":       { icon: "🥻", tag: "#E24E4E" },
  "Kurtas":       { icon: "👗", tag: "#C147D9" },
  DEFAULT:        { icon: "🛍️", tag: "#8B90A0" },
}

export function getCategoryStyle(articleType) {
  return CATEGORY_STYLES[articleType] || CATEGORY_STYLES.DEFAULT
}