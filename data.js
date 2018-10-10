
/*
    Split into a separate module
 */
async function storeValue(key, value)
{
  // KIND, KEY, VALUE

  console.log("storeValue key=" + key + " value=" + value);

  const Datastore = require('@google-cloud/datastore');
  const projectId = 'api-project-73897325473';

  const datastore = Datastore({ projectId: projectId });

  const kind = 'GA';
  const gcskey = datastore.key([kind, key]);

  const entry = {
    key: gcskey,
    data: {
      "value" : value,
      excludeFromIndexes: true
    },
    excludeFromIndexes: ['value']
  };


  datastore.save(entry)
    .then(() => console.log("storeValue Succeded: key=" + key + " value=" + value ))
    .catch((err) => {
      console.error(err);
    });  

}


/*
    Split into a separate module
 */
function getValue(row)
{
  console.log("getValue(" + row + ") Beginning ");

  const Datastore = require('@google-cloud/datastore');
  const projectId = 'api-project-73897325473';

  const datastore = Datastore({ projectId: projectId });

  const kind = 'GA';
  const key = datastore.key([kind, row]);

  return new Promise(function(resolve, reject) {
      // Do async job
    datastore.get(key, function(err, entity) {
      if (err != null) 
      {
        console.log("getValue(" + row + ") err=" + err);
        reject(err);
      }
      else
      {
        console.log("getValue(" + row + ") entity=" + JSON.stringify(entity) + " value=" + entity.value);
        resolve(entity.value);
      }
    });

  });

  
  
}

module.exports = {storeValue, getValue}