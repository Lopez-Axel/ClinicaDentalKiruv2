<template>
  <q-dialog v-model="dialogOpen" persistent>
    <q-card style="width: 100%; max-width: 520px">

      <q-toolbar class="bg-primary text-white">
        <q-icon name="payments" class="q-mr-sm" />
        <q-toolbar-title>Pagar pieza dental</q-toolbar-title>
        <q-btn
          flat
          round
          dense
          icon="close"
          v-close-popup
          @click="cancelar"
          :disable="procesando"
        />
      </q-toolbar>

      <q-card-section class="q-gutter-md">

        <!-- INFO PIEZA -->
        <q-card flat bordered class="bg-grey-1">
          <q-card-section>
            <div class="text-caption text-grey-7">Pieza #{{ pieza.numero }}</div>
            <div class="text-body2 text-weight-medium">{{ pieza.diagnostico || 'Sin diagnóstico' }}</div>
            <div class="row q-mt-sm q-col-gutter-sm">
              <div class="col-4">
                <div class="text-caption text-grey-7">Precio total</div>
                <div class="text-body1 text-weight-bold">
                  Bs. {{ formatearMonto(pieza.precio) }}
                </div>
              </div>
              <div class="col-4">
                <div class="text-caption text-grey-7">Pagado</div>
                <div class="text-body1 text-weight-bold text-positive">
                  Bs. {{ formatearMonto(totalesPieza.total_pagado) }}
                </div>
              </div>
              <div class="col-4">
                <div class="text-caption text-grey-7">Pendiente</div>
                <div class="text-body1 text-weight-bold text-negative">
                  Bs. {{ formatearMonto(totalesPieza.total_pendiente) }}
                </div>
              </div>
            </div>

            <!-- Barra de progreso -->
            <div class="q-mt-sm">
              <q-linear-progress
                :value="totalesPieza.porcentaje_pagado / 100"
                :color="getColorProgreso(totalesPieza.porcentaje_pagado)"
                size="8px"
                rounded
              />
              <div class="text-caption text-center text-grey-7 q-mt-xs">
                {{ totalesPieza.porcentaje_pagado }}% completado
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- MONTO A PAGAR -->
        <q-input
          v-model.number="montoAPagar"
          label="Monto a pagar (Bs) *"
          outlined
          dense
          type="number"
          min="0.01"
          :max="totalesPieza.total_pendiente"
          step="0.01"
          hint="Puede pagar el total o un adelanto"
          :error="!!errorMonto"
          :error-message="errorMonto"
        >
          <template #prepend>
            <q-icon name="attach_money" />
          </template>
          <template #append>
            <q-btn
              flat
              dense
              size="sm"
              label="Total"
              color="primary"
              @click="montoAPagar = totalesPieza.total_pendiente"
              :disable="totalesPieza.total_pendiente <= 0"
            />
          </template>
        </q-input>

        <!-- NOTAS -->
        <q-input
          v-model="notas"
          label="Notas (opcional)"
          outlined
          dense
          type="textarea"
          rows="2"
        >
          <template #prepend>
            <q-icon name="notes" />
          </template>
        </q-input>

        <!-- INFO STRIPE -->
        <q-banner dense rounded class="bg-info text-white">
          <template #avatar>
            <q-icon name="info" />
          </template>
          Tarjeta de prueba: <span class="text-weight-bold">4242 4242 4242 4242</span>
          <br>
          <span class="text-caption">Fecha: Cualquier fecha futura | CVC: Cualquier 3 dígitos</span>
        </q-banner>

        <!-- MÉTODO DE PAGO -->
        <div>
          <div class="text-subtitle2 q-mb-xs text-grey-8">
            <q-icon name="credit_card" class="q-mr-xs" />
            Datos de la tarjeta
          </div>

          <q-card flat bordered class="q-pa-sm">
            <div ref="cardElement" class="q-pa-sm"></div>
          </q-card>
        </div>

        <!-- ERROR -->
        <q-banner
          v-if="error"
          dense
          rounded
          class="bg-negative text-white"
        >
          <template #avatar>
            <q-icon name="error" />
          </template>
          {{ error }}
        </q-banner>

      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          label="Cancelar"
          color="grey-7"
          @click="cancelar"
          :disable="procesando"
        />
        <q-btn
          unelevated
          color="primary"
          icon="lock"
          :label="`Pagar Bs. ${formatearMonto(montoAPagar)}`"
          @click="procesarPago"
          :loading="procesando"
          :disable="!esMontoValido"
        />
      </q-card-actions>

    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { loadStripe } from '@stripe/stripe-js'
import { pagoPiezaStripeService } from 'src/services/pagoPiezaStripeService'
import { usePagoStore } from 'src/stores/pagoStore'
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  pieza: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'pago-exitoso', 'pago-cancelado'])

const $q = useQuasar()
const pagoStore = usePagoStore()

// ============================================
// STATE
// ============================================
const cardElement = ref(null)
const procesando = ref(false)
const error = ref('')
const errorMonto = ref('')
const montoAPagar = ref(0)
const notas = ref('')
const dialogOpen = ref(props.modelValue)

let stripe = null
let elements = null
let card = null
let clientSecret = null
let paymentIntentId = null

// ============================================
// COMPUTED
// ============================================

