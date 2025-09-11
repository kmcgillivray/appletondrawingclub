<script lang="ts">
  import type { RegistrationFormData, RegistrationResponse } from '$lib/types';
  import CheckoutModal from './CheckoutModal.svelte';
  
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
      error = e instanceof Error ? e.message : 'Registration failed';
      loading = false;
    }
  }
  
  async function handleOnlinePayment() {
    // Validate form before opening modal
    if (!form.name.trim() || !form.email.trim()) {
      throw new Error('Please fill in all required fields');
    }
    
    // Open the checkout modal
    showCheckoutModal = true;
    loading = false;
  }
  
  async function handleDoorPayment() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('Missing Supabase configuration');
    }
    
    const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!supabasePublishableKey) {
      throw new Error('Missing Supabase configuration');
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
      throw new Error(result.error || 'Registration failed');
    }
    
    success = true;
    loading = false;
  }
  
  function handleModalClose() {
    showCheckoutModal = false;
  }
</script>

{#if success}
  <div class="bg-green-50 border border-green-200 rounded-lg p-6">
    <h3 class="text-lg font-bold text-green-800 mb-2">Registration Successful!</h3>
    <p class="text-green-700">
      You're registered for this event. 
      {#if form.payment_method === 'door'}
        You can pay ${eventPrice} at the door. We'll send you a confirmation email shortly.
      {:else}
        Payment confirmation and event details will be sent to your email.
      {/if}
    </p>
  </div>
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
      <div class="mt-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
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