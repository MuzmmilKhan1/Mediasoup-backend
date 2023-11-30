// // Using ES6 import:
// const mediasoup = require("mediasoup")
// const https = require('https');
// const fs = require('fs');
// const express = require('express')
// const cors = require('cors')
// const path = require('path');
// const { Server } = require('socket.io');
// const app = express();
// app.use(cors())

// const options = {
//   key: fs.readFileSync(path.resolve(__dirname, 'ssl', 'key.pem')),
//   cert: fs.readFileSync(path.resolve(__dirname, 'ssl','cert.pem'))
// };

// const server = https.createServer(options, (req, res) => {
//   res.writeHead(200, { 'Content-Type': 'text/plain' });
//   res.end('Hello, HTTPS!\n');
// }, app);

//   let router;
//   let worker;
//   let producerTransport;
//   let clientStates = {};
//   let peers = {};
//   let rooms;

//   const createWorker = async () => {
//     worker = await mediasoup.createWorker({
//       rtcMinPort: 2000,
//       rtcMaxPort: 2020,
//     })
//     console.log(`worker pid ${worker.pid}`)
  
//     worker.on('died', error => {
//       // This implies something serious happened, so kill the application
//       console.error('mediasoup worker has died')
//       setTimeout(() => process.exit(1), 2000) // exit in 2 seconds
//     })
  
//     return worker
//   }
  
//   // We create a Worker as soon as our application starts
//   worker = createWorker()

// const mediaCodecs = [
//   {
//     kind: 'audio',
//     mimeType: 'audio/opus',
//     clockRate: 48000,
//     channels: 2,
//   },
//   {
//     kind: 'video',
//     mimeType: 'video/VP8',
//     clockRate: 90000,
//     parameters: {
//       'x-google-start-bitrate': 1000,
//     },
//   },
// ]

// const io = new Server(server, {
//   cors: "https://127.0.0.1:3000"
// });
// io.on('connection', async (socket) => {
//     console.log('Client connected', socket.id);
//     socket.emit("connection-success", { socketId: socket.id })

//     // Handle client requests here...
   

//     // Initialize client state
//     clientStates[socket.id] = {
//       producerTransport: null,
//       consumerTransport: null,
//       consumers: []
//     };

//     // Client emits a request for RTP Capabilities
//     // This event responds to the request
//     socket.on('getRtpCapabilities', async (callback) => {
//       router = await worker.createRouter({ mediaCodecs, })
//       rooms = router; 
  
//       const rtpCapabilities = router.rtpCapabilities
  
//       console.log('rtp Capabilities', rtpCapabilities)
  
//       // call callback from the client and send back the rtpCapabilities
//       callback({ rtpCapabilities })
//     })

//     socket.on('createWebRtcTransport', async ({ sender }, callback) => {
//       console.log(`Is this a sender request? ${sender}`)
//       // The client indicates if it is a producer or a consumer
//       // if sender is true, indicates a producer else a consumer
//       // if (sender)
//       //   producerTransport = await createWebRtcTransport(callback)
//       // else
//       //   consumerTransport = await createWebRtcTransport(callback)
//       if (sender) {
//         producerTransport = await createWebRtcTransport(callback);
//       } else {
//         clientStates[socket.id].consumerTransport = await createWebRtcTransport(callback);
//       }
//     })

//     socket.on('transport-connect', async ({ dtlsParameters }) => {
//       console.log('DTLS PARAMS... ', { dtlsParameters })
//       await producerTransport.connect({ dtlsParameters })
//     })

//       // see client's socket.emit('transport-produce', ...)
//   socket.on('transport-produce', async ({ kind, rtpParameters, appData }, callback) => {
//     // call produce based on the prameters from the client
//     producer = await producerTransport.produce({
//       kind,
//       rtpParameters,
//     })

//     console.log('Producer ID: ', producer.id, producer.kind)

//     producer.on('transportclose', () => {
//       console.log('transport for this producer closed ')
//       producer.close()
//     })

//     // Send back to the client the Producer's id
//     callback({
//       id: producer.id
//     })
//   })

//   socket.on('transport-recv-connect', async ({ dtlsParameters }) => {
//     console.log(`DTLS PARAMS: ${dtlsParameters}`)
//     let consumerTransport = clientStates[socket.id].consumerTransport;
//     await consumerTransport.connect({ dtlsParameters })
//   })

//   socket.on('consume', async ({ rtpCapabilities }, callback) => {
//     try {
//       let consumerTransport = clientStates[socket.id].consumerTransport;
//       if (!consumerTransport) {
//         throw new Error("Consumer transport not found");
//       }

