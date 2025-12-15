<template>
  <div class="tooth-container">
    <!-- Imagen del diente arriba (para superiores) -->
    <div v-if="isUpperTooth" class="tooth-image-wrapper">
      <img :src="toothImageSrc" class="tooth-image" :alt="`Diente ${pieza?.numero}`" />
      <span class="tooth-number">{{ pieza?.numero }}</span>
    </div>

    <svg
      viewBox="0 0 300 300"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      :aria-label="`Diente ${pieza?.numero}`"
    >
      <!-- ORDEN INVERTIDO: Primero Oclusal (fondo), luego las caras laterales (frente) -->
      
      <!-- Cara Oclusal (centro) - Se dibuja primero para estar al fondo -->
      <polygon
        :points="occlusalPoints"
        :fill="getFaceColor('Oclusal')"
        :stroke="getStrokeColor('Oclusal')"
        :stroke-width="getStrokeWidth('Oclusal')"
        @click="handleSelectFace('Oclusal')"
        class="tooth-face"
      />

      <!-- Vestibular - Se dibuja después para estar al frente -->
      <polygon
        :points="vestibularPoints"
        :fill="getFaceColor('Vestibular')"
        :stroke="getStrokeColor('Vestibular')"
        :stroke-width="getStrokeWidth('Vestibular')"
        @click="handleSelectFace('Vestibular')"
        class="tooth-face"
      />

      <!-- Palatino - Se dibuja después para estar al frente -->
      <polygon
        :points="palatinoPoints"
        :fill="getFaceColor('Palatino')"
        :stroke="getStrokeColor('Palatino')"
        :stroke-width="getStrokeWidth('Palatino')"
        @click="handleSelectFace('Palatino')"
        class="tooth-face"
      />

      <!-- Mesial - Se dibuja después para estar al frente -->
      <polygon
        :points="mesialPoints"
        :fill="getFaceColor('Mesial')"
        :stroke="getStrokeColor('Mesial')"
        :stroke-width="getStrokeWidth('Mesial')"
        @click="handleSelectFace('Mesial')"
        class="tooth-face"
      />

      <!-- Distal - Se dibuja después para estar al frente -->
      <polygon
        :points="distalPoints"
        :fill="getFaceColor('Distal')"
        :stroke="getStrokeColor('Distal')"
        :stroke-width="getStrokeWidth('Distal')"
        @click="handleSelectFace('Distal')"
        class="tooth-face"
      />

      <!-- Símbolo clínico del diente (UNA VEZ, centrado) -->
      <component 
        :is="toothSymbolComponent" 
        v-if="toothSymbolComponent"
        :center-x="centerX"
        :center-y="centerY"
        :size="symbolSize"
      />
    </svg>

    <!-- Imagen del diente abajo (para inferiores) -->
    <div v-if="!isUpperTooth" class="tooth-image-wrapper">
      <span class="tooth-number">{{ pieza?.numero }}</span>
      <img :src="toothImageSrc" class="tooth-image" :alt="`Diente ${pieza?.numero}`" />
    </div>

    <!-- Cara seleccionada -->
    <div v-if="caraSeleccionada" class="selection-info q-mt-sm">
      <q-chip
        removable
        @remove="caraSeleccionada = null"
        color="primary"
        text-color="white"
        size="sm"
      >
        {{ caraSeleccionada }}
      </q-chip>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch, h } from 'vue'
import { obtenerNombreDiente } from 'src/utils/diente'
import { COLORES_CLINICOS } from 'src/types/odontograma'

// Componentes de símbolos SVG como funciones render
const CruzExodoncia = () => {
  const centerX = 150
  const centerY = 150
  const size = 80
  

  const halfSize = size / 2
  return h('g', [
    h('line', {
      x1: centerX - halfSize,
      y1: centerY - halfSize,
      x2: centerX + halfSize,
      y2: centerY + halfSize,
      stroke: '#000',
      'stroke-width': 3
    }),
    h('line', {
      x1: centerX + halfSize,
      y1: centerY - halfSize,
      x2: centerX - halfSize,
      y2: centerY + halfSize,
      stroke: '#000',
      'stroke-width': 3
    })
  ])
}

const RellenoObturacion = () => {
  const centerX = 150
  const centerY = 150
  const size = 80
  return h('circle', {
    cx: centerX,
    cy: centerY,
    r: size / 3,
    fill: '#000',
    opacity: 0.8
  })
}

