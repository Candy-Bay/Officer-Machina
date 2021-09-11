import { ApolloClient, ApolloLink, InMemoryCache, HttpLink, gql } from '@apollo/client';
import fetch from 'cross-fetch';
const httpLink = new HttpLink({ uri: 'http://localhost:8000/graphql', fetch });

const authLink = new ApolloLink((operation, forward) => {
  /*
  // Retrieve the authorization token from local storage.
  const token = localStorage.getItem('auth_token');

  // Use the setContext method to set the HTTP headers.
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : ''
    }
  });

  operation.setContext({
    headers: {
      'Access-Control-Allow-Origin': "*"
    }
  });
  */

  // Call the next link in the middleware chain.
  return forward(operation);
});


const INITIAL_GRAPHQL = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

const listUsers = `
    query {
			listUsers {
        address
        discordID
      }
		}
    `;

// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');


// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const channels = {
  botTest: '886110475849457695'
}

const managePermissions = (seconds) => {
  const botTestchannel = client.channels.cache.get(channels.botTest)
  setInterval(function () {
    // use the message's channel (TextChannel) to send a new message
    INITIAL_GRAPHQL.query({
      query: gql(listUsers)
    })
    .then((data) => {
      botTestchannel.send(JSON.stringify(data.data.listUsers, null, 2))
      })
    .catch((err) => {
        console.log('Error fetching data: ', err);
        botTestchannel.send('Error fetching data')
      });
  }, seconds * 1000);
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log('Ready!');

  managePermissions(5)
});

/*
client.on('message', function (message) {
  // Now, you can use the message variable inside

  if (message.content === "$loop") {
    var interval = setInterval(function () {
      // use the message's channel (TextChannel) to send a new message
      message.channel.send(message.content) // add error handling here
    }, 1 * 1000);
  }
});
*/


// Login to Discord with your client's token
client.login(token);