export const mockBuyerOrders = [
  {
    id: 'FM-2041',
    status: 'pending',
    items: [{ animalId: 'an_1045', title: 'Dorper sheep', quantity: 1, price: 12500 }],
    total: 12500,
    farmerName: 'Grace Mutua',
    createdAt: '2026-08-14',
  },
  {
    id: 'FM-2038',
    status: 'confirmed',
    items: [{ animalId: 'an_1044', title: 'Boer goat — stud buck', quantity: 1, price: 18000 }],
    total: 18000,
    farmerName: 'Paul Otieno',
    createdAt: '2026-08-10',
  },
  {
    id: 'FM-2035',
    status: 'confirmed',
    items: [{ animalId: 'an_1042', title: 'Friesian — dairy cow', quantity: 1, price: 85000 }],
    total: 85000,
    farmerName: 'James Kamau',
    createdAt: '2026-08-02',
  },
]

export const mockFarmerOrders = [
  {
    id: 'FM-2041',
    status: 'pending',
    buyerName: 'John Kariuki',
    items: [{ animalId: 'an_1045', title: 'Dorper sheep', quantity: 1, price: 12500 }],
    total: 12500,
    createdAt: '2026-08-14',
  },
  {
    id: 'FM-2038',
    status: 'confirmed',
    buyerName: 'Alice Njeri',
    items: [{ animalId: 'an_1044', title: 'Boer goat — stud buck', quantity: 1, price: 18000 }],
    total: 18000,
    createdAt: '2026-08-10',
  },
  {
    id: 'FM-2035',
    status: 'confirmed',
    buyerName: 'Brian Otieno',
    items: [{ animalId: 'an_1042', title: 'Friesian — dairy cow', quantity: 1, price: 85000 }],
    total: 85000,
    createdAt: '2026-08-02',
  },
]

export const mockFarmerStats = {
  activeListings: 24,
  totalOrders: 8,
  rating: 4.9,
}
