const z = require("zod"); //Zod es una libreria de validacion de datos, se usa para validar los datos que recibimos en las peticiones y asegurarnos de que cumplen con un esquema definido.

//Validacion de datos con Zod
const peliculaSchema = z.object({
  title: z.string().min(1, "El titulo es obligatorio"),
  genre: z.array(
    z.enum([
      "Action",
      "Comedy",
      "Drama",
      "Horror",
      "Sci-Fi",
      "Romance",
      "Adventure",
      "Crime",
      "Science Fiction",
      "Fantasy",
      "Biography",
    ]),
    {
      required_error: "El género es obligatorio",
      invalid_type_error: "El género debe ser un array de strings",
    }
  ),
  year: z
    .number()
    .int()
    .min(1888, "El año debe ser un número entero mayor a 1888"),
  director: z.string().min(1, "El director es obligatorio"),
  rate: z
    .number("La calificación debe ser un número")
    .min(0, "La calificación debe ser un número mayor o igual a 0")
    .max(10, "La calificación debe ser un número menor o igual a 10"),
  poster: z.url("El poster debe ser una URL válida"),
  duration: z
    .number()
    .int()
    .min(1, "La duración debe ser un número entero mayor a 0"),
});

//La funcionalidad especial de esta validadion es que si se pasa un objeto que no esta validado simplemnte lo ignora
//Esto sirve porqeu una API deberia recibir siempre de todo y uno deberia ser quien lo filtre, con qeu se le pasen todos funciona los demas sobran. 
function validarPelicula(object) {
  return peliculaSchema.safeParse(object); //safeParse devuelve un objeto con success y data o error, si es correcto devuelve success: true y data con los datos validados, si no es correcto devuelve success: false y error con los errores de validación.
}

function validarParcialPelicula(object) {
  return peliculaSchema.partial().safeParse(object); //partial permite que los campos sean opcionales, es decir, no es necesario enviar todos los campos para que la validación sea exitosa.
}

module.exports = {
  validarPelicula,
  validarParcialPelicula,
};


//La idempotencia es una propiedad que dice que realizar la misma operación varias veces tiene el mismo efecto que realizarla una sola vez. 
//Por ejemplo las funciones puras son idempotentes, ya que siempre devuelven el mismo resultado para los mismos argumentos.
//POST no es idempotente porque crear un nuevo recurso cada vez que se hace la peticion.
//PUT es idempotente porque actualiza un recurso existente, si se hace varias veces el mismo cambio no afecta al recurso y aunque lo cree no importa ya que es el mismo resultado por que se le pasa un id
//PATCH es idempotente porque actualiza un recurso existente, si se hace varias veces el mismo cambio no afecta al recurso ,en ocasiones no lo es porque pueden tener campos de fecha que indiquen su actualizacion y ya no seria el mismo resultado por ejemplo.