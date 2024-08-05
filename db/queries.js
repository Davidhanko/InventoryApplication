const db = require('./pool');

//GAMES

async function getGamesIndex() {
  const { rows } = await db.query('SELECT * FROM games order by game_name ASC');
  return rows;
}

async function getAllDataOnGame(id) {
    const query = `
        SELECT games.game_name as name, games.game_price as price,
               array_agg(DISTINCT genres.genre_name) as genres,
               array_agg(DISTINCT genres.id) as genre_id,
               array_agg(DISTINCT companies.company_name) as companies,
               array_agg(DISTINCT companies.id) as company_id,
               games.id
        FROM games
                 LEFT JOIN game_genres ON games.id = game_genres.game_id
                 LEFT JOIN genres ON game_genres.genre_id = genres.id
                 LEFT JOIN game_companies ON games.id = game_companies.game_id
                 LEFT JOIN companies ON game_companies.company_id = companies.id
        WHERE games.id = $1
        GROUP BY games.id
    `;

    const {rows} = await db.query(query, [id]);

    return rows[0];
}

//COMPANIES

async function getCompanyIndex() {
    const { rows } = await db.query('SELECT * FROM companies ORDER BY company_name ASC');
    return rows;
}

async function getAllCompanyData(id){
    // First, check if the company has any games
    const checkGamesSQL = `SELECT COUNT(*)
                           FROM game_companies
                           WHERE company_id = $1`;
    const { rows: gameRows } = await db.query(checkGamesSQL, [id]);

    if (gameRows[0].count > 0) {
        // If the company has games, use the original query
        const SQL = `SELECT array_agg(games.id) as game_ids, array_agg(games.game_name) as games,
                            companies.company_name as company, companies.company_country as country, companies.id
                     FROM games
                              JOIN game_companies ON games.id = game_companies.game_id
                              JOIN companies ON game_companies.company_id = companies.id
                     WHERE companies.id = $1
                     GROUP BY companies.id`;
        const { rows } = await db.query(SQL, [id]);
        return rows[0];
    } else {
        // If the company doesn't have games, return only the company's information
        const SQL = `SELECT company_name as company, company_country as country, companies.id
                     FROM companies
                     WHERE id = $1`;
        const { rows } = await db.query(SQL, [id]);
        return { ...rows[0], game_ids: [], games: [] };
    }
}

//GENRES

async function getGenreIndex() {
    const { rows } = await db.query('SELECT * FROM genres ORDER BY genre_name ASC');
    return rows;
}

async function getAllGenreData(id){
    // First, check if the genre has any games
    const checkGamesSQL = `SELECT COUNT(*)
                           FROM game_genres
                           WHERE genre_id = $1`;
    const { rows: gameRows } = await db.query(checkGamesSQL, [id]);

    if (gameRows[0].count > 0) {
        // If the genre has games, use the original query
        const SQL = `SELECT array_agg(games.id) as game_ids, array_agg(games.game_name) as games,
                            genres.genre_name as genre, genres.id
                     FROM games
                              JOIN game_genres ON games.id = game_genres.game_id
                              JOIN genres ON game_genres.genre_id = genres.id
                     WHERE genres.id = $1
                     GROUP BY genres.id`;
        const { rows } = await db.query(SQL, [id]);
        return rows[0];
    } else {
        // If the genre doesn't have games, return only the genre's information
        const SQL = `SELECT genre_name as genre, genres.id
                     FROM genres
                     WHERE id = $1`;
        const { rows } = await db.query(SQL, [id]);
        return { ...rows[0], game_ids: [], games: [] };
    }
}

//CREATE

async function addCompany(name, state){
    const SQL = 'INSERT INTO companies (company_name, company_country) VALUES ($1, $2)';
    console.log('INSERT INTO companies (company_name, company_country) VALUES (' + name + ', ' + state + ')');
    await db.query(SQL, [name, state]);
}

async function addGenre(genres){
    const SQL = 'INSERT INTO genres (genre_name) VALUES ($1)';
    await Promise.all(genres.map(genre => db.query(SQL, [genre])));
}

async function addGame(name, price, company_id, genre_id){
    const SQLGame = 'INSERT INTO games (game_name, game_price) VALUES ($1, $2) RETURNING id';
    const { rows } = await db.query(SQLGame, [name, price]);
    const game_id = rows[0].id;
    const SQLCompany = 'INSERT INTO game_companies (game_id, company_id) VALUES ($1, $2)';
    if(!Array.isArray(company_id)){
        await db.query(SQLCompany, [game_id, company_id]);
    }else{
    await Promise.all(company_id.map(company => db.query(SQLCompany, [game_id, company])));}
    const SQLGenre = 'INSERT INTO game_genres (game_id, genre_id) VALUES ($1, $2)';
    if(!Array.isArray(genre_id)){
        await db.query(SQLGenre, [game_id, genre_id]);
    }
    else{
    await Promise.all(genre_id.map(genre => db.query(SQLGenre, [game_id, genre])));
    }
    return game_id;
}

//UPDATE

async function updateCompany(id, name, country){
    const SQL = 'UPDATE companies SET company_name = $1, company_country = $2 WHERE id = $3';
    await db.query(SQL, [name, country, id]);
}

async function updateGenre(id, name){
    const SQL = 'UPDATE genres SET genre_name = $1 WHERE id = $2';
    await db.query(SQL, [name, id]);
}

async function updateGame(id, name, price, companies, genres){
    const SQLGame = 'UPDATE games SET game_name = $1, game_price = $2 WHERE id = $3';
    await db.query(SQLGame, [name, price, id]);
    const SQLCompany = 'DELETE FROM game_companies WHERE game_id = $1';
    await db.query(SQLCompany, [id]);
    const SQLGenre = 'DELETE FROM game_genres WHERE game_id = $1';
    await db.query(SQLGenre, [id]);
    const SQLCompanyInsert = 'INSERT INTO game_companies (game_id, company_id) VALUES ($1, $2)';
    const SQLGenreInsert = 'INSERT INTO game_genres (game_id, genre_id) VALUES ($1, $2)';
    if(!Array.isArray(companies)){
        await db.query(SQLCompanyInsert, [id, companies]);
    }else{
        await Promise.all(companies.map(company => db.query(SQLCompanyInsert, [id, company])))
    }
    if(!Array.isArray(genres)){
        await db.query(SQLGenreInsert, [id, genres]);
    }else{
        await Promise.all(genres.map(genre => db.query(SQLGenreInsert, [id, genre])))
    }

}

// DELETE

async function deleteCompany(id){
    const SQL = 'DELETE FROM companies WHERE id = $1';
    await db.query(SQL, [id]);
}

async function deleteGenre(id){
    const SQL = 'DELETE FROM genres WHERE id = $1';
    await db.query(SQL, [id]);
}

async function deleteGame(id){
    const SQLGameCompanies = 'DELETE FROM game_companies WHERE game_id = $1';
    await db.query(SQLGameCompanies, [id]);

    const SQLGameGenres = 'DELETE FROM game_genres WHERE game_id = $1';
    await db.query(SQLGameGenres, [id]);

    const SQLGame = 'DELETE FROM games WHERE id = $1';
    await db.query(SQLGame, [id]);
}

module.exports = {
    getGamesIndex,
    getAllDataOnGame,
    getCompanyIndex,
    getAllCompanyData,
    getGenreIndex,
    getAllGenreData,
    addCompany,
    addGenre,
    addGame,
    updateCompany,
    updateGenre,
    updateGame,
    deleteCompany,
    deleteGenre,
    deleteGame
}