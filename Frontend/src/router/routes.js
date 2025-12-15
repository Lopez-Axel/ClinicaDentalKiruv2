// router/routes.js
import MainLayout from 'layouts/MainLayout.vue'
import DashboardLayout from 'layouts/DashboardLayout.vue'

/**
 * Define qué secciones puede ver cada rol
 * Esto se usa para filtrar el menú de navegación dinámicamente
 */
export const rolePermissions = {
  DENTIST: ['dashboard', 'patients', 'reserves', 'calendar', 'odontogram', 'quotes', 'historyQuotes'],
  CLIENT: ['dashboard', 'reserves'],
  ADMIN: ['dashboard', 'users', 'dentist', 'specialties', 'announcements', 'branches', 'patients', 'reserves', 'quotes', 'historyQuotes', 'calendar', 'odontogram', 'statistics', 'purchase', 'servicio']
}

/**
 * Configuración del menú del dashboard por rol
 * Esto define qué items aparecen en el sidebar
 */
export const dashboardMenuConfig = {
  ADMIN: [
    {
      title: 'Panel Principal',
      icon: 'dashboard',
      to: '/dashboard',
      permission: 'dashboard'
    },
    {
      title: 'Gestión',
      icon: 'settings',
      children: [
        { title: 'Usuarios', icon: 'people', to: '/users', permission: 'users' },
        { title: 'Dentistas', icon: 'medical_services', to: '/dentist', permission: 'dentist' },
        { title: 'Especialidades', icon: 'school', to: '/specialties', permission: 'specialties' },
        { title: 'Anuncios', icon: 'article', to: '/announcement', permission: 'announcements' },
        { title: 'Sucursales', icon: 'business', to: '/branches', permission: 'branches' },
        { title: 'Servicios', icon: 'medical_services', to: '/servicio', permission: 'servicio' }
      ]
    },
    {
      title: 'Pacientes',
      icon: 'person',
      to: '/patients',
      permission: 'patients'
    },
    {
      title: 'Reservas',
      icon: 'event',
      to: '/reserves',
      permission: 'reserves'
    },
    {
      title: 'Calendario',
      icon: 'calendar_month',
      children: [
        { title: 'Vista Mensual', icon: 'calendar_view_month', to: '/Calendar-Month', permission: 'calendar' },
        { title: 'Vista Semanal', icon: 'calendar_view_week', to: '/Calendar-Week', permission: 'calendar' },
        { title: 'Vista Diaria', icon: 'calendar_view_day', to: '/Calendar-Day', permission: 'calendar' }
      ]
    },
    {
      title: 'Tratamientos',
      icon: 'healing',
      children: [
        { title: 'Cotizaciones', icon: 'attach_money', to: '/quotes', permission: 'quotes' },
        { title: 'Historial', icon: 'history', to: '/HistoryQuotes', permission: 'historyQuotes' },
        { title: 'Odontograma', icon: 'emoji_emotions', to: '/Odontogram', permission: 'odontogram' }
      ]
    },
    {
      title: 'Estadísticas',
      icon: 'bar_chart',
      to: '/Statistics',
      permission: 'statistics'
    },
    {
      title: 'Pagos',
      icon: 'payment',
      to: '/purchase',
      permission: 'purchase'
    }
  ],
  DENTIST: [
    {
      title: 'Panel Principal',
      icon: 'dashboard',
      to: '/dashboard',
      permission: 'dashboard'
    },
    {
      title: 'Pacientes',
      icon: 'person',
      to: '/patients',
      permission: 'patients'
    },
    {
      title: 'Reservas',
      icon: 'event',
      to: '/reserves',
      permission: 'reserves'
    },
    {
      title: 'Calendario',
      icon: 'calendar_month',
      children: [
        { title: 'Vista Mensual', icon: 'calendar_view_month', to: '/Calendar-Month', permission: 'calendar' },
        { title: 'Vista Semanal', icon: 'calendar_view_week', to: '/Calendar-Week', permission: 'calendar' },
        { title: 'Vista Diaria', icon: 'calendar_view_day', to: '/Calendar-Day', permission: 'calendar' },
        { title: 'Servicios', icon: 'medical_services', to: '/servicios', permission: 'services' }
      ]
    },
    {
      title: 'Tratamientos',
      icon: 'healing',
      children: [
        { title: 'Cotizaciones', icon: 'attach_money', to: '/quotes', permission: 'quotes' },
        { title: 'Historial', icon: 'history', to: '/HistoryQuotes', permission: 'historyQuotes' },
        { title: 'Odontograma', icon: 'emoji_emotions', to: '/Odontogram', permission: 'odontogram' }
      ]
    }
  ],
  CLIENT: [
    {
      title: 'Panel Principal',
      icon: 'dashboard',
      to: '/dashboard',
      permission: 'dashboard'
    },
    {
      title: 'Mis Reservas',
      icon: 'event',
      to: '/reserves',
      permission: 'reserves'
    }
  ]
}

