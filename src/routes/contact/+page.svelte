<script>
</script>

<svelte:head>
  <title>Contact - Appleton Drawing Club</title>
  <meta name="description" content="Contact Appleton Drawing Club with questions, comments, or inquiries about modeling or private events." />
</svelte:head>

<section class="container">
  <h1 class="font-caveat text-5xl text-center mb-4">Contact Us</h1>

  <p>Have a question or comment? Send us a message!</p>

  <p>If you're interested in being an art model, <a href="/modeling">let us know here</a>.</p>
  <p>If you're interested in booking a private event, please fill out the form on the <a href="/private-events">private events</a> page.</p>

  <form name="contact" method="POST" data-netlify="true" action="/contact-success">
    <input type="hidden" name="form-name" value="contact" />
    <p>
      <label>Name <input type="text" name="name" required /></label>
    </p>
    <p>
      <label>Email <input type="email" name="email" required /></label>
    </p>
    <p>
      <label>Message <textarea name="message" required></textarea></label>
    </p>
    <p>
      <button type="submit">Send message</button>
    </p>
  </form>
</section>