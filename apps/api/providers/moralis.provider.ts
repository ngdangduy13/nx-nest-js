import Moralis from 'moralis/node';

Moralis.start({
   "masterKey": process.env.MORALIS_MASTER_KEY,
   "serverUrl": process.env.MORALIS_SERVER_URL,
   "appId": process.env.MORALIS_APP_ID
 });

export default Moralis;
