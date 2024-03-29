const rawWqlKeyWords = [
    "ADD",
    "ADD CONSTRAINT",
    "ALTER",
    "ALTER COLUMN",
    "ALTER TABLE",
    "ALL",
    "AND",
    "ANY",
    "AS",
    "ASC",
    "BACKUP DATABASE",
    "BETWEEN",
    "CASE",
    "CHECK",
    "COLUMN",
    "CONSTRAINT",
    "CREATE",
    "CREATE DATABASE",
    "CREATE INDEX",
    "CREATE OR REPLACE VIEW",
    "CREATE TABLE",
    "CREATE PROCEDURE",
    "CREATE UNIQUE INDEX",
    "CREATE VIEW",
    "DATABASE",
    "DEFAULT",
    "DELETE",
    "DESC",
    "DISTINCT",
    "DROP",
    "DROP COLUMN",
    "DROP CONSTRAINT",
    "DROP DATABASE",
    "DROP DEFAULT",
    "DROP INDEX",
    "DROP TABLE",
    "DROP VIEW",
    "EXEC",
    "EXISTS",
    "FOREIGN KEY",
    "FROM",
    "FULL OUTER JOIN",
    "GROUP BY",
    "HAVING",
    "IN",
    "INDEX",
    "INNER JOIN",
    "INSERT INTO",
    "INSERT INTO SELECT",
    "IS NULL",
    "IS NOT NULL",
    "JOIN",
    "LEFT JOIN",
    "LIKE",
    "LIMIT",
    "NOT",
    "NOT NULL",
    "OR",
    "ORDER BY",
    "OUTER JOIN",
    "PRIMARY KEY",
    "PROCEDURE",
    "RIGHT JOIN",
    "ROWNUM",
    "SELECT",
    "SELECT DISTINCT",
    "SELECT INTO",
    "SELECT TOP",
    "SET",
    "TABLE",
    "TOP",
    "TRUNCATE TABLE",
    "UNION",
    "UNION ALL",
    "UNIQUE",
    "UPDATE",
    "VALUES",
    "VIEW",
    "WHERE",
    "PRAGMA",
    "INTEGER",
    "PRIMARY",
    "letCHAR",
    "DATETIME",
    "NULL",
    "REFERENCES",
    "INDEX_LIST",
    "BY",
    "CURRENT_DATE",
    "CURRENT_TIME",
    "EACH",
    "ELSE",
    "ELSEIF",
    "FALSE",
    "FOR",
    "GROUP",
    "IF",
    "INSERT",
    "INTERVAL",
    "INTO",
    "IS",
    "KEY",
    "KEYS",
    "LEFT",
    "MATCH",
    "ON",
    "OPTION",
    "ORDER",
    "OUT",
    "OUTER",
    "REPLACE",
    "TINYINT",
    "RIGHT",
    "THEN",
    "TO",
    "TRUE",
    "WHEN",
    "WITH",
    "UNSIGNED",
    "CASCADE",
    "ENGINE",
    "TEXT",
    "AUTO_INCREMENT",
    "SHOW",
    "BEGIN",
    "END",
    "PRINT",
    "OVERLAPS"
];

const requiredLowercase = false;

const sqlKeyWords = [ ...rawWqlKeyWords ];

const keywordsMap = {}, regexMap = {};

for (const keyWord of rawWqlKeyWords) {
    // lower case is not needed for sequelize.
    if (requiredLowercase) {
        const lcKeyWord = keyWord.toLowerCase();
        keywordsMap[lcKeyWord] = keyWord;
        sqlKeyWords.push(lcKeyWord);
        regexMap[lcKeyWord] = new RegExp("\\b" + lcKeyWord + "\\b", "g");
    }
    regexMap[keyWord] = new RegExp("\\b" + keyWord + "\\b", "g");
}

const extractingRegex = new RegExp("\\b(" + sqlKeyWords.join("|") + ")\\b", "gm");

const extractKeywords = str => {
    const uniqWords = new Set();
    Array.from(str.matchAll(extractingRegex)).forEach(match => uniqWords.add(match[0]));
    return Array.from(uniqWords);
};

module.exports = { keywordsMap, regexMap, sqlKeyWords, extractKeywords, extractingRegex };
