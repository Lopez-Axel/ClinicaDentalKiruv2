<template>
  <q-page class="contact-contact-page">
    <!-- Hero Section para Contacto -->
    <section class="contact-hero-section">
      <div class="contact-hero-background">
        <div class="contact-hero-shape contact-hero-shape-1"></div>
        <div class="contact-hero-shape contact-hero-shape-2"></div>
        <div class="contact-hero-shape contact-hero-shape-3"></div>
      </div>
      
      <q-container class="q-pa-xl">
        <div class="row items-center q-col-gutter-xl">
          <div class="col-12 col-md-6">
            <div class="contact-hero-badge animated fadeInDown">
              <q-icon name="contact_mail" size="20px" />
              <span>Estamos para Ayudarte</span>
            </div>
            
            <h1 class="contact-hero-title animated fadeInLeft">
              Contáctanos
            </h1>
            
            <p class="contact-hero-subtitle animated fadeInLeft" style="animation-delay: 0.2s">
              Estamos aquí para resolver todas tus dudas y ayudarte a mantener tu sonrisa perfecta. 
              Contáctanos por cualquiera de nuestros medios disponibles y te atenderemos con gusto.
            </p>

            <div class="contact-hero-features animated fadeInUp" style="animation-delay: 0.3s">
              <div class="contact-feature-item">
                <q-icon name="support_agent" color="primary" size="24px" />
                <span>Atención personalizada 24/7</span>
              </div>
              <div class="contact-feature-item">
                <q-icon name="schedule" color="primary" size="24px" />
                <span>Respuesta en menos de 2 horas</span>
              </div>
              <div class="contact-feature-item">
                <q-icon name="verified" color="primary" size="24px" />
                <span>Profesionales certificados</span>
              </div>
            </div>
          </div>
          
          <div class="col-12 col-md-6">
            <div class="contact-hero-image-wrapper animated zoomIn" style="animation-delay: 0.3s">
              <div class="contact-hero-glow"></div>
              <div class="contact-hero-image-container">
                <q-img
                  src="/KiruIMG/contact.png"
                  alt="Contacto KIRU Odontología"
                  class="contact-hero-image"
                  fit="contain"
                />
              </div>
              
              <div class="contact-floating-elements">
                <div class="contact-floating-card contact-floating-card-1">
                  <q-icon name="phone" color="#1976d2" size="24px" />
                  <div class="contact-floating-text">
                    <strong>24/7</strong>
                    <span>Disponible</span>
                  </div>
                </div>
                
                <div class="contact-floating-card contact-floating-card-2">
                  <q-icon name="chat" color="#26a69a" size="24px" />
                  <div class="contact-floating-text">
                    <strong>Chat</strong>
                    <span>En Vivo</span>
                  </div>
                </div>
                
                <div class="contact-floating-card contact-floating-card-3">
                  <q-icon name="emergency" color="#ff4081" size="24px" />
                  <div class="contact-floating-text">
                    <strong>Urgencias</strong>
                    <span>Inmediatas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-container>
    </section>

    <!-- Información de Contacto Rápido Mejorada -->
    <section class="contact-quick-section">
      <div class="contact-quick-background">
        <div class="contact-wave contact-wave-top"></div>
      </div>
      
      <q-container>
        <div class="contact-section-header animated fadeIn">
          <div class="contact-section-badge">
            <q-icon name="contact_phone" size="20px" />
            <span>Múltiples Canales</span>
          </div>
          <h2 class="contact-section-title">Medios de Contacto</h2>
          <p class="contact-section-subtitle">Elige la forma más conveniente para comunicarte con nosotros</p>
          <div class="contact-title-decoration">
            <div class="contact-title-line"></div>
            <q-icon name="diversity_3" color="primary" size="32px" />
            <div class="contact-title-line"></div>
          </div>
        </div>

        <div class="row q-col-gutter-xl">
          <div class="col-12 col-md-4 animated fadeInUp" style="animation-delay: 0.1s">
            <q-card 
              class="contact-quick-card" 
              @click="makeCall(contactInfo.phone)"
              flat
            >
              <div class="contact-card-glow contact-card-glow-1"></div>
              <q-card-section class="contact-card-content text-center">
                <div class="contact-card-icon-wrapper">
                  <q-icon name="phone" size="3em" class="contact-card-icon" />
                </div>
                <div class="contact-card-title">Teléfono</div>
                <div class="contact-card-value">{{ contactInfo.phone }}</div>
                <div class="contact-card-description">Llamada directa</div>
                <q-btn 
                  unelevated 
                  color="primary" 
                  label="Llamar Ahora" 
                  icon="call"
                  class="contact-card-btn"
                />
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-4 animated fadeInUp" style="animation-delay: 0.2s">
            <q-card 
              class="contact-quick-card" 
              @click="sendEmail(contactInfo.email)"
              flat
            >
              <div class="contact-card-glow contact-card-glow-2"></div>
              <q-card-section class="contact-card-content text-center">
                <div class="contact-card-icon-wrapper">
                  <q-icon name="email" size="3em" class="contact-card-icon" />
                </div>
                <div class="contact-card-title">Email</div>
                <div class="contact-card-value">{{ contactInfo.email }}</div>
                <div class="contact-card-description">Respuesta rápida</div>
                <q-btn 
                  unelevated 
                  color="secondary" 
                  label="Enviar Email" 
                  icon="email"
                  class="contact-card-btn"
                />
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-4 animated fadeInUp" style="animation-delay: 0.3s">
            <q-card 
              class="contact-quick-card" 
              @click="openMap(contactInfo.address)"
              flat
            >
              <div class="contact-card-glow contact-card-glow-3"></div>
              <q-card-section class="contact-card-content text-center">
                <div class="contact-card-icon-wrapper">
                  <q-icon name="location_on" size="3em" class="contact-card-icon" />
                </div>
                <div class="contact-card-title">Ubicación</div>
                <div class="contact-card-value">{{ contactInfo.address }}</div>
                <div class="contact-card-description">Visítanos</div>
                <q-btn 
                  unelevated 
                  color="red" 
                  label="Cómo Llegar" 
                  icon="directions"
                  class="contact-card-btn"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-container>
    </section>

    <!-- Formulario de Contacto y Horarios Mejorado -->
    <section class="contact-form-section q-pa-xl">
      <q-container>
        <div class="row q-col-gutter-xl">
          <!-- Formulario de Contacto Mejorado -->
          <div class="col-12 col-lg-7 animated fadeInLeft">
            <q-card class="contact-form-main-card" flat>
              <q-card-section class="contact-form-header">
                <div class="contact-form-title-section">
                  <q-icon name="message" size="32px" color="primary" class="contact-form-title-icon" />
                  <div>
                    <div class="contact-form-title">Envíanos un Mensaje</div>
                    <div class="contact-form-subtitle">Completa el formulario y te contactaremos pronto</div>
                  </div>
                </div>
              </q-card-section>

              <q-card-section class="contact-form-body">
                <q-form @submit.prevent="onSubmitContact" ref="contactFormRef">
                  <div class="contact-form-fields">
                    <div class="row q-col-gutter-lg">
                      <div class="col-12 col-sm-6">
                        <q-input
                          v-model="contactForm.name"
                          label="Nombre completo *"
                          outlined
                          :rules="[val => !!val || 'Nombre es requerido']"
                          lazy-rules
                          class="contact-form-input"
                          color="primary"
                        >
                          <template v-slot:prepend>
                            <q-icon name="person" color="primary" />
                          </template>
                        </q-input>
                      </div>

                      <div class="col-12 col-sm-6">
                        <q-input
                          v-model="contactForm.phone"
                          label="Teléfono *"
                          outlined
                          :rules="[val => !!val || 'Teléfono es requerido']"
                          lazy-rules
                          class="contact-form-input"
                          color="primary"
                        >
                          <template v-slot:prepend>
                            <q-icon name="phone" color="primary" />
                          </template>
                        </q-input>
                      </div>

                      <div class="col-12">
                        <q-input
                          v-model="contactForm.email"
                          label="Email *"
                          type="email"
                          outlined
                          :rules="[
                            val => !!val || 'Email es requerido',
                            val => /.+@.+\..+/.test(val) || 'Email debe ser válido'
                          ]"
                          lazy-rules
                          class="contact-form-input"
                          color="primary"
                        >
                          <template v-slot:prepend>
                            <q-icon name="email" color="primary" />
                          </template>
                        </q-input>
                      </div>

                      <div class="col-12">
                        <q-select
                          v-model="contactForm.subject"
                          :options="subjectOptions"
                          label="Motivo de consulta *"
                          outlined
                          :rules="[val => !!val || 'Seleccione un motivo']"
                          lazy-rules
                          class="contact-form-input"
                          color="primary"
                        >
                          <template v-slot:prepend>
                            <q-icon name="topic" color="primary" />
                          </template>
                        </q-select>
                      </div>

                      <div class="col-12">
                        <q-input
                          v-model="contactForm.message"
                          label="Mensaje *"
                          type="textarea"
                          rows="5"
                          outlined
                          :rules="[val => !!val || 'Mensaje es requerido']"
                          lazy-rules
                          class="contact-form-input"
                          color="primary"
                        >
                          <template v-slot:prepend>
                            <q-icon name="message" color="primary" />
                          </template>
                        </q-input>
                      </div>

                      <div class="col-12">
                        <q-checkbox
                          v-model="contactForm.consent"
                          :error="!!consentError"
                          :error-message="consentError"
                          class="contact-consent-checkbox"
                        >
                          <span class="contact-consent-text">
                            Acepto el tratamiento de mis datos personales según la
                            <a href="#" @click.prevent="showPrivacyPolicy = true" class="contact-privacy-link">
                              política de privacidad
                            </a>
                          </span>
                        </q-checkbox>
                      </div>

                      <div class="col-12">
                        <q-btn
                          type="submit"
                          color="primary"
                          size="lg"
                          label="Enviar Mensaje"
                          icon="send"
                          :loading="loading"
                          unelevated
                          no-caps
                          class="contact-submit-btn"
                        />
                      </div>
                    </div>
                  </div>
                </q-form>
              </q-card-section>
            </q-card>
          </div>

          <!-- Información Lateral Mejorada -->
          <div class="col-12 col-lg-5 animated fadeInRight">
            <!-- Horarios de Atención -->
            <q-card class="contact-info-card contact-schedule-card" flat>
              <q-card-section class="contact-info-header">
                <q-icon name="access_time" size="24px" color="primary" class="q-mr-sm" />
                <span class="contact-info-title">Horarios de Atención</span>
              </q-card-section>
              
              <q-card-section class="contact-schedule-content">
                <q-list class="contact-schedule-list">
                  <q-item 
                    v-for="schedule in scheduleInfo" 
                    :key="schedule.day"
                    class="contact-schedule-item"
                  >
                    <q-item-section class="contact-schedule-day">
                      <q-item-label class="contact-schedule-day-text">{{ schedule.day }}</q-item-label>
                    </q-item-section>
                    <q-item-section side class="contact-schedule-hours">
                      <q-item-label class="contact-schedule-hours-text">{{ schedule.hours }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
                
                <div class="contact-schedule-note">
                  <q-icon name="info" size="16px" class="q-mr-xs" />
                  <span>Horarios sujetos a cambios en feriados</span>
                </div>
              </q-card-section>
            </q-card>

            <!-- Información Adicional -->
            <q-card class="contact-info-card contact-additional-card" flat>
              <q-card-section class="contact-info-header">
                <q-icon name="info" size="24px" color="primary" class="q-mr-sm" />
                <span class="contact-info-title">Información Adicional</span>
              </q-card-section>
              
              <q-card-section class="contact-additional-content">
                <div class="contact-additional-item">
                  <div class="contact-additional-icon-wrapper">
                    <q-icon name="emergency" color="red" size="28px" />
                  </div>
                  <div class="contact-additional-text">
                    <div class="contact-additional-title">Emergencias 24/7</div>
                    <div class="contact-additional-description">{{ contactInfo.emergency }}</div>
                  </div>
                </div>

                <q-separator class="contact-additional-separator" />

                <div class="contact-additional-item">
                  <div class="contact-additional-icon-wrapper">
                    <q-icon name="payment" color="green" size="28px" />
                  </div>
                  <div class="contact-additional-text">
                    <div class="contact-additional-title">Métodos de Pago</div>
                    <div class="contact-additional-description">Efectivo, Tarjetas, Transferencia</div>
                  </div>
                </div>

                <q-separator class="contact-additional-separator" />

                <div class="contact-additional-item">
                  <div class="contact-additional-icon-wrapper">
                    <q-icon name="local_hospital" color="blue" size="28px" />
                  </div>
                  <div class="contact-additional-text">
                    <div class="contact-additional-title">Seguros Médicos</div>
                    <div class="contact-additional-description">Aceptamos la mayoría de seguros</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Botones de Acción Rápida -->
            <q-card class="contact-info-card contact-actions-card" flat>
              <q-card-section class="contact-actions-content">
                <q-btn
                  color="primary"
                  label="Agendar Cita Rápida"
                  icon="calendar_today"
                  unelevated
                  no-caps
                  class="contact-action-btn"
                  @click="openAppointmentDialog"
                />
                <q-btn
                  color="secondary"
                  label="Chat en Vivo"
                  icon="chat"
                  outline
                  no-caps
                  class="contact-action-btn"
                  @click="openChat"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-container>
    </section>

    <!-- Social Media Mejorado -->
    <section class="contact-social-section">
      <div class="contact-social-background">
        <div class="contact-cta-shape contact-cta-shape-1"></div>
        <div class="contact-cta-shape contact-cta-shape-2"></div>
      </div>
      
      <q-container class="animated fadeIn">
        <div class="contact-social-content text-center">
          <div class="contact-social-badge">
            <q-icon name="share" size="18px" />
            <span>Síguenos en Redes</span>
          </div>
          
          <h2 class="contact-social-title">Conecta con Nosotros</h2>
          
          <p class="contact-social-text">
            Mantente al día con consejos de salud dental, promociones especiales y todas nuestras novedades
          </p>

          <div class="contact-social-buttons">
            <q-btn
              v-for="(social, index) in socialMedia"
              :key="social.name"
              :color="social.color"
              round
              size="lg"
              :icon="social.icon"
              class="contact-social-btn animated bounceIn"
              :style="{ animationDelay: `${index * 0.1}s` }"
              @click="openSocialMedia(social.url)"
            >
              <q-tooltip>
                {{ social.name }}
              </q-tooltip>
            </q-btn>
          </div>

          <div class="contact-social-stats">
            <div class="contact-social-stat">
              <div class="contact-stat-number">5K+</div>
              <div class="contact-stat-label">Seguidores</div>
            </div>
            <div class="contact-social-stat">
              <div class="contact-stat-number">98%</div>
              <div class="contact-stat-label">Satisfacción</div>
            </div>
            <div class="contact-social-stat">
              <div class="contact-stat-number">24/7</div>
              <div class="contact-stat-label">Activos</div>
            </div>
          </div>
        </div>
      </q-container>
    </section>

    <!-- Dialog de Política de Privacidad Mejorado -->
    <q-dialog v-model="showPrivacyPolicy" transition-show="scale" transition-hide="scale">
      <q-card class="contact-privacy-card">
        <q-card-section class="contact-privacy-header bg-primary text-white">
          <div class="contact-privacy-title">
            <q-icon name="privacy_tip" size="24px" class="q-mr-sm" />
            Política de Privacidad
          </div>
        </q-card-section>

        <q-card-section class="contact-privacy-content">
          <div class="contact-privacy-text">
            <p>
              En <strong>KIRU Odontología</strong> nos comprometemos a proteger tu privacidad y datos personales. 
              Toda la información que nos proporciones será tratada de acuerdo con la normativa vigente de protección de datos.
            </p>
            
            <h5 class="contact-privacy-subtitle">Uso de la Información</h5>
            <ul>
              <li>La información proporcionada será utilizada únicamente para contactarte y brindarte nuestros servicios</li>
              <li>No compartimos tu información con terceros sin tu consentimiento expreso</li>
              <li>Mantenemos tus datos de forma segura y confidencial</li>
            </ul>

            <h5 class="contact-privacy-subtitle">Tus Derechos</h5>
            <ul>
              <li>Acceso a tus datos personales</li>
              <li>Rectificación de información incorrecta</li>
              <li>Cancelación del tratamiento de datos</li>
              <li>Oposición al uso de información</li>
            </ul>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="contact-privacy-actions">
          <q-btn 
            flat 
            label="Entendido" 
            color="primary" 
            v-close-popup 
            class="contact-privacy-btn"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'

const $q = useQuasar()
const loading = ref(false)
const showPrivacyPolicy = ref(false)
const contactFormRef = ref(null)
const consentError = ref('')

// Contact info
const contactInfo = {
  phone: '+591 78900785',
  email: 'info@clinicaboliviaKiru.com',
  address: 'Av. 6 de Octubre #567, Oruro, Bolivia',
  emergency: '+591 70123456'
}

// Form data
const contactForm = reactive({
  name: '',
  phone: '',
  email: '',
  subject: '',
  message: '',
  consent: false
})

// Options
const subjectOptions = [
  'Consulta general',
  'Solicitar cita',
  'Urgencia dental',
  'Información sobre tratamientos',
  'Reclamo o sugerencia',
  'Seguro dental'
]

const scheduleInfo = [
  { day: 'Lunes', hours: '8:00 - 18:00' },
  { day: 'Martes', hours: '8:00 - 18:00' },
  { day: 'Miércoles', hours: '8:00 - 18:00' },
  { day: 'Jueves', hours: '8:00 - 18:00' },
  { day: 'Viernes', hours: '8:00 - 18:00' },
  { day: 'Sábado', hours: '8:00 - 13:00' },
  { day: 'Domingo', hours: 'Cerrado' }
]

const socialMedia = [
  { name: 'Facebook', icon: 'fab fa-facebook-f', color: 'blue-8', url: 'https://facebook.com/clinicadental' },
  { name: 'Instagram', icon: 'fab fa-instagram', color: 'purple', url: 'https://instagram.com/clinicadental' },
  { name: 'WhatsApp', icon: 'fab fa-whatsapp', color: 'green', url: 'https://wa.me/59170123456' },
  { name: 'Twitter', icon: 'fab fa-twitter', color: 'light-blue', url: 'https://twitter.com/clinicadental' },
  { name: 'YouTube', icon: 'fab fa-youtube', color: 'red', url: 'https://youtube.com/clinicadental' }
]

// Methods
const onSubmitContact = async () => {
  consentError.value = ''

  if (!contactFormRef.value) {
    return
  }

  const formValid = await contactFormRef.value.validate().catch(() => false)

  if (!contactForm.consent) {
    consentError.value = 'Debe aceptar el tratamiento de datos'
  }

  if (!formValid || consentError.value) {
    $q.notify({
      type: 'negative',
      message: 'Por favor corrige los campos resaltados',
      icon: 'warning',
      position: 'top'
    })
    return
  }

  loading.value = true
  
  try {
    // Enviar a la API
    await axios.post('http://localhost:5050/contacto', {
      nombre: contactForm.name,
      telefono: contactForm.phone,
      email: contactForm.email,
      asunto: contactForm.subject,
      mensaje: contactForm.message
    })

    $q.notify({
      type: 'positive',
      message: '¡Mensaje enviado correctamente!',
      caption: 'Te contactaremos en menos de 2 horas',
      icon: 'check_circle',
      position: 'top',
      timeout: 3000
    })

    // Reset form
    contactForm.name = ''
    contactForm.phone = ''
    contactForm.email = ''
    contactForm.subject = ''
    contactForm.message = ''
    contactForm.consent = false

    if (contactFormRef.value) {
      contactFormRef.value.resetValidation()
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al enviar el mensaje',
      caption: 'Inténtalo nuevamente',
      icon: 'error',
      position: 'top'
    })
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

const makeCall = (phoneNumber) => {
  window.open(`tel:${phoneNumber}`, '_self')
}

const sendEmail = (email) => {
  window.open(`mailto:${email}`, '_self')
}

const openMap = (address) => {
  const encodedAddress = encodeURIComponent(address)
  window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank')
}

const openSocialMedia = (url) => {
  window.open(url, '_blank')
}

const openAppointmentDialog = () => {
  $q.notify({
    type: 'info',
    message: 'Redirigiendo al agendamiento de citas...',
    icon: 'calendar_today',
    timeout: 1500
  })
}

const openChat = () => {
  $q.notify({
    type: 'info',
    message: 'Iniciando chat en vivo...',
    icon: 'chat',
    timeout: 1500
  })
}
</script>