
const crypto = require('crypto')
const db = require('../database/database')
const moment = require('moment')

module.exports = {
    login: async (req, res, io) => {
        const conn = await db.createConnection()
        if (!conn) {
            res.status(500)
            res.end()
        }

        let pswd = crypto.createHash('md5').update(req.body.pswd).digest('hex')
        var { status, result } = await conn.read('users',
            ["fname", "lname", "identity", "nickname", "id"],
            ` pswd = "${pswd}" and nickname = "${req.body.nickname}"`
        )

        res.status(status)
        if (status != 200) {
            res.end()
        }

        result[0]['exp'] = moment().unix() + (60 * 60)
        const token = Buffer.from(JSON.stringify(result[0]), 'utf-8').toString('base64')
        let response = await conn.update('users',
            { token },
            ` id = ${result[0]['id']}`
        )
        conn.closeConnections()
        res.json({
            token,
            user: result[0]
        })
    },


    validateAuth: async (req, res, next) => {
        if (req.headers.authorization) {
            var token;
            try {
                token = req.headers.authorization.replace('Bearer ', '')
            } catch (err) {
                res.status(401)
                res.end()
            }
            const user = (JSON.parse(Buffer.from(token, 'base64').toString('utf-8')))
            if (user.exp > moment().unix()) {
                //consultar si se coincide con el registro de base de datos
                const conn = await db.createConnection()
                if (!conn) {
                    res.status(500)
                    res.end()
                }
                var { status, result } = await conn.read('users',
                    ["fname", "lname", "identity", "nickname", "id"],
                    ` token = "${token}" and id = "${user.id}"`
                )

                if (status != 200) {
                    res.status(401)
                    res.end()
                }
                next()
            } else {
                res.status(401)
                res.end()
            }
        } else {
            res.status(401)
            res.end()
        }
    }
}