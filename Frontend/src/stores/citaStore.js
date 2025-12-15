import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Fuse from 'fuse.js'
import { citaService } from 'src/services/citaService'

const FUSE_OPTIONS = {
  keys: [
    'asunto',
    'tipo_cita',
    'notas',
    'estado'
  ],
  threshold: 0.3,
  includeScore: true,
  minMatchCharLength: 2
}

export const useCitaStore = defineStore('cita', () => {

  // State
  const citas = ref([])
  const searchQuery = ref('')
  const estadoFilter = ref(null)
  const tipoCitaFilter = ref(null)
  const dentistaFilter = ref(null)
  const selectedCita = ref(null)
  const loading = ref(false)
  let fuse = null

  // Getters Computed
  const citasFiltradas = computed(() => {
    let result = citas.value.filter(c => c.state === 1)

    if (estadoFilter.value) {
      result = result.filter(c => c.estado === estadoFilter.value)
    }

    if (tipoCitaFilter.value) {
      result = result.filter(c => c.tipo_cita === tipoCitaFilter.value)
    }

    if (dentistaFilter.value) {
      result = result.filter(c => c.dentista_id === dentistaFilter.value)
    }

    if (searchQuery.value.trim()) {
      const fuseResults = fuse.search(searchQuery.value)
      const matched = fuseResults.map(r => r.item.id)
      result = result.filter(c => matched.includes(c.id))
    }

    return result
  })

  const totalCitas = computed(() => citasFiltradas.value.length)

  const citasConfirmadas = computed(() => {
    return citas.value.filter(c => 
      c.state === 1 && c.estado === 'confirmada'
    ).length
  })

  const citasCompletadas = computed(() => {
    return citas.value.filter(c => 
      c.state === 1 && c.estado === 'completada'
    ).length
  })

  const citasProgramadas = computed(() => {
    return citas.value.filter(c => 
      c.state === 1 && c.estado === 'programada'
    ).length
  })

  const opcionesEstado = computed(() => [
    { label: 'Confirmada', value: 'confirmada' },
    { label: 'Programada', value: 'programada' },
    { label: 'Completada', value: 'completada' },
    { label: 'Cancelada', value: 'cancelada' }
  ])

  const opcionesTipoCita = computed(() => {
    const tipos = Array.from(
      new Set(
        citas.value.filter(c => c.state === 1).map(c => c.tipo_cita)
      )
    ).filter(Boolean).sort()
    
    return tipos.map(t => ({ label: t, value: t }))
  })

  // Inicializar Fuse
  const inicializarFuse = () => {
    fuse = new Fuse(
      citas.value.filter(c => c.state === 1),
      FUSE_OPTIONS
    )
  }

  const actualizarFuse = () => inicializarFuse()

  // CRUD Operations
  const cargarCitas = async () => {
    loading.value = true
    try {
      const { data } = await citaService.getAll()
      citas.value = data.data || []
      inicializarFuse()
    } catch (error) {
      console.error('Error cargando citas:', error)
      citas.value = []
      throw error
    } finally {
      loading.value = false
    }
  }

  const cargarCitasPorPaciente = async (pacienteId) => {
    loading.value = true
    try {
      const { data } = await citaService.getByPaciente(pacienteId)
      return data.data || []
    } catch (error) {
      console.error('Error cargando citas del paciente:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const cargarCitasPorDentista = async (dentistaId) => {
    loading.value = true
    try {
      const { data } = await citaService.getByDentista(dentistaId)
      citas.value = data.data || []
      inicializarFuse()
    } catch (error) {
      console.error('Error cargando citas del dentista:', error)
      citas.value = []
      throw error
    } finally {
      loading.value = false
    }
  }

  const cargarProximasCitas = async (dentistaId, limite = 5) => {
    loading.value = true
    try {
      const { data } = await citaService.getProximas(dentistaId, limite)
      return data.data || []
    } catch (error) {
      console.error('Error cargando próximas citas:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const agregarCita = async (nuevaCita) => {
    loading.value = true
    try {
      const { data } = await citaService.create(nuevaCita)
      citas.value.push(data.data)
      actualizarFuse()
      return data.data
    } catch (error) {
      console.error('Error agregando cita:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const actualizarCita = async (cita) => {
    loading.value = true
    try {
      const { data } = await citaService.update(cita.id, cita)
      
      const index = citas.value.findIndex(c => c.id === cita.id)
      if (index > -1) {
        citas.value[index] = data.data
      }

      actualizarFuse()
      return data.data
    } catch (error) {
      console.error('Error actualizando cita:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const cambiarEstadoCita = async (citaId, estado) => {
    loading.value = true
    try {
      const { data } = await citaService.cambiarEstado(citaId, estado)
      
      const index = citas.value.findIndex(c => c.id === citaId)
      if (index > -1) {
        citas.value[index] = data.data
      }

      actualizarFuse()
      return data.data
    } catch (error) {
      console.error('Error cambiando estado:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const completarCita = async (citaId) => {
    loading.value = true
    try {
      const { data } = await citaService.completar(citaId)
      
      const index = citas.value.findIndex(c => c.id === citaId)
      if (index > -1) {
        citas.value[index] = data.data
      }

      actualizarFuse()
      return data.data
    } catch (error) {
      console.error('Error completando cita:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const cancelarCita = async (citaId) => {
    loading.value = true
    try {
      const { data } = await citaService.cancelar(citaId)
      
      const index = citas.value.findIndex(c => c.id === citaId)
      if (index > -1) {
        citas.value[index] = data.data
      }

      actualizarFuse()
      return data.data
    } catch (error) {
      console.error('Error cancelando cita:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const eliminarCita = async (citaId) => {
    loading.value = true
    try {
      await citaService.delete(citaId)

      const index = citas.value.findIndex(c => c.id === citaId)
      if (index > -1) {
        citas.value[index].state = 0
      }

      actualizarFuse()
    } catch (error) {
      console.error('Error eliminando cita:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const obtenerHorariosDisponibles = async (sucursalId, fecha, dentistaId = null) => {
    loading.value = true
    try {
      const { data } = await citaService.getHorariosDisponibles(sucursalId, fecha, dentistaId)
      if (data && data.data) {
        return data.data
      }
      return { horarios_disponibles: [], horarios_ocupados: [] }
    } catch (error) {
      console.error('Error obteniendo horarios:', error)
      return { horarios_disponibles: [], horarios_ocupados: [] }
    } finally {
      loading.value = false
    }
  }

  const obtenerEstadisticas = async (dentistaId) => {
    loading.value = true
    try {
      const { data } = await citaService.getEstadisticas(dentistaId)
      return data.data
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Selección y filtros
  const seleccionarCita = (c) => {
    selectedCita.value = { ...c }
  }

  const limpiarCitaSeleccionada = () => {
    selectedCita.value = null
  }

  const establecerBusqueda = (q) => {
    searchQuery.value = q
  }

  const establecerFiltroEstado = (e) => {
    estadoFilter.value = e
  }

  const establecerFiltroTipoCita = (t) => {
    tipoCitaFilter.value = t
  }

  const establecerFiltroDentista = (d) => {
    dentistaFilter.value = d
  }

  const limpiarFiltros = () => {
    searchQuery.value = ''
    estadoFilter.value = null
    tipoCitaFilter.value = null
    dentistaFilter.value = null
  }

  // Helpers
  const formatearFecha = (d) => {
    if (!d) return 'Sin fecha'
    try {
      return new Date(d).toLocaleDateString('es-ES')
    } catch {
      return 'Inválida'
    }
  }

  const formatearHora = (h) => {
    if (!h) return '--:--'
    return h.substring(0, 5) // Toma solo HH:MM
  }

  return {
    citas,
    citasFiltradas,
    totalCitas,
    citasConfirmadas,
    citasCompletadas,
    citasProgramadas,
    opcionesEstado,
    opcionesTipoCita,
    searchQuery,
    estadoFilter,
    tipoCitaFilter,
    dentistaFilter,
    selectedCita,
    loading,

    cargarCitas,
    cargarCitasPorPaciente,
    cargarCitasPorDentista,
    cargarProximasCitas,
    agregarCita,
    actualizarCita,
    cambiarEstadoCita,
    completarCita,
    cancelarCita,
    eliminarCita,
    obtenerHorariosDisponibles,
    obtenerEstadisticas,

    seleccionarCita,
    limpiarCitaSeleccionada,

    establecerBusqueda,
    establecerFiltroEstado,
    establecerFiltroTipoCita,
    establecerFiltroDentista,
    limpiarFiltros,

    formatearFecha,
    formatearHora
  }
})