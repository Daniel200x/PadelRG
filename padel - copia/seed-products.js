// seed-products.js
// Script para cargar productos iniciales en Firestore

const products = [
  {
    name: "Pala Bullpadel Vertex 03",
    description: "Pala de potencia media-alta, ideal para jugadores intermedios. Control y potencia balanceados.",
    price: 89990,
    brand: "Bullpadel",
    category: "palas",
    stock: 15,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400&h=300&fit=crop",
    isActive: true,
    createdAt: new Date(),
    specifications: {
      material: "Fibra de carbono",
      forma: "Redonda",
      peso: "360-375g",
      balance: "Medio"
    }
  },
  {
    name: "Pala Head Alpha Pro",
    description: "Control máximo para jugadores avanzados. Excelente manejo y precisión.",
    price: 75990,
    brand: "Head",
    category: "palas",
    stock: 8,
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400&h=300&fit=crop",
    isActive: true,
    createdAt: new Date(),
    specifications: {
      material: "Goma EVA",
      forma: "Diamante",
      peso: "350-365g",
      balance: "Alto"
    }
  },
  {
    name: "Pelotas Head Padel Pro",
    description: "Tubo de 3 pelotas profesionales. Durabilidad y consistencia excepcionales.",
    price: 12990,
    brand: "Head",
    category: "pelotas",
    stock: 50,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1587174486073-ae7e6c84b587?w=400&h=300&fit=crop",
    isActive: true,
    createdAt: new Date()
  },
  {
    name: "Mochila Bullpadel Advance",
    description: "Mochila con compartimento térmico para 2 palas. Múltiples bolsillos.",
    price: 34990,
    brand: "Bullpadel",
    category: "accesorios",
    stock: 12,
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop",
    isActive: true,
    createdAt: new Date()
  },
  {
    name: "Zapatos Asics Gel-Padel Pro",
    description: "Calzado profesional con tecnología GEL. Máxima amortiguación y estabilidad.",
    price: 55990,
    brand: "Asics",
    category: "calzado",
    stock: 6,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w-400&h=300&fit=crop",
    isActive: true,
    createdAt: new Date()
  },
  {
    name: "Overgrips Tecnifibre",
    description: "Pack de 10 overgrips absorbentes. Mejor agarre y comodidad.",
    price: 8990,
    brand: "Tecnifibre",
    category: "accesorios",
    stock: 45,
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=300&fit=crop",
    isActive: true,
    createdAt: new Date()
  },
  {
    name: "Pala Nox ML10 Pro Cup",
    description: "Pala profesional para competencia. Máximo rendimiento en potencia.",
    price: 109990,
    brand: "Nox",
    category: "palas",
    stock: 5,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400&h=300&fit=crop",
    isActive: true,
    createdAt: new Date(),
    specifications: {
      material: "Fibra de carbono 3K",
      forma: "Híbrida",
      peso: "365-380g",
      balance: "Alto"
    }
  },
  {
    name: "Kit Mantenimiento Padel",
    description: "Incluye protector de marco, masilla y lijas. Cuidado completo para tu pala.",
    price: 15990,
    brand: "Pádel Fuego",
    category: "accesorios",
    stock: 25,
    rating: 4.1,
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop",
    isActive: true,
    createdAt: new Date()
  }
];