const EndodonciaSymbol = () => {
  const centerX = 150
  const centerY = 150
  const size = 80
  return h('g', [
    // Círculo de fondo
    h('circle', {
      cx: centerX,
      cy: centerY,
      r: size / 2.5,
      fill: '#000',
      opacity: 0.8
    }),
    // Letra E
    h('text', {
      x: centerX,
      y: centerY + 5,
      'text-anchor': 'middle',
      'font-size': size / 2,
      'font-weight': 'bold',
      fill: '#fff'
    }, 'E')
  ])
}

const CoronaSymbol = () => {
  const centerX = 150
  const centerY = 150
  const size = 80
  
  const points = []
  const numPoints = 8
  const outerRadius = size / 2
  const innerRadius = size / 3.5

  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (Math.PI * 2 * i) / (numPoints * 2) - Math.PI / 2
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius
    points.push(`${x},${y}`)
  }

  return h('polygon', {
    points: points.join(' '),
    fill: '#FFD700',
    stroke: '#000',
    'stroke-width': 2
  })
}

const CruzImplante = () => {
  const centerX = 150
  const centerY = 150
  const size = 80
  const halfSize = size / 2
  return h('g', [
    h('line', {
      x1: centerX - halfSize,
      y1: centerY - halfSize,
      x2: centerX + halfSize,
      y2: centerY + halfSize,
      stroke: '#666',
      'stroke-width': 3
    }),
    h('line', {
      x1: centerX + halfSize,
      y1: centerY - halfSize,
      x2: centerX - halfSize,
      y2: centerY + halfSize,
      stroke: '#666',
      'stroke-width': 3
    })
  ])
}

const ProtesisRemovible = () => {
  const centerX = 150
  const centerY = 150
  const size = 80
  const spacing = size / 4
  return h('g', [
    h('line', {
      x1: centerX - spacing,
      y1: centerY - size / 3,
      x2: centerX - spacing,
      y2: centerY + size / 3,
      stroke: '#000',
      'stroke-width': 2
    }),
    h('line', {
      x1: centerX + spacing,
      y1: centerY - size / 3,
      x2: centerX + spacing,
      y2: centerY + size / 3,
      stroke: '#000',
      'stroke-width': 2
    })
  ])
}

const LineaEdentulo = () => {
  const centerX = 150
  const centerY = 150
  const size = 80
  return h('line', {
    x1: centerX - size / 2,
    y1: centerY,
    x2: centerX + size / 2,
    y2: centerY,
    stroke: '#000',
    'stroke-width': 3
  })
}

const ProtesisCompleta = () => {
  const centerX = 150
  const centerY = 150
  const size = 80
  const spacing = size / 3
  return h('g', [
    h('line', {
      x1: centerX - spacing,
      y1: centerY - size / 3,
      x2: centerX - spacing,
      y2: centerY + size / 3,
      stroke: '#000',
      'stroke-width': 4
    }),
    h('line', {
      x1: centerX + spacing,
      y1: centerY - size / 3,
      x2: centerX + spacing,
      y2: centerY + size / 3,
      stroke: '#000',
      'stroke-width': 4
    })
  ])
}

const FlechaExtruido = () => {
  const centerX = 150
  const centerY = 150
  const size = 80
  const arrowSize = size / 3
  return h('g', [
    // Línea vertical
    h('line', {
      x1: centerX,
      y1: centerY + size / 3,
      x2: centerX,
      y2: centerY - size / 3,
      stroke: '#000',
      'stroke-width': 2
    }),
    // Punta superior derecha
    h('line', {
      x1: centerX,
      y1: centerY - size / 3,
      x2: centerX + arrowSize,
      y2: centerY - size / 3 + arrowSize,
      stroke: '#000',
      'stroke-width': 2
    }),
    // Punta superior izquierda
    h('line', {
      x1: centerX,
      y1: centerY - size / 3,
      x2: centerX - arrowSize,
      y2: centerY - size / 3 + arrowSize,
      stroke: '#000',
      'stroke-width': 2
    })
  ])
}

const FlechaIntruido = () => {
  const centerX = 150
  const centerY = 150
  const size = 80
  const arrowSize = size / 3
  return h('g', [
    // Línea vertical
    h('line', {
      x1: centerX,
      y1: centerY - size / 3,
      x2: centerX,
      y2: centerY + size / 3,
      stroke: '#000',
      'stroke-width': 2
    }),
    // Punta inferior derecha
    h('line', {
      x1: centerX,
      y1: centerY + size / 3,
      x2: centerX + arrowSize,
      y2: centerY + size / 3 - arrowSize,
      stroke: '#000',
      'stroke-width': 2
    }),
    // Punta inferior izquierda
    h('line', {
      x1: centerX,
      y1: centerY + size / 3,
      x2: centerX - arrowSize,
      y2: centerY + size / 3 - arrowSize,
      stroke: '#000',
      'stroke-width': 2
    })
  ])
}

