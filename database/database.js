const moment = require('moment')
require('dotenv').config()

class data {

    dataTrait(data) {
        var fields = []
        var values = []
        var update = ''
        if (Object.keys(data).length > 0) {
            Object.keys(data).map(key => {
                fields.push(key)
            })
            var temp = []
            fields.map(key => {
                temp.push(data[key])
                update += key + "=\'" + data[key] + '\', '
            })
            // update += `updated="${moment().format("YYYY-MM-DD HH:mm:ss")}"`
            values.push(temp)

            return { fields: [fields], values, update }
        } else if (data.length > 0) {

        }
    }

    dataType(data) {
        if (Object.keys(data).length > 0) {
            return 'object'
        } else if (data.length > 0) {
            return 'array'
        }
    }

    arr2String(data) {
        var value = ''
        data.map(item => {
            value += '' + item + ', '
        })
        return value.substring(0, value.length - 2)
    }

    dataUpdater(data) {
        var fields = []
        var update = ''
        if (Object.keys(data).length > 0) {
            Object.keys(data).map(key => {
                fields.push(key)
            })
            var temp = []
            fields.map(key => {
                temp.push(data[key])
                update += key + "=\'" + data[key] + '\', '
            })
            update = update.substring(0, update.length - 2)
            return { update }
        } else if (data.length > 0) {

        }
    }
}

// Defining DB connection
class database extends data {
    db = require('mysql')
    con = undefined

    async connect() {
        const connect = await new Promise((resolve, reject) => {
            try {
                this.con = this.db.createConnection({
                    host: process.env.HOST,
                    user: process.env.USER,
                    password: process.env.PASSWORD,
                    database: process.env.DATABASE
                })
                this.con.connect((err) => {
                    err ? reject(false) : resolve(true)
                })
            } catch (err) {
                console.log("****************** re-try ******************")
                console.error('connect error', err.message)
                console.log("********************************************")
                resolve(false)
            }
        })
        return connect ?? false
    }

    // This function inserts or update a given value
    async insert(data, table) {
        var result = undefined
        var { fields, values, update } = this.dataTrait(data)
        var query = `INSERT INTO ${table} (${fields}) VALUES ? ON DUPLICATE KEY UPDATE ${update}`;
        console.log(query, values)
        try {
            result = await new Promise((resolve, reject) => {
                this.con.query(query, [values], (err, res) => {
                    if (err) reject(new Error(err.sqlMessage))
                    // console.log(res.affectedRows, res.affectedRows == 1 ? '************':'')
                    if (res.insertId == 0) {
                        console.log(values)
                    }
                    resolve(res)
                })
            })
            console.log('result', result)
        } catch (err) {
            console.log(err.message)
            return { status: 500 }
        }
        return { status: 200, id: result.insertId, warning: result.warningCount }
    }

    async read(table, selecting = undefined, conditions = '') {
        var result = undefined
        var sql = ''
        if (selecting) {
            const toSelect = this.arr2String(selecting)
            sql = `SELECT ${toSelect} FROM ${table} WHERE ${conditions}`
        } else {
            sql = `SELECT * FROM ${table}`
        }

        try {
            result = await new Promise((resolve, reject) => {
                this.con.query(sql, [], (err, res) => {
                    if (err) reject(new Error(err.sqlMessage))
                    resolve(res)
                })
            })
        } catch (err) {
            console.log(err.message)
            return { status: 500 }
        }
        if (result.length == 0) {
            return { status: 204 }
        }

        return { status: 200, result }
    }

    async update(table, setters, condition = undefined) {
        var { update } = this.dataUpdater(setters)
        var result;
        if (!condition) {
            var query = `UPDATE ${table} SET ${update} `;
        } else {
            var query = `UPDATE ${table} SET ${update} WHERE ${condition}`;
        }
        try {
            result = await new Promise((resolve, reject) => {
                this.con.query(query, [], (err, res) => {
                    if (err) reject(new Error(err.sqlMessage))
                    resolve(res)
                })
            })
        } catch (err) {
            console.log(err.message)
            return { status: 500 }
        }
        return { status: 200 }
    }

    async closeConnections() {
        try {
            this.con.end()
        } catch (err) {
            console.log('in closing', err.message)
        }
    }

}

module.exports = {
    createConnection: async () => {
        const db = new database()
        const res = await db.connect()
        return db
    },
}