import { CombinedOrder, OrderDiff } from "../types";


const HISTORY_TRANSLATIONS_IGNORED = [
    "details.tasks.registration.orderDetails.vin",
    "details.tasks.registration.regData.orderDetails.vin",
    "details.tasks.finalPayment.data.vin",
    "details.tasks.tradeIn.isMatched",
    "details.tasks.registration.isMatched",
    "details.tasks.registration.orderDetails.vehicleModelYear",
    "details.state",
    "details.strings",
    "details.scheduling.card",
    "details.scheduling.strings",
    "details.tasks.carbonCredit.card",
    "details.tasks.carbonCredit.strings.",
    "details.tasks.finalPayment.card.",
    "details.tasks.finalPayment.strings.",
    "details.tasks.scheduling.card.",
    "details.tasks.scheduling.strings.",
    "details.tasks.scheduling.isDeliveryEstimatesEnabled",
    "details.tasks.registration.orderDetails.isAvailableForMatch",
    "details.tasks.finalPayment.data.isAvailableForMatch",
    "details.tasks.finalPayment.data.deliveryReadinessDetail.",
    "details.tasks.finalPayment.data.deliveryReadiness.",
    "details.tasks.finalPayment.data.agreementDetails",
    "details.tasks.finalPayment.data.vehicleId",
    "details.tasks.deliveryAcceptance.gates",
    "details.tasks.deliveryAcceptance.card.",
    "details.tasks.deliveryAcceptance.strings.",
    "details.tasks.deliveryDetails.regData.reggieRegistrationStatus",
    "details.tasks.deliveryDetails.strings.",
    "details.tasks.deliveryDetails.card.",
    "details.tasks.registration.card.",
    "details.tasks.registration.regData.reggieRegistrationStatus",
    "details.tasks.registration.strings.",
    "details.tasks.finalPayment.complete",
    "details.tasks.finalPayment.data.finalPaymentStatus",
    "details.tasks.scheduling.apptDateTimeAddressStr",
    "details.tasks.scheduling.isInventoryOrMatched",
    "details.tasks.finalPayment.data.hasFinalInvoice",
    "details.tasks.finalPayment.data.hasActiveInvoice",
    "details.tasks.finalPayment.data.selfSchedulingDetails.deliveryLocationId",
    "details.tasks.finalPayment.data.selfSchedulingDetails.",
    "details.tasks.financing.card.",
    "details.tasks.financing.strings.",
    "details.tasks.tradeIn.card.",
    "details.tasks.tradeIn.strings."
]

// --- PKCE Helpers ---

function base64urlencode(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function generateCodeVerifier(): string {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return base64urlencode(randomBytes.buffer);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64urlencode(digest);
}

// --- Token Helpers ---

function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode JWT", e);
    return null;
  }
}

export function isTokenValid(accessToken: string): boolean {
    const decoded = decodeJwt(accessToken);
    if (!decoded || !decoded.exp) {
        return false;
    }
    // Check if expiry time is in the future (with a 60-second buffer)
    return decoded.exp > (Date.now() / 1000) + 60;
}

// --- Comparison Helpers ---

function isObject(obj: any): obj is object {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
}

// Helper to compare arrays. Using JSON.stringify is a pragmatic choice for this app's data.
// It's fast and handles nested structures, but is sensitive to property order in objects.
const areArraysEqual = (a: any[], b: any[]): boolean => {
    if (a.length !== b.length) {
        return false;
    }
    // This is a quick way to compare arrays of primitives or simple objects.
    // It will consider arrays with same elements but different order as different.
    return JSON.stringify(a) === JSON.stringify(b);
};

export function compareObjects(oldObj: any, newObj: any, path: string = '', diffs: OrderDiff = {}): OrderDiff {
    const a = oldObj || {};
    const b = newObj || {};

    const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);

    for (const key of allKeys) {
        const currentPath = path ? `${path}.${key}` : key;
        const oldVal = a[key];
        const newVal = b[key];
        
        if (HISTORY_TRANSLATIONS_IGNORED.includes(currentPath)) {
            continue;
        }

        if (Object.is(oldVal, newVal)) {
            continue; // Values are strictly equal, no change.
        }
        
        if (isObject(oldVal) && isObject(newVal)) {
            compareObjects(oldVal, newVal, currentPath, diffs);
        } else if (Array.isArray(oldVal) && Array.isArray(newVal)) {
            if (!areArraysEqual(oldVal, newVal)) {
                diffs[currentPath] = { old: oldVal, new: newVal };
            }
        } else {
            // This covers primitives, nulls, undefined, and type mismatches (e.g., object vs. array).
            // The Object.is check at the top has already filtered out identical values, so if we're here, it's a difference.
            diffs[currentPath] = { old: oldVal, new: newVal };
        }
    }
    return diffs;
}

export function compareOrders(oldOrders: CombinedOrder[], newOrders: CombinedOrder[]): Record<string, OrderDiff> {
    const allDiffs: Record<string, OrderDiff> = {};
    const newOrdersMap = new Map(newOrders.map(o => [o.order.referenceNumber, o]));

    for (const oldOrder of oldOrders) {
        const rn = oldOrder.order.referenceNumber;
        const newOrder = newOrdersMap.get(rn);
        if (newOrder) {
            const orderDiffs = compareObjects(oldOrder, newOrder);
            if(Object.keys(orderDiffs).length > 0) {
                allDiffs[rn] = orderDiffs;
            }
        }
    }
    return allDiffs;
}