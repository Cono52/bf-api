import dotenv from 'dotenv';
import mongoose from 'mongoose';

import app from './app';

mongoose.Promise = global.Promise;

dotenv.config({ path: 'variables.env' });

mongoose.connect(process.env.DATABASE);
const db = mongoose.connection;
db.on('error', (err) => {
  console.log(err);
});

app.set('port', process.env.PORT || 7777);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
