//REST es una arquitectura de software, la mayoria de arquitecturas repsonde a crear en base a principios para simplificar y crear algo sostenible en el tiempo.
//LOs principios de REST son:
//EScalabilidad: que pueda crecer y adaptarse a nuevas necesidades.
//Simplicidad: que sea facil de entender y usar.
//Interoperabilidad: que pueda comunicarse con diferentes sistemas y plataformas.
//Flexibilidad: que pueda adaptarse a diferentes necesidades y cambios en el futuro.
//Mantenibilidad: que sea facil de mantener y actualizar en el tiempo.
//Reusabilidad: que pueda reutilizarse en diferentes contextos y aplicaciones.
//Seguridad: que pueda protegerse contra ataques y vulnerabilidades.
//Portabilidad: que pueda ejecutarse en diferentes entornos y plataformas sin problemas.
//Visibilidad: que pueda monitorearse y depurarse facilmente para detectar problemas y errores.

// Sus fundamentos:
//1. Recursos: son las entidades que se exponen a traves de la API identificadas ppor una URL unica.
//2. Verbos HTTP: son las acciones que se pueden realizar sobre los recursos, como GET, POST, PUT, DELETE, etc.
//3. Representaciones: son las diferentes formas en que se pueden representar los recursos, como JSON, XML, HTML, etc.
//4. Stateless: el servidor no debe mantener información o tener un estado del cliente entre peticiones para saber que responder, cada petición debe contener toda la información necesaria para ser procesada.

//Dado esto hay veces que podemos crear API's que no sean REST

const express = require("express");
const crypto = require("crypto");
const { validarPelicula, validarParcialPelicula } = require("./schemas/movies"); //Importamos la funcion de validacion de peliculas

const peliculas = require("./movies.json");

const app = express();
app.disable("x-powered-by");

const puerto = process.env.PORT || 3000;

app.use(express.json()); //Para poder recibir datos en formato JSON

app.get("/", (req, res) => {
  res.send("<h1>Hola Mundo</h1>");
});

//Hya un middleware par aoslucionar lso probelmas de corrs pero lo que hace es permitir todo y no es seguro ni util simepre
//app.use(cors()); //Esto permite que cualquier origen pueda acceder a la API, se intala con npm install cors -E

//metodos normlaes: get/head/post
//metodos especiales: put/patch/delete
//Los metodos especiales son los que se usan para modificar recursos, los normales son para leer
//los especiales tiene otro probelma espcaial tambien llamado CORS-PREFLIGHT, que es una peticion previa que se hace para verificar si el servidor permite el acceso al recurso solicitado desde otro origen (dominio, puerto, etc.).
//Esto se hace para evitar ataques de tipo CSRF (Cross-Site Request Forgery) y XSS (Cross-Site Scripting), que son ataques que intentan robar información o ejecutar código malicioso en el navegador del usuario.
//Pero estos requieren usan un metodo especial llamado OPTIONS antes de hacer los otros donde pregunta por si tiene permiso el origen

const ACCEPT_ORIGINS = ["http://localhost:8080", "http://localhost:3000"];

//El principio rest dice que cada recurso tiene un url unica en este caso peliculas, siempre que queraos est erecursos debe comenzar con /peliculas
app.get("/peliculas", (req, res) => {
  /* ERROR CORS (Cross-Origin Resource Sharing) sucede solo en los navegadores que van a otro dominio que no es el suyo a por un recurso
  esto es porque no se tiene la cabecera de respuesta que indica el origen de la petición si tiene acceso, el navegador pregunta al servidor que si puede acceder
  el servidor no le dice nada y el navegador bloquea la petición */
  if (ACCEPT_ORIGINS.includes(req.headers.origin) || !req.headers.origin) {
    //Si no tiene origin es porque lo hace algo que no es navegador o porque viene desde el mismo origen y ahi no lo manda al pedirlo asimismo
    res.header("Access-Control-Allow-Origin", req.headers.origin);
  }
  //res.header("Access-Control-Allow-Origin", "*"); //Esto permite que cualquier origen pueda acceder a la API, en produccion deberia ser mas restrictivo. podemo poner * o directmente la direccion

  let { genre, page } = req.query;
  peliculasLimitadas = peliculas.slice(0, 5); //Limitar a 5 resultados por defecto para no saturar el servidor
  console.log("Pagina: ", page);

  page ? page : (page = 1);
  console.log("Pagina: ", page);

  const pagina = parseInt(page);
  const inicio = (pagina - 1) * 5;
  const fin = inicio + 5;
  peliculasLimitadas = peliculas.slice(inicio, fin);

  if (genre) {
    const peliculasFiltradas = peliculasLimitadas.filter((p) =>
      p.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
    return res.json(peliculasFiltradas);
  }
  //Para lo de representar se puede leer como venia y mandarlo con ese formato, aunque eso ya es muy raro
  return res.json(peliculasLimitadas);
});

app.get("/peliculas/:id", (req, res) => {
  //se puede usar path to regex para validar el id
  const { id } = req.params;
  const pelicula = peliculas.find((p) => p.id === id);
  if (pelicula) {
    res.json(pelicula);
  } else {
    res.status(404).send("Pelicula no encontrada");
  }
});

app.post("/peliculas", (req, res) => {
  const resultado = validarPelicula(req.body);
  if (resultado.error) {
    return res.status(422).json(JSON.parse(resultado.error));
  }

  const nuevaPelicula = {
    id: crypto.randomUUID(), //Genera un id unico nativo de react UUID (universally unique identifier)
    ...resultado.data,
  };

  //Esto no es rest porque guardamos el estado de la app en memoria, por ahora en lo que hacemos una BD
  peliculas.push(nuevaPelicula);
  res.status(201).json(nuevaPelicula); //201 es el codigo de creado, se suele responder con el recurso creado para actualizar cache del cliente en la misma peticion puesto que ya llega con id.
});

app.patch("/peliculas/:id", (req, res) => {
  const { id } = req.params;
  const result = validarParcialPelicula(req.body);
  if (result.error) {
    return res.status(422).json(JSON.parse(result.error));
  }

  const peliculaIndex = peliculas.findIndex((p) => p.id === id);
  if (peliculaIndex === -1) {
    return res.status(404).send("Pelicula no encontrada");
  }

  const peliculaActualizada = {
    ...peliculas[peliculaIndex],
    ...result.data,
  };
  peliculas[peliculaIndex] = peliculaActualizada;
  res.json(peliculaActualizada);
});

app.delete("/peliculas/:id", (req, res) => {
  if (ACCEPT_ORIGINS.includes(req.headers.origin) || !req.headers.origin) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
  }
  const { id } = req.params;
  const peliculaIndex = peliculas.findIndex((p) => p.id === id);
  if (peliculaIndex === -1) {
    return res.status(404).send("Pelicula no encontrada");
  }
  peliculas.splice(peliculaIndex, 1);
  res.status(204).send();
});

//El metodo OPTIONS se usa para verificar si el servidor permite el acceso al recurso solicitado desde otro origen (dominio, puerto, etc.).
app.options("/peliculas/:id", (req, res) => {
  if (ACCEPT_ORIGINS.includes(req.headers.origin) || !req.headers.origin) {
    //Encabezados para permitir el acceso desde el origen especificado
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    //Encabezados para permitir los metodos y encabezados que se pueden usar en la peticion
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    //Encabezados para permitir los encabezados que se pueden usar en la peticion
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
  res.status(204).send(); //204 No Content, no hay contenido que devolver
});

app.use((req, res) => {
  res.status(404).send("Recurso no encontrado");
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
