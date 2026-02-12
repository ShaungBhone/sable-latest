// this middleware is used to check for agents
// this is legacy code from the previous versions

import { menuItems } from 'data/menu'
import _ from 'lodash'
import { swalWarningHtml } from 'helpers/swalHelper'

const protectSpecificPath = ['/automate/journey']

export const removeLocalePath = (path, i18n) => {
  const locale = i18n.locale === i18n.defaultLocale ? '' : '/' + i18n.locale

  let routePath = path
  if (locale !== '') {
    routePath = routePath.replace(locale, '')
    if (routePath === '') {
      routePath = '/'
    }
  }

  const indexOfProtectPath = protectSpecificPath.findIndex(path => routePath.includes(path))
  if (indexOfProtectPath === -1) {
    return '/' + routePath.split('/')[1]
  } else {
    const splitPath = routePath.split('/')
    return '/' + splitPath[1] + '/' + splitPath[2]
  }
}

export const pathIgnoreAuthAndPermissions = (path) => {
  return path !== '/login' && path !== '/resetPassword' && path !== '/register'
}

export const allRoutePath = () => {
  const allMenu = []
  for (let i = 0; i < menuItems.length; i++) {
    const menu = menuItems[i]
    const menuData = {}
    if (menu.link) {
      menuData.id = menu.id
      menuData.link = menu.link
      if (menu.subItems) {
        menuData.hasChild = true
        menuData.subItems = menu.subItems
        allMenu.push(menuData)

        for (let j = 0; j < menu.subItems.length; j++) {
          const subMenu = menu.subItems[j]
          const subMenuData = {}
          if (subMenu.link) {
            subMenuData.id = subMenu.id
            subMenuData.link = subMenu.link
            allMenu.push(subMenuData)
          }
        }
      } else {
        allMenu.push(menuData)
      }
    }
  }
  return allMenu
}

export const permissionFunction = async ({ app, store, route, i18n, router, path, isRedirect = true, permissionDenied, contactAdmin }) => {
  let routePath = path
  const i18nData = app?.i18n || i18n
  const routerData = app?.router || router

  let permissionDeniedText = permissionDenied
  if (app?.i18n?.t) {
    permissionDeniedText = app.i18n.t('error.permission_denied')
  }
  let contactAdminText = contactAdmin
  if (app?.i18n?.t) {
    contactAdminText = app.i18n.t('error.contact_admin')
  }

  if (route) {
    routePath = removeLocalePath(route.path, i18nData)
  }
  if (!routePath) {
    return false
  }

  if (pathIgnoreAuthAndPermissions(routePath)) {
    const brandConfigData = (store?.state?.user?.brandConfig) || {}
    if (_.isEmpty(brandConfigData)) {
      if (typeof window !== 'undefined') {
        Object.assign(brandConfigData, JSON.parse(localStorage.getItem('brandConfig')))
      }
    }

    if (!_.isEmpty(brandConfigData)) {
      const allBrandPermission = brandConfigData?.permission_menu
      const allPath = allRoutePath()
      const foundMenuData = allPath.find(menu => menu.link === routePath)
      const permissionIndex = allBrandPermission.findIndex(permission => permission === foundMenuData.id || foundMenuData.id === 'MODULE_ALL')

      if (permissionIndex === -1) {
        const res = await swalWarningHtml(
          permissionDeniedText,
          `${contactAdminText} <a href="https://sbl.asia/t8ChcH" target="_blank" class="hover:underline">@sable_support</a>`,
          i18nData.t('journeyAutomation.detail.warning.swalWarning.close')
        )
        if (res.isConfirmed) {
          if (isRedirect) {
            const locale = i18nData.locale === i18nData.defaultLocale ? '' : '/' + i18nData.locale
            // window.open('https://sable.asia/pricing-plans/', '_blank')
            const isPermissionHome = allBrandPermission.includes('MODULE_HOME')
            if (isPermissionHome) {
              routerData.push(locale + '/')
            } else {
              routerData.push(locale + '/cookie-consent')
            }
          }
        }
        return false
      }
    } else {
      return false
    }
  }
  return true
}

export const goToURL = (url, isRedirect = true) => {
  if (isRedirect) {
    window.open(url, '_blank')
  } else {
    window.location.href = url
  }
}