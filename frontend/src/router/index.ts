import { createWebHistory, createRouter, RouteRecordRaw } from 'vue-router';
/* Layout */
import Layout from '@/layout/index.vue';

/**
 * Note: 路由配置项
 *
 * hidden: true                     // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * alwaysShow: true                 // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                  // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                  // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                  // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'               // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * query: '{"id": 1, "name": "ry"}' // 访问路由的默认传递参数
 * roles: ['admin', 'common']       // 访问路由的角色权限
 * permissions: ['a:a:a', 'b:b:b']  // 访问路由的菜单权限
 * meta : {
    noCache: true                   // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
    title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'                // 设置该路由的图标，对应路径src/assets/icons/svg
    breadcrumb: false               // 如果设置为false，则不会在breadcrumb面包屑中显示
    activeMenu: '/system/user'      // 当路由设置了该属性，则会高亮相对应的侧边栏。
  }
 */

// 公共路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index.vue')
      }
    ]
  },
  {
    path: '/social-callback',
    hidden: true,
    component: () => import('@/layout/components/SocialCallback/index.vue')
  },
  {
    path: '/login',
    component: () => import('@/views/login.vue'),
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/register.vue'),
    hidden: true
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/error/404.vue'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error/401.vue'),
    hidden: true
  },
  {
    path: '/farmland_management/soilProfile/form',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/soilProfile/form.vue'),
        name: 'SoilProfileForm',
        meta: {
          title: 'Add Soil Profile',
          description: 'Create a new soil profile record',
          activeMenu: '/farmland_management/soilProfile',
          showBack: '1',
          showPath: '/farmland_management/soilProfile',
          noCache: true
        }
      }
    ]
  },
  {
    path: '/farmland_management/landPreparationAdvanced',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/landPreparationAdvanced/index.vue'),
        name: 'LandPreparationAdvanced',
        meta: {
          title: 'Advanced Land Preparation',
          description: 'Manage advanced land preparation records',
          activeMenu: '/farmland_management/landPreparationAdvanced',
          showBack: '1',
          noCache: true
        }
      }
    ]
  },
  {
    path: '/farmland_management/soilProfileVerify/form',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/soilProfile_verify/form.vue'),
        name: 'SoilProfileVerifyForm',
        meta: {
          title: 'Soil Profile Approval',
          description: 'Review and approve soil profile record',
          activeMenu: '/farmland_management/soilProfileVerify',
          showBack: '1',
          showPath: '/farmland_management/soilProfileVerify',
          noCache: true
        }
      }
    ]
  },
  {
    path: '/',
    component: Layout,
    hidden: true,
    redirect: '/index',
    children: [
      {
        path: '/index',
        component: () => import('@/views/index.vue'),
        name: 'Index',
        hidden: true,
        meta: { title: 'Welcome Page', icon: 'dashboard', affix: false, description: 'Welcome to here！' }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'profile',
        component: () => import('@/views/system/user/profile/index.vue'),
        name: 'Profile',
        meta: { title: '个人中心', icon: 'user' }
      }
    ]
  },
  // ==================== Logistics delivery：弹窗改页面（隐藏路由） ====================
  {
    path: '/logistics_delivery/transporterMaster/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/transporterMaster/form.vue'),
        name: 'TransporterMasterAdd',
        meta: { title: 'Add Transporter Master', activeMenu: '/logistics_delivery/transporterMaster', showBack: '1', showPath: '/logistics_delivery/transporterMaster', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/transporterMaster/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/transporterMaster/form.vue'),
        name: 'TransporterMasterEdit',
        meta: { title: 'Edit Transporter Master', activeMenu: '/logistics_delivery/transporterMaster', showBack: '1', showPath: '/logistics_delivery/transporterMaster', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/vehicle/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/vehicle/form.vue'),
        name: 'VehicleAdd',
        meta: { title: 'Add Vehicle Info', activeMenu: '/logistics_delivery/vehicle', showBack: '1', showPath: '/logistics_delivery/vehicle', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/vehicle/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/vehicle/form.vue'),
        name: 'VehicleEdit',
        meta: { title: 'Edit Vehicle Info', activeMenu: '/logistics_delivery/vehicle', showBack: '1', showPath: '/logistics_delivery/vehicle', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/vehicle/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/vehicle/form.vue'),
        name: 'VehicleDetail',
        meta: { title: 'View Vehicle Info', activeMenu: '/logistics_delivery/vehicle', showBack: '1', showPath: '/logistics_delivery/vehicle', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/driver/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/driver/form.vue'),
        name: 'DriverAdd',
        meta: { title: 'Add Driver Info', activeMenu: '/logistics_delivery/driver', showBack: '1', showPath: '/logistics_delivery/driver', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/driver/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/driver/form.vue'),
        name: 'DriverEdit',
        meta: { title: 'Edit Driver Info', activeMenu: '/logistics_delivery/driver', showBack: '1', showPath: '/logistics_delivery/driver', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/driver/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/driver/form.vue'),
        name: 'DriverDetail',
        meta: { title: 'View Driver Info', activeMenu: '/logistics_delivery/driver', showBack: '1', showPath: '/logistics_delivery/driver', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/logisticsProvider/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/logisticsProvider/form.vue'),
        name: 'LogisticsProviderAdd',
        meta: { title: 'Add Logistics Provider', activeMenu: '/logistics_delivery/logisticsProvider', showBack: '1', showPath: '/logistics_delivery/logisticsProvider', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/logisticsProvider/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/logisticsProvider/form.vue'),
        name: 'LogisticsProviderEdit',
        meta: { title: 'Edit Logistics Provider', activeMenu: '/logistics_delivery/logisticsProvider', showBack: '1', showPath: '/logistics_delivery/logisticsProvider', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/logisticsProvider/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/logisticsProvider/form.vue'),
        name: 'LogisticsProviderDetail',
        meta: { title: 'View Logistics Provider', activeMenu: '/logistics_delivery/logisticsProvider', showBack: '1', showPath: '/logistics_delivery/logisticsProvider', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/transportAssignment/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/transportAssignment/form.vue'),
        name: 'TransportAssignmentAdd',
        meta: { title: 'Add Transport Assignment', activeMenu: '/logistics_delivery/transportAssignment', showBack: '1', showPath: '/logistics_delivery/transportAssignment', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/transportAssignment/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/transportAssignment/form.vue'),
        name: 'TransportAssignmentEdit',
        meta: { title: 'Edit Transport Assignment', activeMenu: '/logistics_delivery/transportAssignment', showBack: '1', showPath: '/logistics_delivery/transportAssignment', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/transportAssignment/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/transportAssignment/form.vue'),
        name: 'TransportAssignmentDetail',
        meta: { title: 'View Transport Assignment', activeMenu: '/logistics_delivery/transportAssignment', showBack: '1', showPath: '/logistics_delivery/transportAssignment', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/buyerDispatch/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/buyerDispatch/form.vue'),
        name: 'BuyerDispatchAdd',
        meta: { title: 'Add Buyer Dispatch', activeMenu: '/logistics_delivery/buyerDispatch', showBack: '1', showPath: '/logistics_delivery/buyerDispatch', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/buyerDispatch/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/buyerDispatch/form.vue'),
        name: 'BuyerDispatchEdit',
        meta: { title: 'Edit Buyer Dispatch', activeMenu: '/logistics_delivery/buyerDispatch', showBack: '1', showPath: '/logistics_delivery/buyerDispatch', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/buyerDispatch/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/buyerDispatch/form.vue'),
        name: 'BuyerDispatchDetail',
        meta: { title: 'View Buyer Dispatch', activeMenu: '/logistics_delivery/buyerDispatch', showBack: '1', showPath: '/logistics_delivery/buyerDispatch', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/proofOfDelivery/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/proofOfDelivery/form.vue'),
        name: 'ProofOfDeliveryAdd',
        meta: { title: 'Add Proof of Delivery', activeMenu: '/logistics_delivery/proofOfDelivery', showBack: '1', showPath: '/logistics_delivery/proofOfDelivery', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/proofOfDelivery/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/proofOfDelivery/form.vue'),
        name: 'ProofOfDeliveryDetail',
        meta: { title: 'View Proof of Delivery', activeMenu: '/logistics_delivery/proofOfDelivery', showBack: '1', showPath: '/logistics_delivery/proofOfDelivery', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/gpsTrack/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/gpsTrack/form.vue'),
        name: 'GpsTrackAdd',
        meta: { title: 'Add GPS Track Info', activeMenu: '/logistics_delivery/gpsTrack', showBack: '1', showPath: '/logistics_delivery/gpsTrack', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/gpsTrack/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/gpsTrack/form.vue'),
        name: 'GpsTrackEdit',
        meta: { title: 'Edit GPS Track Info', activeMenu: '/logistics_delivery/gpsTrack', showBack: '1', showPath: '/logistics_delivery/gpsTrack', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/coldChainReading/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/coldChainReading/form.vue'),
        name: 'ColdChainReadingAdd',
        meta: { title: 'Add Cold Chain Reading Info', activeMenu: '/logistics_delivery/coldChainReading', showBack: '1', showPath: '/logistics_delivery/coldChainReading', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/coldChainReading/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/coldChainReading/form.vue'),
        name: 'ColdChainReadingEdit',
        meta: { title: 'Edit Cold Chain Reading Info', activeMenu: '/logistics_delivery/coldChainReading', showBack: '1', showPath: '/logistics_delivery/coldChainReading', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/vehicleApproval/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/vehicleApproval/form.vue'),
        name: 'VehicleApprovalDetail',
        meta: { title: 'View Vehicle Info', activeMenu: '/logistics_delivery/vehicleApproval', showBack: '1', showPath: '/logistics_delivery/vehicleApproval', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/vehicleApproval/approve/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/vehicleApproval/form.vue'),
        name: 'VehicleApprovalApprove',
        meta: { title: 'Approve Vehicle Info', activeMenu: '/logistics_delivery/vehicleApproval', showBack: '1', showPath: '/logistics_delivery/vehicleApproval', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/driverApproval/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/driverApproval/form.vue'),
        name: 'DriverApprovalDetail',
        meta: { title: 'View Driver Info', activeMenu: '/logistics_delivery/driverApproval', showBack: '1', showPath: '/logistics_delivery/driverApproval', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/driverApproval/approve/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/driverApproval/form.vue'),
        name: 'DriverApprovalApprove',
        meta: { title: 'Approve Driver Info', activeMenu: '/logistics_delivery/driverApproval', showBack: '1', showPath: '/logistics_delivery/driverApproval', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/logisticsProviderApproval/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/logisticsProviderApproval/form.vue'),
        name: 'LogisticsProviderApprovalDetail',
        meta: { title: 'View Logistics Provider', activeMenu: '/logistics_delivery/logisticsProviderApproval', showBack: '1', showPath: '/logistics_delivery/logisticsProviderApproval', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/logisticsProviderApproval/approve/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/logisticsProviderApproval/form.vue'),
        name: 'LogisticsProviderApprovalApprove',
        meta: { title: 'Approve Logistics Provider', activeMenu: '/logistics_delivery/logisticsProviderApproval', showBack: '1', showPath: '/logistics_delivery/logisticsProviderApproval', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/transportAssignmentApproval/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/transportAssignmentApproval/form.vue'),
        name: 'TransportAssignmentApprovalDetail',
        meta: { title: 'View Transport Assignment', activeMenu: '/logistics_delivery/transportAssignmentApproval', showBack: '1', showPath: '/logistics_delivery/transportAssignmentApproval', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/transportAssignmentApproval/approve/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/transportAssignmentApproval/form.vue'),
        name: 'TransportAssignmentApprovalApprove',
        meta: { title: 'Approve Transport Assignment', activeMenu: '/logistics_delivery/transportAssignmentApproval', showBack: '1', showPath: '/logistics_delivery/transportAssignmentApproval', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/shipmentOrderApproval/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/shipmentOrderApproval/form.vue'),
        name: 'ShipmentOrderApprovalDetail',
        meta: { title: 'View Shipment Order', activeMenu: '/logistics_delivery/shipmentOrderApproval', showBack: '1', showPath: '/logistics_delivery/shipmentOrderApproval', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/shipmentOrderApproval/approve/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/shipmentOrderApproval/form.vue'),
        name: 'ShipmentOrderApprovalApprove',
        meta: { title: 'Approve Shipment Order', activeMenu: '/logistics_delivery/shipmentOrderApproval', showBack: '1', showPath: '/logistics_delivery/shipmentOrderApproval', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/buyerDispatchApproval/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/buyerDispatchApproval/form.vue'),
        name: 'BuyerDispatchApprovalDetail',
        meta: { title: 'View Buyer Dispatch', activeMenu: '/logistics_delivery/buyerDispatchApproval', showBack: '1', showPath: '/logistics_delivery/buyerDispatchApproval', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/buyerDispatchApproval/approve/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/buyerDispatchApproval/form.vue'),
        name: 'BuyerDispatchApprovalApprove',
        meta: { title: 'Approve Buyer Dispatch', activeMenu: '/logistics_delivery/buyerDispatchApproval', showBack: '1', showPath: '/logistics_delivery/buyerDispatchApproval', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/shipmentOrder/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/shipmentOrder/form.vue'),
        name: 'ShipmentOrderAdd',
        meta: { title: 'Add Shipment Order', activeMenu: '/logistics_delivery/shipmentOrder', showBack: '1', showPath: '/logistics_delivery/shipmentOrder', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/shipmentOrder/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/shipmentOrder/form.vue'),
        name: 'ShipmentOrderEdit',
        meta: { title: 'Edit Shipment Order', activeMenu: '/logistics_delivery/shipmentOrder', showBack: '1', showPath: '/logistics_delivery/shipmentOrder', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/shipmentOrder/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/shipmentOrder/form.vue'),
        name: 'ShipmentOrderDetail',
        meta: { title: 'Shipment Order Detail', activeMenu: '/logistics_delivery/shipmentOrder', showBack: '1', showPath: '/logistics_delivery/shipmentOrder', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/dispatchLoading/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/dispatchLoading/form.vue'),
        name: 'DispatchLoadingEdit',
        meta: { title: 'Edit Dispatch & Loading', activeMenu: '/logistics_delivery/dispatchLoading', showBack: '1', showPath: '/logistics_delivery/dispatchLoading', noCache: true }
      }
    ]
  },
  {
    path: '/logistics_delivery/dispatchLoading/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/dispatchLoading/form.vue'),
        name: 'DispatchLoadingDetail',
        meta: { title: 'Dispatch & Loading Detail', activeMenu: '/logistics_delivery/dispatchLoading', showBack: '1', showPath: '/logistics_delivery/dispatchLoading', noCache: true }
      }
    ]
  },
  // ==================== Production management：弹窗改页面（隐藏路由） ====================
  {
    path: '/production_management/productionSeason/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/productionSeason/form.vue'),
        name: 'ProductionSeasonEdit',
        meta: { title: 'Edit Production Season', activeMenu: '/production_management/productionSeason', showBack: '1', showPath: '/production_management/productionSeason', noCache: true }
      }
    ]
  },
  {
    path: '/production_management/productionSeason/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/productionSeason/form.vue'),
        name: 'ProductionSeasonDetail',
        meta: { title: 'View Production Season', activeMenu: '/production_management/productionSeason', showBack: '1', showPath: '/production_management/productionSeason', noCache: true }
      }
    ]
  },
  {
    path: '/production_management/productionBatch/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/productionBatch/form.vue'),
        name: 'ProductionBatchAdd',
        meta: { title: 'Add Production Batch', activeMenu: '/production_management/productionBatch', showBack: '1', showPath: '/production_management/productionBatch', noCache: true }
      }
    ]
  },
  {
    path: '/production_management/productionBatch/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/productionBatch/form.vue'),
        name: 'ProductionBatchEdit',
        meta: { title: 'Edit Production Batch', activeMenu: '/production_management/productionBatch', showBack: '1', showPath: '/production_management/productionBatch', noCache: true }
      }
    ]
  },
  {
    path: '/production_management/productionBatch/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/productionBatch/form.vue'),
        name: 'ProductionBatchDetail',
        meta: { title: 'View Production Batch', activeMenu: '/production_management/productionBatch', showBack: '1', showPath: '/production_management/productionBatch', noCache: true }
      }
    ]
  },
  {
    path: '/production_management/productionBatchApproval/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/productionBatchApproval/form.vue'),
        name: 'ProductionBatchApprovalDetail',
        meta: { title: 'View Production Batch', activeMenu: '/production_management/productionBatchApproval', showBack: '1', showPath: '/production_management/productionBatchApproval', noCache: true }
      }
    ]
  },
  {
    path: '/production_management/productionBatchApproval/approve/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/productionBatchApproval/form.vue'),
        name: 'ProductionBatchApprovalApprove',
        meta: { title: 'Approve Production Batch', activeMenu: '/production_management/productionBatchApproval', showBack: '1', showPath: '/production_management/productionBatchApproval', noCache: true }
      }
    ]
  },
  {
    path: '/production_management/finishedGoodsBatch/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/finishedGoodsBatch/form.vue'),
        name: 'FinishedGoodsBatchAdd',
        meta: { title: 'Add Finished Goods Batch', activeMenu: '/production_management/finishedGoodsBatch', showBack: '1', showPath: '/production_management/finishedGoodsBatch', noCache: true }
      }
    ]
  },
  {
    path: '/production_management/finishedGoodsBatch/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/finishedGoodsBatch/form.vue'),
        name: 'FinishedGoodsBatchEdit',
        meta: { title: 'Edit Finished Goods Batch', activeMenu: '/production_management/finishedGoodsBatch', showBack: '1', showPath: '/production_management/finishedGoodsBatch', noCache: true }
      }
    ]
  },
  {
    path: '/production_management/finishedGoodsBatch/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/finishedGoodsBatch/form.vue'),
        name: 'FinishedGoodsBatchDetail',
        meta: { title: 'View Finished Goods Batch', activeMenu: '/production_management/finishedGoodsBatch', showBack: '1', showPath: '/production_management/finishedGoodsBatch', noCache: true }
      }
    ]
  },
  {
    path: '/production_management/finishedGoodsBatch/verify/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/finishedGoodsBatch/form.vue'),
        name: 'VerifyFinishedGoodsBatch',
        meta: { title: 'Verify Finished Goods Batch', activeMenu: '/production_management/finishedGoodsBatch', showBack: '1', showPath: '/production_management/finishedGoodsBatch', noCache: true }
      }
    ]
  },
  {
    path: '/production_management/rawMaterialIntake/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/rawMaterialIntake/form.vue'),
        name: 'RawMaterialIntakeAdd',
        meta: { title: 'Add Raw Material Intake', activeMenu: '/production_management/rawMaterialIntake', showBack: '1', showPath: '/production_management/rawMaterialIntake', noCache: true }
      }
    ]
  },
  {
    path: '/production_management/rawMaterialIntake/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/rawMaterialIntake/form.vue'),
        name: 'RawMaterialIntakeEdit',
        meta: { title: 'Edit Raw Material Intake', activeMenu: '/production_management/rawMaterialIntake', showBack: '1', showPath: '/production_management/rawMaterialIntake', noCache: true }
      }
    ]
  },
  // ==================== Production/Processing/Harvest/Farmland：弹窗改页面（隐藏路由·自动生成） ====================
  {
    path: '/farmland_management/pestDiseaseReportActioned/action/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/pestDiseaseReportActioned/form.vue'),
        name: 'ActionPestDiseaseReport',
        meta: { title: 'Action Pest Disease Report', activeMenu: '/farmland_management/pestDiseaseReportActioned', showBack: '1', showPath: '/farmland_management/pestDiseaseReportActioned', noCache: true }
      }
    ]
  },
  {
    path: '/processing_value_addition/agroprocessor/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/agroprocessor/form.vue'),
        name: 'AgroprocessorAdd',
        meta: { title: 'Add Agro Processor', activeMenu: '/processing_value_addition/agroprocessor', showBack: '1', showPath: '/processing_value_addition/agroprocessor', noCache: true }
      }
    ]
  },
  {
    path: '/processing_value_addition/agroprocessor/approve/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/agroprocessor/form.vue'),
        name: 'AgroprocessorApprove',
        meta: { title: 'Verify Agro Processor', activeMenu: '/processing_value_addition/agroprocessor', showBack: '1', showPath: '/processing_value_addition/agroprocessor', noCache: true }
      }
    ]
  },
  {
    path: '/processing_value_addition/agroprocessor/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/agroprocessor/form.vue'),
        name: 'AgroprocessorDetail',
        meta: { title: 'Agro Processor Detail', activeMenu: '/processing_value_addition/agroprocessor', showBack: '1', showPath: '/processing_value_addition/agroprocessor', noCache: true }
      }
    ]
  },
  {
    path: '/processing_value_addition/agroprocessor/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/agroprocessor/form.vue'),
        name: 'AgroprocessorEdit',
        meta: { title: 'Edit Agro Processor', activeMenu: '/processing_value_addition/agroprocessor', showBack: '1', showPath: '/processing_value_addition/agroprocessor', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/aiYieldPrediction/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/aiYieldPrediction/form.vue'),
        name: 'AiYieldPredictionAdd',
        meta: { title: 'Add AI Yield Prediction', activeMenu: '/farmland_management/aiYieldPrediction', showBack: '1', showPath: '/farmland_management/aiYieldPrediction', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/aiYieldPrediction/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/aiYieldPrediction/form.vue'),
        name: 'AiYieldPredictionEdit',
        meta: { title: 'Edit AI Yield Prediction', activeMenu: '/farmland_management/aiYieldPrediction', showBack: '1', showPath: '/farmland_management/aiYieldPrediction', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/clusterFarming/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/clusterFarming/form.vue'),
        name: 'ClusterFarmingAdd',
        meta: { title: 'Add Cluster', activeMenu: '/farmland_management/clusterFarming', showBack: '1', showPath: '/farmland_management/clusterFarming', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/clusterFarming/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/clusterFarming/form.vue'),
        name: 'ClusterFarmingEdit',
        meta: { title: 'Edit Cluster', activeMenu: '/farmland_management/clusterFarming', showBack: '1', showPath: '/farmland_management/clusterFarming', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/crop/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/crop/form.vue'),
        name: 'CropAdd',
        meta: { title: 'Add Crop Management', activeMenu: '/farmland_management/crop', showBack: '1', showPath: '/farmland_management/crop', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/cropCategory/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/cropCategory/form.vue'),
        name: 'CropCategoryAdd',
        meta: { title: 'Add Crop Category Management', activeMenu: '/farmland_management/cropCategory', showBack: '1', showPath: '/farmland_management/cropCategory', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/cropCategory/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/cropCategory/form.vue'),
        name: 'CropCategoryEdit',
        meta: { title: 'Edit Crop Category Management', activeMenu: '/farmland_management/cropCategory', showBack: '1', showPath: '/farmland_management/cropCategory', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/crop/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/crop/form.vue'),
        name: 'CropEdit',
        meta: { title: 'Edit Crop Management', activeMenu: '/farmland_management/crop', showBack: '1', showPath: '/farmland_management/crop', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/cropMaster/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/cropMaster/form.vue'),
        name: 'CropMasterAdd',
        meta: { title: 'Add Crop Master', activeMenu: '/farmland_management/cropMaster', showBack: '1', showPath: '/farmland_management/cropMaster', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/cropMaster/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/cropMaster/form.vue'),
        name: 'CropMasterEdit',
        meta: { title: 'Edit Crop Master', activeMenu: '/farmland_management/cropMaster', showBack: '1', showPath: '/farmland_management/cropMaster', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/cropMonitoring/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/cropMonitoring/form.vue'),
        name: 'CropMonitoringAdd',
        meta: { title: 'Add Crop Monitoring Record', activeMenu: '/farmland_management/cropMonitoring', showBack: '1', showPath: '/farmland_management/cropMonitoring', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/cropMonitoring_verified/approve/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/cropMonitoring_verified/form.vue'),
        name: 'CropMonitoringApprove',
        meta: { title: 'Approve Crop Monitoring Record', activeMenu: '/farmland_management/cropMonitoring_verified', showBack: '1', showPath: '/farmland_management/cropMonitoring_verified', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/cropMonitoring/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/cropMonitoring/form.vue'),
        name: 'CropMonitoringDetail',
        meta: { title: 'View Crop Monitoring Record', activeMenu: '/farmland_management/cropMonitoring', showBack: '1', showPath: '/farmland_management/cropMonitoring', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/cropMonitoring/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/cropMonitoring/form.vue'),
        name: 'CropMonitoringEdit',
        meta: { title: 'Edit Crop Monitoring Record', activeMenu: '/farmland_management/cropMonitoring', showBack: '1', showPath: '/farmland_management/cropMonitoring', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/croppingPlan/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/croppingPlan/form.vue'),
        name: 'CroppingPlanAdd',
        meta: { title: 'Add Cropping Plan', activeMenu: '/farmland_management/croppingPlan', showBack: '1', showPath: '/farmland_management/croppingPlan', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/croppingPlan_approval/approve/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/croppingPlan_approval/form.vue'),
        name: 'CroppingPlanApprove',
        meta: { title: 'Approve Cropping Plan', activeMenu: '/farmland_management/croppingPlan_approval', showBack: '1', showPath: '/farmland_management/croppingPlan_approval', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/croppingPlan/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/croppingPlan/form.vue'),
        name: 'CroppingPlanDetail',
        meta: { title: 'View Cropping Plan', activeMenu: '/farmland_management/croppingPlan', showBack: '1', showPath: '/farmland_management/croppingPlan', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/croppingPlan/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/croppingPlan/form.vue'),
        name: 'CroppingPlanEdit',
        meta: { title: 'Edit Cropping Plan', activeMenu: '/farmland_management/croppingPlan', showBack: '1', showPath: '/farmland_management/croppingPlan', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/farmer/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/farmer/form.vue'),
        name: 'FarmerAdd',
        meta: { title: 'Add Farmer', activeMenu: '/farmland_management/farmer', showBack: '1', showPath: '/farmland_management/farmer', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/farmer/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/farmer/form.vue'),
        name: 'FarmerEdit',
        meta: { title: 'Edit Farmer', activeMenu: '/farmland_management/farmer', showBack: '1', showPath: '/farmland_management/farmer', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/farmland_approval/approve/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/farmland_approval/form.vue'),
        name: 'FarmlandApprovalApprove',
        meta: { title: 'Approve FarmLand Info', activeMenu: '/farmland_management/farmland_approval', showBack: '1', showPath: '/farmland_management/farmland_approval', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/farmland_approval/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/farmland_approval/form.vue'),
        name: 'FarmlandApprovalDetail',
        meta: { title: 'View FarmLand Info', activeMenu: '/farmland_management/farmland_approval', showBack: '1', showPath: '/farmland_management/farmland_approval', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/fieldOperationLog/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/fieldOperationLog/form.vue'),
        name: 'FieldOperationLogAdd',
        meta: { title: 'Add Operation', activeMenu: '/farmland_management/fieldOperationLog', showBack: '1', showPath: '/farmland_management/fieldOperationLog', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/fieldOperationLogVerify/approve/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/fieldOperationLogVerify/form.vue'),
        name: 'FieldOperationLogApprove',
        meta: { title: 'Approve Field Operation Log', activeMenu: '/farmland_management/fieldOperationLogVerify', showBack: '1', showPath: '/farmland_management/fieldOperationLogVerify', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/fieldOperationLog/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/fieldOperationLog/form.vue'),
        name: 'FieldOperationLogDetail',
        meta: { title: 'View Operation Log', activeMenu: '/farmland_management/fieldOperationLog', showBack: '1', showPath: '/farmland_management/fieldOperationLog', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/fieldOperationLog/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/fieldOperationLog/form.vue'),
        name: 'FieldOperationLogEdit',
        meta: { title: 'Edit Operation', activeMenu: '/farmland_management/fieldOperationLog', showBack: '1', showPath: '/farmland_management/fieldOperationLog', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/fieldOperationSession/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/fieldOperationSession/form.vue'),
        name: 'FieldOperationSessionAdd',
        meta: { title: 'Add Field Operation Session', activeMenu: '/farmland_management/fieldOperationSession', showBack: '1', showPath: '/farmland_management/fieldOperationSession', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/fieldOperationSession/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/fieldOperationSession/form.vue'),
        name: 'FieldOperationSessionDetail',
        meta: { title: 'View Field Operation Session', activeMenu: '/farmland_management/fieldOperationSession', showBack: '1', showPath: '/farmland_management/fieldOperationSession', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/fieldOperationSession/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/fieldOperationSession/form.vue'),
        name: 'FieldOperationSessionEdit',
        meta: { title: 'Edit Field Operation Session', activeMenu: '/farmland_management/fieldOperationSession', showBack: '1', showPath: '/farmland_management/fieldOperationSession', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/fieldOperationSessionVerify/approve/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/fieldOperationSessionVerify/form.vue'),
        name: 'FieldOperationSessionVerifyApprove',
        meta: { title: 'Approve Field Operation Session', activeMenu: '/farmland_management/fieldOperationSessionVerify', showBack: '1', showPath: '/farmland_management/fieldOperationSessionVerify', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/fieldOperationSessionVerify/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/fieldOperationSessionVerify/form.vue'),
        name: 'FieldOperationSessionVerifyDetail',
        meta: { title: 'View Field Operation Session', activeMenu: '/farmland_management/fieldOperationSessionVerify', showBack: '1', showPath: '/farmland_management/fieldOperationSessionVerify', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/harvest/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/harvest/form.vue'),
        name: 'HarvestAdd',
        meta: { title: 'Add Harvest', activeMenu: '/post_harvest_storage/harvest', showBack: '1', showPath: '/post_harvest_storage/harvest', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/harvestCollection/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/harvestCollection/form.vue'),
        name: 'HarvestCollectionAdd',
        meta: { title: 'Add Harvest Collection', activeMenu: '/post_harvest_storage/harvestCollection', showBack: '1', showPath: '/post_harvest_storage/harvestCollection', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/harvestCollectionApproval/approve/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/harvestCollectionApproval/form.vue'),
        name: 'HarvestCollectionApprovalApprove',
        meta: { title: 'Approve Harvest Collection', activeMenu: '/post_harvest_storage/harvestCollectionApproval', showBack: '1', showPath: '/post_harvest_storage/harvestCollectionApproval', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/harvestCollectionApproval/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/harvestCollectionApproval/form.vue'),
        name: 'HarvestCollectionApprovalDetail',
        meta: { title: 'Harvest Collection Detail', activeMenu: '/post_harvest_storage/harvestCollectionApproval', showBack: '1', showPath: '/post_harvest_storage/harvestCollectionApproval', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/harvestCollection/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/harvestCollection/form.vue'),
        name: 'HarvestCollectionDetail',
        meta: { title: 'Harvest Collection Detail', activeMenu: '/post_harvest_storage/harvestCollection', showBack: '1', showPath: '/post_harvest_storage/harvestCollection', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/harvestCollection/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/harvestCollection/form.vue'),
        name: 'HarvestCollectionEdit',
        meta: { title: 'Edit Harvest Collection', activeMenu: '/post_harvest_storage/harvestCollection', showBack: '1', showPath: '/post_harvest_storage/harvestCollection', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/harvest/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/harvest/form.vue'),
        name: 'HarvestDetail',
        meta: { title: 'Harvest Detail', activeMenu: '/post_harvest_storage/harvest', showBack: '1', showPath: '/post_harvest_storage/harvest', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/harvest/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/harvest/form.vue'),
        name: 'HarvestEdit',
        meta: { title: 'Edit Harvest', activeMenu: '/post_harvest_storage/harvest', showBack: '1', showPath: '/post_harvest_storage/harvest', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/harvest_verified/approve/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/harvest_verified/form.vue'),
        name: 'HarvestVerifiedApprove',
        meta: { title: 'Approve Harvest', activeMenu: '/post_harvest_storage/harvest_verified', showBack: '1', showPath: '/post_harvest_storage/harvest_verified', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/harvest_verified/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/harvest_verified/form.vue'),
        name: 'HarvestVerifiedDetail',
        meta: { title: 'Harvest Detail', activeMenu: '/post_harvest_storage/harvest_verified', showBack: '1', showPath: '/post_harvest_storage/harvest_verified', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/iotEnvironmentLog/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/iotEnvironmentLog/form.vue'),
        name: 'IotEnvironmentLogAdd',
        meta: { title: 'Add IoT Environment Log', activeMenu: '/farmland_management/iotEnvironmentLog', showBack: '1', showPath: '/farmland_management/iotEnvironmentLog', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/iotEnvironmentLog/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/iotEnvironmentLog/form.vue'),
        name: 'IotEnvironmentLogEdit',
        meta: { title: 'Edit IoT Environment Log', activeMenu: '/farmland_management/iotEnvironmentLog', showBack: '1', showPath: '/farmland_management/iotEnvironmentLog', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/irrigationTypeMaster/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/irrigationTypeMaster/form.vue'),
        name: 'IrrigationTypeMasterAdd',
        meta: { title: 'Add Irrigation Type Master', activeMenu: '/farmland_management/irrigationTypeMaster', showBack: '1', showPath: '/farmland_management/irrigationTypeMaster', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/irrigationTypeMaster/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/irrigationTypeMaster/form.vue'),
        name: 'IrrigationTypeMasterEdit',
        meta: { title: 'Edit Irrigation Type Master', activeMenu: '/farmland_management/irrigationTypeMaster', showBack: '1', showPath: '/farmland_management/irrigationTypeMaster', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/landPreparation/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/landPreparation/form.vue'),
        name: 'LandPreparationAdd',
        meta: { title: 'Add Land Preparation Record', activeMenu: '/farmland_management/landPreparation', showBack: '1', showPath: '/farmland_management/landPreparation', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/landPreparationAdvanced/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/landPreparationAdvanced/form.vue'),
        name: 'LandPreparationAdvancedAdd',
        meta: { title: 'Add Land Preparation Record', activeMenu: '/farmland_management/landPreparationAdvanced', showBack: '1', showPath: '/farmland_management/landPreparationAdvanced', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/landPreparationAdvanced/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/landPreparationAdvanced/form.vue'),
        name: 'LandPreparationAdvancedDetail',
        meta: { title: 'Land Preparation Record Detail', activeMenu: '/farmland_management/landPreparationAdvanced', showBack: '1', showPath: '/farmland_management/landPreparationAdvanced', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/landPreparationAdvanced/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/landPreparationAdvanced/form.vue'),
        name: 'LandPreparationAdvancedEdit',
        meta: { title: 'Edit Land Preparation Record', activeMenu: '/farmland_management/landPreparationAdvanced', showBack: '1', showPath: '/farmland_management/landPreparationAdvanced', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/landPreparationApprovalVerify/approve/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/landPreparationApprovalVerify/form.vue'),
        name: 'LandPreparationApprovalApprove',
        meta: { title: 'Approve Land Preparation Record', activeMenu: '/farmland_management/landPreparationApprovalVerify', showBack: '1', showPath: '/farmland_management/landPreparationApprovalVerify', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/landPreparationVerify/approve/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/landPreparationVerify/form.vue'),
        name: 'LandPreparationApprove',
        meta: { title: 'Approve Land Preparation Record', activeMenu: '/farmland_management/landPreparationVerify', showBack: '1', showPath: '/farmland_management/landPreparationVerify', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/landPreparation/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/landPreparation/form.vue'),
        name: 'LandPreparationDetail',
        meta: { title: 'Land Preparation Record Detail', activeMenu: '/farmland_management/landPreparation', showBack: '1', showPath: '/farmland_management/landPreparation', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/landPreparation/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/landPreparation/form.vue'),
        name: 'LandPreparationEdit',
        meta: { title: 'Edit Land Preparation Record', activeMenu: '/farmland_management/landPreparation', showBack: '1', showPath: '/farmland_management/landPreparation', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/lossMonitoring/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/lossMonitoring/form.vue'),
        name: 'LossMonitoringAdd',
        meta: { title: 'Add Loss Monitoring', activeMenu: '/post_harvest_storage/lossMonitoring', showBack: '1', showPath: '/post_harvest_storage/lossMonitoring', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/lossMonitoring/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/lossMonitoring/form.vue'),
        name: 'LossMonitoringDetail',
        meta: { title: 'Loss Monitoring Detail', activeMenu: '/post_harvest_storage/lossMonitoring', showBack: '1', showPath: '/post_harvest_storage/lossMonitoring', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/lossMonitoring/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/lossMonitoring/form.vue'),
        name: 'LossMonitoringEdit',
        meta: { title: 'Edit Loss Monitoring', activeMenu: '/post_harvest_storage/lossMonitoring', showBack: '1', showPath: '/post_harvest_storage/lossMonitoring', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/pestDiseaseReport/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/pestDiseaseReport/form.vue'),
        name: 'PestDiseaseReportAdd',
        meta: { title: 'Add Pest and Disease Report', activeMenu: '/farmland_management/pestDiseaseReport', showBack: '1', showPath: '/farmland_management/pestDiseaseReport', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/pestDiseaseReportVerified/approve/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/pestDiseaseReportVerified/form.vue'),
        name: 'PestDiseaseReportApprove',
        meta: { title: 'Approve Pest Disease Report', activeMenu: '/farmland_management/pestDiseaseReportVerified', showBack: '1', showPath: '/farmland_management/pestDiseaseReportVerified', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/pestDiseaseReport/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/pestDiseaseReport/form.vue'),
        name: 'PestDiseaseReportDetail',
        meta: { title: 'View Pest and Disease Report', activeMenu: '/farmland_management/pestDiseaseReport', showBack: '1', showPath: '/farmland_management/pestDiseaseReport', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/pestDiseaseReport/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/pestDiseaseReport/form.vue'),
        name: 'PestDiseaseReportEdit',
        meta: { title: 'Edit Pest and Disease Report', activeMenu: '/farmland_management/pestDiseaseReport', showBack: '1', showPath: '/farmland_management/pestDiseaseReport', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/plot/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/plot/form.vue'),
        name: 'PlotAdd',
        meta: { title: 'Add Plot', activeMenu: '/farmland_management/plot', showBack: '1', showPath: '/farmland_management/plot', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/plot/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/plot/form.vue'),
        name: 'PlotEdit',
        meta: { title: 'Edit Plot', activeMenu: '/farmland_management/plot', showBack: '1', showPath: '/farmland_management/plot', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/postharvestBatch/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/postharvestBatch/form.vue'),
        name: 'PostharvestBatchAdd',
        meta: { title: 'Add Post Harvest Batch', activeMenu: '/post_harvest_storage/postharvestBatch', showBack: '1', showPath: '/post_harvest_storage/postharvestBatch', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/postharvestBatchApproval/approve/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/postharvestBatchApproval/form.vue'),
        name: 'PostharvestBatchApprovalApprove',
        meta: { title: 'Approve Post Harvest Batch', activeMenu: '/post_harvest_storage/postharvestBatchApproval', showBack: '1', showPath: '/post_harvest_storage/postharvestBatchApproval', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/postharvestBatchApproval/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/postharvestBatchApproval/form.vue'),
        name: 'PostharvestBatchApprovalDetail',
        meta: { title: 'Postharvest Batch Detail', activeMenu: '/post_harvest_storage/postharvestBatchApproval', showBack: '1', showPath: '/post_harvest_storage/postharvestBatchApproval', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/postharvestBatch/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/postharvestBatch/form.vue'),
        name: 'PostharvestBatchDetail',
        meta: { title: 'Postharvest Batch Detail', activeMenu: '/post_harvest_storage/postharvestBatch', showBack: '1', showPath: '/post_harvest_storage/postharvestBatch', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/postharvestBatch/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/postharvestBatch/form.vue'),
        name: 'PostharvestBatchEdit',
        meta: { title: 'Edit Post Harvest Batch', activeMenu: '/post_harvest_storage/postharvestBatch', showBack: '1', showPath: '/post_harvest_storage/postharvestBatch', noCache: true }
      }
    ]
  },
  {
    path: '/processing_value_addition/processingLicense/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/processingLicense/form.vue'),
        name: 'ProcessingLicenseAdd',
        meta: { title: 'Add Processing License', activeMenu: '/processing_value_addition/processingLicense', showBack: '1', showPath: '/processing_value_addition/processingLicense', noCache: true }
      }
    ]
  },
  {
    path: '/processing_value_addition/processingLicenseApproval/approve/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/processingLicenseApproval/form.vue'),
        name: 'ProcessingLicenseApprovalApprove',
        meta: { title: 'Approval Processing License', activeMenu: '/processing_value_addition/processingLicenseApproval', showBack: '1', showPath: '/processing_value_addition/processingLicenseApproval', noCache: true }
      }
    ]
  },
  {
    path: '/processing_value_addition/processingLicenseApproval/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/processingLicenseApproval/form.vue'),
        name: 'ProcessingLicenseApprovalDetail',
        meta: { title: 'Processing License Detail', activeMenu: '/processing_value_addition/processingLicenseApproval', showBack: '1', showPath: '/processing_value_addition/processingLicenseApproval', noCache: true }
      }
    ]
  },
  {
    path: '/processing_value_addition/processingLicense/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/processingLicense/form.vue'),
        name: 'ProcessingLicenseDetail',
        meta: { title: 'Processing License Detail', activeMenu: '/processing_value_addition/processingLicense', showBack: '1', showPath: '/processing_value_addition/processingLicense', noCache: true }
      }
    ]
  },
  {
    path: '/processing_value_addition/processingLicense/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/processingLicense/form.vue'),
        name: 'ProcessingLicenseEdit',
        meta: { title: 'Edit Processing License', activeMenu: '/processing_value_addition/processingLicense', showBack: '1', showPath: '/processing_value_addition/processingLicense', noCache: true }
      }
    ]
  },
  {
    path: '/processing_value_addition/processingLicenseReview/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/processingLicenseReview/form.vue'),
        name: 'ProcessingLicenseReviewDetail',
        meta: { title: 'Processing License Detail', activeMenu: '/processing_value_addition/processingLicenseReview', showBack: '1', showPath: '/processing_value_addition/processingLicenseReview', noCache: true }
      }
    ]
  },
  {
    path: '/processing_value_addition/processorProduct/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/processorProduct/form.vue'),
        name: 'ProcessorProductAdd',
        meta: { title: 'Add Processor Product', activeMenu: '/processing_value_addition/processorProduct', showBack: '1', showPath: '/processing_value_addition/processorProduct', noCache: true }
      }
    ]
  },
  {
    path: '/processing_value_addition/processorProduct/approve/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/processorProduct/form.vue'),
        name: 'ProcessorProductApprove',
        meta: { title: 'Verify Processor Product', activeMenu: '/processing_value_addition/processorProduct', showBack: '1', showPath: '/processing_value_addition/processorProduct', noCache: true }
      }
    ]
  },
  {
    path: '/processing_value_addition/processorProduct/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/processorProduct/form.vue'),
        name: 'ProcessorProductDetail',
        meta: { title: 'Processor Product Detail', activeMenu: '/processing_value_addition/processorProduct', showBack: '1', showPath: '/processing_value_addition/processorProduct', noCache: true }
      }
    ]
  },
  {
    path: '/processing_value_addition/processorProduct/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/processorProduct/form.vue'),
        name: 'ProcessorProductEdit',
        meta: { title: 'Edit Processor Product', activeMenu: '/processing_value_addition/processorProduct', showBack: '1', showPath: '/processing_value_addition/processorProduct', noCache: true }
      }
    ]
  },
  {
    path: '/processing_value_addition/qualityCertificate/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/qualityCertificate/form.vue'),
        name: 'QualityCertificateAdd',
        meta: { title: '添加质量认证证书', activeMenu: '/processing_value_addition/qualityCertificate', showBack: '1', showPath: '/processing_value_addition/qualityCertificate', noCache: true }
      }
    ]
  },
  {
    path: '/processing_value_addition/qualityCertificate/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/qualityCertificate/form.vue'),
        name: 'QualityCertificateEdit',
        meta: { title: '修改质量认证证书', activeMenu: '/processing_value_addition/qualityCertificate', showBack: '1', showPath: '/processing_value_addition/qualityCertificate', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/qualityGradeMaster/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/qualityGradeMaster/form.vue'),
        name: 'QualityGradeMasterAdd',
        meta: { title: 'Add Quality Grade Data', activeMenu: '/post_harvest_storage/qualityGradeMaster', showBack: '1', showPath: '/post_harvest_storage/qualityGradeMaster', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/qualityGradeMaster/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/qualityGradeMaster/form.vue'),
        name: 'QualityGradeMasterEdit',
        meta: { title: 'Edit Quality Grade Data', activeMenu: '/post_harvest_storage/qualityGradeMaster', showBack: '1', showPath: '/post_harvest_storage/qualityGradeMaster', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/qualityInspection/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/qualityInspection/form.vue'),
        name: 'QualityInspectionAdd',
        meta: { title: 'Add Quality Inspection', activeMenu: '/post_harvest_storage/qualityInspection', showBack: '1', showPath: '/post_harvest_storage/qualityInspection', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/qualityInspectionApproval/approve/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/qualityInspectionApproval/form.vue'),
        name: 'QualityInspectionApprovalApprove',
        meta: { title: 'Approve Quality Inspection', activeMenu: '/post_harvest_storage/qualityInspectionApproval', showBack: '1', showPath: '/post_harvest_storage/qualityInspectionApproval', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/qualityInspectionApproval/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/qualityInspectionApproval/form.vue'),
        name: 'QualityInspectionApprovalDetail',
        meta: { title: 'Quality Inspection Detail', activeMenu: '/post_harvest_storage/qualityInspectionApproval', showBack: '1', showPath: '/post_harvest_storage/qualityInspectionApproval', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/qualityInspection/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/qualityInspection/form.vue'),
        name: 'QualityInspectionDetail',
        meta: { title: 'Quality Inspection Detail', activeMenu: '/post_harvest_storage/qualityInspection', showBack: '1', showPath: '/post_harvest_storage/qualityInspection', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/qualityInspection/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/qualityInspection/form.vue'),
        name: 'QualityInspectionEdit',
        meta: { title: 'Edit Quality Inspection', activeMenu: '/post_harvest_storage/qualityInspection', showBack: '1', showPath: '/post_harvest_storage/qualityInspection', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/region/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/region/form.vue'),
        name: 'RegionAdd',
        meta: { title: 'Add Region', activeMenu: '/farmland_management/region', showBack: '1', showPath: '/farmland_management/region', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/region/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/region/form.vue'),
        name: 'RegionEdit',
        meta: { title: 'Edit Region', activeMenu: '/farmland_management/region', showBack: '1', showPath: '/farmland_management/region', noCache: true }
      }
    ]
  },
  {
    path: '/processing_value_addition/processingLicenseRenewal/renew/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/processingLicenseRenewal/form.vue'),
        name: 'RenewProcessingLicense',
        meta: { title: 'Processing License', activeMenu: '/processing_value_addition/processingLicenseRenewal', showBack: '1', showPath: '/processing_value_addition/processingLicenseRenewal', noCache: true }
      }
    ]
  },
  {
    path: '/processing_value_addition/processingLicenseReview/review/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/processingLicenseReview/form.vue'),
        name: 'ReviewProcessingLicense',
        meta: { title: 'Review Processing License', activeMenu: '/processing_value_addition/processingLicenseReview', showBack: '1', showPath: '/processing_value_addition/processingLicenseReview', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/seasonMaster/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/seasonMaster/form.vue'),
        name: 'SeasonMasterAdd',
        meta: { title: 'Add Season Master', activeMenu: '/farmland_management/seasonMaster', showBack: '1', showPath: '/farmland_management/seasonMaster', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/seasonMaster/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/seasonMaster/form.vue'),
        name: 'SeasonMasterEdit',
        meta: { title: 'Edit Season Master', activeMenu: '/farmland_management/seasonMaster', showBack: '1', showPath: '/farmland_management/seasonMaster', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/soilTypeMaster/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/soilTypeMaster/form.vue'),
        name: 'SoilTypeMasterAdd',
        meta: { title: 'Add Soil Type Master', activeMenu: '/farmland_management/soilTypeMaster', showBack: '1', showPath: '/farmland_management/soilTypeMaster', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/soilTypeMaster/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/soilTypeMaster/form.vue'),
        name: 'SoilTypeMasterEdit',
        meta: { title: 'Edit Soil Type Master', activeMenu: '/farmland_management/soilTypeMaster', showBack: '1', showPath: '/farmland_management/soilTypeMaster', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/sowing/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/sowing/form.vue'),
        name: 'SowingAdd',
        meta: { title: 'Add Sowing Record', activeMenu: '/farmland_management/sowing', showBack: '1', showPath: '/farmland_management/sowing', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/sowing_verified/approve/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/sowing_verified/form.vue'),
        name: 'SowingApprove',
        meta: { title: 'Approve Sowing Record', activeMenu: '/farmland_management/sowing_verified', showBack: '1', showPath: '/farmland_management/sowing_verified', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/sowing/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/sowing/form.vue'),
        name: 'SowingDetail',
        meta: { title: 'View Sowing Record', activeMenu: '/farmland_management/sowing', showBack: '1', showPath: '/farmland_management/sowing', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/sowing/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/sowing/form.vue'),
        name: 'SowingEdit',
        meta: { title: 'Edit Sowing Record', activeMenu: '/farmland_management/sowing', showBack: '1', showPath: '/farmland_management/sowing', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/croppingPlan_submit/submit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/croppingPlan_submit/form.vue'),
        name: 'SubmitCroppingPlan',
        meta: { title: 'Submit Cropping Plan', activeMenu: '/farmland_management/croppingPlan_submit', showBack: '1', showPath: '/farmland_management/croppingPlan_submit', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/village/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/village/form.vue'),
        name: 'VillageAdd',
        meta: { title: 'Add Village', activeMenu: '/farmland_management/village', showBack: '1', showPath: '/farmland_management/village', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/village/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/village/form.vue'),
        name: 'VillageEdit',
        meta: { title: 'Edit Village', activeMenu: '/farmland_management/village', showBack: '1', showPath: '/farmland_management/village', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/warehouseIntake/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/warehouseIntake/form.vue'),
        name: 'WarehouseIntakeAdd',
        meta: { title: 'Add Warehouse Intake', activeMenu: '/post_harvest_storage/warehouseIntake', showBack: '1', showPath: '/post_harvest_storage/warehouseIntake', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/warehouseIntake_approval/approve/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/warehouseIntake_approval/form.vue'),
        name: 'WarehouseIntakeApprovalApprove',
        meta: { title: 'Approve Warehouse Intake', activeMenu: '/post_harvest_storage/warehouseIntake_approval', showBack: '1', showPath: '/post_harvest_storage/warehouseIntake_approval', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/warehouseIntake_approval/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/warehouseIntake_approval/form.vue'),
        name: 'WarehouseIntakeApprovalDetail',
        meta: { title: 'Warehouse Intake Detail', activeMenu: '/post_harvest_storage/warehouseIntake_approval', showBack: '1', showPath: '/post_harvest_storage/warehouseIntake_approval', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/warehouseIntake/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/warehouseIntake/form.vue'),
        name: 'WarehouseIntakeDetail',
        meta: { title: 'Warehouse Intake Detail', activeMenu: '/post_harvest_storage/warehouseIntake', showBack: '1', showPath: '/post_harvest_storage/warehouseIntake', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/warehouseIntake/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/warehouseIntake/form.vue'),
        name: 'WarehouseIntakeEdit',
        meta: { title: 'Edit Warehouse Intake', activeMenu: '/post_harvest_storage/warehouseIntake', showBack: '1', showPath: '/post_harvest_storage/warehouseIntake', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/warehouseMaster/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/warehouseMaster/form.vue'),
        name: 'WarehouseMasterAdd',
        meta: { title: 'Add Warehouse Master Data', activeMenu: '/post_harvest_storage/warehouseMaster', showBack: '1', showPath: '/post_harvest_storage/warehouseMaster', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/warehouseMaster/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/warehouseMaster/form.vue'),
        name: 'WarehouseMasterEdit',
        meta: { title: 'Edit Warehouse Master Data', activeMenu: '/post_harvest_storage/warehouseMaster', showBack: '1', showPath: '/post_harvest_storage/warehouseMaster', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/warehouseReceipt/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/warehouseReceipt/form.vue'),
        name: 'WarehouseReceiptAdd',
        meta: { title: 'Add Warehouse Receipt', activeMenu: '/post_harvest_storage/warehouseReceipt', showBack: '1', showPath: '/post_harvest_storage/warehouseReceipt', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/warehouseReceiptApproval/approve/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/warehouseReceiptApproval/form.vue'),
        name: 'WarehouseReceiptApprovalApprove',
        meta: { title: 'Approve Warehouse Receipt', activeMenu: '/post_harvest_storage/warehouseReceiptApproval', showBack: '1', showPath: '/post_harvest_storage/warehouseReceiptApproval', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/warehouseReceiptApproval/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/warehouseReceiptApproval/form.vue'),
        name: 'WarehouseReceiptApprovalDetail',
        meta: { title: 'Warehouse Receipt Detail', activeMenu: '/post_harvest_storage/warehouseReceiptApproval', showBack: '1', showPath: '/post_harvest_storage/warehouseReceiptApproval', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/warehouseReceipt/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/warehouseReceipt/form.vue'),
        name: 'WarehouseReceiptDetail',
        meta: { title: 'Warehouse Receipt Detail', activeMenu: '/post_harvest_storage/warehouseReceipt', showBack: '1', showPath: '/post_harvest_storage/warehouseReceipt', noCache: true }
      }
    ]
  },
  {
    path: '/post_harvest_storage/warehouseReceipt/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/warehouseReceipt/form.vue'),
        name: 'WarehouseReceiptEdit',
        meta: { title: 'Edit Warehouse Receipt', activeMenu: '/post_harvest_storage/warehouseReceipt', showBack: '1', showPath: '/post_harvest_storage/warehouseReceipt', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/weatherIotData/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/weatherIotData/form.vue'),
        name: 'WeatherIotDataAdd',
        meta: { title: 'Add Weather Data', activeMenu: '/farmland_management/weatherIotData', showBack: '1', showPath: '/farmland_management/weatherIotData', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/weatherIotData_verify/approve/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/weatherIotData_verify/form.vue'),
        name: 'WeatherIotDataApprove',
        meta: { title: 'Approve Weather Data', activeMenu: '/farmland_management/weatherIotData_verify', showBack: '1', showPath: '/farmland_management/weatherIotData_verify', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/weatherIotData/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/weatherIotData/form.vue'),
        name: 'WeatherIotDataDetail',
        meta: { title: 'View Weather Data', activeMenu: '/farmland_management/weatherIotData', showBack: '1', showPath: '/farmland_management/weatherIotData', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/weatherIotData/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/weatherIotData/form.vue'),
        name: 'WeatherIotDataEdit',
        meta: { title: 'Edit Weather Data', activeMenu: '/farmland_management/weatherIotData', showBack: '1', showPath: '/farmland_management/weatherIotData', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/yieldEstimate/add',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/yieldEstimate/form.vue'),
        name: 'YieldEstimateAdd',
        meta: { title: 'Add Yield Estimate', activeMenu: '/farmland_management/yieldEstimate', showBack: '1', showPath: '/farmland_management/yieldEstimate', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/yieldEstimate_verify/approve/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/yieldEstimate_verify/form.vue'),
        name: 'YieldEstimateApprove',
        meta: { title: 'Approve Yield Estimate', activeMenu: '/farmland_management/yieldEstimate_verify', showBack: '1', showPath: '/farmland_management/yieldEstimate_verify', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/yieldEstimate/detail/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/yieldEstimate/form.vue'),
        name: 'YieldEstimateDetail',
        meta: { title: 'View Yield Estimate', activeMenu: '/farmland_management/yieldEstimate', showBack: '1', showPath: '/farmland_management/yieldEstimate', noCache: true }
      }
    ]
  },
  {
    path: '/farmland_management/yieldEstimate/edit/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/yieldEstimate/form.vue'),
        name: 'YieldEstimateEdit',
        meta: { title: 'Edit Yield Estimate', activeMenu: '/farmland_management/yieldEstimate', showBack: '1', showPath: '/farmland_management/yieldEstimate', noCache: true }
      }
    ]
  },

  {
    path: '/processing_value_addition/agroprocessor/review/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/agroprocessor/form.vue'),
        name: 'AgroprocessorReview',
        meta: { title: 'Review Agro Processor', activeMenu: '/processing_value_addition/agroprocessor', showBack: '1', showPath: '/processing_value_addition/agroprocessor', noCache: true }
      }
    ]
  },
  {
    path: '/processing_value_addition/processorProduct/review/:id',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        component: () => import('@/views/demo/processorProduct/form.vue'),
        name: 'ProcessorProductReview',
        meta: { title: 'Review Processor Product', activeMenu: '/processing_value_addition/processorProduct', showBack: '1', showPath: '/processing_value_addition/processorProduct', noCache: true }
      }
    ]
  },
];

// 动态路由，基于用户权限动态去加载
export const dynamicRoutes: RouteRecordRaw[] = [];

/**
 * 创建路由
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_APP_CONTEXT_PATH),
  routes: constantRoutes,
  // 刷新时，滚动条位置还原
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  }
});

export default router;


