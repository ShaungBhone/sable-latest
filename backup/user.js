import _ from 'lodash'
import { swalWarning } from '../helpers/swalHelper'

const userState = {
  isLogin: false,
  userData: null,
  selectedBrand: null,
  brandConfig: null,
  token: {
    accessToke: null,
    refreshToken: null,
    expired: null
  },
  sideBarOpen: false,
  isShowTrackingCampaign: false,
  companyId: null
}

const user = {
  namespaced: true,
  state: () => (_.cloneDeep(userState)),
  actions: {
    async logIn ({ commit, dispatch }, payload) {
      try {
        const response = await this.$fire.auth.signInWithEmailAndPassword(
          payload.username,
          payload.password
        )
        this.$cookiz.set('sable.accessToken', response.user._delegate.accessToken, {
          path: '/',
          maxAge: 60 * 60 * 24 * 30
        })
        this.$cookiz.set('sable.refreshToken', response.user._delegate.stsTokenManager.refreshToken, {
          path: '/',
          maxAge: 60 * 60 * 24 * 90
        })
        this.$cookiz.set('sable.expired_time', this.$dayjs().add(1, 'hour').toISOString(), {
          path: '/',
          maxAge: 60 * 60 * 24 * 90
        })
        const responseFromGetUser = await dispatch('getUserData')
        if (responseFromGetUser.isError) {
          return { isError: true, response: responseFromGetUser.response }
        }
        return { isError: false, response: responseFromGetUser.response }
      } catch (e) {
        return { isError: true, response: { data: { code: 400, message: e.message } } }
      }
    },
    async resetPassword ({ commit }, payload) {
      try {
        await this.$fire.auth.sendPasswordResetEmail(payload.email)
        return true
      } catch (e) {
        return false
      }
    },
    async getUserData ({ commit, dispatch }) {
      try {
        const response = await this.$axios.$post('/login/user')
        if (!response.code) {
          commit('SET_USER_DATA', response)
        }
        commit('SET_COMPANY_ID', response.company_id)

        // const SABLE_COMPANY_ID = process.env.SABLE_COMPANY_ID || ''
        // if (SABLE_COMPANY_ID === response.company_id) {
        //   let flag = false
        //   const allCookie = this.$cookiz.getAll()
        //   const domain = process.env.HBASE_URL.replace('https://', '').replace('http://', '').replace('/', '')

        //   // for (const ls of Object.keys(localStorage)) {
        //   //   if (ls.startsWith('_hj') || ls.startsWith('hj')) {
        //   //     flag = true
        //   //     localStorage.removeItem(ls)
        //   //   }
        //   // }
        //   for (const cookie of Object.keys(allCookie)) {
        //     if (cookie.startsWith('_hj') || cookie.startsWith('hj')) {
        //       flag = true
        //       this.$cookiz.remove(cookie, {
        //         path: '/',
        //         domain
        //       })
        //     }
        //   }

        //   if (flag) {
        //     window.location.reload(true)
        //   }
        // }
        return { isError: false, response }
      } catch (err) {
        const { response, message } = err
        // console.log(err)
        // console.log(message)
        // console.log(response)
        if (message === 'Network Error') {
          swalWarning('เซเบิลกำลังอัปเดตเวอร์ชัน\nกรุณารอสักครู่')
          console.log('==== ERROR CODE 1: x09108123012136 ====')
          this.$router.push(this.localePath({ path: '/login' }))
        } else if (response.status === 401) {
          const { message } = response.data
          console.log('==== ERROR CODE 1: x09108123012137 ====')
          swalWarning(message)
          if (message === 'No brand') {
            console.log('==== ERROR CODE 1: x09108123012138 ====')

            const accessToken = this.$cookiz.get('sable.accessToken')
            const refreshToken = this.$cookiz.get('sable.refreshToken')
            const expired = this.$cookiz.get('sable.expired_time')

            dispatch('logOut')

            this.$cookiz.set('sable.accessToken_register', accessToken, {
              path: '/',
              maxAge: 60 * 30
            })
            this.$cookiz.set('sable.refreshToken_register', refreshToken, {
              path: '/',
              maxAge: 60 * 30
            })
            this.$cookiz.set('sable.expired_time_register', expired, {
              path: '/',
              maxAge: 60 * 30
            })
          }
        }

        return { isError: true, response }
      }
    },
    async getBrandConfig ({ commit, dispatch }, brandId) {
      try {
        const response = await this.$axios.$get('/brand-config/' + brandId)
        if (response) {
          commit('SET_BRAND_CONFIG', response)
          localStorage.setItem('brandConfig', JSON.stringify(response))
          dispatch('processTrackingCampaign')
        }
        return { isError: false }
      } catch (err) {
        console.log(err)
        return { isError: true }
      }
    },
    async processTrackingCampaign ({ state, commit, dispatch, rootState }, payload) {
      const brandConfigData = state.brandConfig
      if (_.isEmpty(brandConfigData)) {
        commit('SET_IS_SHOW_TRACKING_CAMPAIGN', false)
      } else {
        const allPackagesInBrand = brandConfigData?.all_packages_in_brand?.map(item => item.package_id)
        let packageId = '65a105f3861fa09db1c7d75e'
        if (process.env.NODE_ENV_FROM_ENV === 'production' || process.env.NODE_ENV_FROM_ENV === 'prod') {
          packageId = '65a4dc460bde5c602e8b2da5'
        }
        let extendPackageId = '65a4d12a96e0e5f4b68e57ad' // for dev
        if (process.env.NODE_ENV_FROM_ENV === 'production' || process.env.NODE_ENV_FROM_ENV === 'prod') {
          extendPackageId = '65a4dbc60bde5c602e8b2d5f'
        }
        if (allPackagesInBrand?.includes(packageId)) {
          await dispatch('billPayment/getPaymentHistory', null, { root: true })
          const { billPayment } = rootState
          const paymentHistory = billPayment?.paymentHistory
          const isShowTrackingCampaign = paymentHistory?.length === 1

          commit('SET_IS_SHOW_TRACKING_CAMPAIGN', isShowTrackingCampaign)
        } else if (allPackagesInBrand?.includes(extendPackageId)) {
          commit('SET_IS_SHOW_TRACKING_CAMPAIGN', true)
        }
      }
    },
    async setIsShowTrackingCampaign ({ commit }, status) {
      await commit('SET_IS_SHOW_TRACKING_CAMPAIGN', status)
    },
    async setSidebarStatus ({ commit }, status) {
      await commit('SET_SIDEBAR_STATUS', status)
    },
    async logOut ({ commit }) {
      // this.$cookiz.remove('sable.accessToken', {
      //   path: '/'
      // })
      // this.$cookiz.remove('sable.refreshToken', {
      //   path: '/'
      // })

      const locale = this.$i18n.locale

      this.$cookiz.removeAll()
      this.$cookiz.set('i18n_redirected', locale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365
      })
      localStorage.clear()
      commit('SET_USER_DATA', null)
      commit('SET_SELECTED_BRAND_ID', null)
      commit('SET_BRAND_CONFIG', null)
      await this.$fire.auth.signOut()
    },
    resetState ({ commit }) {
      commit('SET_DEFAULT_STATE')
    }
  },
  mutations: {
    SET_TOKEN (state, payload) {
      state.token = payload
    },
    SET_USER_DATA (state, payload) {
      state.isLogin = payload !== null
      state.userData = payload
    },
    SET_SELECTED_BRAND_ID (state, payload) {
      state.selectedBrand = payload
    },
    SET_COMPANY_ID (state, payload) {
      state.companyId = payload
    },
    SET_BRAND_CONFIG (state, payload) {
      state.brandConfig = payload
    },
    SET_SIDEBAR_STATUS (state, payload) {
      state.sideBarOpen = payload
    },
    SET_IS_SHOW_TRACKING_CAMPAIGN (state, payload) {
      state.isShowTrackingCampaign = payload
    },
    SET_DEFAULT_STATE (state) {
      Object.assign(state, userState)
    }
  },
  getters: {
  }
}

export default user
