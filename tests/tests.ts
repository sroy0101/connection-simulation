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
let agentSpecs: AgentSpec[] = [];

describe('consumer tests', () => {
    afterEach(() => {
        sinon.restore();
    })    
    it('initiate a connection', () => {        

        // stub router connect request method to return true. 
        let stub= sinon.stub(router, "connect").returns(true); 

        let consumer: Consumer = new Consumer(consumerSpec, router);
        consumer.startConnection(); 
        expect(stub.callCount).equal(1);
        expect(consumer.connected).to.equal(true);
    });
    
});

describe('router tests', () => {
    before(() => {        
        let accepts1: Accept[] = [ {type: AcceptType.AGE, value: "40"}];         
        let accepts2: Accept[] = [ {type: AcceptType.INCOME, value: "90000"}];    
        agentSpecs.push({id: 1, accepts: accepts1}, {id: 2, accepts: accepts2});
    })

    it('finds matching agent', () => {
        // create a stub for Agent.
        let agent1 : Agent = new Agent(agentSpecs[0], router);
        let agent2 : Agent = new Agent(agentSpecs[1], router);

        // set up the agent Registry. 
        router.agentRegistry= []; 
        router.registerAgent(agent1);
        router.registerAgent(agent2)

        // check it matches on age
        let agents: Agent = router.selectAgentsForConsumer(consumerSpec); 
        expect(agents.agentSpec.accepts[0].value).to.equal('40');

        //check it always returns one agent even if there is 
        consumerSpec.income = 92000;
        agents = router.selectAgentsForConsumer(consumerSpec); 
        expect(agents.agentSpec.id).to.be.oneOf([1,2]);
    });
});

describe('agent tests', () => {
    before(() => {        
        let accepts1: Accept[] = [ {type: AcceptType.AGE, value: "40"}];         
        let accepts2: Accept[] = [ {type: AcceptType.INCOME, value: "90000"}];    
        agentSpecs.push({id: 1, accepts: accepts1}, {id: 2, accepts: accepts2});
    });
    afterEach(() => {
        sinon.restore();
    });    
    it('should stay busy for 50 to 300ms after a connection', () => {
        let agent : Agent = new Agent(agentSpecs[0], router);
        agent.connect(); 
        setTimeout(()=> {
            expect(agent.isBusy).equal(true);
        }, 45);
        setTimeout(() => {
            expect(agent.isBusy).equal(false);
        }, 350);
    });
    it('returns calls for left messages', async () => {        
        let consumer: Consumer = new Consumer(consumerSpec, router);
        const spy = sinon.spy(consumer, 'messageCallBack');
        
        let agent : Agent = new Agent(agentSpecs[0], router);
        let message: Message = {
            phone: consumerSpec.phone,
            message: "please call back",
            callBack: consumer.messageCallBack
        }
        agent.saveMessage(message);
        agent.saveMessage(message);
        
        await(randomDelay(2500, 3000))
        .then(() => {
            expect(spy.callCount).equal(2);
        }).catch((error)=> {
            assert(false)
        });        
    });
});

describe('create reports tests', () => {
    before(() => {        
        let accepts1: Accept[] = [ {type: AcceptType.AGE, value: "40"}];         
        let accepts2: Accept[] = [ {type: AcceptType.INCOME, value: "90000"}];    
        agentSpecs.push({id: 1, accepts: accepts1}, {id: 2, accepts: accepts2});
    });
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
        checkFileSaveSuccess(report);       
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
        checkFileSaveSuccess(report);        
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
        checkFileSaveSuccess(report);
    })
})

async function checkFileSaveSuccess (report: Report)  {
    await(randomDelay(3000, 3500))
        .then(() => {
            expect(report.isFileSavedSuccess).equal(true);
        }).catch((error)=> {
            assert(false)
        });
}






