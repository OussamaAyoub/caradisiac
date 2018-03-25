const elasticsearch = require('elasticsearch');
const {getBrands} = require('node-car-api');
const {getModels} = require('node-car-api');


//execute server.js
var elasticClient = new elasticsearch.Client({
    host: '127.0.0.1:9200',
    log: 'trace'
});
elasticClient.ping({
  // ping usually has a 3000ms timeout
  requestTimeout: 1000
}, function (error) {
  if (error) {
    console.trace('elasticsearch cluster is down!');
  } else {
    console.log('All is well');
  }
});
/*
 * Asynchronous function to get the brands
 */
async function populate() {
  const brands = await getBrands();
  var body = [];
  var counter= 1;
  for(var i=0; i<brands.length; i++)
  {
    const models = await getModels(brands[i]);

    for(var j=0; j<models.length; j++)
    {
      body.push({
        index:
        {
          _index: 'caradisiac',
          _type: 'car',
          _id: counter
        }
      });
      body.push(models[j]);
      counter++;
    }
  }
  /*
   * Send all the models to ElasticSearch with bulk.
   */
  elasticClient.bulk({
      body: body
  }, function (error, response) {
      if (error) {
          console.error(error);
          return;
      }
      else {
          console.log(response);
      }
  });
}

async function suv() {
  elasticClient.search({
    index: 'caradisiac',
    type: 'car',
    body:{
      "size": 15,
      "query": {
        "range": {
          "volume": {
            "gte" : "600"
          }
        }
      },
      "sort":[
        {"volume.keyword" :{"order":"desc"}}
      ]
    }
  }, function (error, response) {
       if (error){
         console.error(error)
         return;
       }
       else {
         console.log(response);
       }
  });
}


/*
 * Creation of the endpoints /populate and /suv.
 */
module.exports = function(app, db) {
  app.post('/populate', (req, res) => {
    populate()
    res.send('Create Index in ElasticSearch')
  });
  app.post('/suv', (req, res) => {
    suv()
    res.send('SUV, volume>600')
  });
};
