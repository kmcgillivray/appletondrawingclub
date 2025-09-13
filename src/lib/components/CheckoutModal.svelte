<script lang="ts">
  import { loadStripe } from '@stripe/stripe-js';
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';
  
  export let isOpen = false;
  export let eventId: string;
  export let eventTitle: string;
  export let eventPrice: number;
  export let formData: {
    name: string;
    email: string;
    quantity: number;
    newsletter_signup: boolean;
    website?: string;
  };
  
  const dispatch = createEventDispatcher<{ close: void }>();
  
  const stripe = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  
  let modalElement: HTMLElement;
  let checkoutElement: HTMLElement;
  let checkoutLoading = true;
  let error = '';
  let checkout: any = null;
  let registrationId: string | null = null;
  
  // Focus management
  let previouslyFocusedElement: HTMLElement | null = null;
  
  onMount(() => {
    if (isOpen) {
      initializeCheckout();
      trapFocus();
    }
  });
  
  onDestroy(() => {
    cleanup();
  });
  
  $: if (browser && isOpen) {
    initializeCheckout();
    trapFocus();
    document.body.style.overflow = 'hidden';
  } else if (browser) {
    cleanup();
    document.body.style.overflow = '';
  }
  
  async function initializeCheckout() {
    if (!isOpen || checkout) return;
    
    checkoutLoading = true;
    error = '';
    
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      if (!supabaseUrl || !supabasePublishableKey) {
        throw new Error('Missing Supabase configuration');
      }
      
      // Create pending registration first
      if (!registrationId) {
        // TODO: Improve request and response typing
        const registrationResponse = await fetch(`${supabaseUrl}/functions/v1/register`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabasePublishableKey}`
          },
          body: JSON.stringify({
            event_id: eventId,
            name: formData.name,
            email: formData.email,
            quantity: formData.quantity,
            payment_method: 'online',
            newsletter_signup: formData.newsletter_signup,
            website: formData.website || ''
          })
        });
        
        const registrationResult = await registrationResponse.json();
        
        if (!registrationResponse.ok || !registrationResult.success) {
          throw new Error(registrationResult.error || 'Failed to create registration');
        }
        
        registrationId = registrationResult.registration.id;
      }
      
      const fetchClientSecret = async () => {
        // TODO: Improve fetch response typing
        const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabasePublishableKey}`
          },
          body: JSON.stringify({
            event_id: eventId,
            event_title: eventTitle,
            name: formData.name,
            email: formData.email,
            newsletter_signup: formData.newsletter_signup,
            price: eventPrice,
            quantity: formData.quantity,
            registration_id: registrationId,
            website: formData.website || '' // Anti-spam field
          })
        });
        
        const { clientSecret, error: fetchError } = await response.json();
        
        if (fetchError) {
          throw new Error(fetchError);
        }
        
        return clientSecret;
      };

      const stripeInstance = await stripe;
      if (!stripeInstance) {
        throw new Error('Stripe not loaded');
      }

      checkout = await stripeInstance.initEmbeddedCheckout({
        fetchClientSecret
      });

      // Mount checkout in the modal
      if (checkoutElement) {
        checkout.mount(checkoutElement);
      }
      
      checkoutLoading = false;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to initialize checkout';
      checkoutLoading = false;
      console.error('Checkout initialization error:', e);
    }
  }
  
  function cleanup() {
    if (checkout) {
      checkout.destroy();
      checkout = null;
    }
    
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
      previouslyFocusedElement = null;
    }
  }
  
  function trapFocus() {
    if (!browser || !isOpen) return;
    
    previouslyFocusedElement = document.activeElement as HTMLElement;
    
    // Focus the modal
    if (modalElement) {
      modalElement.focus();
    }
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }
  
  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }
  
  function handleBackdropKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      closeModal();
    }
  }
  
  function closeModal() {
    dispatch('close');
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <!-- Modal backdrop -->
  <div 
    class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    on:click={handleBackdropClick}
    on:keydown={handleBackdropKeydown}
    bind:this={modalElement}
    tabindex="-1"
    role="dialog"
    aria-modal="true"
    aria-labelledby="checkout-modal-title"
  >
    <!-- Modal content -->
    <div class="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Modal header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 id="checkout-modal-title" class="text-xl font-bold text-gray-900">
          Complete Your Registration
        </h2>
        <button 
          on:click={closeModal}
          class="cursor-pointer text-gray-200 hover:text-gray-300 transition-colors"
          aria-label="Close checkout"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Modal body -->
      <div class="p-6">
        {#if error}
          <div class="text-center py-12">
            <div class="text-red-600 mb-4">
              <svg class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Checkout Error</h3>
            <p class="text-gray-600 mb-6">{error}</p>
            <div class="space-x-3">
              <button 
                on:click={initializeCheckout}
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Try Again
              </button>
              <button 
                on:click={closeModal}
                class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        {:else}
          <!-- Checkout container -->
          <div bind:this={checkoutElement} class="min-h-[400px]"></div>
        {/if}
      </div>
      
      <!-- Modal footer -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div class="flex items-center justify-between text-sm text-gray-600">
          <div class="flex items-center space-x-2">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure payment powered by Stripe</span>
          </div>
          <button 
            on:click={closeModal}
            class="cursor-pointer text-gray-200 hover:text-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}