const express = require("express");
const { open } = require("sqlite");

const app = express();
const sqlite3 = require("sqlite3");
const path = require("path");
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server Running at 3000");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//GET all movie names

app.get("/movies/", async (request, response) => {
  const getAllMovieQuery = `SELECT movie_name FROM movie;`;
  const movieName = await db.all(getAllMovieQuery);
  response.send(movieName);
});

//ADD movie
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `INSERT INTO 
    movie(director_id,movie_name,lead_actor)
    VALUES
    (${directorId},
        '${movieName}',
        '${leadActor}');`;
  const dbResponsive = await db.run(addMovieQuery);
  const movieId = dbResponsive.lastID;
  response.send("Movie Successfully Added");
});

//GET 1 movie
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie 
    WHERE 
    movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(movie);
});

//Update movie
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `UPDATE movie 
        SET 
            director_id = ${directorId},
            movie_name = '${movieName}',
            lead_actor = '${leadActor}'
        WHERE 
        movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//DELETE movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie
        WHERE 
            movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//GET all directors
app.get("/directors/", async (request, response) => {
  const getAllDirectors = `SELECT * FROM director;`;
  const director = await db.all(getAllDirectors);
  response.send(director);
});

//GET movies with director name
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directedByMovieQuery = `SELECT * FROM 
    movie WHERE
    director_id=${directorId};`;
  const movie = await db.all(directedByMovieQuery);
  response.send(movie);
});
module.exports = app;
