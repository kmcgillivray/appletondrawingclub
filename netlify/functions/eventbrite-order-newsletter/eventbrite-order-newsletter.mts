import { Context } from '@netlify/functions'

export default async (request: Request, context: Context) => {
  try {
    console.log('Function `eventbrite-order-newsletter` invoked');
    console.log(JSON.stringify(context, null, 2));
    const requestBody = await request.text();
    console.log(JSON.parse(requestBody || '{}')); 
    const url = new URL(request.url)
    const subject = url.searchParams.get('name') || 'World'

    return new Response(`Hello ${subject}`)
  } catch (error) {
    return new Response(error.toString(), {
      status: 500,
    })
  }
}
