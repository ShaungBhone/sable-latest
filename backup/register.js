
import _ from 'lodash'

const registerState = {
  isVerifyAgain: false,
  loadingStatusInvite: true,
  isLoading: true,
  language: 'th',
  verifyEmailStatus: false,
  picStatusPayment: 'payment_success',
  emailRegister: '',
  passwordRegister: '',
  imageUrl: '',
  firstNameRegister: '',
  lastNameRegister: '',
  companyNameRegister: '',
  phoneNumberRegister: '',
  brandNameRegister: '',
  webUrl: '',
  webFormat: '',
  webMaintain: '',
  isVerifiedFirstTime: false,
  redeemCode: [],
  isAnnual: false,
  isSummary: false,
  selectedPlan: {},
  packageList: [],
  paymentSummary: {
    oldPrice: 0,
    discountPrice: 0,
    totalPrice: 0
  },
  packageId: '',
  subscriptionPlan: 'MONTHLY',
  isLoadingPackage: false
}

const register = {
  namespaced: true,
  state: () => (_.cloneDeep(registerState)),
  actions: {
    async redeemCode ({ commit, rootState, state }, payload) {
      try {
        const body = {
          redeem_codes: [payload]
        }

        for (let index = 0; index < state.redeemCode[0]?.package_data?.code.length; index++) {
          body.redeem_codes.push(state.redeemCode[0]?.package_data?.code[index])
        }

        const response = await this.$axios.post('/redeem-code/detail', body)
        let isYear = false
        if (response.data.package_data?.annual?.annual_price) {
          isYear = true
        }
        response.data.package_data = {
          type: response.data.package_data.type,
          code: response.data.redeem_code,
          annualInterval: response.data?.package_data?.annual?.annual_interval || null,
          monthlyInterval: response.data?.package_data?.monthly?.monthly_interval || null,
          isShowSelectBox: response.data.package_data?.have_sibling,
          redeemCode: response.data.redeem_code,
          isYear,
          titleName: response.data.package_data.group_name,
          isShowRedeemCode: true,
          priceMonthly: response.data?.package_data?.monthly?.monthly_price || null,
          priceAnnual: response.data?.package_data?.annual?.annual_price || null,
          isDiscount: false,
          discountMonthly: {
            type: response.data?.package_data?.monthly?.monthly_discount_type,
            discount: response.data?.package_data?.monthly?.monthly_discount
          },
          discountAnnual: {
            type: response.data?.package_data?.annual?.annual_discount_type,
            discount: response.data?.package_data?.annual?.annual_discount
          },
          planBox: [{
            isYear,
            planName: response.data?.package_data?.name,
            monthly: {
              price: response.data?.package_data?.monthly?.monthly_price || null,
              type: response.data?.package_data?.monthly?.monthly_discount_type,
              discount: response.data?.package_data?.monthly?.monthly_discount
            },
            description: response.data?.package_data?.description,
            annual:
            {
              price: response.data?.package_data?.annual?.annual_price || null,
              type: response.data?.package_data?.annual?.annual_discount_type,
              discount: response.data?.package_data?.annual?.annual_discount
            },
            isChecked: true,
            featuredList: response.data?.package_data?.features
          }]
        }

        if (response) {
          if (state.redeemCode.length > 0) {
            // SET_REDEEM_CODE
            if (response.data.package_data.type === 'STACK') {
              for (let index = 0; index < state.redeemCode[0].package_data.code.length; index++) {
                if (!response.data.redeem_code.includes(state.redeemCode[0].package_data.code[index])) {
                  response.data.redeem_code.push(state.redeemCode[0].package_data.code[index])
                }
              }
              commit('SET_REDEEM_CODE', [])
              commit('SET_PUSH_REDEEM_CODE', response.data)
            }
          } else {
            commit('SET_PUSH_REDEEM_CODE', response.data)
          }

          const cal = {
            oldPrice: 0,
            discountPrice: 0,
            totalPrice: 0
          }
          for (let i = 0; i < state.redeemCode.length; i++) {
            const redeem = state.redeemCode[i].package_data
            const TypeProduct = redeem.isYear ? 'Annual' : 'Monthly'
            cal.oldPrice += redeem[`price${TypeProduct}`]
            if (redeem[`discount${TypeProduct}`].type === 'PERCENTAGE') {
              cal.discountPrice += redeem[`price${TypeProduct}`] * (redeem[`discount${TypeProduct}`].discount / 100)
              cal.totalPrice += redeem[`price${TypeProduct}`] - (redeem[`price${TypeProduct}`] * (redeem[`discount${TypeProduct}`].discount / 100))
            } else {
              if (redeem[`discount${TypeProduct}`].discount > 0) {
                cal.discountPrice += redeem[`price${TypeProduct}`] - redeem[`discount${TypeProduct}`].discount
              }
              cal.totalPrice += redeem[`price${TypeProduct}`] - (redeem[`price${TypeProduct}`] - redeem[`discount${TypeProduct}`].discount)
            }
          }
          commit('SET_PAYMENT_SUMMARY', cal)

          return true
        }
      } catch (error) {
        console.log(error)
        return false
      }
    },
    async checkEmail ({ commit, rootState, state }, payload) {
      try {
        const response = await this.$axios.get(`/register/email-checker?email=${payload}`)
        console.log(response)
        return true
      } catch (error) {
        console.log(error)
        return false
      }
    },
    async createUser ({ state }) {
      let body

      if (state.redeemCode.length > 0) {
        const redeem = []
        for (let index = 0; index < state.redeemCode.length; index++) {
          redeem.push(state.redeemCode[index])
        }

        body = {
          email: state.emailRegister,
          password: state.passwordRegister,
          redeem_code: redeem[0].package_data.code
        }
      } else {
        body = {
          email: state.emailRegister,
          password: state.passwordRegister,
          package: {
            id: state.packageId,
            subscription_plan: state.subscriptionPlan
          }
        }
      }
      try {
        const response = await this.$axios.post('/register/user/app', body)
        console.log(response)
        return response
      } catch (error) {
        return error.response
      }
    },
    async sendEmailVerify ({ commit }, email) {
      try {
        const response = await this.$axios.post('/register/user/app/generate-token', {
          email
        }
        )
        return response
      } catch (error) {
        return error.response
      }
    },
    async verifyEmail ({ commit }, token) {
      try {
        const response = await this.$axios.patch(`/register/user/app/${token}`)
        commit('SET_VERIFY_EMAIL_STATUS', true)
        commit('SET_LOADING_INVITE', false)
        return response
      } catch (error) {
        commit('SET_LOADING_INVITE', false)
        commit('SET_VERIFY_EMAIL_STATUS', false)
        return error.response
      }
    },
    async uploadImage ({ commit }, file) {
      try {
        const data = new FormData()
        data.append('image', file)
        let boundary = '--------------------------'
        for (let i = 0; i < 24; i += 1) {
          boundary += Math.floor(Math.random() * 10).toString(16)
        }
        const response = await this.$axios.$post('/register/user/app/upload-logo', data, {
          headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`
          }
        })
        await commit('SET_MSG_IMAGE_URL', response.imageUrl)
      } catch (err) {
        return { err }
      }
    },
    async updateUserInfo ({ state, dispatch }) {
      try {
        const response = await this.$axios.post('/register/user/app/update-user-info', {
          firstName: state.firstNameRegister,
          lastName: state.lastNameRegister,
          companyName: state.companyNameRegister,
          phoneNumber: state.phoneNumberRegister,
          email: state.emailRegister,
          brandLogoUrl: state.imageUrl,
          brandName: state.brandNameRegister,
          webUrl: state.webUrl,
          webFormat: state.webFormat,
          webMaintainer: state.webMaintainer
        })
        const accessToken = this.$cookiz.get('sable.accessToken_register')
        const refreshToken = this.$cookiz.get('sable.refreshToken_register')
        const expired = this.$cookiz.get('sable.expired_time_register')

        await dispatch('user/logOut', null, { root: true })

        this.$cookiz.set('sable.accessToken', accessToken, {
          path: '/',
          maxAge: 60 * 60 * 24 * 30
        })
        this.$cookiz.set('sable.refreshToken', refreshToken, {
          path: '/',
          maxAge: 60 * 60 * 24 * 90
        })
        this.$cookiz.set('sable.expired_time', expired, {
          path: '/',
          maxAge: 60 * 60 * 24 * 90
        })
        return response
      } catch (error) {
        return error.response
      }
    },
    async getPackageList ({ commit }) {
      try {
        commit('SET_LOADING_PACKAGE', true)
        const response = await this.$axios.get('/package-cdp')
        commit('SET_PACKAGE_LIST', response.data)
      } catch (error) {
        console.log(error)
      } finally {
        commit('SET_LOADING_PACKAGE', false)
      }
    },
    async validateTransaction ({ commit }, transactionId) {
      try {
        const response = await this.$axios.patch(`/register/user/verify/${transactionId}`)
        return response
      } catch (error) {
        return error.response
      }
    },
    checkIsAnnual ({ state, commit }) {
      if (state.selectedPlan.isYear) {
        commit('SET_SELECTED_PLAN_ANNUAL')
      } else {
        commit('SET_SELECTED_PLAN_MONTHLY')
      }

      state.selectedPlan.planBox.forEach((plan) => {
        if (plan.isChecked) {
          commit('SET_PACKAGE_ID', plan.packageId)
        }
      })
    }
  },
  mutations: {
    SET_IS_VERIFY_AGAIN (state, payload) {
      state.isVerifyAgain = payload
    },
    SET_LOADING_INVITE (state, payload) {
      state.loadingStatusInvite = payload
    },
    SET_LOADING (state, payload) {
      state.isLoading = payload
    },
    SET_LANGUAGE (state, payload) {
      state.language = payload
    },
    SET_VERIFY_EMAIL_STATUS (state, payload) {
      state.verifyEmailStatus = payload
    },
    SET_PIC_STATUS (state, payload) {
      state.picStatusPayment = payload
    },
    SET_SUMMARY (state, payload) {
      state.isSummary = payload
    },
    SET_EMAIL (state, payload) {
      state.emailRegister = payload
    },
    SET_PASSWORD (state, payload) {
      state.passwordRegister = payload
    },
    SET_DEFAULT_STATE (state) {
      Object.assign(state, registerState)
    },
    SET_MSG_IMAGE_URL (state, payload) {
      state.imageUrl = payload
    },
    SET_USER_INFO (state, payload) {
      state.firstNameRegister = payload.firstName
      state.lastNameRegister = payload.lastName
      state.companyNameRegister = payload.companyName
      state.phoneNumberRegister = payload.phoneNumber
      state.brandNameRegister = payload.brandName
      state.webUrl = payload.webUrl
      state.webFormat = payload.webFormat
      state.webMaintainer = payload.webMaintainer
    },
    SET_VERIFIED_FIRST_TIME (state, payload) {
      state.isVerifiedFirstTime = payload
    },
    SET_PUSH_REDEEM_CODE (state, payload) {
      state.redeemCode.push(payload)
    },
    SET_REDEEM_CODE (state, payload) {
      state.redeemCode = payload
    },
    SET_ANNUAL_STATUS (state, payload) {
      state.isAnnual = payload
    },
    SET_SELECTED_PLAN (state, payload) {
      state.selectedPlan = payload
    },
    SET_SELECTED_PLAN_ANNUAL (state) {
      state.subscriptionPlan = 'ANNUAL'
    },
    SET_SELECTED_PLAN_MONTHLY (state) {
      state.subscriptionPlan = 'MONTHLY'
    },
    SET_PACKAGE_ID (state, payload) {
      state.packageId = payload
    },
    SET_PACKAGE_LIST (state, payload) {
      state.packageList = payload
    },
    SET_PAYMENT_SUMMARY (state, payload) {
      state.paymentSummary = payload
    },
    SET_LOADING_PACKAGE (state, payload) {
      state.isLoadingPackage = payload
    }
  }
}

export default register
