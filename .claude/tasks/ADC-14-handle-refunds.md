I need generally support the cancellation / refund of a registration. This includes processing refunds in Stripe and keeping the registration in sync with the webhook if necessary.

I'm not sure about the details:

- Should free event registrations be able to be cancelled automatically by the customer?
- Should we track refund requests for paid events, or should we just allow it to happen automatically, or have it be configurable per event?
