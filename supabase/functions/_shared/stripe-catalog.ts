// =============================================================================
// Catálogo de productos Stripe — ÚNICA FUENTE DE VERDAD del lado servidor.
//
// Tanto create-checkout-session como stripe-webhook importan este archivo.
// El frontend (PaywallModal.tsx) sólo manda el priceId; los créditos y el modo
// se resuelven aquí. Nunca confiar en `credits` o `mode` enviados por el cliente:
// antes, un usuario autenticado podía pedir el paquete más barato con
// `credits: 9999` y el webhook se lo acreditaba tal cual.
// =============================================================================

export type CatalogItem =
    | { mode: 'payment'; credits: number; label: string }
    | { mode: 'subscription'; credits: 0; label: string };

export const STRIPE_CATALOG: Record<string, CatalogItem> = {
    'price_1T4HWkKtp6JiUcWzTNSg9D8h': { mode: 'payment', credits: 5, label: 'Starter: 5 VPOs $250 MXN' },
    'price_1T4HX1Ktp6JiUcWzb6Jm2Utk': { mode: 'payment', credits: 10, label: 'Pro: 10 VPOs $400 MXN' },
    // TODO: sustituir por el Price ID recurrente real y actualizar MONTHLY_UNLIMITED_PRICE_ID en PaywallModal.tsx
    'price_REPLACE_WITH_YOUR_MONTHLY_PRICE_ID': { mode: 'subscription', credits: 0, label: 'Suscripción mensual ilimitada' },
};

export const getCatalogItem = (priceId: unknown): CatalogItem | null => {
    if (typeof priceId !== 'string') return null;
    if (priceId.includes('REPLACE_WITH')) return null; // placeholder: nunca vendible
    return STRIPE_CATALOG[priceId] ?? null;
};

// Estados de suscripción de Stripe que conservan el acceso ilimitado.
// `past_due` se mantiene activo a propósito: Stripe reintenta el cobro durante
// su periodo de gracia y emite `customer.subscription.deleted` (o pasa a
// `unpaid`/`canceled`) cuando se agota; hasta entonces no se degrada al usuario.
export const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing', 'past_due']);
