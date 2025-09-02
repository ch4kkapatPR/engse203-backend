const express = require('express');

const app = express();

const PORT = 3001;

const cors = require('cors');

const agent = {
    code: "A001",    
    name: "Hod",        
    status: "Available",      
    loginTime: new Date()
};

const agents = [
   {
    code: "A001",      
    name: "Mairu",        
    status: "Available",      
    loginTime: new Date()
   },
   {
    code: "A002",       
    name: "Steak",         
    status: "Wrap Up",       
    loginTime: new Date()
   },
   {
    code: "A003",        
    name: "Slept",         
    status: "Active",       
    loginTime: new Date()
   },
];

app.use(express.json());
app.use(cors());
app.patch('/api/agents/:code/status', (req, res) => {
    const agentCode = req.params.code;
    
    const newStatus = req.body.status; 

    console.log("Agent Code:", agentCode);
    console.log("New Status:", newStatus);

    const agent = agents.find(a => a.code == agentCode);

    console.log('found agent :', agent);

    if (!agent) {
        return res.status(404).json({
            success: false,
            error: "Agent not found"
        });
    }

    const validStatuses = ["Available", "Active", "Wrap Up", "Not Ready", "Offline"];
    if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({
            success: false,
            error: "Invalid status",
            validStatuses: validStatuses
        });
    }  

    const oldStatus = agent.status;

    agent.status = newStatus;
    agent.lastStatusChange = new Date();

    console.log('current agent :', agent)

    res.json({
        success: true,
        message: `Agent ${agentCode} status changed from ${oldStatus} to ${newStatus}`,
        data: agent
    })
    
});

app.get('/api/dashboard/stats', (req, res) => {
    const totalAgents = agents.length;

    const available = agents.filter(a => a.status === "Available").length;
    const active = agents.filter(a => a.status === "Active").length;
    const wrapUp = agents.filter(a => a.status === "Wrap Up").length;
    const notReady = agents.filter(a => a.status === "Not Ready").length;
    const offline = agents.filter(a => a.status === "Offline").length;

    const availablePercent = (count) => totalAgents > 0 ?
        Math.round((count / totalAgents) * 100) : 0;

    res.json({
        success: true,
        data: {
            total: totalAgents,
            statusBreakdown: {
                available: { count: available, percent: availablePercent },
                active: { count: active, percent: availablePercent },
                wrapUp: { count: wrapUp, percent: availablePercent },
                notReady: { count: notReady, percent: availablePercent },
                offline: { count: offline, percent: availablePercent },
            },
            timestamp: new Date().toString()
        }
    });
});

app.post('/api/agents/:code/login', (req, res) => {
    const agentCode = req.params.code;
    const { name } = req.body;

    let agent = agents.find(a => a.code === agentCode);

    if (!agent) {
        agent = { code: agentCode };
        agents.push(agent);
    }

    agent.name = name;
    agent.status = "Available";
    agent.loginTime = new Date();

    res.json({
        success: true,
        message: `Agent ${agentCode} logged in`,
        data: agent
    });
});

app.post('/api/agents/:code/logout', (req, res) => {
    const agentCode = req.params.code;
    const agent = agents.find(a => a.code === agentCode);

    if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
    }

        agent.status = "Offline";
        delete agent.loginTime;
    
        res.json({
        message: `Agent ${agentCode} logged out `,
        data: agent
    })
});

app.get('/api/agents', (req, res) => {
    res.json({
        success: true,  
        data: agents,        
        count: agents.length,       
        timestamp: new Date().toISOString()  
    });
});

app.get('/api/agents/count', (req, res) => {
        res.json({
        success: true,    
        count: 3,      
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.send("Hello Agent Wallboard!");
});

app.get('/hello', (req, res) => {
    res.send("Hello");
});

app.get('/health', (req, res) => {
    res.send({
        status: "OK",
        timestamp : new Date()
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});