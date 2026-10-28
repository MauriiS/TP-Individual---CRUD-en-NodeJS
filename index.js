const express = require('express');

const app = express();
const PORT = 3000;

// Permite leer el body de las peticiones en formato JSON (req.body)
app.use(express.json());

// "Base de datos" en memoria: los cambios se pierden al reiniciar el servidor
const productos = [
  { id: 1, nombre: 'Café con leche', precio: 1800, categoria: 'bebida' },
  { id: 2, nombre: 'Medialuna', precio: 900, categoria: 'comida' },
  { id: 3, nombre: 'Tostado de jamón y queso', precio: 3500, categoria: 'comida' },
  { id: 4, nombre: 'Agua mineral', precio: 1200, categoria: 'bebida' }
];

// Próximo id a asignar. Se calcula a partir del id más alto para no repetir
// ids aunque se elimine el último producto.
let siguienteId = Math.max(...productos.map(p => p.id)) + 1;

// Valida nombre y precio. Devuelve un mensaje de error o null si está todo bien.
function validarProducto(datos) {
  if (typeof datos.nombre !== 'string' || datos.nombre.trim() === '') {
    return 'El nombre es obligatorio y no puede estar vacío';
  }
  // typeof 'number' rechaza precios enviados como texto, por ejemplo "1500"
  if (typeof datos.precio !== 'number' || !Number.isFinite(datos.precio) || datos.precio <= 0) {
    return 'El precio debe ser un número mayor que cero';
  }
  return null;
}

// GET / -> mensaje de bienvenida
app.get('/', (req, res) => {
  res.send('Bienvenido a la API de la Cafetería del CRUI');
});

// GET /api/productos -> lista todos los productos
app.get('/api/productos', (req, res) => {
  res.status(200).json(productos);
});

// GET /api/productos/:id -> busca un producto por id
app.get('/api/productos/:id', (req, res) => {
  const id = Number(req.params.id);
  const producto = productos.find(p => p.id === id);

  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  res.status(200).json(producto);
});

// POST /api/productos -> crea un producto nuevo
app.post('/api/productos', (req, res) => {
  const datos = req.body || {};
  const error = validarProducto(datos);

  if (error) {
    return res.status(400).json({ error });
  }

  const nuevo = {
    id: siguienteId++,
    nombre: datos.nombre.trim(),
    precio: datos.precio,
    categoria: datos.categoria
  };
  productos.push(nuevo);

  res.status(201).json(nuevo);
});

// PUT /api/productos/:id -> modifica un producto existente
app.put('/api/productos/:id', (req, res) => {
  const id = Number(req.params.id);
  const producto = productos.find(p => p.id === id);

  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const datos = req.body || {};
  const error = validarProducto(datos);

  if (error) {
    return res.status(400).json({ error });
  }

  // Se modifica el objeto que está dentro del array, así el cambio queda guardado
  producto.nombre = datos.nombre.trim();
  producto.precio = datos.precio;
  if (datos.categoria !== undefined) {
    producto.categoria = datos.categoria;
  }

  res.status(200).json(producto);
});

// DELETE /api/productos/:id -> elimina un producto
app.delete('/api/productos/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = productos.findIndex(p => p.id === id);

  if (indice === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  // splice saca el elemento del array y lo devuelve
  const eliminado = productos.splice(indice, 1)[0];
  res.status(200).json({ mensaje: 'Producto eliminado', producto: eliminado });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