const OrtodonciaFija = () => {
  const centerX = 150
  const centerY = 150
  const size = 80
  const rectSize = size / 2.5
  return h('g', [
    // Cuadrado
    h('rect', {
      x: centerX - rectSize / 2,
      y: centerY - rectSize / 2,
      width: rectSize,
      height: rectSize,
      fill: 'none',
      stroke: '#000',
      'stroke-width': 2
    }),
    // Cruz dentro
    h('line', {
      x1: centerX - rectSize / 2,
      y1: centerY - rectSize / 2,
      x2: centerX + rectSize / 2,
      y2: centerY + rectSize / 2,
      stroke: '#000',
      'stroke-width': 2
    }),
    h('line', {
      x1: centerX + rectSize / 2,
      y1: centerY - rectSize / 2,
      x2: centerX - rectSize / 2,
      y2: centerY + rectSize / 2,
      stroke: '#000',
      'stroke-width': 2
    })
  ])
}

const OrtodonciaRemovible = () => {
  const centerX = 150
  const centerY = 150
  const size = 80
  const segments = 6
  const segmentWidth = size / segments
  const points = []
  
  for (let i = 0; i <= segments; i++) {
    const x = centerX - size / 2 + i * segmentWidth
    const y = centerY + (i % 2 === 0 ? -size / 4 : size / 4)
    points.push(`${x},${y}`)
  }
  
  return h('polyline', {
    points: points.join(' '),
    fill: 'none',
    stroke: '#000',
    'stroke-width': 2
  })
}

// Mapeo de símbolos de BD a componentes
const SYMBOL_MAP = {
  'Exodoncia': CruzExodoncia,
  'Obturacion': RellenoObturacion,
  'Endodoncia': EndodonciaSymbol,
  'Corona': CoronaSymbol,
  'Implante': CruzImplante,
  'Protesis Removible': ProtesisRemovible,
  'Edentulo': LineaEdentulo,
  'Protesis Completa': ProtesisCompleta,
  'Protesis Fija': LineaEdentulo, 
  'Diente extruido': FlechaExtruido,
  'Diente intruido': FlechaIntruido,
  'Ortodoncia Fija': OrtodonciaFija,
  'Ortodoncia Removible': OrtodonciaRemovible
}

