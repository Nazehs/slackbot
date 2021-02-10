const normalizePort = require('normalize-port');
const app = require("./app");

const port = normalizePort(process.env.PORT || '3000');
app.listen(port, () => {
    console.log(`server listening on port ${port}`);
  });