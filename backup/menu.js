export const menuItems = [
  {
    id: 'EXPAND',
    label: '',
    icon: 'keyboard_double_arrow_right'
  },
  {
    id: 'MODULE_HOME',
    label: 'menu.home.text',
    icon: 'auto_awesome_mosaic',
    link: '/'
  },
  // {
  //   id: 'MODULE_ALERT_SALE',
  //   label: 'menu.alert_sale.text',
  //   icon: 'alarm',
  //   link: '/alert-sale'
  // },
  {
    id: 'MODULE_TODO_LIST',
    label: 'menu.todo_list.text',
    icon: 'checklist',
    link: '/todo-list'
  },
  {
    id: 'MODULE_CUSTOMER_LIST',
    label: 'menu.customer_list.text',
    icon: 'group',
    link: '/customer-list',
    hide_items: true,
    subItems: [
      {
        id: 'MODULE_CUSTOMER_360',
        label: '',
        link: '/customer-360'
      }
    ]
  },
  {
    id: 'MODULE_SEGMENT',
    label: 'menu.segment.text',
    icon: 'donut_small',
    link: '/segment',
    subItems: [
      {
        id: 'MODULE_SEGMENT',
        label: 'menu.segment.subItem.segment',
        link: '/segment'
      },
      {
        id: 'MODULE_AUDIENCE',
        label: 'menu.segment.subItem.facebookAudience',
        link: '/segment/facebookAudience'
      }
    ]
  },
  {
    id: 'MODULE_PRODUCT',
    label: 'menu.product.text',
    icon: 'shopping_bag',
    link: '/product'
  },
  {
    id: 'MODULE_CAMPAIGN',
    label: 'menu.campaign.text',
    icon: 'campaign',
    link: '/campaign',
    subItems: [
      {
        id: 'MODULE_CAMPAIGN',
        label: 'menu.campaign.subItem.campaign',
        link: '/campaign'
      },
      {
        id: 'MODULE_SHORTLINK',
        label: 'menu.campaign.subItem.shortlink',
        link: '/shortlink'
      },
      {
        id: 'MODULE_FACEBOOK_ADS',
        label: 'menu.campaign.subItem.facebook',
        link: '/facebookAds'
      },
      {
        id: 'MODULE_REWARD',
        label: 'menu.campaign.subItem.reward',
        link: '/reward'
      }
    ]
  },
  {
    id: 'MODULE_ONSITE_CAMPAIGN',
    label: 'menu.onSite.text',
    icon: 'call_to_action',
    link: '/onsite'
  },
  {
    id: 'MODULE_AUTOMATE',
    label: 'menu.automate.text',
    icon: 'account_tree',
    link: '/automate',
    subItems: [
      {
        id: 'MODULE_AUTOMATE_NEW_WORKFLOW',
        label: 'menu.automate.subItem.newWorkflow',
        link: '/automate'
      },
      {
        id: 'MODULE_JOURNEY_AUTOMATION',
        label: 'menu.automate.subItem.journeyAutomation',
        link: '/automate/journey'
      }
    ]
  },
  {
    id: 'MODULE_AUTOMATE',
    label: 'menu.ai_agent.text',
    icon: 'account_tree',
    link: '/ai-chat',
    subItems: [
      {
        id: 'MODULE_AUTOMATE_NEW_WORKFLOW',
        label: 'menu.ai_agent.subItem.ai_chat',
        link: '/ai-chat'
      }
    ]
  },
  {
    id: 'MODULE_EXTENSION',
    label: 'menu.extension.text',
    icon: 'extension',
    link: '/extension',
    subItems: [
      {
        id: 'MODULE_EXTENSION',
        label: 'menu.extension.subItem.extension',
        link: '/extension'
      }
      // {
      //   id: 'MODULE_EXTENSION',
      //   label: 'menu.extension.subItem.addOn'
      // }
    ]
  },
  {
    id: 'MODULE_COOKIE_CONSENT',
    label: 'menu.cookie_consent.text',
    icon: 'cookie',
    link: '/cookie-consent'
  },
  {
    id: 'MODULE_BILLING',
    label: 'menu.bill.text',
    icon: 'credit_card',
    link: '/bill-payment'
  },
  {
    id: 'MODULE_SETTING',
    label: 'menu.setting.text',
    icon: 'settings',
    link: '/setting'
  }
  // {
  //   id: 'MODULE_CONNECT',
  //   label: 'menu.connect.text',
  //   icon: 'upload_file',
  //   link: '/connect',
  //   subItems: [
  //     {
  //       id: 'MODULE_CONNECT_LOYALTY',
  //       label: 'menu.connect.subItem.connectLOYALTY',
  //       link: '/connect/connect-LOYALTY'
  //     },
  //     {
  //       id: 'MODULE_CONNECT_AIPEN',
  //       label: 'menu.connect.subItem.connectAIPEN',
  //       link: '/connect/connect-AIPEN'
  //     },
  //     {
  //       id: 'MODULE_IMPORT_DATA',
  //       label: 'menu.connect.subItem.importData',
  //       link: '/connect/import'
  //     }
  //   ]
  // }
]
