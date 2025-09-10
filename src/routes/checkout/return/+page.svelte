<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getCheckoutSession, getStatusMessage, getNextSteps, formatPrice, isPaymentSuccessful, canRetryPayment } from '$lib/utils/checkout';
  import type { CheckoutSessionData } from '$lib/utils/checkout';
  
  let loading = true;
  let session: CheckoutSessionData | null = null;
  let error = '';
  let eventData: { title: string; price: string; eventId: string } | null = null;
  
  onMount(async () => {
    const sessionId = $page.url.searchParams.get('session_id');
    
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
    <div class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error Retrieving Payment Status</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>{error}</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="text-center">
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
    
    {#if statusInfo}
      <div class="bg-{statusInfo.type === 'success' ? 'green' : statusInfo.type === 'warning' ? 'yellow' : 'red'}-50 border border-{statusInfo.type === 'success' ? 'green' : statusInfo.type === 'warning' ? 'yellow' : 'red'}-200 rounded-lg p-6 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            {#if statusInfo.type === 'success'}
              <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            {:else if statusInfo.type === 'warning'}
              <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            {:else}
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            {/if}
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-{statusInfo.type === 'success' ? 'green' : statusInfo.type === 'warning' ? 'yellow' : 'red'}-800">
              {statusInfo.title}
            </h3>
            <div class="mt-2 text-sm text-{statusInfo.type === 'success' ? 'green' : statusInfo.type === 'warning' ? 'yellow' : 'red'}-700">
              <p>{statusInfo.message}</p>
              
              {#if eventData}
                <div class="mt-3 space-y-1">
                  <p><strong>Event:</strong> {eventData.title}</p>
                  <p><strong>Amount:</strong> {eventData.price}</p>
                  {#if session.customer_email}
                    <p><strong>Email:</strong> {session.customer_email}</p>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/if}
    
    <!-- Next steps -->
    {#if steps.length > 0}
      <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
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
        <p class="text-sm text-gray-600">
          Questions? Contact us at 
          <a href="mailto:hello@appletondrawingclub.com" class="text-green-600 hover:text-green-700 font-medium">
            hello@appletondrawingclub.com
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