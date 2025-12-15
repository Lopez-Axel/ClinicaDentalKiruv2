const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const util = require('util');
const cors = require('cors');
require('dotenv').config();
require('./auth_google.js');

const jwtSign = util.promisify(jwt.sign);

const app = express();

app.use(cors({
  origin: 'http://localhost:9000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use('/uploads', express.static('uploads'));

app.use('/users', require('./routes/users.js'));
app.use('/anuncios', require('./routes/anuncioRoutes'));

app.use('/dependientes', require('./routes/dependientes.js'));
app.use('/reservas', require('./routes/reservas.js'));
app.use('/servicios', require('./routes/servicioRoutes.js'));
app.use('/payments', require('./routes/payments.js'));
app.use('/sucursales', require('./routes/sucursalRoutes'));
app.use('/especialidad', require('./routes/especialidadRoutes'));
app.use('/dentista', require('./routes/dentistaRoutes'));
app.use('/dentistaEspecialidad', require('./routes/dentistaEspecialidadRoutes'));
app.use('/citas', require('./routes/citaRoutes'));
app.use('/pacientes', require('./routes/pacienteRouter'));
app.use('/recetas', require('./routes/recetaRouter.js'));
app.use('/contacto', require('./routes/contactoRoutes.js'));
app.use('/odontogramas', require('./routes/odontogramaRoutes.js'));
app.use('/piezas', require('./routes/piezaRoutes.js'));
app.use('/caras', require('./routes/caraRoutes.js'));
app.use('/pagos', require('./routes/pagoRoutes.js'));
app.use('/pago-pieza-stripe', require('./routes/pagoPiezaStripeRoutes'));
app.get('/', (req, res) => {
  res.send('<a href="/auth/google">Authenticate con google</a>');
});

app.get('/auth/google',
  passport.authenticate('google', { 
    scope: ['email', 'profile'],
    session: false 
  })
);

app.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: 'http://localhost:9000/login?error=auth_failed',
    session: false 
  }),
  async (req, res) => {
    try {
      const token = await jwtSign(JSON.stringify(req.user), process.env.SECRET);
      const userEncoded = encodeURIComponent(JSON.stringify(req.user));
      
      res.redirect(`http://localhost:9000/#/auth/callback?token=${token}&user=${userEncoded}`);
    } catch (err) {
      console.error('Error generando token:', err);
      res.redirect('http://localhost:9000/login?error=token_generation_failed');
    }
  }
);

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`✓ Servidor ejecutándose en puerto ${PORT}`);
});