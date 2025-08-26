import { Context } from '@netlify/functions'

export default (request: Request, context: Context) => {
  try {
    console.log('Function `eventbrite-order-newsletter` invoked');
    console.log(JSON.stringify(context, null, 2));
    console.log(JSON.stringify(request, null, 2));
    const url = new URL(request.url)
    const subject = url.searchParams.get('name') || 'World'

    return new Response(`Hello ${subject}`)
  } catch (error) {
    return new Response(error.toString(), {
      status: 500,
    })
  }
}