// Obtener totales de la pieza desde el store
const totalesPieza = computed(() => {
  if (!props.pieza?.id) {
    return {
      precio_total: 0,
      total_pagado: 0,
      total_pendiente: 0,
      porcentaje_pagado: 0
    }
  }
  return pagoStore.getTotalesPieza(props.pieza.id, props.pieza.precio)
})

// Validar si el monto es válido
const esMontoValido = computed(() => {
  if (!montoAPagar.value || montoAPagar.value <= 0) {
    return false
  }
  if (montoAPagar.value > totalesPieza.value.total_pendiente) {
    return false
  }
  return true
})

// ============================================
// WATCHERS
// ============================================
watch(() => props.modelValue, async (newVal) => {
  dialogOpen.value = newVal
  if (newVal) {
    // Cargar pagos actuales de la pieza para tener datos frescos
    if (props.pieza?.id) {
      try {
        await pagoStore.cargarPagosPorPieza(props.pieza.id)
      } catch (error) {
        console.error('Error cargando pagos:', error)
      }
    }
    
    // Establecer monto inicial
    montoAPagar.value = totalesPieza.value.total_pendiente
    await nextTick()
  } else {
    limpiarStripe()
  }
})

watch(dialogOpen, (newVal) => {
  emit('update:modelValue', newVal)
})

watch(() => montoAPagar.value, async (newVal) => {
  // Validar monto
  errorMonto.value = ''
  
  if (newVal <= 0) {
    errorMonto.value = 'El monto debe ser mayor a 0'
    return
  }
  
  if (newVal > totalesPieza.value.total_pendiente) {
    errorMonto.value = `El monto excede el saldo pendiente (Bs. ${formatearMonto(totalesPieza.value.total_pendiente)})`
    return
  }
  
  // Inicializar Stripe si el monto es válido
  if (newVal > 0 && dialogOpen.value) {
    await inicializarStripe()
  }
})

// ============================================
// MÉTODOS
// ============================================

const formatearMonto = (monto) => {
  return Number(monto || 0).toFixed(2)
}

const getColorProgreso = (porcentaje) => {
  if (porcentaje >= 100) return 'positive'
  if (porcentaje >= 50) return 'warning'
  return 'negative'
}

const inicializarStripe = async () => {
  try {
    error.value = ''
    
    if (!montoAPagar.value || montoAPagar.value <= 0) {
      return
    }

    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    if (!stripeKey) {
      throw new Error('Clave de Stripe no configurada')
    }

    stripe = await loadStripe(stripeKey)
    
    // Crear payment intent
    const response = await pagoPiezaStripeService.createPaymentIntent({
      monto: montoAPagar.value,
      id_pieza: props.pieza.id
    })
    
    clientSecret = response.data.data.client_secret
    paymentIntentId = response.data.data.payment_intent_id

    // Crear elemento de tarjeta
    elements = stripe.elements()
    card = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#32325d',
          fontFamily: '"Roboto", sans-serif',
          '::placeholder': {
            color: '#aab7c4'
          }
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a'
        }
      }
    })

    if (cardElement.value) {
      card.mount(cardElement.value)
    }
  } catch (err) {
    console.error('Error inicializando Stripe:', err)
    error.value = err.response?.data?.message || 'Error al inicializar el sistema de pagos'
  }
}

const procesarPago = async () => {
  if (!stripe || !card) {
    error.value = 'Sistema de pagos no inicializado'
    return
  }
  
  if (!esMontoValido.value) {
    error.value = errorMonto.value || 'Monto inválido'
    return
  }
  
  procesando.value = true
  error.value = ''

  try {
    // Confirmar pago con Stripe
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      { 
        payment_method: { 
          card,
          billing_details: {
            name: 'Cliente'
          }
        } 
      }
    )

    if (stripeError) {
      error.value = stripeError.message
      procesando.value = false
      return
    }

    if (paymentIntent.status !== 'succeeded') {
      error.value = 'El pago no se completó correctamente'
      procesando.value = false
      return
    }

    // Confirmar pago en el backend
    const response = await pagoPiezaStripeService.confirmarPago({
      payment_intent_id: paymentIntentId,
      datosPago: {
        id_pieza: props.pieza.id,
        monto: montoAPagar.value,
        notas: notas.value
      }
    })

    if (response.data.success) {
      // Recargar los pagos de la pieza para actualizar el store
      await pagoStore.cargarPagosPorPieza(props.pieza.id)
      
      $q.notify({
        type: 'positive',
        message: '¡Pago registrado exitosamente!',
        icon: 'check_circle',
        position: 'top-right'
      })
      
      emit('pago-exitoso', response.data.data)
      limpiarStripe()
      dialogOpen.value = false
    } else {
      error.value = response.data.message || 'Error al confirmar el pago'
    }
  } catch (err) {
    console.error('Error procesando pago:', err)
    error.value = err.response?.data?.message || 'Error al procesar el pago'
  } finally {
    procesando.value = false
  }
}

const cancelar = () => {
  if (procesando.value) return
  
  emit('pago-cancelado')
  limpiarStripe()
  dialogOpen.value = false
}

const limpiarStripe = () => {
  if (card) {
    card.unmount()
    card = null
  }
  elements = null
  stripe = null
  clientSecret = null
  paymentIntentId = null
  error.value = ''
  errorMonto.value = ''
  montoAPagar.value = 0
  notas.value = ''
}
</script>

<style scoped>
.q-banner {
  border-radius: 8px;
}
</style>