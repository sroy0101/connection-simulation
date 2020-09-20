import "mocha";
import * as sinon from "sinon";
import * as chai from "chai";


import { Consumer } from "../src/consumer";
import {ConsumerSpec, Message, AgentSpec, Accept, AcceptType, randomDelay} from "../src/common";
import { Router } from "../src/router";
import { Agent } from "../src/agent";
import { Report, ConsumerRecord, AgentRecord } from "../src/report";
import { assert } from "chai";

const expect = chai.expect;
let router = Router.instance();
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

describe('create reports tests', () => {
    it('creates consumer Record', () => {
        let report: Report = new Report();

        let consumer1: Consumer = new Consumer(consumerSpec, router);
        consumer1.consumerSpec.id = 1;
        consumer1.connected = true; 
        consumer1.callbacksReceived = 10; 
        report.updateConsumerRecord(consumer1); 

        let consumer2: Consumer = new Consumer(consumerSpec, router);
        consumer2.consumerSpec.id = 2;
        consumer2.connected = false; 
        consumer2.callbacksReceived = 2; 
        report.updateConsumerRecord(consumer2); 

        // report.consumerRecord
        let record: Map<number, ConsumerRecord> = report.consumerRecord; 
    
        let connected: boolean = record.has(1)? record.get(1).connected : null;
        let callbacksReceived: number = record.has(1)? record.get(1).callbacksReceived : null;
    
        expect(record.has(1)).equal(true);
        expect(connected).equal(true);
        expect(callbacksReceived).equal(10);

        connected = record.has(2)? record.get(2).connected : null;
        callbacksReceived = record.has(2)? record.get(2).callbacksReceived : null;
        expect(record.has(2)).equal(true);
        expect(connected).equal(false);
        expect(callbacksReceived).equal(2);

        // check CSV file save
        report.createConsumerReport();
        setTimeout(() => {
            expect(report.isFileSavedSuccess).equal(true);
        }, 3000)
        
    });

    it('creates agent record', () => {
        let report: Report = new Report();

        let accepts1: Accept[] = [ {type: AcceptType.AGE, value: "40"}];
        let agentSpec1= {id: 1, accepts: accepts1};
        let agent1: Agent = new Agent(agentSpec1, router);
        agent1.callsReceived = 10;
        agent1.messagesReceived = 5;
        report.updateAgentRecord(agent1); 

        let accepts2: Accept[] = [ {type: AcceptType.INCOME, value: "90000"}];
        let agentSpec2= {id: 2, accepts: accepts2};
        let agent2: Agent = new Agent(agentSpec2, router);     
        agent2.callsReceived = 15;
        agent2.messagesReceived = 7;   
        report.updateAgentRecord(agent2); 

        let record: Map<number, AgentRecord> = report.agentRecord; 
    
        let callsReceived: number = record.has(1)? record.get(1).callsReceived : null;
        let messagesReceived: number = record.has(1)? record.get(1).messagesReceived : null;
    
        expect(record.has(1)).equal(true);
        expect(callsReceived).equal(10);
        expect(messagesReceived).equal(5);

        callsReceived = record.has(2)? record.get(2).callsReceived : null;
        messagesReceived = record.has(2)? record.get(2).messagesReceived : null;
        expect(record.has(2)).equal(true);
        expect(callsReceived).equal(15);
        expect(messagesReceived).equal(7);

        // check CSV file save
        report.createAgentReport();
        setTimeout(() => {
            expect(report.isFileSavedSuccess).equal(true);
        }, 3000)
    })

    it('saves metrics record', () => {
        let report: Report = new Report();
        
        let consumer1: Consumer = new Consumer(consumerSpec, router);
        consumer1.consumerSpec.id = 1;
        consumer1.connected = true; 
        consumer1.callbacksReceived = 10; 
        report.updateConsumerRecord(consumer1); 

        let consumer2: Consumer = new Consumer(consumerSpec, router);
        consumer2.consumerSpec.id = 2;
        consumer2.connected = false; 
        consumer2.callbacksReceived = 2; 
        report.updateConsumerRecord(consumer2); 

        let accepts1: Accept[] = [ {type: AcceptType.AGE, value: "40"}];
        let agentSpec1= {id: 1, accepts: accepts1};
        let agent1: Agent = new Agent(agentSpec1, router);
        agent1.callsReceived = 10;
        agent1.messagesReceived = 5;
        report.updateAgentRecord(agent1); 

        let accepts2: Accept[] = [ {type: AcceptType.INCOME, value: "90000"}];
        let agentSpec2= {id: 2, accepts: accepts2};
        let agent2: Agent = new Agent(agentSpec2, router);     
        agent2.callsReceived = 15;
        agent2.messagesReceived = 7;   
        report.updateAgentRecord(agent2); 

        // check CSV file save
        report.createMetricsReport();
        setTimeout(() => {
            expect(report.isFileSavedSuccess).equal(true);
        }, 3000)
    })
})
