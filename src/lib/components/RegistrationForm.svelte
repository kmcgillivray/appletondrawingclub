<script lang="ts">
  import type { RegistrationFormData, RegistrationResponse } from '$lib/types';
  import CheckoutModal from './CheckoutModal.svelte';
  import RegistrationMessages from './RegistrationMessages.svelte';
  
  export let eventId: string;
  export let eventPrice: number;
  export let eventTitle: string;
  
  let form: RegistrationFormData & { payment_method: string } = {
    name: '',
    email: '',
    newsletter_signup: false,
    payment_method: 'online' // 'door' or 'online'
  };

  // Should remain empty for legitimate users
  let website = '';
  
  let loading = false;
  let success = false;
  let error = '';
  let showCheckoutModal = false;

  async function handleSubmit() {
    loading = true;
    error = '';
    
    try {
      if (form.payment_method === 'online') {
        await handleOnlinePayment();
      } else {
        await handleDoorPayment();
      }
    } catch (e) {
      // Provide user-friendly error messages
      if (e instanceof Error) {
        error = e.message;
      } else if (typeof e === 'string') {
        error = e;
      } else {
        error = 'Registration failed due to an unexpected error. Please try again or contact us for assistance.';
      }
      loading = false;
    }
  }
  
  async function handleOnlinePayment() {
    // Open the checkout modal (HTML5 validation handles required fields)
    showCheckoutModal = true;
    loading = false;
  }
  
  async function handleDoorPayment() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('Registration system is temporarily unavailable. Please try again in a few minutes.');
    }
    
    const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!supabasePublishableKey) {
      throw new Error('Registration system is temporarily unavailable. Please try again in a few minutes.');
    } 

    const response = await fetch(`${supabaseUrl}/functions/v1/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabasePublishableKey}`
      },
      body: JSON.stringify({
        event_id: eventId,
        name: form.name,
        email: form.email,
        payment_method: 'door',
        newsletter_signup: form.newsletter_signup,
        website: website // Anti-spam field
      })
    });
    
    const result: RegistrationResponse = await response.json();
    
    if (!response.ok) {
      // TODO: Implement typed error codes rather than relying on error message strings
      // Provide specific error messages based on common scenarios
      if (result.error?.includes('already registered')) {
        throw new Error('You have already registered for this event. Check your email for confirmation details.');
      } else if (result.error?.includes('Invalid email')) {
        throw new Error('Please enter a valid email address (example: yourname@email.com).');
      } else if (response.status >= 500) {
        throw new Error('Registration system is temporarily unavailable. Please try again in a few minutes.');
      } else {
        throw new Error(result.error || 'Registration failed. Please try again or contact us for assistance.');
      }
    }
    
    success = true;
    loading = false;
  }
  
  function handleModalClose() {
    showCheckoutModal = false;
  }
</script>

{#if success}
  <RegistrationMessages 
    type={form.payment_method === 'door' ? 'success-door' : 'success-online'}
    {eventPrice}
    {eventTitle}
  />
{:else}
  <form on:submit|preventDefault={handleSubmit} class="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
    <h3 class="text-2xl font-bold text-green-900 mb-4">Reserve your spot</h3>
    
    <div class="space-y-4">
      <div>
        <label for="name" class="block font-bold text-gray-700 mb-1">Name *</label>
        <input 
          id="name"
          type="text" 
          bind:value={form.name}
          required
          disabled={loading}
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
        />
      </div>
      
      <div>
        <label for="email" class="block font-bold text-gray-700 mb-1">Email *</label>
        <input 
          id="email"
          type="email" 
          bind:value={form.email}
          required
          disabled={loading}
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
        />
      </div>
      
      <div>
        <!-- TODO: Fix label -->
        <label class="block font-bold text-gray-700 mb-3">Payment method *</label>
        <div class="space-y-2">
          <label for="payment-online" class="font-normal flex items-center border border-gray-300 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
            <input 
              id="payment-online"
              type="radio" 
              bind:group={form.payment_method}
              value="online"
              disabled={loading}
              class="w-3"
            />
            <span class="pl-3">
              <strong>Pay online now</strong> - ${eventPrice} (secure payment with card)
            </span>
          </label>
          <label for="payment-door" class="font-normal flex items-center border border-gray-300 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
            <input 
              id="payment-door"
              type="radio" 
              bind:group={form.payment_method}
              value="door"
              disabled={loading}
              class="w-3"
            />
            <span class="pl-3">
              <strong>Pay at door</strong> - ${eventPrice} (cash at event)
            </span>
          </label>
        </div>
      </div>
      
      <div class="flex items-center">
        <input 
          type="checkbox" 
          bind:checked={form.newsletter_signup}
          id="newsletter"
          disabled={loading}
          class="h-4 w-4"
        />
        <label for="newsletter" class="pl-3 text-gray-700 font-normal text-md">
          Subscribe to the Appleton Drawing Club newsletter for event updates and drawing news.
        </label>
      </div>
      
      <input 
        type="text" 
        name="website"
        bind:value={website}
        style="position: absolute; left: -9999px; top: -9999px;"
        tabindex="-1" 
        autocomplete="off"
        aria-hidden="true"
      />
    </div>
    
    
    {#if error}
      <div class="mt-4">
        <RegistrationMessages 
          type="error"
          message={error}
        />
      </div>
    {/if}
    
    <button 
      type="submit"
      disabled={loading}
      class="mt-6 w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors"
    >
      {#if loading}
        <span class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      {:else}
        {form.payment_method === 'online' ? 'Pay Online & Register' : 'Reserve Spot (Pay at Door)'}
      {/if}
    </button>
  </form>
{/if}

<!-- Checkout Modal -->
<CheckoutModal 
  bind:isOpen={showCheckoutModal}
  {eventId}
  {eventTitle}
  {eventPrice}
  formData={{
    name: form.name,
    email: form.email,
    newsletter_signup: form.newsletter_signup,
    website: website
  }}
  on:close={handleModalClose}
/>