//       if(!router){
//         console.log("Router Not Found")
//       }

//       // check if the router can consume the specified producer
//       if (router.canConsume({
//         producerId: producer.id,
//         rtpCapabilities
//       })) {
//         // transport can now consume and return a consumer
//         consumer = await consumerTransport.consume({
//           producerId: producer.id,
//           rtpCapabilities,
//           paused: true,
//         })

//         clientStates[socket.id].consumers.push(consumer);

//         consumer.on('transportclose', () => {
//           console.log('transport close from consumer')
//         })

//         consumer.on('producerclose', () => {
//           console.log('producer of consumer closed')
//         })

//         // from the consumer extract the following params
//         // to send back to the Client
//         const params = {
//           id: consumer.id,
//           producerId: producer.id,
//           kind: consumer.kind,
//           rtpParameters: consumer.rtpParameters,
//         }

//         // send the parameters to the client
//         callback({ params })
//       }
//     } catch (error) {
//       console.log(error.message)
//       callback({
//         params: {
//           error: error
//         }
//       })
//     }
//   })

//   socket.on('consumer-resume', async () => {
//     console.log('consumer resume')
//     await consumer.resume()
//   })

//     socket.on('disconnect', () => {
//         console.log('Client disconnected');
//     });
// });



// const createWebRtcTransport = async (callback) => {
//   try {
//     // https://mediasoup.org/documentation/v3/mediasoup/api/#WebRtcTransportOptions
//     const webRtcTransport_options = {
//       listenIps: [
//         {
//           ip: '0.0.0.0', // replace with relevant IP address
//           announcedIp: '127.0.0.1',
//         }
//       ],
//       enableUdp: true,
//       enableTcp: true,
//       preferUdp: true,
//     }

//     // https://mediasoup.org/documentation/v3/mediasoup/api/#router-createWebRtcTransport
//     let transport = await router.createWebRtcTransport(webRtcTransport_options)
//     console.log(`transport id: ${transport.id}`)

//     transport.on('dtlsstatechange', dtlsState => {
//       if (dtlsState === 'closed') {
//         transport.close()
//       }
//     })

//     transport.on('close', () => {
//       console.log('transport closed')
//     })

//     // send back to the client the following prameters
//     callback({
//       // https://mediasoup.org/documentation/v3/mediasoup-client/api/#TransportOptions
//       params: {
//         id: transport.id,
//         iceParameters: transport.iceParameters,
//         iceCandidates: transport.iceCandidates,
//         dtlsParameters: transport.dtlsParameters,
//       }
//     })

//     return transport

//   } catch (error) {
//     console.log(error)
//     callback({
//       params: {
//         error: error
//       }
//     })
//   }
// }



// const PORT = 8000;

// server.listen(PORT, () => {
//   console.log(`Server running at https://localhost:${PORT}/`);
// });




// Using ES6 import:
const mediasoup = require("mediasoup")
const https = require('https');
const fs = require('fs');
const express = require('express')
const cors = require('cors')
const path = require('path');
const { Server } = require('socket.io');
const app = express();
app.use(cors())

const options = {
  key: fs.readFileSync(path.resolve(__dirname, 'ssl', 'key.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, 'ssl','cert.pem'))
};

const server = https.createServer(options, (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, HTTPS!\n');
}, app);

  let router;
  let worker;
  let producerTransport;
  let rtpCapabilities;
  let routers = {};
  let room;

  const createWorker = async () => {
    worker = await mediasoup.createWorker({
      rtcMinPort: 2000,
      rtcMaxPort: 2020,
    })
    console.log(`worker pid ${worker.pid}`)
  
    worker.on('died', error => {
      // This implies something serious happened, so kill the application
      console.error('mediasoup worker has died')
      setTimeout(() => process.exit(1), 2000) // exit in 2 seconds
    })
  
    return worker
  }
  
  // We create a Worker as soon as our application starts
  worker = createWorker()

const mediaCodecs = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000,
    parameters: {
      'x-google-start-bitrate': 1000,
    },
  },
]

