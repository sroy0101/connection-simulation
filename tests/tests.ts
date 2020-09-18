import "mocha";
import * as sinon from "sinon";
import * as chai from "chai";


import { Consumer } from "../src/consumer";
import {ConsumerSpec, AgentSpec, Accept, AcceptType} from "../src/common";
import { Router } from "../src/router";
import { sandbox } from "sinon";

const expect = chai.expect;
let router = Router.instance();

describe('consumer tests', () => {
    afterEach(() => {
        sinon.restore();
    })    
    it('initiate a connection', () => {
        let consumerSpec: ConsumerSpec = {
            id: 1,
            age: 44,
            state: "Georgia",
            kids: 3,
            cars: 2,
            isRenting: false,
            income: 80000,
            phone: 4045556666
        }

        // stub router connect request method to return true. 
        sinon.stub(router, "connect").returns(true); 

        let consumer: Consumer = new Consumer(consumerSpec, router);
        consumer.startConnection().then((result) => {  
            expect(result).to.equal(true);
        });       
        
    });
    it('retries if connection fails', () => {
        let consumerSpec: ConsumerSpec = {
            id: 1,
            age: 39,
            state: "Georgia",
            kids: 3,
            cars: 2,
            isRenting: false,
            income: 80000,
            phone: 4045556666
        }

        // stub router connect request method to return true. 
        let connectCallCount = 0; 
        sinon.stub(router, "connect").returns(false);
 
        let consumer: Consumer = new Consumer(consumerSpec, router);
        setTimeout(()=> consumer.abortConnection(), 330);         

        consumer.startConnection().then((result) => {
            expect(consumer.connectionAttempts).to.greaterThan(10);
            expect(result).to.equal(false);
        });

    })





})