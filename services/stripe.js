/**
 * Servicio de Stripe - Frontend
 * Maneja Checkout y suscripciones
 */

// Cargar Stripe
let stripe = null;

/**
 * Inicializa Stripe
 */
export function initStripe() {
  if (!stripe) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
      'pk_test_51SVcFZFApc6nOGEvWGRDRJAIrDNCfbpyTCmDyEX7eVRE5YvwJdYOZUDIBi5sy7bPPRnSOCLl1HTV3loZyOEKtkED00Tfnaqegl';

    stripe = Stripe(publishableKey);
    console.log('✅ Stripe inicializado');
  }
  return stripe;
}

/**
 * Redirige a Stripe Checkout para suscripción
 */
export async function redirectToCheckout(chapa) {
  try {
    const stripeInstance = initStripe();

    // URL del backend (Vercel)
    const BACKEND_URL = 'https://portalestiba-push-backend.vercel.app';

    console.log('🔄 Creando sesión de checkout para chapa:', chapa);

    // Crear sesión de checkout en backend
    const response = await fetch(`${BACKEND_URL}/api/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chapa: chapa,
        priceId: 'price_1SVccrFApc6nOGEvgrJJ1xBR'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend error: ${response.status} - ${errorText}`);
    }

    const session = await response.json();

    if (session.error) {
      throw new Error(session.error);
    }

    console.log('✅ Sesión creada:', session.sessionId);

    // Redirigir a Stripe Checkout
    const result = await stripeInstance.redirectToCheckout({
      sessionId: session.sessionId,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

  } catch (error) {
    console.error('❌ Error COMPLETO en checkout:', error);
    console.error('Stack trace:', error.stack);
    console.error('Error message:', error.message);
    alert(`Error al procesar el pago: ${error.message}\n\nRevisa la consola (F12) para más detalles.`);
  }
}

/**
 * Redirige al portal de gestión de suscripción
 */
export async function redirectToCustomerPortal(chapa) {
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chapa }),
    });

    const session = await response.json();

    if (session.error) {
      throw new Error(session.error);
    }

    // Redirigir al portal de cliente
    window.location.href = session.url;

  } catch (error) {
    console.error('❌ Error abriendo portal:', error);
    alert('Error al abrir el portal de gestión.');
  }
}
