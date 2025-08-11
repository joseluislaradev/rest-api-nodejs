## Recupera todas las peliculas
GET http://localhost:3000/peliculas


## Recupera una pelicula por id
GET http://localhost:3000/peliculas/dcdd0fad-a94c-4810-8acc-5f108d3b18c3


## Recupera una pelicula por genero
GET http://localhost:3000/peliculas?genre=Action


## Crea una pelicula
POST http://localhost:3000/peliculas  
Content-Type: application/json

```json
{
  "title": "Inception",
  "year": 2010,
  "director": "Christopher Nolan",
  "rate": 5,
  "poster": "https://example.com/inception.jpg",
  "duration": 148,
  "genre": ["Science Fiction"]
}
```


## Actualizar una pelicula
PATCH http://localhost:3000/peliculas/dcdd0fad-a94c-4810-8acc-5f108d3b18c3  
Content-Type: application/json

```json
{
  "year": 1889
}
```
