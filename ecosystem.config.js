module.exports = {
  apps : [
    {
      name : "www",
      script : "./bin/www.js",
      watch : false,
      env : {
        "NODE_ENV": "production",
      },
      log_date_format : "YYYY-MM-DD HH:mm Z",
    },
    {
      name   : "update",
      script : "./bin/update.js",
      watch  : false,
      env : {
        "NODE_ENV": "production",
      },
      log_date_format : "YYYY-MM-DD HH:mm Z",
    }
  ]
}
