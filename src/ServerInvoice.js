import express from "express";
import ConnectorSQL from './ConnectorSQL.js';
import _ from 'lodash';

class ServerInvoice {
    constructor() {
        this.port = 3000;
        this.app = express();
        this.initServices();
        this.startServer();
    }

    initServices() {
    //    const urlencodedParser = express.urlencoded({extended: false});
        this.app.use(express.json());
        this.app.post("/setInvoice", this.setInvoice);
        this.app.get("/getInvoice", this.getInvoice);
        this.app.get("/", this.default);
        //console.log(process.env.NODE_ENV);
    }

    startServer() {
        this.app.listen(this.port, () => {
            console.log(`Server ${process.env.NODE_ENV} is Running`)
        });
    }

    sendResponse(response, bodyResp) {
        response.send(bodyResp);
    }

    setInvoice(request, response) {
        const connector = new ConnectorSQL();
        const inputData = request.body;
        const responseProcessing = (err, dataSavedInSQL) => {
            const isEqualRow = (row1, row2) => (row1.numInvoice === row2.numInvoice && row2.dateInvoice === row2.dateInvoice);
            const invoiceForUpdate = _.intersectionWith(inputData, dataSavedInSQL, isEqualRow);
            const invoiceForAppend = inputData.reduce((prev, curr) => {

                const countFindRow = invoiceForUpdate 
                    ? invoiceForUpdate.filter(
                        (obj) => obj.numInvoice === curr.numInvoice && obj.dateInvoice === curr.dateInvoice).length : 0;
                if (countFindRow === 0) prev.push(curr);
                return prev;
            }, []);
            const responseObj = [];
            const sumResult = (err, result) => {
                //responseObj.push({err, result});
                console.log(err, result);
            };
            connector.updateInvoices(invoiceForUpdate, sumResult);
            connector.appendInvoices(invoiceForAppend, sumResult);
           // console.log('Update',invoiceForUpdate);
           // console.log('Insert',invoiceForAppend);
            response.send('done');//JSON.stringify(responseObj)
            connector.connectEnd();
        }
    //    const params = request.query;
    //    console.log(request.body);
    //    const boundResponseProcessing = responseProcessing.bind(this);
        connector.getState({ inputData, responseProcessing });
    }

    getInvoice(request, response) {
        response.send('getInvoice');
    }

    default(request, response) {
        response.send('server is running');
    }
}

export default ServerInvoice;