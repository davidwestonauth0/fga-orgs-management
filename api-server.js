 // server/server.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8000;

const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const jwt_decode = require("jwt-decode");
const jwtAuthz = require("express-jwt-authz");
const ManagementClient = require("auth0").ManagementClient;

const OrganizationsManager = require("auth0").OrganizationsManager;

const { Auth0FgaApi } = require('@auth0/fga'); // OR import { Auth0FgaApi } from '@auth0/fga';



app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const NodeCache = require( "node-cache" );
const myCache = new NodeCache( { stdTTL: 100, checkperiod: 120 } );

// Set up Auth0 configuration
const authConfig = {
  domain: process.env.AUTH0_DOMAIN,
  audience: process.env.AUTH0_AUDIENCE,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
};

const auth0Fga = new Auth0FgaApi({
  environment: process.env.REACT_APP_AUTH0_FGA_ENVIRONMENT,
  storeId: process.env.REACT_APP_AUTH0_FGA_STORE_ID,
  clientId: process.env.REACT_APP_AUTH0_FGA_CLIENT_ID,
  clientSecret: process.env.REACT_APP_AUTH0_FGA_CLIENT_SECRET,
});

const managementAPI = new ManagementClient({
  domain: authConfig.domain,
  clientId: authConfig.clientId,
  clientSecret: authConfig.clientSecret,
});

// Create middleware to validate the JWT using express-jwt
const checkJwt = jwt({
  // Provide a signing key based on the key identifier in the header and the signing keys provided by your Auth0 JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
  }),

  // Validate the audience (Identifier) and the issuer (Domain).
  audience: authConfig.audience,
  issuer: `https://authtwo.geoffit.co.uk/`,
  algorithms: ["RS256"],
});

// Middleware to check that the access token has the manage:users permission
// Middleware to check that the access token has the manage:users permission
const checkReadPermission = jwtAuthz(["read:organizations"], {
  customScopeKey: "permissions",
});

// Middleware to check that the access token has the manage:users permission
const checkWritePermission = jwtAuthz(["write:organizations"], {
  customScopeKey: "permissions",
});


// Get data for the logged in user
app.get("/user", checkJwt, (req, res) => {

  var authorization = req.headers.authorization.split(".")[1];
  try {
    authToken = jwt_decode(req.headers.authorization);
  } catch (e) {
    console.log(e);
    return res.status(401).send("unauthorized");
  }
  var userId = authToken.sub;

  try {
    managementAPI
      .getUser({ id: userId })
      .then((user) => {
        res.send(user);
      })

      .catch(function (err) {
        res.send(401, "Unauthorized");
      });
  } catch (err) {
    res.send(401, "Unauthorized");
  }
});


app.get("/organisation", checkJwt, checkReadPermission, async (req, res) => {

      try {
        var authorization = req.headers.authorization.split(".")[1];
        try {
          authToken = jwt_decode(req.headers.authorization);
        } catch (e) {
          console.log(e);
          return res.status(401).send("unauthorized");
        }
        var userId = authToken.sub;

        var orgId = req.query.org;
        var permission = "read";

        const result = await auth0Fga.check({
          tuple_key: {
            user: userId,
            relation: permission,
            object: "org:"+orgId,
          },
        });

        if (result.allowed) {
              managementAPI.organizations.getByID({ id: orgId }, function (err, organization) {
                 if (err) {
                    console.log(err);
                     res.status(401).send(err);
                 } else {
                    res.status(200).send(organization);
              }
              });
        } else {
            res.status(403).send();
        }

      } catch (err) {
        console.log(err);
        res.status(401).send();
      }

});

app.post("/organisation", checkJwt, checkWritePermission, async (req, res) => {

      try {
        var authorization = req.headers.authorization.split(".")[1];
        try {
          authToken = jwt_decode(req.headers.authorization);
        } catch (e) {
          console.log(e);
          return res.status(401).send("unauthorized");
        }
        var userId = authToken.sub;

        var orgId = req.query.org;
        var permission = "write";

        const result = await auth0Fga.check({
          tuple_key: {
            user: userId,
            relation: permission,
            object: "org:"+orgId,
          },
        });


        if (result.allowed) {
          managementAPI.organizations.update({ id: orgId }, req.body, function (err, organization) {
             if (err) {
                console.log(err);
                 res.status(401).send(err);
             } else {
                res.status(200).send(organization);
          }
          });
        } else {
            res.status(403).send();
        }


      } catch (err) {
        console.log(err);
        res.status(401).send();
      }

});



// get all organisations
app.get("/organisations", checkJwt, (req, res) => {

    try {
          if (req.query.flushCache=="true") {
            myCache.del("organizations");
          }

          var params = {
            take: 100
          };

        value = myCache.get( "organizations" );
        if ( value == undefined ){

              managementAPI.organizations.getAll(params, function (err, organizations) {
              res.status(200).send(organizations.organizations);
              myCache.set( "organizations", organizations.organizations, 120 );
          })
        } else {
            res.status(200).send(myCache.get( "organizations" ));
        }

  } catch (err) {
    console.log(err);
    res.status(200).send(json);
  }
});



// get all organisations
app.get("/users", checkJwt, (req, res) => {

    try {
          if (req.query.flushCache=="true") {
            myCache.del("users");
          }

        var params = {
          search_engine: 'v3',
          per_page: 100,
          page: 0
        };

        value = myCache.get("users");
        if ( value == undefined ){

              managementAPI.getUsers(params, function (err, users) {
              res.status(200).send(users);
              myCache.set( "users", users, 120 );
          })
        } else {
            res.status(200).send(myCache.get( "users" ));
        }



  } catch (err) {
    console.log(err);
    res.status(200).send(json);
  }
});


// get all organisations
app.get("/permission", checkJwt, checkWritePermission, async (req, res) => {

var object1 = req.query.object1;
var object2 = req.query.object2;
var relation = req.query.relation;
console.log(req.query);
console.log(relation);
console.log(object1);
console.log(object2);
try {
const result = await auth0Fga.write({
  writes: {
    tuple_keys: [{ user: object1, relation: relation, object: object2 }],
  },
});

console.log(result);
res.status(200).send(result);
} catch (err) {
res.send(200);
}

});


app.get("/", (req, res) => {
  res.send(`Hi! Server is listening on port ${port}`);
});

app.use(function (error, req, res, next) {
  // Any request to this server will get here, and will send an HTTP
  // response with the error message 'woops'
  console.log(error);
  res.json({ message: error });
});

// listen on the port
app.listen(port);
