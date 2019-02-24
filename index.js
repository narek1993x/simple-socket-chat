const http = require('./server/server');

const PORT = 3001;

http.listen(PORT, function() {
  console.log(`Listening on port http://localhost:${PORT}`);
});
