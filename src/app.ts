import { Consumer } from "./consumer";
import { Router } from "./router";
import { Agent } from "./agent";
import { Report } from "./report";
import { ConsumerSpec, AgentSpec, getRandomAgentSpec, getRandomConsumerSpec, randomDelay } from "./common";

startSimulation();

async function startSimulation () {        
    const requiredConsumers = 10000;         
    const requiredAgents = 20; 
    const printDetails = false;
    const generateReport = true;

    let router = Router.instance();

    // create agents with randomly generated agent spec 
    let agents: Agent[] = [];
    console.log(`Starting simulation - Consumers ${requiredConsumers}, Agents ${requiredAgents}. Print Details - ${printDetails}. Generate Reports ${generateReport} `);
    for(let x=0; x < requiredAgents; x++) {
        let agentSpec: AgentSpec = getRandomAgentSpec();
        agentSpec.id = x + 1;
        agents.push(new Agent(agentSpec, router));            
    }

    // create consumers with randomly generated consumer spec
    let consumers: Consumer[] = [];
    for(let x=0; x < requiredConsumers; x++) {
        let consumerSpec: ConsumerSpec = getRandomConsumerSpec();
        consumerSpec.id = x + 1;
        consumers.push(new Consumer(consumerSpec, router));            
    }

    // start calls 
    console.log(`Initiating ${requiredConsumers} connections ....`);
    consumers.forEach(consumer => {
        consumer.startConnection();
    })

    console.log(`waiting 40 secs to display results ....`);

    await randomDelay(38000, 40000); 
    printResults(consumers, agents, printDetails);

    // generate Report
    if(generateReport) {
        console.log('starting reports..')
        const report = new Report(); 
        consumers.forEach(consumer => {
            report.updateConsumerRecord(consumer);
        });
        agents.forEach(agent => {
            report.updateAgentRecord(agent);
        })
        report.createReports(); 
        await randomDelay(5000, 5500);
        console.log('Report files are created.');        
    }
    console.log('Have a nice day.. :)');
    process.exit(0);

}

function printResults (consumers: Consumer[], agents: Agent[], printDetails: boolean = true) {
    let totalConnected: number = 0;
    consumers.forEach(consumer => {
        if(consumer.connected) {
            totalConnected++;
        }
    });
    const connectedConsumersPercent = Math.floor(totalConnected * 100 / consumers.length) 
    let agentReceivedCallsTotal: number = 0;
    agents.forEach(agent => {
        if(agent.callsReceived) {
            agentReceivedCallsTotal++;
        }
    });
    const agentUtilization = Math.floor(agentReceivedCallsTotal * 100/agents.length);

    console.log(`Number of Consumers = ${consumers.length} ----------- Number of Agents = ${agents.length}`);
    console.log(`Consumers Connected = ${connectedConsumersPercent}%;  Agent Utilization = ${agentUtilization}%`);

    if(printDetails) {
        consumers.forEach(consumer => {            
            console.log(`consumer id = ${consumer.consumerSpec.id}; is Connected = ${consumer.connected}; Callbacks Received = ${consumer.callbacksReceived}; specs = ${JSON.stringify(consumer.consumerSpec)}`);
        });
        agents.forEach(agent => {
            console.log(`agent id = ${agent.agentSpec.id}; calls Received = ${agent.callsReceived}; messages Received = ${agent.messagesReceived}; accepts = ${JSON.stringify(agent.agentSpec.accepts)}; `)
        });
    }
}
