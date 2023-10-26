module.exports = {
    sessionSecret: process.env.SESSION_SECRET || 'your_default_secret',
    dbConfig: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '4314',
        database: process.env.DB_NAME || 'mydb'
    }
};
