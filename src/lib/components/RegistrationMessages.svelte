<script lang="ts">
  export let type: 'success-door' | 'success-online' | 'error' | 'cancelled' = 'success-door';
  export let message = '';
  export let eventPrice = 0;
  export let eventTitle = '';
  export let quantity = 1;
  export let donationAmount = 0;

  const isFreeEvent = eventPrice === 0;
  const hasDonation = donationAmount > 0;
</script>

{#if type === 'success-door'}
  <div class="bg-green-50 border border-green-200 rounded-lg p-6">
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-xl font-bold text-green-800 mb-2">Registration successful!</h3>
        <div class="text-green-700 space-y-2">
          <p>You're registered for <strong>{eventTitle}</strong> - {quantity} {quantity === 1 ? 'person' : 'people'}.</p>
          {#if !isFreeEvent}
            <p><strong>Payment:</strong> Please bring ${eventPrice * quantity} to pay at the door.</p>
          {/if}
          <p><strong>Confirmation:</strong> We'll send you a confirmation email with event details and reminders.</p>
          <p>✍️ <strong>What to bring:</strong> Just yourself and your favorite art supplies!</p>
          <p>❓ <strong>Questions?</strong> Visit our <a href="/contact" class="text-green-600 hover:text-green-700 font-medium underline">contact page</a> to get in touch.</p>
        </div>
      </div>
    </div>
  </div>
{:else if type === 'success-online'}
  <div class="bg-green-50 border border-green-200 rounded-lg p-6">
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-2xl font-bold text-green-800 mb-2">You're all set!</h3>
        <div class="text-green-700 space-y-2">
          <p>You're registered for <strong>{eventTitle}</strong> - {quantity} {quantity === 1 ? 'person' : 'people'} - and your payment of ${eventPrice * quantity}{hasDonation ? ` + $${donationAmount} donation` : ''} has been processed.</p>
          {#if hasDonation}
            <p>🦉 <strong>Thank you!</strong> Your registration and additional ${donationAmount} donation to REGI will help support raptor education and wildlife rescue efforts.</p>
          {/if}
          <p>📧 <strong>Confirmation:</strong> Check your email for your receipt and event details.</p>
          <p>🎨 <strong>What to bring:</strong> Just yourself and your favorite art supplies!</p>
          <p>📍 <strong>Location & timing:</strong> Check your confirmation email for address and arrival details.</p>
          <p>❓ <strong>Questions?</strong> Visit our <a href="/contact" class="text-green-600 hover:text-green-700 font-medium underline">contact page</a> to get in touch.</p>
        </div>
      </div>
    </div>
  </div>
{:else if type === 'cancelled'}
  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-xl font-bold text-yellow-800 mb-2">Payment Cancelled</h3>
        <div class="text-yellow-700 space-y-2">
          <p>Your payment was cancelled and no charge was made to your card.</p>
          <p>💡 <strong>Still want to join?</strong> You can try paying online again or choose "Pay at Door" to reserve your spot.</p>
          <p>❓ <strong>Having trouble?</strong> Visit our <a href="/contact" class="text-yellow-600 hover:text-yellow-700 font-medium underline">contact page</a> and we'll help you register.</p>
        </div>
      </div>
    </div>
  </div>
{:else if type === 'error'}
  <div class="bg-red-50 border border-red-200 rounded-lg p-6">
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-xl font-bold text-red-800 mb-2">Registration Failed</h3>
        <div class="text-red-700 space-y-2">
          <p>{message}</p>
          <div>
            <p class="font-medium">💡 <strong>Try these solutions:</strong></p>
            <ul class="list-disc list-inside mt-1 space-y-1 ml-4">
              <li>Check your internet connection and try again</li>
              <li>Make sure all required fields are filled out correctly</li>
              <li>Try refreshing the page and registering again</li>
              <li>Try a different payment method or choose "Pay at Door"</li>
            </ul>
          </div>
          <p>❓ <strong>Still having trouble?</strong> Visit our <a href="/contact" class="text-red-600 hover:text-red-700 font-medium underline">contact page</a> for assistance.</p>
        </div>
      </div>
    </div>
  </div>
{/if}