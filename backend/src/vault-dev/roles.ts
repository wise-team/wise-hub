
export const roles = [
/*§ const role = data.config.hub.docker.services.api.appRole; '\n' + JSON.stringify({ role: role.role, secretMount: role.secretMount, policies: role.policies(data.config) }, undefined, 2) + ',\n' §*/
{
  "role": "wise-hub-api",
  "secretMount": "/secret/api-role.json",
  "policies": [
    "wise-hub-api"
  ]
},
/*§  §.*/

/*§ const role = data.config.hub.docker.services.daemon.appRole; '\n' + JSON.stringify({ role: role.role, secretMount: role.secretMount, policies: role.policies(data.config) }, undefined, 2) + ',\n' §*/
{
  "role": "wise-hub-daemon",
  "secretMount": "/secret/daemon-role.json",
  "policies": [
    "wise-hub-daemon"
  ]
},
/*§  §.*/
];