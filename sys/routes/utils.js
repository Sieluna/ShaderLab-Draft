const rank = require("../config/rank.js");

/**
 * get id from params
 * @param req
 * @return {number|null}
 */
function getIdParam(req) {
    const id = req.params.id;
    if (/^\d+$/.test(id))
        return Number.parseInt(id, 10);
    return null;
}

/**
 * If exist body return number from string if not it should be viestor
 * @param {any} req
 * @return {rank}
 */
function getUserRank(req) {
    const permission = req.body.rank;
    if (!permission) return rank.Visitor;
    return /^\d+$/.test(permission) ? Number.parseInt(permission, 10) : rank.Visitor;
}

module.exports = { getIdParam, getUserRank };
