<script lang="ts">
  import type { RegistrationFormData, RegistrationResponse } from '$lib/types';
  import CheckoutModal from './CheckoutModal.svelte';
  import RegistrationMessages from './RegistrationMessages.svelte';
  
  export let eventId: string;
  export let eventPrice: number;
  export let eventTitle: string;
  export let instance = 'default';

  const isFreeEvent = eventPrice === 0;
  
  let form: RegistrationFormData & { payment_method: string; donation_amount?: number } = {
    name: '',
    email: '',
    quantity: 1,
    newsletter_signup: false,
    payment_method: isFreeEvent ? 'door' : 'online', // 'door' or 'online'
    donation_amount: 0
  };

  // Donation selection state
  let donationSelection: 'none' | '10' | '20' | '50' | 'custom' = 'none';
  let customDonationAmount = 0;

  // Update donation amount when selection changes
  $: {
    if (donationSelection === 'none') {
      form.donation_amount = 0;
    } else if (donationSelection === 'custom') {
      form.donation_amount = customDonationAmount;
    } else {
      form.donation_amount = parseInt(donationSelection);
    }
  }

  // Check if this is the Halloween wildlife event that supports donations
  const isHalloweenWildlifeEvent = eventId === '2025-10-29-halloween-wildlife-drawing';

  // Reactive declaration to show donation field based on current form state
  $: showDonationField = isHalloweenWildlifeEvent && !isFreeEvent && form.payment_method === 'online';

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
        quantity: form.quantity,
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
    quantity={form.quantity}
    donationAmount={form.donation_amount || 0}
  />
{:else}
  <form on:submit|preventDefault={handleSubmit}>
    <h3 class="text-2xl font-bold text-green-900 mb-4">Reserve your spot</h3>
    
    <div class="space-y-4">
      <div>
        <label for="name-{instance}" class="block font-bold text-gray-700 mb-1">Name *</label>
        <input
          id="name-{instance}"
          type="text"
          bind:value={form.name}
          required
          disabled={loading}
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
        />
      </div>
      
      <div>
        <label for="email-{instance}" class="block font-bold text-gray-700 mb-1">Email *</label>
        <input
          id="email-{instance}"
          type="email"
          bind:value={form.email}
          required
          disabled={loading}
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
        />
      </div>
      
      <div>
        <label for="quantity-{instance}" class="block font-bold text-gray-700 mb-1">How many people? *</label>
        <select
          id="quantity-{instance}"
          bind:value={form.quantity}
          required
          disabled={loading}
          class="w-full"
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
          <option value={6}>6</option>
        </select>
      </div>
      
      {#if !isFreeEvent}
      <div>
        <fieldset>
          <legend class="block font-bold text-gray-700 mb-3">Payment method *</legend>
          <div class="space-y-3">
            <label for="payment-online-{instance}" class="font-normal flex items-center border border-gray-300 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                id="payment-online-{instance}"
                type="radio"
                bind:group={form.payment_method}
                value="online"
                disabled={loading}
                class="w-3"
              />
              <span class="pl-3">
                <strong>Pay online now</strong> - ${eventPrice * form.quantity} (secure payment with card)
              </span>
            </label>
            <label for="payment-door-{instance}" class="font-normal flex items-center border border-gray-300 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                id="payment-door-{instance}"
                type="radio"
                bind:group={form.payment_method}
                value="door"
                disabled={loading}
                class="w-3"
              />
              <span class="pl-3">
                <strong>Pay at door</strong> - ${eventPrice * form.quantity} (cash at event)
              </span>
            </label>
          </div>
        </fieldset>
      </div>
      {/if}

      {#if showDonationField}
      <div>
        <fieldset>
          <legend class="block font-bold text-gray-700 mb-1">Additional donation to REGI wildlife rescue (optional)</legend>
          <p class="text-sm text-gray-600 mb-3">All proceeds from this event will be donated to REGI! This is an optional additional donation if you would like to further support wildlife education and rescue efforts.</p>
          <div class="grid grid-cols-2 gap-3">
            <label for="donation-none-{instance}" class="font-normal flex items-center border border-gray-300 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                id="donation-none-{instance}"
                type="radio"
                bind:group={donationSelection}
                value="none"
                disabled={loading}
                class="w-3"
              />
              <span class="pl-3">None</span>
            </label>
            <label for="donation-10-{instance}" class="font-normal flex items-center border border-gray-300 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                id="donation-10-{instance}"
                type="radio"
                bind:group={donationSelection}
                value="10"
                disabled={loading}
                class="w-3"
              />
              <span class="pl-3">$10</span>
            </label>
            <label for="donation-20-{instance}" class="font-normal flex items-center border border-gray-300 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                id="donation-20-{instance}"
                type="radio"
                bind:group={donationSelection}
                value="20"
                disabled={loading}
                class="w-3"
              />
              <span class="pl-3">$20</span>
            </label>
            <label for="donation-50-{instance}" class="font-normal flex items-center border border-gray-300 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                id="donation-50-{instance}"
                type="radio"
                bind:group={donationSelection}
                value="50"
                disabled={loading}
                class="w-3"
              />
              <span class="pl-3">$50</span>
            </label>
            <label class="col-span-2 font-normal flex items-center border border-gray-300 p-3 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                bind:group={donationSelection}
                value="custom"
                disabled={loading}
                class="w-3"
              />
              <span class="pl-3 flex items-center">
                Other: $
                <input
                  id="custom-donation-{instance}"
                  type="number"
                  bind:value={customDonationAmount}
                  min="1"
                  step="1"
                  placeholder="25"
                  disabled={loading || donationSelection !== 'custom'}
                  on:focus={() => donationSelection = 'custom'}
                  class="ml-1 w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
                />
              </span>
            </label>
          </div>
        </fieldset>
      </div>
      {/if}

      <div class="flex items-center">
        <input
          type="checkbox"
          bind:checked={form.newsletter_signup}
          id="newsletter-{instance}"
          disabled={loading}
          class="h-4 w-4"
        />
        <label for="newsletter-{instance}" class="pl-3 text-gray-700 font-normal">
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
      class="mt-6 w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors"
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
        {#if isFreeEvent}
          Reserve spot - <span class="italic">free</span>
        {:else}
          {form.payment_method === 'online' ? 'Pay online & register' : 'Reserve spot (pay at door)'}
        {/if}
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
    quantity: form.quantity,
    newsletter_signup: form.newsletter_signup,
    website: website,
    donation_amount: form.donation_amount || 0
  }}
  on:close={handleModalClose}
/>