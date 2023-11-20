// @ts-nocheck


import { AuthApiError } from '@supabase/supabase-js'
import { error, fail, redirect } from '@sveltejs/kit'

// /** @type {import('./$types').PageServerLoad} */
// export async function load(event) {
//     console.log(event)
// }


/** @type {import('./$types').Actions} */
export const actions = {

    // register action
    register: async ({ request, locals }) => {
        console.log('I am register form action')

        const formData = await request.formData()
        console.log(formData)

        const email = formData.get('email')
        const password = formData.get('password')
        const userAccessKey = formData.get('userAccessKey')

        //console.log(data)

        if (!userAccessKey) {
            return fail(400, { error: 'Access Key is missing.', trableshoot: 'Unfortunately we couldn\'t verify your identification' })
        } else {

            const { data: accesskeys, accessError: err } = await locals.supabase
                .from('accesskeys')
                .select("*")
                .eq('accesskey', userAccessKey)


            if (err) {
                // console.log(err)
                if (err instanceof AuthApiError && err.status === 400) {
                    return fail(400, {
                        error: 'Invalid access key', trableshoot: 'We are having trouble fetching data, please try again'
                    })
                }
                
                return fail(500, {
                    error: 'Server error. Please try again later.'
                    // accessError: 'Server error. Please try again later.'
                })
            }
    
            console.log(accesskeys.length <= 0)
            if (accesskeys.length <= 0) { 
                return fail(400, { error: 'Access Key Not Found', trableshoot: 'Sorry, we couldn\'t recognize your Access Key, please make sure you use the right key or make sure you\'re not offline and try again.' })
            } else {

                    // first check if given email is already suscribed
                    // then return  fail responce with "email not available"

                    const { data: pubuser, userError: err } = await locals.supabase
                        .from('pubusers')
                        .select("email")
                        .eq('email', email)

                        console.log(pubuser)

                        


                        if (err) {
                            // console.log(err)
                            if (err instanceof AuthApiError && err.status === 400) {
                                return fail(400, {
                                    error: 'That didn\'t work. 1', trableshoot: 'We are having trouble fetching data, please try again'
                                })
                            }
                            
                            return fail(500, {
                                error: 'Server error. Please try again later.'
                                // accessError: 'Server error. Please try again later.'
                            })
   
                        }
                
                        if (pubuser.length > 0) {
                            return fail(400, { error: 'Login instead?', trableshoot: 'It looks like this credential belongs to someone else.' })
                        } else {

                                    ////////////////////////////////////////
                                    // 53d16025-d3c8-402b-80f2-2feed075b91a
                                    
                                    // const { data: { users }, error } = await supabase.auth.admin.listUsers()
                            
                                    // const { data, error } = await supabase.auth.admin.deleteUser(
                                    //   '715ed5db-f090-4b8c-a067-640ecee36aa0'
                                    // )


                                    // const { data: user, error } = await supabase.auth.admin.updateUserById(
                                    //   '6aa5d0d4-2a9f-4483-b6c8-0cf4c6c98ac4',
                                    //   { user_metadata: { active: 'false' } } // not currently logged in // auth.users.app_metadata
                                    // )





                        

                                    const { data: newUser, userError: err } = await locals.supabase.auth.signUp({
                                        email: email,
                                        password: password,
                                        options: {
                                            emailRedirectTo: 'https://localhost:5173/access?user_has_accesskey=true&login_portal=true',
                                            data: {
                                                access_key: userAccessKey,
                                            },
                                        },
                                    })

                                    if (err) {
                                        if (err instanceof AuthApiError && err.status === 400) {
                                            return fail(400, {
                                                error: 'That didn\'t work. 2', trableshoot: 'We are having trouble fetching data, please try again'
                                            })
                                        }
                                        return fail(500, {
                                            error: 'Server error. Please try again later.'
                                        })
                                    } else {


                                        const { data: publicUser, pubUserError: err } = await locals.supabase
                                            .from('pubusers')
                                            .insert([
                                                {
                                                    email: email,
                                                    accesskey: userAccessKey
                                                },
                                            ])
                                    
                                        if (err) {
                                            if (err instanceof AuthApiError && err.status === 400) {
                                                return fail(400, {
                                                    error: 'That didn\'t work. 2', trableshoot: 'We are having trouble fetching data, please try again'
                                                })
                                            }
                                            return fail(500, {
                                                error: 'Server error. Please try again later.'
                                            })

                                        } else { 

                                            console.log(publicUser)
                                                // Delete access key

                                            const { data: accessDelete, accessDelError: err } = await locals.supabase
                                                .from('accesskeys')
                                                .delete()
                                                .eq('accesskey', userAccessKey)
                                                .select()
                                            
                                            
                                            
                                            if (err) {
                                                    // console.log(err)
                                                    if (err instanceof AuthApiError && err.status === 400) {
                                                        return fail(400, {
                                                            error: 'That didn\'t work. 3', trableshoot: 'We are having trouble fetching data, please try again'
                                                        })
                                                    }
                                                    
                                                    return fail(500, {
                                                        error: 'Server error. Please try again later.'
                                                        // accessError: 'Server error. Please try again later.'
                                                    })
                                            }
                                            
                                            
                                            if (!accessDelete) {
                                                return fail(400, { error: 'That didn\'t work. 4', trableshoot: 'We are having trouble fetching data, please try again' })
                                            } else { 

                                                // throw redirect(303, "/access?user_has_accesskey=true&login_portal=true")
                                                return { success: true, newUser } // check if 'accesskeys.legth === 0'
                                                        
                                                //console.log(accesskeys)
                                            }
                                        }


                                        
                                    }

                                    

                                }
                        }
                
                        


            }
    },

    // login action
    login: async ({ request, locals }) => {

        const formData = await request.formData()

        const email = formData.get('email')
        const password = formData.get('password')

        // const data = Object.fromEntries(await request.formData())
        
        // eslint-disable-next-line no-unused-vars
        const { data, error: err } = await locals.supabase.auth.signInWithPassword({
            email: email,
            password: password
        })

        // if(data){ console.log(data)}

        if (err) {
            // console.log(err)
            if (err instanceof AuthApiError && err.status === 400) {
                return fail(400, {
                    error: 'Invalid Credentials', trableshoot: 'The account you\'re trying to authenticate with is not foud. Make sure your email is verified as well.'
                })
            }
            throw error(500, { type: 'error',
                message: 'Server error. Please try again later.'
            })
        }

        throw redirect(303, "/")
    },

    // resend email verification action
    resendEmailVerification: async ({ request, locals }) => {

        const formData = await request.formData()

        const email = formData.get('email')
        
        // eslint-disable-next-line no-unused-vars
        
        const { data: resendEmailData, emailResend: err } = await locals.supabase.auth.resend({
            type: 'signup',
            email: email
        })




        if (err) {
            console.log(err)
            if (err instanceof AuthApiError && err.status === 500) {
                return fail(500, {
                    error: 'Sending verification failed', trableshoot: 'We are having trouble fetching data. make sure your email is correct and try again'
                })
            }
            throw error(500, {
                type: 'error',
                message: 'Server error. Please try again later.'
            })
        } 
            if (resendEmailData.length <= 0) {
                throw error(400, {error: 'Sending verification failed', trableshoot: 'We are having trouble fetching data. make sure your email is correct and try again'})
                
            } else {
                console.log(resendEmailData)
            }
        

 

    },
    
    logout: async ({ locals }) => {

        const { error: err } = await locals.supabase.auth.signOut()
    
        if (err) {
            if (err instanceof AuthApiError && err.status === 400) {
                return fail(400, {
                    error: 'Invalid Credentials'
                })
            }
            return fail(500, {
                message: 'Server error. Please try again later.'
            })
        }

        throw redirect(303, "/access?user_has_accesskey=true&login_portal=true")
        
    },
};