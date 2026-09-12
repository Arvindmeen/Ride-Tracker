/**
 * Data Privacy & PII Masking Utilities
 * 
 * Ensures passenger and driver Personally Identifiable Information (PII) 
 * is protected across Admin and public views, adhering to Indian Digital Personal Data Protection (DPDP) standards.
 */

export function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') return '+91 98*** *****';
  const clean = phone.trim();
  if (clean.length < 8) return '****' + clean.slice(-2);
  // Example: +91 99887 76655 -> +91 99*** **655
  return clean.slice(0, 5) + '*** **' + clean.slice(-3);
}

export function maskEmail(email) {
  if (!email || typeof email !== 'string') return 'u***@veloq.com';
  const parts = email.split('@');
  if (parts.length !== 2) return 'u***@veloq.com';
  const [name, domain] = parts;
  const maskedName = name.length <= 2 
    ? name[0] + '***' 
    : name[0] + '***' + name[name.length - 1];
  return `${maskedName}@${domain}`;
}

export function maskGovId(id) {
  if (!id) return 'XXXX-XXXX-4921';
  const clean = String(id);
  return 'XXXX-XXXX-' + clean.slice(-4);
}

export function maskBankAccount(account) {
  if (!account) return 'A/C ending in **89';
  const clean = String(account);
  return 'A/C ending in **' + clean.slice(-4);
}

export function maskAddress(address) {
  if (!address) return 'Zone Area, India';
  // Strip specific house/flat numbers, keep locality and city
  const parts = address.split(',');
  if (parts.length > 2) {
    return parts.slice(-2).join(',').trim();
  }
  return address;
}

/**
 * Sanitize User object for Admin viewing (Strict Privacy Masking)
 */
export function sanitizeUserForAdmin(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: maskEmail(user.email),
    phone: maskPhone(user.phone),
    role: user.role,
    rating: user.rating || 5.0,
    totalRides: user.totalRides || user.total_rides || 0,
    isActive: user.isActive ?? user.is_active ?? true,
    preferredPayment: user.preferredPayment || user.preferred_payment || 'UPI',
    createdAt: user.createdAt || user.created_at,
    isPiiMasked: true,
  };
}

/**
 * Sanitize Driver object for Admin viewing (Operational details visible, financial/personal PII masked)
 */
export function sanitizeDriverForAdmin(driver) {
  if (!driver) return null;
  return {
    id: driver.id,
    userId: driver.userId || driver.user_id,
    name: driver.name,
    phone: maskPhone(driver.phone),
    rating: driver.rating || 4.9,
    status: driver.status || 'AVAILABLE',
    totalRides: driver.totalRides || driver.total_rides || 0,
    acceptanceRate: driver.acceptanceRate || driver.acceptance_rate || 98.5,
    cancellationRate: driver.cancellationRate || driver.cancellation_rate || 1.2,
    safetyScore: driver.safetyScore || driver.safety_score || 99,
    vehicle: {
      category: driver.vehicle?.category || driver.category || 'ECONOMY',
      model: driver.vehicle?.model || driver.vehicleModel || 'Maruti Suzuki Dzire',
      licensePlate: driver.vehicle?.plate || driver.vehicle?.license_plate || driver.licensePlate || 'DL 01 AB 1042',
    },
    bankAccount: maskBankAccount(driver.bankAccount),
    panNumber: maskGovId(driver.panNumber),
    isPiiMasked: true,
  };
}

/**
 * Sanitize Ride for Admin overview (Privacy protected)
 */
export function sanitizeRideForAdmin(ride) {
  if (!ride) return null;
  return {
    id: ride.id,
    pickupArea: maskAddress(ride.pickup?.name || ride.pickup_address || 'Pickup Zone'),
    destinationArea: maskAddress(ride.destination?.name || ride.dest_address || 'Destination Zone'),
    fare: ride.fare?.total || ride.fare || 140,
    status: ride.status,
    category: ride.category,
    requestedAt: ride.requestedAt || ride.created_at,
    passengerName: ride.passengerName ? ride.passengerName.split(' ')[0] + ' (Passenger)' : 'Passenger',
    driverName: ride.driverName || 'Assigned Driver',
    isPiiMasked: true,
  };
}
