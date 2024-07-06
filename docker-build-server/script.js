const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const mime = require('mime-types');
const Redis = require('ioredis')


const PROJECT_ID = process.env.PROJECT_ID;

const publisher = new Redis(process.env.REDIS_URL);

function publishLog(log){
    publisher.publish(`logs:${PROJECT_ID}`, JSON.stringify({ log }))
}

const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.IAM_ACCESS_KEY,
    secretAccessKey: process.env.IAM_SECRET_KEY
  },
});


async function init() {
  console.log("Exec script.js");

  publishLog("Build Started");

  const outDirPath = path.join(__dirname, "output");

  const p = exec(`cd ${outDirPath} && npm install && npm run build`);

  p.stdout.on("data", function (data) {
    publishLog()
    console.log(data.toString());
    publishLog(data.toString());
  });

  p.stderr.on("data", function (data) {
    console.log("Error", data.toString());
    publishLog(`Error ${data.toString()}`);
  });

  p.on("close", async function (code) {
    if (code !== 0) {
      console.error(`Process exited with code ${code}`);
      return;
    }

    publishLog(`Build Proceess Completed for ${PROJECT_ID}`);

    const distFolderPath = path.join(__dirname, 'output', 'dist');
    
    // Ensure the directory exists
    if (!fs.existsSync(distFolderPath)) {
      console.error(`Directory does not exist: ${distFolderPath}`);
      return;
    }

    const distFolderPathContent = fs.readdirSync(distFolderPath, { recursive: true });

    for (const file of distFolderPathContent) {
      const filePath = path.join(distFolderPath, file);
      
      fs.lstat(filePath, async (err, stats) => {
        if (err) {
          console.error('Error', err);
          return;
        }

        if (stats.isDirectory()) return;

        console.log("Uploading");

        const command = new PutObjectCommand({
          Bucket: "akshay-vercel",
          Key: `__outputs/${PROJECT_ID}/${file}`,
          Body: fs.createReadStream(filePath),
          ContentType: mime.lookup(filePath) || 'application/octet-stream',
        });

        try {
          await s3Client.send(command);
          console.log("Uploaded");
        } catch (uploadErr) {
          console.error("Error uploading", uploadErr);
        }
      });
    }
  });

  console.log("Done uploading to S3");
}

init();
