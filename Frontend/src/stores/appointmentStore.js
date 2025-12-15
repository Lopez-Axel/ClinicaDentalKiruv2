import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { reservaService } from 'src/services/reservaService'
import { useAuthStore } from './authStore'

export const useReservaStore = defineStore('reserva', () => {
  const authStore = useAuthStore()

  const reservas = ref([])
  const selectedReserva = ref(null)
  const loading = ref(false)

  const reservasFiltradas = computed(() => {
    return reservas.value.filter(r => r.state === 'active')
  })

  const totalReservas = computed(() => reservasFiltradas.value.length)

  const reservasPendientes = computed(() => {
    return reservasFiltradas.value.filter(r => r.estado === 'pendiente').length
  })

  const reservasConfirmadas = computed(() => {
    return reservasFiltradas.value.filter(r => r.estado === 'confirmada').length
  })

  const cargarReservas = async () => {
    loading.value = true
    try {
      let response
      if (authStore.userRole === 'ADMIN') {
        response = await reservaService.getAllAdmin()
      } else {
        response = await reservaService.getAll()
      }
      reservas.value = response.data.data || []
    } catch (error) {
      console.error('Error cargando reservas:', error)
      reservas.value = []
      throw error
    } finally {
      loading.value = false
    }
  }

  const obtenerReservaPorId = async (id) => {
    loading.value = true
    try {
      const { data } = await reservaService.getById(id)
      return data.data
    } catch (error) {
      console.error('Error obteniendo reserva:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const actualizarReserva = async (id, reservaData) => {
    loading.value = true
    try {
      const { data } = await reservaService.update(id, reservaData)
      
      const index = reservas.value.findIndex(r => r.id === id)
      if (index > -1) {
        reservas.value[index] = data.data
      }

      return data.data
    } catch (error) {
      console.error('Error actualizando reserva:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const confirmarReserva = async (id) => {
    loading.value = true
    try {
      const { data } = await reservaService.confirmar(id)
      
      const index = reservas.value.findIndex(r => r.id === id)
      if (index > -1) {
        reservas.value[index] = data.data
      }

      return data.data
    } catch (error) {
      console.error('Error confirmando reserva:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const rechazarReserva = async (id, motivo) => {
    loading.value = true
    try {
      const { data } = await reservaService.rechazar(id, motivo)
      
      const index = reservas.value.findIndex(r => r.id === id)
      if (index > -1) {
        reservas.value[index] = data.data
      }

      return data.data
    } catch (error) {
      console.error('Error rechazando reserva:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const cancelarReserva = async (id) => {
    loading.value = true
    try {
      const { data } = await reservaService.cancelar(id)
      
      const index = reservas.value.findIndex(r => r.id === id)
      if (index > -1) {
        reservas.value[index] = data.data
      }

      return data.data
    } catch (error) {
      console.error('Error cancelando reserva:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const obtenerHorariosDisponibles = async (sucursalId, fechaReserva) => {
    loading.value = true
    try {
      const { data } = await reservaService.getHorariosDisponibles(sucursalId, fechaReserva)
      return data.data || []
    } catch (error) {
      console.error('Error obteniendo horarios disponibles:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const seleccionarReserva = (reserva) => {
    selectedReserva.value = { ...reserva }
  }

  const limpiarReservaSeleccionada = () => {
    selectedReserva.value = null
  }

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

  return {
    reservas,
    reservasFiltradas,
    totalReservas,
    reservasPendientes,
    reservasConfirmadas,
    selectedReserva,
    loading,

    cargarReservas,
    obtenerReservaPorId,
    actualizarReserva,
    confirmarReserva,
    rechazarReserva,
    cancelarReserva,
    obtenerHorariosDisponibles,

    seleccionarReserva,
    limpiarReservaSeleccionada,

    formatearFecha,
    formatearHora
  }
})