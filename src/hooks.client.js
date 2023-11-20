// @ts-nocheck

export const handle = async ({ event, resolve }) => {

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


  //   if (event.locals.session) {

  //       if (event.url.pathname.startsWith("/access") ) {
  //           return new Response(null, {
  //               status: 303,
  //               headers: { location: '/'}
  //           })
  //       }
	// }
  
  // if (event.url.pathname.startsWith('/access')) { 

  //   event.url.searchParams.set('user_has_accesskey', 'true');
  //   event.locals.hasKey = event.url.searchParams.get('user_has_accesskey')
  // }

  return resolve(event);
};