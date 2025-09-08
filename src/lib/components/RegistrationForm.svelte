<script lang="ts">
  import type { RegistrationFormData, RegistrationResponse } from '$lib/types';
  
  export let eventId: string;
  export let eventPrice: number;
  
  let form: RegistrationFormData = {
    name: '',
    email: '',
    newsletter_signup: false
  };
  
  let loading = false;
  let success = false;
  let error = '';

  async function handleSubmit() {
    loading = true;
    error = '';
    
    try {
      // Construct Supabase Edge Function URL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Missing Supabase configuration');
      }
      
      const supabasePublishableKey = import.meta.env.SUPABASE_PUBLISHABLE_KEY;
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
          newsletter_signup: form.newsletter_signup
        })
      });
      
      const result: RegistrationResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }
      
      success = true;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Registration failed';
    } finally {
      loading = false;
    }
  }
</script>

{#if success}
  <div class="bg-green-50 border border-green-200 rounded-lg p-6">
    <h3 class="text-lg font-bold text-green-800 mb-2">Registration Successful!</h3>
    <p class="text-green-700">
      You're registered for this event. You can pay ${eventPrice} at the door. 
      We'll send you a confirmation email shortly.
    </p>
  </div>
{:else}
  <form on:submit|preventDefault={handleSubmit} class="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
    <h3 class="text-xl font-bold text-green-900 mb-4">Register for This Event</h3>
    
    <div class="space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input 
          id="name"
          type="text" 
          bind:value={form.name}
          required
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>
      
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input 
          id="email"
          type="email" 
          bind:value={form.email}
          required
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>
      
      <div class="flex items-center">
        <input 
          type="checkbox" 
          bind:checked={form.newsletter_signup}
          id="newsletter"
          class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
        <label for="newsletter" class="ml-2 text-sm text-gray-700">
          Subscribe to our newsletter for event updates
        </label>
      </div>
    </div>
    
    <div class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <p class="text-sm text-blue-800">
        <strong>Payment:</strong> You'll pay ${eventPrice} at the door when you arrive.
      </p>
    </div>
    
    {#if error}
      <div class="mt-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
    {/if}
    
    <button 
      type="submit"
      disabled={loading}
      class="mt-6 w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors"
    >
      {loading ? 'Registering...' : 'Reserve My Spot (Pay at Door)'}
    </button>
  </form>
{/if}