import { Consumer } from "./consumer";
import { Router } from "./router";
import { Agent } from "./agent";
import { Report } from "./report";
import { ConsumerSpec, AgentSpec, getRandomAgentSpec, getRandomConsumerSpec, randomDelay } from "./common";

const args: string[] = process.argv.slice(2); 

startSimulation();

async function startSimulation () {    
    let requiredConsumers = 1000;         
    let waitForConnectionsMin = 5; 
    const requiredAgents = 20; 
    const printDetails = false;
    const generateReport = true;

    for(let x=0; x < args.length; x++) {
        requiredConsumers = parseInt(args[0]); 
        waitForConnectionsMin = parseInt(args[1])
    }
    console.log(`Starting simulation - Consumers : ${requiredConsumers}, Agents : ${requiredAgents}. Print Details : ${printDetails}. Generate Reports : ${generateReport} `);

    let router = Router.instance();

    // create agents with randomly generated agent spec 
    let agents: Agent[] = [];
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


    let timesRun = Math.floor(waitForConnectionsMin * 60 * 1000 / 10000);
    console.log(`waiting for up to ${waitForConnectionsMin} minutes, and checking every 10 secs to see if all consumers are connected ....`);
    let today = new Date();
    process.stdout.write(`started at - ${today.getHours()}:${today.getMinutes()}`);
    const interval = setInterval(function(){
        let allConnected = true;
        for(let x=0; x < consumers.length; x++) {
            if(!consumers[x].connected) {
                allConnected = false;
                break;
            }
        }
        if(timesRun-- === 0 || allConnected) {
            today = new Date();
            process.stdout.write(`Ended at - ${today.getHours()}:${today.getMinutes()}\n`);
            
            printResults(consumers, agents, printDetails);
            clearInterval(interval);

            if(generateReport) {
                console.log('starting reports..')
                const report = new Report(); 
                consumers.forEach(consumer => {
                    report.updateConsumerRecord(consumer);
                });
                agents.forEach(agent => {
                    report.updateAgentRecord(agent);
                })
                report.createReports().then(() => {
                    console.log('Report files are created.'); 
                    process.exit(0);
                }).catch(error => {
                    console.error(error);
                    process.exit(1);
                });                  
            }        
            
        } else {
            process.stdout.write(' . ');
        }
    }, 10000); 
    

}

function printResults (consumers: Consumer[], agents: Agent[], printDetails: boolean = true) {
    let totalConnected: number = 0;
    consumers.forEach(consumer => {
        if(consumer.connected) {
            totalConnected++;
        }
    });
    const connectedConsumersPercent = Math.floor(totalConnected * 100 / consumers.length); 

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
