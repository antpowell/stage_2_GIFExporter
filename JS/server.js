const express = require('express');
const request = require('request');
const app = express();
app.set('port', (process.env.PORT || 8080));
app.listen(app.get('port'), () => {
    console.log('​server running on ', app.get('port'));
});
//# sourceMappingURL=server.js.map