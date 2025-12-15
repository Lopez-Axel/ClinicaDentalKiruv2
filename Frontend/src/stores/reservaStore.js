// src/stores/reservaStore.js
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { reservaService } from 'src/services/reservaService'
import { servicioService } from 'src/services/servicioService'
import { sucursalService } from 'src/services/sucursalService'
import { dependienteService } from 'src/services/dependienteService'
import { useAuthStore } from 'src/stores/authStore'

export const useReserveStore = defineStore('reserva', () => {
  // ============================================
  // ESTADO - MODALES (única fuente de verdad)
  // ============================================
  
  const authStore = useAuthStore()
  
  // Control de modales (TODOS centralizados aquí)
  const showSelectionModal = ref(false)  // AppointmentModal (selección)
  const showFormModal = ref(false)       // NewAppointmentForm (formulario de pasos)
  const showHistoryModal = ref(false)    // AppointmentHistory (historial)
  
  // Estados de carga
  const cargandoNuevaReserva = ref(false)
  const cargandoHistorial = ref(false)

  // Datos
  const reservas = ref([])
  const dependientes = ref([])
  const servicios = ref([])
  const sucursales = ref([])
  
  // Nueva reserva (formulario)
  const nuevaReserva = ref({
    patientType: 'me',
    service: null,
    clinic: null,
    date: '',
    time: ''
  })

  const pacienteOtro = ref({
    nombreCompleto: '',
    genero: '',
    parentesco: '',
    telefono: ''
  })

  const currentStep = ref(0)
  const steps = ['Motivo', 'Clínica', 'Fecha y Hora', 'Validación']

  // ============================================
  // COMPUTED
  // ============================================
  
  // Mantener compatibilidad con código existente
  const modalAbierto = computed({
    get: () => showFormModal.value,
    set: (valor) => (showFormModal.value = valor)
  })

  const usuarioAutenticado = computed(() => authStore.isAuthenticated)
  const isAdmin = computed(() => authStore.userRole === 'ADMIN')

  // Reservas con información completa
  const reservasCompletas = computed(() => {
    return reservas.value.map(reserva => ({
      ...reserva,
      dependiente: reserva.dependiente_id 
        ? dependientes.value.find(d => d.id === reserva.dependiente_id)
        : null
    }))
  })

  // Filtrado de reservas activas
  const reservasFiltradas = computed(() => {
    return reservas.value.filter(r => r.state === 'active')
  })

  // Estadísticas
  const totalReservas = computed(() => reservasFiltradas.value.length)
  const reservasPendientes = computed(() => {
    return reservasFiltradas.value.filter(r => r.estado === 'pendiente').length
  })
  const reservasConfirmadas = computed(() => {
    return reservasFiltradas.value.filter(r => r.estado === 'confirmada').length
  })

  // ============================================
  // WATCHERS - Limpieza automática
  // ============================================
  
  // Cuando se cierra el formulario, resetear
  watch(showFormModal, (newValue) => {
    if (!newValue) {
      resetForm()
    }
  })

  // Cuando se abre el historial, cargar datos
  watch(showHistoryModal, async (newValue) => {
    if (newValue) {
      await cargarDatos()
    }
  })

  // ============================================
  // MÉTODOS - CARGA DE DATOS
  // ============================================
  
  const cargarDatos = async () => {
    if (!usuarioAutenticado.value) {
      console.warn('⚠️ Usuario no autenticado')
      reservas.value = []
      dependientes.value = []
      return
    }

    try {
      cargandoHistorial.value = true
      console.log('🔥 Cargando datos desde API...')
      
      // Si es ADMIN, cargar todas las reservas
      // Si es CLIENT, cargar solo las del usuario
      const reservasPromise = isAdmin.value 
        ? reservaService.getAllAdmin()
        : reservaService.getAll()

      // Cargar en paralelo
      const [reservasResponse, dependientesResponse] = await Promise.all([
        reservasPromise,
        dependienteService.getAll()
      ])

      reservas.value = reservasResponse.data.data || []
      dependientes.value = dependientesResponse.data.data || []
      
      console.log('✅ Datos cargados:', {
        reservas: reservas.value.length,
        dependientes: dependientes.value.length,
        rol: isAdmin.value ? 'ADMIN' : 'CLIENT'
      })
    } catch (error) {
      console.error('❌ Error cargando datos:', error)
      reservas.value = []
      dependientes.value = []
    } finally {
      cargandoHistorial.value = false
    }
  }

  // ============================================
  // MÉTODOS - CRUD RESERVAS
  // ============================================
  
  const crearReserva = async (datosReserva) => {
    try {
      cargandoNuevaReserva.value = true
      const response = await reservaService.create(datosReserva)
      const nuevaReservaCreada = response.data.data
      
      reservas.value.push(nuevaReservaCreada)
      console.log('✅ Reserva creada:', nuevaReservaCreada)
      
      return { success: true, data: nuevaReservaCreada }
    } catch (error) {
      console.error('❌ Error al crear reserva:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al crear la reserva' 
      }
    } finally {
      cargandoNuevaReserva.value = false
    }
  }

  const eliminarReserva = async (idReserva) => {
    try {
      await reservaService.delete(idReserva)
      reservas.value = reservas.value.filter(r => r.id !== idReserva)
      console.log('🗑️ Reserva eliminada:', idReserva)
      return { success: true }
    } catch (error) {
      console.error('❌ Error al eliminar reserva:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al eliminar la reserva' 
      }
    }
  }

  const hardDelete = async (idReserva) => {
    try {
      await reservaService.hardDelete(idReserva)
      reservas.value = reservas.value.filter(r => r.id !== idReserva)
      console.log('🗑️ Reserva eliminada permanentemente: ', idReserva)
      return { success: true }
    } catch (error) {
      console.error('❌ Error al eliminar reserva de forma permanente:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al eliminar la reserva' 
      }
    }
  }

  const cancelarReserva = async (idReserva) => {
    try {
      const response = await reservaService.cancelar(idReserva)
      const reservaActualizada = response.data.data
      
      // Actualizar en el array local
      const index = reservas.value.findIndex(r => r.id === idReserva)
      if (index !== -1) {
        reservas.value[index] = reservaActualizada
      }
      
      console.log('🚫 Reserva cancelada:', idReserva)
      return { success: true, data: reservaActualizada }
    } catch (error) {
      console.error('❌ Error al cancelar reserva:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al cancelar la reserva' 
      }
    }
  }

  // ============================================
  // MÉTODOS - ADMIN (NUEVOS)
  // ============================================
  
  const confirmarReserva = async (idReserva) => {
    if (!isAdmin.value) {
      console.warn('⚠️ Solo ADMIN puede confirmar reservas')
      return { success: false, message: 'No autorizado' }
    }

    try {
      const response = await reservaService.confirmar(idReserva)
      const reservaActualizada = response.data.data
      
      // Actualizar en el array local
      const index = reservas.value.findIndex(r => r.id === idReserva)
      if (index !== -1) {
        reservas.value[index] = reservaActualizada
      }
      
      console.log('✅ Reserva confirmada:', idReserva)
      return { success: true, data: reservaActualizada }
    } catch (error) {
      console.error('❌ Error al confirmar reserva:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al confirmar la reserva' 
      }
    }
  }

  const rechazarReserva = async (idReserva, motivo = '') => {
    if (!isAdmin.value) {
      console.warn('⚠️ Solo ADMIN puede rechazar reservas')
      return { success: false, message: 'No autorizado' }
    }

    try {
      const response = await reservaService.rechazar(idReserva, motivo)
      const reservaActualizada = response.data.data
      
      // Actualizar en el array local
      const index = reservas.value.findIndex(r => r.id === idReserva)
      if (index !== -1) {
        reservas.value[index] = reservaActualizada
      }
      
      console.log('❌ Reserva rechazada:', idReserva)
      return { success: true, data: reservaActualizada }
    } catch (error) {
      console.error('❌ Error al rechazar reserva:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al rechazar la reserva' 
      }
    }
  }

  const obtenerReservaPorId = async (id) => {
    try {
      const response = await reservaService.getById(id)
      return { success: true, data: response.data.data }
    } catch (error) {
      console.error('❌ Error al obtener reserva:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al obtener la reserva' 
      }
    }
  }

  const actualizarReserva = async (id, reservaData) => {
    try {
      const response = await reservaService.update(id, reservaData)
      const reservaActualizada = response.data.data
      
      const index = reservas.value.findIndex(r => r.id === id)
      if (index !== -1) {
        reservas.value[index] = reservaActualizada
      }

      console.log('📝 Reserva actualizada:', id)
      return { success: true, data: reservaActualizada }
    } catch (error) {
      console.error('❌ Error al actualizar reserva:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al actualizar la reserva' 
      }
    }
  }

  // ============================================
  // MÉTODOS - SERVICIOS Y SUCURSALES
  // ============================================

  const cargarServicios = async () => {
    try {
      const response = await servicioService.getAll()
      servicios.value = response.data || []
    } catch (error) {
      console.error('Error al cargar servicios:', error)
      servicios.value = []
    }
  }

  const cargarSucursales = async () => {
    try {
      const response = await sucursalService.getAll()
      sucursales.value = response.data || []
    } catch (error) {
      console.error('Error al cargar sucursales:', error)
      sucursales.value = []
    }
  }

  // ============================================
  // MÉTODOS - CRUD DEPENDIENTES
  // ============================================
  
  const crearDependiente = async (datosDependiente) => {
    try {
      const response = await dependienteService.create(datosDependiente)
      const nuevoDependiente = response.data.data
      
      dependientes.value.push(nuevoDependiente)
      console.log('👨‍👦 Dependiente creado:', nuevoDependiente)
      
      return { success: true, data: nuevoDependiente }
    } catch (error) {
      console.error('❌ Error al crear dependiente:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al crear el dependiente' 
      }
    }
  }

  // ============================================
  // MÉTODOS - HORARIOS DISPONIBLES
  // ============================================
  
  const obtenerHorariosDisponibles = async (sucursalId, fechaReserva) => {
    try {
      const response = await reservaService.getHorariosDisponibles(sucursalId, fechaReserva)
      if (response.data && response.data.data) {
        return response.data.data
      }
      return { horarios_disponibles: [], horarios_ocupados: [] }
    } catch (error) {
      console.error('Error obteniendo horarios:', error)
      return { horarios_disponibles: [], horarios_ocupados: [] }
    }
  }

  // ============================================
  // MÉTODOS - CONTROL DE MODALES
  // ============================================
  
  // Modal de selección (AppointmentModal)
  const abrirModalSeleccion = () => {
    if (!usuarioAutenticado.value) {
      console.warn('⚠️ Usuario debe autenticarse primero')
      return false
    }
    showSelectionModal.value = true
    return true
  }
  
  const cerrarModalSeleccion = () => {
    showSelectionModal.value = false
  }

  // Modal de formulario (NewAppointmentForm)
  const abrirModalFormulario = () => {
    if (!usuarioAutenticado.value) {
      console.warn('⚠️ Usuario debe autenticarse primero')
      return false
    }
    showFormModal.value = true
    return true
  }
  
  const cerrarModalFormulario = () => {
    showFormModal.value = false
  }

  // Modal de historial (AppointmentHistory)
  const abrirModalHistorial = () => {
    if (!usuarioAutenticado.value) {
      console.warn('⚠️ Usuario debe autenticarse primero')
      return false
    }
    showHistoryModal.value = true
    return true
  }
  
  const cerrarModalHistorial = () => {
    showHistoryModal.value = false
  }

  // Cerrar todos los modales
  const cerrarTodosLosModales = () => {
    showSelectionModal.value = false
    showFormModal.value = false
    showHistoryModal.value = false
  }

  // ============================================
  // MÉTODOS - FORMULARIO
  // ============================================

  const resetForm = () => {
    currentStep.value = 0
    nuevaReserva.value = { 
      patientType: 'me', 
      service: null, 
      clinic: null, 
      date: '', 
      time: '' 
    }
    pacienteOtro.value = { 
      nombreCompleto: '', 
      genero: '', 
      parentesco: '', 
      telefono: '' 
    }
  }

  const siguientePaso = () => { 
    if (currentStep.value < steps.length - 1) currentStep.value++ 
  }
  
  const pasoAnterior = () => { 
    if (currentStep.value > 0) currentStep.value-- 
  }

  const seleccionarServicio = (id) => { nuevaReserva.value.service = id }
  const seleccionarClinica = (id) => { nuevaReserva.value.clinic = id }

  // ============================================
  // MÉTODO PRINCIPAL - ENVIAR RESERVA
  // ============================================
  
  const enviarReserva = async () => {
    try {
      cargandoNuevaReserva.value = true

      let dependienteId = null

      // Si es para otro paciente, crear dependiente primero
      if (nuevaReserva.value.patientType === 'other') {
        const datosDependiente = {
          nombre_completo: pacienteOtro.value.nombreCompleto,
          genero: pacienteOtro.value.genero,
          parentesco: pacienteOtro.value.parentesco,
          telefono: pacienteOtro.value.telefono
        }
        
        const resultadoDependiente = await crearDependiente(datosDependiente)
        
        if (!resultadoDependiente.success) {
          throw new Error(resultadoDependiente.message)
        }
        
        dependienteId = resultadoDependiente.data.id
      }

      // Crear la reserva
      const datosReserva = {
        dependiente_id: dependienteId,
        servicio_id: nuevaReserva.value.service,
        sucursal_id: nuevaReserva.value.clinic,
        fecha_reserva: nuevaReserva.value.date,
        hora_reserva: nuevaReserva.value.time,
        notas: null
      }

      const resultado = await crearReserva(datosReserva)
      
      if (!resultado.success) {
        throw new Error(resultado.message)
      }

      cerrarModalFormulario()
      return { success: true }
      
    } catch (error) {
      console.error('❌ Error al enviar reserva:', error)
      return { 
        success: false, 
        message: error.message || 'Error al crear la reserva' 
      }
    } finally {
      cargandoNuevaReserva.value = false
    }
  }

  // ============================================
  // HELPERS
  // ============================================
  
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha'
    try {
      return new Date(fecha).toLocaleDateString('es-ES')
    } catch {
      return 'Inválida'
    }
  }

  const formatearHora = (hora) => {
    if (!hora) return '--:--'
    return hora.substring(0, 5)
  }

  // ============================================
  // COMPATIBILIDAD CON CÓDIGO EXISTENTE
  // ============================================
  
  const abrirModal = abrirModalFormulario
  const cerrarModal = cerrarModalFormulario

  // ============================================
  // INICIALIZACIÓN
  // ============================================
  
  // Cargar datos al inicializar el store (solo si está autenticado)
  if (usuarioAutenticado.value) {
    cargarDatos()
    cargarServicios()
    cargarSucursales()
  }

  // ============================================
  // RETORNO
  // ============================================
  
  return {
    // Estado de modales
    showSelectionModal,
    showFormModal,
    showHistoryModal,
    
    // Estados de carga
    cargandoNuevaReserva,
    cargandoHistorial,
    usuarioAutenticado,
    isAdmin,
    
    // Datos
    reservas,
    dependientes,
    reservasCompletas,
    reservasFiltradas,
    servicios,
    sucursales,
    
    // Estadísticas
    totalReservas,
    reservasPendientes,
    reservasConfirmadas,
    
    // Formulario
    nuevaReserva,
    pacienteOtro,
    currentStep,
    steps,
    
    // Métodos de datos
    cargarDatos,
    crearReserva,
    eliminarReserva,
    hardDelete,
    cancelarReserva,
    crearDependiente,
    obtenerHorariosDisponibles,
    cargarServicios,
    cargarSucursales,
    
    // Métodos ADMIN (nuevos)
    confirmarReserva,
    rechazarReserva,
    obtenerReservaPorId,
    actualizarReserva,
    
    // Métodos de control de modales
    abrirModalSeleccion,
    cerrarModalSeleccion,
    abrirModalFormulario,
    cerrarModalFormulario,
    abrirModalHistorial,
    cerrarModalHistorial,
    cerrarTodosLosModales,
    
    // Métodos de formulario
    resetForm,
    siguientePaso,
    pasoAnterior,
    seleccionarServicio,
    seleccionarClinica,
    enviarReserva,
    
    // Helpers
    formatearFecha,
    formatearHora,
    
    // Compatibilidad con código existente
    modalAbierto,
    abrirModal,
    cerrarModal
  }
})