export default defineComponent({
  name: 'ToothComponent',
  props: {
    pieza: Object,
    caras: {
      type: Array,
      default: () => []
    },
    posicion: {
      type: String,
      default: 'superior'
    },
    escala: {
      type: Number,
      default: 1
    }
  },
  emits: ['selectFace'],
  setup(props, { emit }) {
    const caraSeleccionada = ref(null)
    const posicion = ref(props.posicion)

    watch(
      () => props.posicion,
      (newVal) => {
        posicion.value = newVal
      }
    )

    // Determinar si es diente superior o inferior
    const isUpperTooth = computed(() => {
      if (!props.pieza) return true
      const firstDigit = Math.floor(props.pieza.numero / 10)
      return firstDigit === 1 || firstDigit === 2 || firstDigit === 5 || firstDigit === 6
    })

    // Imagen del diente
    const toothImageSrc = computed(() => {
      if (!props.pieza) return '/KiruIMG/tooth_up.png'
      return props.pieza.image_tooth === 'tooth_up.png' 
        ? '/KiruIMG/tooth_up.png' 
        : '/KiruIMG/tooth_down.png'
    })

    // Coordenadas del SVG
    const centerX = 150
    const centerY = 150
    const baseSquareSize = 80

    // Medidas escaladas
    const innerSquareSize = computed(() => baseSquareSize * props.escala)
    const trapezoidHeight = computed(() => 40 * props.escala)
    const strokeWidth = computed(() => 2 * props.escala)
    const symbolSize = computed(() => 30 * props.escala)

    // Cuadrado interior (Oclusal)
    const occlusalPoints = computed(() => {
      const half = innerSquareSize.value / 2
      return `${centerX - half},${centerY - half} ${centerX + half},${centerY - half} ${centerX + half},${centerY + half} ${centerX - half},${centerY + half}`
    })

    // Trapecio Vestibular
    const vestibularPoints = computed(() => {
      const half = innerSquareSize.value / 2
      const outerHalf = half + trapezoidHeight.value

      if (posicion.value === 'inferior') {
        return `${centerX - half},${centerY + half} ${centerX + half},${centerY + half} ${centerX + outerHalf},${centerY + half + trapezoidHeight.value} ${centerX - outerHalf},${centerY + half + trapezoidHeight.value}`
      }
      return `${centerX - outerHalf},${centerY - half - trapezoidHeight.value} ${centerX + outerHalf},${centerY - half - trapezoidHeight.value} ${centerX + half},${centerY - half} ${centerX - half},${centerY - half}`
    })

    // Trapecio Palatino
    const palatinoPoints = computed(() => {
      const half = innerSquareSize.value / 2
      const outerHalf = half + trapezoidHeight.value

      if (posicion.value === 'inferior') {
        return `${centerX - outerHalf},${centerY - half - trapezoidHeight.value} ${centerX + outerHalf},${centerY - half - trapezoidHeight.value} ${centerX + half},${centerY - half} ${centerX - half},${centerY - half}`
      }
      return `${centerX - half},${centerY + half} ${centerX + half},${centerY + half} ${centerX + outerHalf},${centerY + half + trapezoidHeight.value} ${centerX - outerHalf},${centerY + half + trapezoidHeight.value}`
    })

    // Trapecio Mesial
    const mesialPoints = computed(() => {
      const half = innerSquareSize.value / 2
      const outerHalf = half + trapezoidHeight.value
      return `${centerX + half},${centerY - half} ${centerX + half + trapezoidHeight.value},${centerY - outerHalf} ${centerX + half + trapezoidHeight.value},${centerY + outerHalf} ${centerX + half},${centerY + half}`
    })

    // Trapecio Distal
    const distalPoints = computed(() => {
      const half = innerSquareSize.value / 2
      const outerHalf = half + trapezoidHeight.value
      return `${centerX - half - trapezoidHeight.value},${centerY - outerHalf} ${centerX - half},${centerY - half} ${centerX - half},${centerY + half} ${centerX - half - trapezoidHeight.value},${centerY + outerHalf}`
    })

    // Obtener color de una cara
    const getFaceColor = (cara) => {
      if (!props.pieza || !props.caras) {
        return COLORES_CLINICOS.blanco
      }

      const caraInfo = props.caras.find((c) => c.cara === cara)
      if (!caraInfo) {
        return COLORES_CLINICOS.blanco
      }

      return caraInfo.color || COLORES_CLINICOS.blanco
    }

    // Obtener componente de símbolo del diente (A NIVEL DE PIEZA)
    const toothSymbolComponent = computed(() => {
      if (!props.pieza || !props.pieza.simbolo) {
        return null
      }

      console.log('simbolo:', props.pieza?.simbolo, '->', SYMBOL_MAP[props.pieza?.simbolo])

      return SYMBOL_MAP[props.pieza.simbolo] || null
    })

    // Obtener color del stroke (NEGRO como base)
    const getStrokeColor = (cara) => {
      // Si está seleccionada, color azul de highlight
      if (caraSeleccionada.value === cara) {
        return '#1976D2'
      }

      // Si tiene información clínica, negro más intenso
      if (props.pieza && props.caras) {
        const caraInfo = props.caras.find((c) => c.cara === cara)
        if (caraInfo) {
          return '#000000'
        }
      }

      // Color base negro suave
      return '#424242'
    }

    // Obtener grosor del stroke (escalable y aumentado cuando está seleccionado)
    const getStrokeWidth = (cara) => {
      if (caraSeleccionada.value === cara) {
        return strokeWidth.value * 2.5 // Más grueso cuando está seleccionado
      }
      return strokeWidth.value
    }

    // Manejar selección de cara
    const handleSelectFace = (cara) => {
      caraSeleccionada.value = caraSeleccionada.value === cara ? null : cara
      emit('selectFace', { numero: props.pieza?.numero, cara })
    }

    return {
      caraSeleccionada,
      isUpperTooth,
      toothImageSrc,
      centerX,
      centerY,
      occlusalPoints,
      vestibularPoints,
      palatinoPoints,
      mesialPoints,
      distalPoints,
      strokeWidth,
      symbolSize,
      getFaceColor,
      toothSymbolComponent,
      getStrokeColor,
      getStrokeWidth,
      handleSelectFace,
      obtenerNombreDiente
    }
  }
})
</script>

<style scoped>
.tooth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
}

.tooth-image-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.tooth-image {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.tooth-number {
  font-size: 12px;
  font-weight: 600;
  color: #424242;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid #E0E0E0;
}

.tooth-face {
  cursor: pointer;
  transition: all 0.2s ease;
}

.tooth-face:hover {
  opacity: 0.85;
}

.selection-info {
  display: flex;
  justify-content: center;
}
</style>