export const MOCK_USERS = [
  {
    id: 'U001', name: 'Rahul Mehra', email: 'rahul.mehra@example.com',
    phone: '+91 99887 76655', role: 'USER', rating: 4.7, totalRides: 87,
    joinedAt: '2023-03-15', isActive: true, preferredPayment: 'CARD',
    emergencyContacts: [{ id: 'EC001', name: 'Anita Mehra', phone: '+91 99887 76644', relation: 'Spouse' }],
    savedPlaces: [
      { id: 'SP001', label: 'Home', icon: 'HOME', address: 'Flat 4B, Sunshine Apartments, Bandra West', location: { lat: 19.059, lng: 72.8295 } },
      { id: 'SP002', label: 'Work', icon: 'WORK', address: 'Tech Park, Andheri East', location: { lat: 19.1136, lng: 72.8697 } },
    ],
  },
  {
    id: 'U002', name: 'Deepika Nair', email: 'deepika.nair@example.com',
    phone: '+91 88776 65544', role: 'USER', rating: 4.9, totalRides: 234,
    joinedAt: '2022-11-08', isActive: true, preferredPayment: 'WALLET',
    emergencyContacts: [{ id: 'EC002', name: 'Suresh Nair', phone: '+91 88776 65533', relation: 'Father' }],
    savedPlaces: [
      { id: 'SP003', label: 'Home', icon: 'HOME', address: 'Sea View CHS, Worli', location: { lat: 19.0094, lng: 72.8161 } },
    ],
  },
  {
    id: 'U003', name: 'Arjun Krishnaswamy', email: 'arjun.k@techcorp.com',
    phone: '+91 77665 54433', role: 'USER', rating: 3.8, totalRides: 12,
    joinedAt: '2024-07-20', isActive: true, preferredPayment: 'CORPORATE',
    corporateAccount: 'TechCorp India Pvt Ltd',
    emergencyContacts: [], savedPlaces: [],
  },
  {
    id: 'U004', name: 'Priya Kapoor', email: 'priya.kapoor@example.com',
    phone: '+91 66554 43322', role: 'USER', rating: 4.5, totalRides: 456,
    joinedAt: '2022-01-05', isActive: false, preferredPayment: 'CASH',
    emergencyContacts: [{ id: 'EC003', name: 'Rohan Kapoor', phone: '+91 66554 43311', relation: 'Brother' }],
    savedPlaces: [
      { id: 'SP004', label: 'Home', icon: 'HOME', address: 'Powai Lake View, Powai', location: { lat: 19.1197, lng: 72.9043 } },
    ],
  },
  {
    id: 'U005', name: 'Vishal Gupta', email: 'vishal.gupta@example.com',
    phone: '+91 55443 32211', role: 'USER', rating: 4.2, totalRides: 31,
    joinedAt: '2024-02-14', isActive: true, preferredPayment: 'CARD',
    emergencyContacts: [], savedPlaces: [],
  },
];

export const CURRENT_USER = MOCK_USERS[0];
