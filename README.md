# DONT USE ME DIRECTLY

This powers my-first-hoodie (née hoodie-app-skeleton).

One way to get around not having local-tld is using a proxy to map incoming hosts to ports.

Using nginx as a proxy for hoodie
```
server {
  listen   80 ;

  server_name  myapp.dev *.myapp.dev;
  access_log   /var/log/nginx/access.myapp.log;
  location / {
    proxy_redirect off;
    proxy_set_header Host $host;
    proxy_pass  http://localhost:8083; # hoodie port
  }
}
```
