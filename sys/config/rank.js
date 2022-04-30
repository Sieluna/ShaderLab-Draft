/**
 * User rank
 * - visitor is flag for client justify.
 * - user is from user table.
 * - admin is from user table.
 */
var rank = (function(rank) {
    rank[rank["Visitor"] = 0] = "Visitor";
    rank[rank["User"] = 1] = "User";
    /* User Level 1, User Level 2, User Level 3 */
    rank[rank["Admin"] = 2] = "Admin";
    return rank; }
)(rank || (rank = {}));

module.exports = rank;