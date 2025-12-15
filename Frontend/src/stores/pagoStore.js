// Frontend/src/stores/pagoStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { pagoService } from 'src/services/pagoService'

export const usePagoStore = defineStore('pago', () => {

  // ============================================
  // STATE
  // ============================================
  
  const pagos = ref([])
  const pagosPorPieza = ref({}) // Objeto indexado por id_pieza
  const resumenPaciente = ref(null)
  const resumenOdontograma = ref(null)
  const pagoSeleccionado = ref(null)
  const loading = ref(false)
  const loadingPago = ref(false)

  // ============================================
  // GETTERS COMPUTED
  // ============================================
  
  const tienePagos = computed(() => pagos.value.length > 0)
  
  // Total pagado (solo pagos completados)
  const totalPagado = computed(() => {
    return pagos.value
      .filter(p => p.estado === 'completado')
      .reduce((sum, pago) => sum + parseFloat(pago.monto || 0), 0)
  })

  // Total pendiente de todos los pagos
  const totalPendiente = computed(() => {
    return pagos.value.reduce((sum, pago) => sum + parseFloat(pago.monto_pendiente || 0), 0)
  })

  // Total general (pagado + pendiente)
  const totalGeneral = computed(() => {
    return totalPagado.value + totalPendiente.value
  })

  // Obtener pagos de una pieza específica
  const getPagosPorPieza = (idPieza) => {
    return pagosPorPieza.value[idPieza] || []
  }

  // Calcular totales por pieza
  const getTotalesPieza = (idPieza, precioPieza = 0) => {
    const pagosPieza = getPagosPorPieza(idPieza)
    console.log('Pagos por Pieza', pagosPieza)
    const pagado = pagosPieza
      .filter(p => p.estado === 'completado')
      .reduce((sum, p) => sum + parseFloat(p.monto || 0), 0)
    
    const pendiente = parseFloat(precioPieza) - pagado
    
    return {
      precio_total: parseFloat(precioPieza),
      total_pagado: pagado,
      total_pendiente: pendiente > 0 ? pendiente : 0,
      porcentaje_pagado: precioPieza > 0 ? (pagado / precioPieza * 100).toFixed(2) : 0
    }
  }

  // ============================================
  // CARGAR PAGOS
  // ============================================

  /**
   * Carga todos los pagos de un paciente (a través de su odontograma)
   */
  const cargarPagosPorPaciente = async (ci) => {
    loading.value = true
    try {
      const response = await pagoService.getByPaciente(ci)
      pagos.value = response.data || []
      
      // Indexar pagos por pieza
      organizarPagosPorPieza()
      
      console.log('Pagos del paciente cargados:', pagos.value.length)
    } catch (error) {
      console.error('Error cargando pagos del paciente:', error)
      pagos.value = []
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Carga pagos de un odontograma específico
   */
  const cargarPagosPorOdontograma = async (idOdontograma) => {
    loading.value = true
    try {
      const response = await pagoService.getByOdontograma(idOdontograma)
      pagos.value = response.data || []
      
      organizarPagosPorPieza()
      
      console.log('Pagos del odontograma cargados:', pagos.value.length)
    } catch (error) {
      console.error('Error cargando pagos del odontograma:', error)
      pagos.value = []
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Carga pagos de una pieza específica
   */
  const cargarPagosPorPieza = async (idPieza) => {
    loadingPago.value = true
    try {
      const response = await pagoService.getByPieza(idPieza)
      const pagosPieza = response.data || []
      
      pagosPorPieza.value[idPieza] = pagosPieza
      
      // También actualizar en el array principal
      pagosPieza.forEach(pago => {
        const index = pagos.value.findIndex(p => p.id === pago.id)
        if (index === -1) {
          pagos.value.push(pago)
        } else {
          pagos.value[index] = pago
        }
      })
      
      return pagosPieza
    } catch (error) {
      console.error('Error cargando pagos de la pieza:', error)
      throw error
    } finally {
      loadingPago.value = false
    }
  }

  /**
   * Organiza los pagos indexados por id_pieza
   */
  const organizarPagosPorPieza = () => {
    pagosPorPieza.value = {}
    pagos.value.forEach(pago => {
      if (!pagosPorPieza.value[pago.id_pieza]) {
        pagosPorPieza.value[pago.id_pieza] = []
      }
      pagosPorPieza.value[pago.id_pieza].push(pago)
    })
  }

  // ============================================
  // RESÚMENES
  // ============================================

  /**
   * Obtiene resumen de pagos por paciente
   */
  const cargarResumenPaciente = async (ci) => {
    loading.value = true
    try {
      const response = await pagoService.getResumenPaciente(ci)
      resumenPaciente.value = response.data || null
      return resumenPaciente.value
    } catch (error) {
      console.error('Error cargando resumen del paciente:', error)
      resumenPaciente.value = null
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene resumen de pagos por odontograma
   */
  const cargarResumenOdontograma = async (idOdontograma) => {
    loading.value = true
    try {
      const response = await pagoService.getResumenOdontograma(idOdontograma)
      resumenOdontograma.value = response.data || null
      return resumenOdontograma.value
    } catch (error) {
      console.error('Error cargando resumen del odontograma:', error)
      resumenOdontograma.value = null
      throw error
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // PAGO CRUD
  // ============================================

  /**
   * Crea un nuevo pago
   * Validaciones:
   * - monto > 0
   * - monto <= monto_pendiente de la pieza
   */
  const crearPago = async (datosPago, precioPieza) => {
    loadingPago.value = true
    try {
      // Validar monto
      const monto = parseFloat(datosPago.monto)
      if (monto <= 0) {
        throw new Error('El monto debe ser mayor a 0')
      }

      // Calcular totales actuales de la pieza
      const totales = getTotalesPieza(datosPago.id_pieza, precioPieza)
      
      if (monto > totales.total_pendiente) {
        throw new Error(`El monto excede el saldo pendiente (Bs. ${totales.total_pendiente.toFixed(2)})`)
      }

      // Calcular nuevo pendiente
      const nuevoPendiente = totales.total_pendiente - monto
      
      // Determinar estado automáticamente
      const estado = nuevoPendiente <= 0 ? 'completado' : 'pendiente'

      const nuevoPago = {
        id_pieza: datosPago.id_pieza,
        monto: monto,
        monto_pendiente: nuevoPendiente,
        tipo_pago: datosPago.tipo_pago || 'efectivo',
        stripe_payment_intent_id: null,
        estado: estado,
        notas: datosPago.notas || ''
      }

      const response = await pagoService.create(nuevoPago)
      const pagoCreado = response.data
      
      // Agregar a los arrays
      pagos.value.push(pagoCreado)
      
      if (!pagosPorPieza.value[datosPago.id_pieza]) {
        pagosPorPieza.value[datosPago.id_pieza] = []
      }
      pagosPorPieza.value[datosPago.id_pieza].push(pagoCreado)
      
      console.log('Pago creado:', pagoCreado)
      return pagoCreado
    } catch (error) {
      console.error('Error creando pago:', error)
      throw error
    } finally {
      loadingPago.value = false
    }
  }

  /**
   * Actualiza un pago existente
   */
  const actualizarPago = async (idPago, datosPago) => {
    loadingPago.value = true
    try {
      const response = await pagoService.update(idPago, datosPago)
      const pagoActualizado = response.data

      // Actualizar en array principal
      const index = pagos.value.findIndex(p => p.id === idPago)
      if (index > -1) {
        pagos.value[index] = pagoActualizado
      }

      // Actualizar en pagosPorPieza
      if (pagosPorPieza.value[pagoActualizado.id_pieza]) {
        const indexPieza = pagosPorPieza.value[pagoActualizado.id_pieza].findIndex(p => p.id === idPago)
        if (indexPieza > -1) {
          pagosPorPieza.value[pagoActualizado.id_pieza][indexPieza] = pagoActualizado
        }
      }

      return pagoActualizado
    } catch (error) {
      console.error('Error actualizando pago:', error)
      throw error
    } finally {
      loadingPago.value = false
    }
  }

  /**
   * Actualiza solo el estado de un pago
   */
  const actualizarEstadoPago = async (idPago, estado) => {
    loadingPago.value = true
    try {
      const response = await pagoService.updateEstado(idPago, estado)
      const pagoActualizado = response.data

      // Actualizar en arrays
      const index = pagos.value.findIndex(p => p.id === idPago)
      if (index > -1) {
        pagos.value[index] = pagoActualizado
      }

      if (pagosPorPieza.value[pagoActualizado.id_pieza]) {
        const indexPieza = pagosPorPieza.value[pagoActualizado.id_pieza].findIndex(p => p.id === idPago)
        if (indexPieza > -1) {
          pagosPorPieza.value[pagoActualizado.id_pieza][indexPieza] = pagoActualizado
        }
      }

      return pagoActualizado
    } catch (error) {
      console.error('Error actualizando estado del pago:', error)
      throw error
    } finally {
      loadingPago.value = false
    }
  }

  /**
   * Elimina un pago (soft delete)
   */
  const eliminarPago = async (idPago) => {
    loadingPago.value = true
    try {
      await pagoService.delete(idPago)
      
      // Remover de arrays
      const pago = pagos.value.find(p => p.id === idPago)
      if (pago) {
        pagos.value = pagos.value.filter(p => p.id !== idPago)
        
        if (pagosPorPieza.value[pago.id_pieza]) {
          pagosPorPieza.value[pago.id_pieza] = pagosPorPieza.value[pago.id_pieza].filter(p => p.id !== idPago)
        }
      }
      
      if (pagoSeleccionado.value?.id === idPago) {
        pagoSeleccionado.value = null
      }
    } catch (error) {
      console.error('Error eliminando pago:', error)
      throw error
    } finally {
      loadingPago.value = false
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  const seleccionarPago = (pago) => {
    pagoSeleccionado.value = pago
  }

  const limpiarPagoSeleccionado = () => {
    pagoSeleccionado.value = null
  }

  const limpiarPagos = () => {
    pagos.value = []
    pagosPorPieza.value = {}
    resumenPaciente.value = null
    resumenOdontograma.value = null
    pagoSeleccionado.value = null
  }

  /**
   * Formatea un monto a bolivianos
   */
  const formatearMonto = (monto) => {
    return `Bs. ${parseFloat(monto || 0).toFixed(2)}`
  }

  /**
   * Formatea una fecha
   */
  const formatearFecha = (fecha) => {
    if (!fecha) return '--'
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } catch {
      return '--'
    }
  }

  /**
   * Obtiene el color según el estado del pago
   */
  const getColorEstado = (estado) => {
    const colores = {
      completado: 'positive',
      pendiente: 'warning',
      cancelado: 'negative'
    }
    return colores[estado] || 'grey'
  }

  /**
   * Obtiene el ícono según el método de pago
   */
  const getIconoMetodoPago = (metodoPago) => {
    const iconos = {
      efectivo: 'payments',
      stripe: 'credit_card',
      transferencia: 'account_balance',
      qr: 'qr_code'
    }
    return iconos[metodoPago] || 'attach_money'
  }

  return {
    // State
    pagos,
    pagosPorPieza,
    resumenPaciente,
    resumenOdontograma,
    pagoSeleccionado,
    loading,
    loadingPago,

    // Getters
    tienePagos,
    totalPagado,
    totalPendiente,
    totalGeneral,
    getPagosPorPieza,
    getTotalesPieza,

    // Cargar pagos
    cargarPagosPorPaciente,
    cargarPagosPorOdontograma,
    cargarPagosPorPieza,
    cargarResumenPaciente,
    cargarResumenOdontograma,

    // CRUD
    crearPago,
    actualizarPago,
    actualizarEstadoPago,
    eliminarPago,

    // Helpers
    seleccionarPago,
    limpiarPagoSeleccionado,
    limpiarPagos,
    formatearMonto,
    formatearFecha,
    getColorEstado,
    getIconoMetodoPago
  }
})