const routes = [
  // ============================================
  // RUTAS PÚBLICAS (MainLayout)
  // ============================================
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('pages/IndexPage.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'about',
        name: 'About',
        component: () => import('pages/AboutPage.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'faq',
        name: 'FAQ',
        component: () => import('pages/FAQPage.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'contact',
        name: 'Contact',
        component: () => import('pages/ContactPage.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'services',
        name: 'Services',
        component: () => import('pages/ServicesPage.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'branch',
        name: 'Branch',
        component: () => import('pages/BranchPage.vue'),
        meta: { requiresAuth: false }
      }
    ]
  },

  // ============================================
  // RUTAS DE AUTENTICACIÓN
  // ============================================
  {
    path: '/login',
    name: 'Login',
    component: () => import('pages/Auth/LoginPage.vue'),
    meta: {
      requiresAuth: false,
      redirectIfAuthenticated: true // Redirigir al dashboard si ya está logueado
    }
  },

  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('pages/Auth/AuthCallback.vue'),
    meta: {
      requiresAuth: false,
      redirectIfAuthenticated: true // Redirigir al dashboard si ya está logueado
    }
  },
  // ============================================
  // RUTAS PRIVADAS (DashboardLayout)
  // ============================================
  {
    path: '/dashboard',
    component: DashboardLayout,
    meta: {
      requiresAuth: true,
      roles: ['ADMIN', 'DENTIST', 'CLIENT']
    },
    children: [
      // DASHBOARD - Todos los usuarios autenticados
      {
        path: '',
        name: 'Dashboard',
        component: () => import('pages/DashboardPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['DENTIST', 'CLIENT', 'ADMIN'],
          title: 'Panel Principal'
        }
      },

      // GESTIÓN - Solo ADMIN
      {
        path: '/users',
        name: 'Users',
        component: () => import('pages/User/UserPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ADMIN'],
          title: 'Gestión de Usuarios'
        }
      },
      {
        path: '/dentist',
        name: 'Dentists',
        component: () => import('pages/Dentist/DentistPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ADMIN'],
          title: 'Gestión de Dentistas'
        }
      },
      {
        path: '/specialties',
        name: 'Specialties',
        component: () => import('pages/Specialties/SpecialityPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ADMIN'],
          title: 'Especialidades'
        }
      },
      {
        path: '/Announcement',
        name: 'Announcements',
        component: () => import('pages/Announcement/AnnouncementPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ADMIN'],
          title: 'Anuncios'
        }
      },
      {
        path: '/branches',
        name: 'Branches',
        component: () => import('pages/Branch/BranchPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ADMIN'],
          title: 'Sucursales'
        }
      },

      // PACIENTES - DENTIST y ADMIN
      {
        path: '/patients',
        name: 'Patients',
        component: () => import('pages/Patient/PatientPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['DENTIST', 'ADMIN'],
          title: 'Pacientes'
        }
      },

      // RESERVAS - Todos los autenticados
      {
        path: '/reserves',
        name: 'Reserves',
        component: () => import('pages/Reserve/ReservePage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['DENTIST', 'CLIENT', 'ADMIN'],
          title: 'Reservas'
        }
      },

      // COTIZACIONES - Todos los autenticados
      {
        path: '/quotes',
        name: 'Quotes',
        component: () => import('pages/quotes/QuotesPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['DENTIST', 'ADMIN'],
          title: 'Cotizaciones'
        }
      },
      {
        path: '/HistoryQuotes',
        name: 'HistoryQuotes',
        component: () => import('pages/HistoryQuotes/HistoryQuotesPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['DENTIST', 'ADMIN'],
          title: 'Historial de Cotizaciones'
        }
      },

      // CALENDARIO - DENTIST y ADMIN
      {
        path: '/Calendar-Month',
        name: 'CalendarMonth',
        component: () => import('pages/Calendar/CalendarMonthPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['DENTIST', 'ADMIN'],
          title: 'Calendario Mensual'
        }
      },
      {
        path: '/Calendar-Week',
        name: 'CalendarWeek',
        component: () => import('pages/Calendar/CalendarWeekPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['DENTIST', 'ADMIN'],
          title: 'Calendario Semanal'
        }
      },
      {
        path: '/Calendar-Day',
        name: 'CalendarDay',
        component: () => import('pages/Calendar/CalendarDayPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['DENTIST', 'ADMIN'],
          title: 'Calendario Diario'
        }
      },

      // ODONTOGRAMA - DENTIST y ADMIN
      {
        path: '/Odontogram',
        name: 'Odontogram',
        component: () => import('pages/Odontogram/OdontogramPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['DENTIST', 'ADMIN'],
          title: 'Odontograma'
        }
      },

      // PAGOS - CLIENT y ADMIN
      {
        path: '/purchase',
        name: 'Purchase',
        component: () => import('pages/Purchase/PurchasePage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['CLIENT', 'ADMIN'],
          title: 'Pagos'
        }
      },

      // ESTADÍSTICAS - Solo ADMIN
      {
        path: '/Statistics',
        name: 'Statistics',
        component: () => import('pages/Stadistic/StadisticsPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ADMIN'],
          title: 'Estadísticas'
        }
      },
      // SERVICIOS - Solo ADMIN
      {
        path: '/servicio',
        name: 'ServicioAdmin',
        component: () => import('pages/Service/ServicioPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ADMIN'],  // solo admins pueden acceder
          title: 'Gestión de Servicios'
        }
      }

    ]
  },

  // ============================================
  // PÁGINAS ESPECIALES
  // ============================================
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('pages/UnauthorizedPage.vue'),
    meta: {
      requiresAuth: false,
      title: 'Acceso Denegado'
    }
  },

  // ============================================
  // 404 - Siempre al final
  // ============================================
  {
    path: '/:catchAll(.*)*',
    name: 'NotFound',
    component: () => import('pages/ErrorNotFound.vue'),
    meta: { title: 'Página No Encontrada' }
  }
]

export default routes