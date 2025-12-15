import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { odontogramaService } from 'src/services/odontogramaService'
import { piezaService } from 'src/services/piezaService'
import { caraService } from 'src/services/caraService'

export const useOdontogramStore = defineStore('odontogram', () => {

  // ============================================
  // STATE
  // ============================================
  
  const odontogramaActual = ref(null)
  const piezas = ref([])
  const caras = ref({}) // Objeto indexado por id_pieza
  const piezaSeleccionada = ref(null)
  const loading = ref(false)
  const loadingPieza = ref(false)

  // ============================================
  // GETTERS COMPUTED
  // ============================================
  
  const tienePiezas = computed(() => piezas.value.length > 0)
  
  const precioTotal = computed(() => {
    return piezas.value.reduce((sum, pieza) => sum + parseFloat(pieza.precio || 0), 0)
  })

  const piezasPorNumero = computed(() => {
    const map = {}
    piezas.value.forEach(pieza => {
      map[pieza.numero] = pieza
    })
    return map
  })

  const getPiezaPorNumero = (numero) => {
    const pieza = piezas.value.find(p => p.numero === numero)
    return pieza
  }

  const getCarasDePieza = (idPieza) => {
    return caras.value[idPieza] || []
  }

  // ============================================
  // ODONTOGRAMA CRUD
  // ============================================

  /**
   * Carga el odontograma de un paciente
   * Si no existe, lo crea automáticamente
   */
  const cargarOdontogramaPorPaciente = async (ci) => {
    loading.value = true
    try {
      const response = await odontogramaService.getByPaciente(ci)
      const odontogramas = response.data

      if (odontogramas && odontogramas.length > 0) {
        // Ya existe un odontograma
        odontogramaActual.value = odontogramas[0]
        await cargarPiezasYCaras(odontogramaActual.value.id)
      } else {
        // No existe, crear automáticamente
        await crearOdontogramaAutomatico(ci)
      }
    } catch (error) {
      console.error('Error cargando odontograma:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Crea un odontograma automáticamente con valores por defecto
   */
  const crearOdontogramaAutomatico = async (ci) => {
    try {
      const nuevoOdontograma = {
        paciente_ci: ci,
        tipo_denticion: 'Permanente',
        diagnostico_general: '',
        plan_tratamiento: '',
        notas: ''
      }

      const response = await odontogramaService.create(nuevoOdontograma)
      odontogramaActual.value = response.data
      piezas.value = []
      caras.value = {}
      
      console.log('Odontograma creado automáticamente:', odontogramaActual.value)
    } catch (error) {
      console.error('Error creando odontograma automático:', error)
      throw error
    }
  }

  /**
   * Actualiza los campos del odontograma actual
   */
  const actualizarOdontograma = async (datos) => {
    if (!odontogramaActual.value) return

    loading.value = true
    try {
      const response = await odontogramaService.update(odontogramaActual.value.id, datos)
      odontogramaActual.value = response.data
      return response.data
    } catch (error) {
      console.error('Error actualizando odontograma:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // PIEZAS Y CARAS - CARGA
  // ============================================

  /**
   * Carga todas las piezas y caras del odontograma
   */
  const cargarPiezasYCaras = async (idOdontograma) => {
    try {
      // Cargar piezas
      const responsePiezas = await piezaService.getByOdontograma(idOdontograma)
      piezas.value = responsePiezas.data || []

      // Cargar caras de cada pieza
      caras.value = {}
      for (const pieza of piezas.value) {
        const responseCaras = await caraService.getByPieza(pieza.id)
        caras.value[pieza.id] = responseCaras.data || []
      }

      console.log('Piezas cargadas:', piezas.value.length)
    } catch (error) {
      console.error('Error cargando piezas y caras:', error)
      throw error
    }
  }

  // ============================================
  // PIEZA CRUD
  // ============================================

  /**
   * Verifica si una pieza existe y la retorna, si no existe la crea
   */
  const obtenerOCrearPieza = async (numero, posicion) => {
    loadingPieza.value = true
    try {
      // Verificar si ya existe
      let pieza = getPiezaPorNumero(numero)
      
      if (pieza) {
        // Ya existe, cargar caras
        if (!caras.value[pieza.id]) {
          const responseCaras = await caraService.getByPieza(pieza.id)
          caras.value[pieza.id] = responseCaras.data || []
        }
        piezaSeleccionada.value = pieza
        return pieza
      }

      // No existe, crear pieza base
      const imageTooth = posicion === 'up' ? 'tooth_up.png' : 'tooth_down.png'
      
      const nuevaPieza = {
        id_odontograma: odontogramaActual.value.id,
        numero: numero,
        denticion: 'permanente',
        estado_general: 'enfermo',
        precio: 0.00,
        diagnostico: '',
        image_tooth: imageTooth,
        simbolo: null,
        notas_simbolo: ''
      }

      const response = await piezaService.create(nuevaPieza)
      const piezaCreada = response.data
      
      piezas.value.push(piezaCreada)
      caras.value[piezaCreada.id] = []
      piezaSeleccionada.value = piezaCreada
      
      console.log('Pieza creada:', piezaCreada)
      return piezaCreada
    } catch (error) {
      console.error('Error obteniendo o creando pieza:', error)
      throw error
    } finally {
      loadingPieza.value = false
    }
  }

  /**
   * Actualiza una pieza existente
   */
  const actualizarPieza = async (idPieza, datos) => {
    loadingPieza.value = true
    try {
      const response = await piezaService.update(idPieza, datos)
      const piezaActualizada = response.data

      const index = piezas.value.findIndex(p => p.id === idPieza)
      if (index > -1) {
        piezas.value[index] = piezaActualizada
      }

      if (piezaSeleccionada.value?.id === idPieza) {
        piezaSeleccionada.value = piezaActualizada
      }

      return piezaActualizada
    } catch (error) {
      console.error('Error actualizando pieza:', error)
      throw error
    } finally {
      loadingPieza.value = false
    }
  }

  /**
   * Elimina una pieza
   */
  const eliminarPieza = async (idPieza) => {
    loadingPieza.value = true
    try {
      await piezaService.delete(idPieza)
      
      piezas.value = piezas.value.filter(p => p.id !== idPieza)
      delete caras.value[idPieza]
      
      if (piezaSeleccionada.value?.id === idPieza) {
        piezaSeleccionada.value = null
      }
    } catch (error) {
      console.error('Error eliminando pieza:', error)
      throw error
    } finally {
      loadingPieza.value = false
    }
  }

  // ============================================
  // CARA CRUD
  // ============================================

  /**
   * Agrega una cara a una pieza
   */
  const agregarCara = async (idPieza, datosCara) => {
    try {
      const response = await caraService.create({
        id_pieza: idPieza,
        ...datosCara
      })
      
      const caraCreada = response.data
      
      if (!caras.value[idPieza]) {
        caras.value[idPieza] = []
      }
      caras.value[idPieza].push(caraCreada)
      
      return caraCreada
    } catch (error) {
      console.error('Error agregando cara:', error)
      throw error
    }
  }

  /**
   * Actualiza una cara existente
   */
  const actualizarCara = async (idCara, idPieza, datosCara) => {
    try {
      const response = await caraService.update(idCara, datosCara)
      const caraActualizada = response.data

      if (caras.value[idPieza]) {
        const index = caras.value[idPieza].findIndex(c => c.id === idCara)
        if (index > -1) {
          caras.value[idPieza][index] = caraActualizada
        }
      }

      return caraActualizada
    } catch (error) {
      console.error('Error actualizando cara:', error)
      throw error
    }
  }

  /**
   * Elimina una cara
   */
  const eliminarCara = async (idCara, idPieza) => {
    try {
      await caraService.delete(idCara)
      
      if (caras.value[idPieza]) {
        caras.value[idPieza] = caras.value[idPieza].filter(c => c.id !== idCara)
      }
    } catch (error) {
      console.error('Error eliminando cara:', error)
      throw error
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  const seleccionarPieza = (pieza) => {
    piezaSeleccionada.value = pieza
  }

  const limpiarPiezaSeleccionada = () => {
    piezaSeleccionada.value = null
  }

  const limpiarOdontograma = () => {
    odontogramaActual.value = null
    piezas.value = []
    caras.value = {}
    piezaSeleccionada.value = null
  }

  return {
    // State
    odontogramaActual,
    piezas,
    caras,
    piezaSeleccionada,
    loading,
    loadingPieza,

    // Getters
    tienePiezas,
    precioTotal,
    piezasPorNumero,
    getPiezaPorNumero,
    getCarasDePieza,

    // Odontograma
    cargarOdontogramaPorPaciente,
    actualizarOdontograma,

    // Piezas
    obtenerOCrearPieza,
    actualizarPieza,
    eliminarPieza,

    // Caras
    agregarCara,
    actualizarCara,
    eliminarCara,

    // Helpers
    seleccionarPieza,
    limpiarPiezaSeleccionada,
    limpiarOdontograma
  }
})