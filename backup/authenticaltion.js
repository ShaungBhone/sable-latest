// this middleware is used to check for agents
// this is legacy code from the previous versions

import { pathIgnoreAuthAndPermissions, removeLocalePath } from 'helpers/routerHelper'

export default async function ({ app, store, route, redirect }) {
  if (process?.client) {
    console.log('🚀 ~ client:')
  }
  if (process?.server) {
    console.log('🚀 ~ server:')
  }
  const routePath = removeLocalePath(route.path, app.i18n)
  console.log('🚀 ~ Path:', routePath)
  if (pathIgnoreAuthAndPermissions(routePath)) {
    console.log(`==== ERROR CODE ${store.state.user.isLogin ? 1 : 0} : x091328401849212 ====`)
    console.log(`==== ERROR CODE ${store.state.user.userData ? 1 : 0}: x091328401849213 ====`)
    if (!store.state.user.isLogin || !store.state.user.userData) {
      const token = await app.$cookiz.get('sable.accessToken')

      if (token) {
        console.log('==== ERROR CODE 1: x091328401849210 ====')
        try {
          await store.dispatch('user/getUserData')
        } catch (err) {
          console.log('🚀 ~ file: authentication.js:13 ~ err:', err)
        }
      } else if (!(route.path === '/login' || route.path === '/resetPassword' ||
      route.path === '/register' || route.path === '/register/verifyEmail' ||
      route.path === '/register/account' || route.path === `/invite/${route.params.id}`
      )) {
        console.log('==== ERROR CODE 1: x091328401849209 ====')
        return redirect('/login')
      }
    }
  } else if (store.state.user.isLogin || (store.state.user.userData)) {
    console.log('==== ERROR CODE 1: x091328401849214 ====')
    return redirect('/')
  }
}