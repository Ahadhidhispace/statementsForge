// @ts-nocheck

import { redirect } from '@sveltejs/kit' 

import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';

export const handle = async ({ event, resolve }) => {

  // if (event.locals.supabase === null) {

	// 	if (!event.url.pathname.startsWith("/access")) {
			
	// 		throw redirect(303, "/access")
	// 	}
  // }



  // if (event.locals.supabase) {

	// 	if (event.url.pathname.startsWith("/access")) {
			
	// 		throw redirect(303, "/")
  //   } else {
  //     throw redirect(303, '/access')
  //   }
	// }

  event.locals.supabase = createSupabaseServerClient({
    supabaseUrl: PUBLIC_SUPABASE_URL,
    supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
    event
  });

  event.locals.getSession = async () => {
    const {
      data: { session }
    } = await event.locals.supabase.auth.getSession();
    return session;
  };

  console.log('Checking session here:')
  console.log(await event.locals.getSession())
  
  const mySession = await event.locals.getSession()
  console.log('Checking my session here:')
  console.log(mySession)

  // disable auth
  	if (mySession === null || mySession === undefined) {

      if (!event.url.pathname.startsWith("/access")) {
        
          throw redirect(303, "/access")
        }
    } else {
      if (!event.url.pathname.startsWith("/")) {
        
          throw redirect(303, "/")
        }
    }


  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range';
    }
  });



	// if (!event.locals.session) {

	// 	if (!event.url.pathname.startsWith("/access") && !event.url.pathname.startsWith("/access?user_access_key=true")) {
	// 		if (event.request.formData.userAccessKey === "") {
  //       event.locals.accessKeyError = 'Access key is missing'
  //     }
  //     return new Response(null, {
  //       status: 303,
  //       statusText: 'Un-Authorized Access',
  //       headers: { location: '/access'}
  //     })
	// 	}
  // }
  

	// if (event.locals.session) {

	// 	if (event.url.pathname.startsWith("/access") ) {
  //     return new Response(null, {
  //       status: 303,
  //       headers: { location: '/'}
  //     })
	// 	}
	// }
  
  // if (event.url.pathname.startsWith('/access')) { 

  //   event.url.searchParams.set('user_has_accesskey', 'true');
  //   event.locals.hasKey = event.url.searchParams.get('user_has_accesskey')
  // }
  

};

// import '$lib/supabase'
// import { getSupabase } from '@supabase/auth-helpers-sveltekit'

// export const handle = async ({ event, resolve }) => {
// 	const { session, supabaseClient } = await getSupabase(event)

// 	event.locals.sb = supabaseClient
// 	event.locals.session = session

// 	return resolve(event)
// }


// export async function handle({ event, resolve }) {
// 	if (event.url.pathname.startsWith('/job/application')) {
// 		console.log('This is the right page');
// 		event.url.searchParams.set('nav_background_optimize', 'true');
// 	}
// 	return await resolve(event);

// }
