const express = require('express')
const { generateSlug } = require('random-word-slugs')
const { ECSClient, RunTaskCommand } = require('@aws-sdk/client-ecs')
const { Server } = require('socket.io')
const Redis = require('ioredis')
const cors = require("cors");

const app = express();

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify the HTTP methods you allow
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify the headers you allow
  };
  
  app.use(cors(corsOptions));
  


const PORT = 6100

const subscriber = new Redis(process.env.REDIS_URL);
subscriber.on('connect',()=>{
    console.log("Redis Connected");
})

const io = new Server({ cors: '*' })

io.on('connection', socket => {
    socket.on('subscribe', channel => {
        socket.join(channel)
        socket.emit('message', `Joined ${channel}`)
    })
})

io.listen(9002, () => console.log('Socket Server 9002'))

const ecsClient = new ECSClient({
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.IAM_ACCESS_KEY,
      secretAccessKey:  process.env.IAM_SECRET_KEY,
    }
})

const config = {
    CLUSTER: process.env.CLUSTER_ARN,
    TASK: process.env.TASK_ARN
}

app.use(express.json())

app.post('/project', async (req, res) => {
    const { gitURL, slug } = req.body
    const projectSlug = slug ? slug : generateSlug();

    // Spin the container
    const command = new RunTaskCommand({
        cluster: config.CLUSTER,
        taskDefinition: config.TASK,
        launchType: 'FARGATE',
        count: 1,
        networkConfiguration: {
            awsvpcConfiguration: {
                assignPublicIp: 'ENABLED',
                subnets: ['subnet-0aba1572a808edc9c', 'subnet-0c3ba912202381ced', 'subnet-03e51aa466c586d3a'],
                securityGroups: ['sg-09fe10205f79c2e1c']
            }
        },
        overrides: {
            containerOverrides: [
                {
                    name: 'builder-image',
                    environment: [
                        { name: 'GIT_REPOSITORY_URL', value: gitURL },
                        { name: 'PROJECT_ID', value: projectSlug }
                    ]
                }
            ]
        }
    })

    await ecsClient.send(command).then(()=>{
        console.log("completedd");
    });

    return res.json({ status: 'queued', data: { projectSlug, url: `http://${projectSlug}.localhost:8000` } })

})

async function initRedisSubscribe() {
    console.log('Subscribed to logs....')
    subscriber.psubscribe('logs:*')
    subscriber.on('pmessage', (pattern, channel, message) => {
        io.to(channel).emit('message', message)
    })
}

initRedisSubscribe()

app.listen(PORT, () => console.log(`API Server Running..${PORT}`))