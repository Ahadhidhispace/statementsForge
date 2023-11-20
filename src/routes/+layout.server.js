// @ts-nocheck
// import { getServerSession } from '@supabase/auth-helpers-sveltekit'
import { redirect } from '@sveltejs/kit' 

// export const load = async (event) => {

// 	return {
// 		session: await getServerSession(event)
// 	}
// }

// src/routes/+layout.server.ts
export const load = async ( { url: { pathname } , locals: { session, getSession, hasKey, accessKeyError } }) => {

			
	console.log('pirate session', await getSession())

	const mySession = await getSession()

	if (mySession === null || mySession === undefined) {

      if (!pathname.startsWith("/access")) {
        
          throw redirect(303, "/access")
        }
    } else {
      if (!pathname.startsWith("/")) {
        
          throw redirect(303, "/")
        }
    }

	return {
		session: await getSession(),
		accesskey: hasKey,
		accessKeyError
	}
}

// export async function load() {

	// if (event.url.pathname === '/') {
	// 	event.url.searchParams.set('nav_background_optimize', 'false');
	// }
	// if (event.url.pathname.startsWith('/news')) {
	// 	event.url.searchParams.set('nav_background_optimize', 'true');
	// }

	// let optimize = event.url.searchParams.get('nav_background_optimize');
// 	let optimize = false
// 	return {
// 		optimize
// 	};
// }
