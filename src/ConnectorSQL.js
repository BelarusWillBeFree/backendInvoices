import mysql from 'mysql2';
import sqlConfig from '../config/sqlConfig.js';

class ConnectorSQL {
    constructor() {
        this.connection = mysql.createConnection(sqlConfig);
    }

    insertInvoice() {

    }

    updateInvoice() {

    }

    querySelectWithFilter(filter) {
        try {
            const strFilter = filter.map(({numInvoice, dateInvoice}) => (`numInvoice="${numInvoice}" AND dateInvoice="${dateInvoice}"`)).join(' or ');
            const selectQuery = `SELECT numInvoice, dateInvoice FROM Invoice WHERE ${strFilter};`;
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
        const queries = invoices.map((invoice) => (` UPDATE Invoice SET state='${invoice.state}' WHERE numInvoice='${invoice.numInvoice}' AND dateInvoice='${invoice.dateInvoice}'`));
        queries.forEach((query) => (
            this.connection.query(query, sumResult)
        ));
        
    }

    appendInvoices(invoices, sumResult) {
        if (!invoices.length) return;
        const queryInsert = `INSERT INTO Invoice (numInvoice, dateInvoice, state) VALUES `;
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