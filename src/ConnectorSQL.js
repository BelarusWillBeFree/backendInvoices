import mysql from 'mysql2';
import sqlConfig from '../config/sqlConnect.js';
import paramsTable from '../config/paramsTable.js';

class ConnectorSQL {
    constructor() {
        this.connection = mysql.createConnection(sqlConfig[process.env.NODE_ENV]);
        this.num = paramsTable.fields.num;
        this.date = paramsTable.fields.date;
        this.state = paramsTable.fields.state;
    }

    insertInvoice() {

    }

    updateInvoice() {

    }

    querySelectWithFilter(filter) {
        try {
            const strFilter = filter.map(({numInvoice, dateInvoice}) => (`${this.num}="${numInvoice}" AND ${this.date}="${dateInvoice}"`)).join(' or ');
            const selectQuery = `SELECT ${this.num}, ${this.date} FROM ${paramsTable.nameTable} WHERE ${strFilter};`;
            return selectQuery;
        } catch (err) {
            throw new Error;
        }
    }

    getState(params) {
        const { inputData, responseProcessing } = params;
        const selectQuery = this.querySelectWithFilter(inputData);
        this.connection.query(selectQuery, responseProcessing);
    }
    updateInvoices(invoices, sumResult) {
        if (!invoices.length) return;
        const queries = invoices.map((invoice) => (` UPDATE ${paramsTable.nameTable} SET ${this.state}='${invoice.state}' WHERE ${this.num}='${invoice.numInvoice}' AND ${this.date}='${invoice.dateInvoice}'`));
        queries.forEach((query) => (
            this.connection.query(query, sumResult)
        ));
        
    }

    appendInvoices(invoices, sumResult) {
        if (!invoices.length) return;
        const queryInsert = `INSERT INTO ${paramsTable.nameTable} (${this.num}, ${this.date}, ${this.state}) VALUES `;
        const queryData = invoices.map((invoice) => (`
        ("${invoice.numInvoice}", "${invoice.dateInvoice}", "${invoice.state}")`)).join(',');
        const totalQuery = queryInsert.concat(queryData, ';');
        console.log(totalQuery);
        this.connection.query(totalQuery, sumResult);
    }

    connectEnd () {
        this.connection.end();
    }
}

export default ConnectorSQL;