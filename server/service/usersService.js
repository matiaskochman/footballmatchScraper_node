const request = require('request-promise');
//import uuid    from 'uuid';

const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

createFakeUsers = async (req,resp,db) => {

  const response = await request({
    uri: 'https://randomuser.me/api/?results=10'
  });
  const jsonResult = JSON.parse(response);

  let nuevos_usuarios = {};

  jsonResult.results.forEach((user,index) => {

    var obj = {
      facebookData: {
        email:user.email,
        id:index,
        name:`${user.name.first} ${user.name.last}`,
        picture:{
          data:{
            url:user.picture.large,
            heigth: 200,
            width: 200,
            is_silhouette: false
          }
        }
      },
      login: user.login,
      Apuestas:{

      },
      lastInsert:{

      }
    }
    //return obj;

    //agregando data para hacer update en grupo
    let route = `/users/${index}/facebookData/`;

    nuevos_usuarios[route] = obj;

  })

  await db.ref().update(nuevos_usuarios).then(function(){
    console.log('users created.')
  }).catch(function(err){
    console.error(err);
  })

  resp.status(200).send(nuevos_usuarios);


}
module.exports = {
  createFakeUsers
}