const io = new Server(server, {
  cors: "https://127.0.0.1:3000"
});
io.on('connection', async (socket) => {
    console.log('Client connected', socket.id);
    socket.emit("connection-success", { socketId: socket.id })
    // Handle client requests here...
    if(!rtpCapabilities){
      router = await worker.createRouter({ mediaCodecs, })
    }

    // Client emits a request for RTP Capabilities
    // This event responds to the request
    socket.on('getRtpCapabilities', async ({ roomName, broadcaster },callback) => {

      room = roomName;

      if (!routers[roomName]) {
        if(broadcaster == true){
          // If not, create a new router
          const router = await worker.createRouter({ mediaCodecs });
          routers[roomName] = { router: router.rtpCapabilities };
          console.log(`Created router for room ${roomName}`);
        }
        rtpCapabilities = routers[roomName].router
        console.log('rtp Capabilities', rtpCapabilities)
        callback({ rtpCapabilities })
      }else{ 
        rtpCapabilities = routers[roomName].router
        console.log('rtp Capabilities', rtpCapabilities)
        callback({ rtpCapabilities })
      }

      console.log(routers)
      // call callback from the client and send back the rtpCapabilities
       if (!routers[roomName]) {
      callback("No Router");
      }
    })

    socket.on('createWebRtcTransport', async ({ sender }, callback) => {
      console.log(`Is this a sender request? ${sender}`)
      // The client indicates if it is a producer or a consumer
      // if sender is true, indicates a producer else a consumer
      if (sender)
        producerTransport = await createWebRtcTransport(callback)
      else
        consumerTransport = await createWebRtcTransport(callback)
    })

    socket.on('transport-connect', async ({ dtlsParameters }) => {
      console.log('DTLS PARAMS... ', { dtlsParameters })
      await producerTransport.connect({ dtlsParameters })
    })

      // see client's socket.emit('transport-produce', ...)
  socket.on('transport-produce', async ({ kind, rtpParameters, appData }, callback) => {
    // call produce based on the prameters from the client
    producer = await producerTransport.produce({
      kind,
      rtpParameters,
    })

    console.log('Producer ID: ', producer.id, producer.kind)

    producer.on('transportclose', () => {
      console.log('transport for this producer closed ')
      producer.close()
    })

    let existingData = routers[room]

    routers[room] = {
      ...existingData,
      producerId: producer.id
    }

    console.log(routers)
    // Send back to the client the Producer's id
    callback({
      id: producer.id
    })
  })

  socket.on('transport-recv-connect', async ({ dtlsParameters }) => {
    console.log(`DTLS PARAMS: ${dtlsParameters}`)
    await consumerTransport.connect({ dtlsParameters })
  })

  socket.on('consume', async ({ rtpCapabilities }, callback) => {
    let producerId = routers[room].producerId
    try {
      // check if the router can consume the specified producer
      if (router.canConsume({
        producerId: producerId,
        rtpCapabilities
      })) {
        // transport can now consume and return a consumer
        consumer = await consumerTransport.consume({
          producerId: producerId,
          rtpCapabilities,
          paused: true,
        })

        consumer.on('transportclose', () => {
          console.log('transport close from consumer')
        })

        consumer.on('producerclose', () => {
          console.log('producer of consumer closed')
        })

        // from the consumer extract the following params
        // to send back to the Client
        const params = {
          id: consumer.id,
          producerId: producer.id,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
        }

        // send the parameters to the client
        callback({ params })
      }
    } catch (error) {
      console.log(error.message)
      callback({
        params: {
          error: error
        }
      })
    }
  })

  socket.on('consumer-resume', async () => {
    console.log('consumer resume')
    await consumer.resume()
  })

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});



const createWebRtcTransport = async (callback) => {
  try {
    // https://mediasoup.org/documentation/v3/mediasoup/api/#WebRtcTransportOptions
    const webRtcTransport_options = {
      listenIps: [
        {
          ip: '0.0.0.0', // replace with relevant IP address
          announcedIp: '127.0.0.1',
        }
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    }

    // https://mediasoup.org/documentation/v3/mediasoup/api/#router-createWebRtcTransport
    let transport = await router.createWebRtcTransport(webRtcTransport_options)
    console.log(`transport id: ${transport.id}`)

    transport.on('dtlsstatechange', dtlsState => {
      if (dtlsState === 'closed') {
        transport.close()
      }
    })

    transport.on('close', () => {
      console.log('transport closed')
    })

    // send back to the client the following prameters
    callback({
      // https://mediasoup.org/documentation/v3/mediasoup-client/api/#TransportOptions
      params: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      }
    })

    return transport

  } catch (error) {
    console.log(error)
    callback({
      params: {
        error: error
      }
    })
  }
}

const PORT = 8000;

server.listen(PORT, () => {
  console.log(`Server running at https://localhost:${PORT}/`);
});
