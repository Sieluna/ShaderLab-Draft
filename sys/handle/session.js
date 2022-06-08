const { Op } = require("sequelize");
const { Store } = require("express-session");
const { session } = require("./model.js").models;
const { storeOption } = require("../config/session.js");

function promisify (promise, cb) {
    if (typeof cb === "function") {
        promise = promise.then(obj => cb(null, obj)).catch(err => {
            if (!err) {
                const error = new Error(err + '');
                error.cause = err;
                err = error;
            }
            cb(err);
        });
    }
    return promise;
}

class sessionStore extends Store {
    constructor(options) {
        super(options);
        this.options = { ...storeOption, ...(options || {}) };
        this.startExpiringSessions();
    }

    sync (options) {
        return session.sync(options);
    }

    get (sid, cb) {
        return promisify(session.findOne({ where: { sid: sid } }).then(session => session ? JSON.parse(session.data) : null), cb);
    }

    set (sid, data, cb) {
        const stringData = JSON.stringify(data), expires = this.expiration(data), defaults = { data: stringData, expires: expires };
        return promisify(session.findCreateFind({ where: { sid: sid }, defaults: defaults, raw: false }).then(([session]) => {
            let changed = false;
            Object.keys(defaults).forEach(key => {
                if (key == "data") return;
                if (session.dataValues[key] !== defaults[key]) {
                    session[key] = defaults[key];
                    changed = true;
                }
            });
            if (session.data !== stringData) {
                session.data = JSON.stringify(data);
                changed = true;
            }
            if (changed) {
                session.expires = expires;
                return session.save().then(() => session);
            }
            return session;
        }), cb);
    }

    touch (sid, data, cb) {
        return promisify(session.update({ expires: this.expiration(data) }, { where: { sid: sid } }).then(rows => rows), cb);
    }

    destroy (sid, cb) {
        return promisify(session.findOne({ where: { sid: sid }, raw: false }).then(session => session ? session.destroy() : null), cb)
    }

    length (cb) {
        return promisify(session.count(), cb);
    }

    clearExpiredSessions (cb) {
        return promisify(session.destroy({ where: { expires: { [Op.lt]: new Date() }}}), cb);
    }

    startExpiringSessions () {
        this.stopExpiringSessions()
        if (this.options.expirationInterval > 0) {
            this._expirationInterval = setInterval(this.clearExpiredSessions.bind(this), this.options.expirationInterval);
            this._expirationInterval.unref();
        }
    }

    stopExpiringSessions () {
        if (this._expirationInterval) {
            clearInterval(this._expirationInterval);
            this._expirationInterval = null;
        }
    }

    expiration (data) {
        return data.cookie && data.cookie.expires && !isNaN(data.cookie.expires) ? data.cookie.expires : new Date(Date.now() + this.options.expiration);
    }
}

module.exports = sessionStore;
