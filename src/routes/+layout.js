/* eslint-disable no-unused-vars */
// @ts-nocheck
// src/routes/+layout.ts
// export const prerender = true
export const ssr = false

import { redirect } from '@sveltejs/kit'
import { invalidate } from '$app/navigation'
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit'

export const load = async ({ url, fetch, data, depends }) => {
  
  // if (!data.session) {

	// 	if (!url.pathname.startsWith("/access") || !url.pathname.startsWith("/access?user_access_key=true")) {
			
	// 		throw redirect(303, "/access")
	// 	}
  // }


  // if (data.session) {

	// 	if (url.pathname.startsWith("/access")) {
			
	// 		throw redirect(303, "/")
	// 	}
	// }

  depends('supabase:auth')

  const supabase = createSupabaseLoadClient({
    supabaseUrl: PUBLIC_SUPABASE_URL,
    supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
    event: { fetch },
    serverSession: data?.session,
  })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const accesskey = await data?.accesskey
  
  let accessKeyError = await data?.accessKeyError

  return { supabase, session, accesskey, accessKeyError }
}