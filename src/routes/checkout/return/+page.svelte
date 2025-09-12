<script lang="ts">
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getCheckoutSession, getStatusMessage, getNextSteps, formatPrice, isPaymentSuccessful, canRetryPayment } from '$lib/utils/checkout';
  import type { CheckoutSessionData } from '$lib/utils/checkout';
  import RegistrationMessages from '$lib/components/RegistrationMessages.svelte';
  
  let loading = true;
  let session: CheckoutSessionData | null = null;
  let error = '';
  let eventData: { title: string; price: string; eventId: string } | null = null;
  
  onMount(async () => {
    const sessionId = page.url.searchParams.get('session_id');
    
    if (!sessionId) {
      error = 'No session ID provided in URL';
      loading = false;
      return;
    }
    
    const result = await getCheckoutSession(sessionId);
    
    if (result.success && result.session) {
      session = result.session;
      
      // Extract event data from session metadata
      if (session.metadata) {
        eventData = {
          title: session.metadata.event_title || 'Unknown Event',
          price: formatPrice(session.amount_total),
          eventId: session.metadata.event_id || ''
        };
      }
    } else {
      error = result.error || 'Failed to retrieve checkout session';
    }
    
    loading = false;
  });
  
  function getStatusInfo() {
    if (!session) return null;
    return getStatusMessage(session.status);
  }
  
  function getSteps() {
    if (!session) return [];
    return getNextSteps(session.status);
  }
  
  function handleRetryPayment() {
    // Go back to the event page to start over
    if (eventData?.eventId) {
      goto(`/events/${eventData.eventId}`);
    } else {
      goto('/events');
    }
  }
  
  function handleBackToEvents() {
    goto('/events');
  }
  
  function getMessageType() {
    if (!session) return 'error';
    
    switch (session.status) {
      case 'complete':
        return 'success-online';
      case 'open':
        return 'cancelled';
      case 'expired':
      default:
        return 'error';
    }
  }
  
  function getErrorMessage() {
    if (!session) return error;
    
    const statusInfo = getStatusMessage(session.status);
    return statusInfo.message;
  }
</script>

<svelte:head>
  <title>Payment Status - Appleton Drawing Club</title>
  <meta name="description" content="Check your event registration payment status" />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-2xl">
  {#if loading}
    <!-- Loading state -->
    <div class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Checking your payment status...</p>
      </div>
    </div>
  {:else if error}
    <!-- Error state -->
    <RegistrationMessages 
      type="error"
      message={error}
    />
    
    <div class="mt-6 text-center">
      <button 
        on:click={handleBackToEvents}
        class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
      >
        Back to Events
      </button>
    </div>
  {:else if session}
    <!-- Success/status display -->
    {@const statusInfo = getStatusInfo()}
    {@const steps = getSteps()}
    
    <RegistrationMessages 
      type={getMessageType()}
      message={getErrorMessage()}
      eventPrice={eventData ? parseFloat(eventData.price.replace('$', '')) : 0}
      eventTitle={eventData?.title || 'Unknown Event'}
    />
    
    <!-- Next steps -->
    {#if steps.length > 0}
      <div class="bg-white border border-gray-200 rounded-lg p-6 mt-6 mb-6">
        <h3 class="text-2xl font-bold text-gray-900 mb-4">
          {isPaymentSuccessful(session.status) ? 'What\'s Next?' : 'Next Steps'}
        </h3>
        <ul class="space-y-2">
          {#each steps as step}
            <li class="flex items-start">
              <svg class="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <span class="text-gray-700">{step}</span>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
    
    <!-- Action buttons -->
    <div class="text-center space-y-4">
      {#if canRetryPayment(session.status)}
        <div class="space-x-3">
          <button 
            on:click={handleRetryPayment}
            class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Try Payment Again
          </button>
          <button 
            on:click={handleBackToEvents}
            class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-medium"
          >
            Back to Events
          </button>
        </div>
      {:else}
        <button 
          on:click={handleBackToEvents}
          class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
        >
          {isPaymentSuccessful(session.status) ? 'View More Events' : 'Back to Events'}
        </button>
      {/if}
      
      <!-- Contact info -->
      <div class="pt-4 border-t border-gray-200">
        <p class="text-gray-600">
          Questions? 
          <a href="/contact" class="text-green-600 hover:text-green-700 font-medium">
            Contact us here
          </a>
        </p>
        {#if session.id}
          <p class="text-xs text-gray-500 mt-1">
            Session ID: {session.id}
          </p>
        {/if}
      </div>
    </div>
  {/if}
</div>