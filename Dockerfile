FROM fedora:25

RUN dnf -y update
RUN dnf -y install nginx npm
COPY . /usr/src/rdbf
WORKDIR /usr/src/rdbf
RUN npm install
RUN npm run production
RUN cp -r dist/* /usr/share/nginx/html
RUN cp /usr/share/nginx/html/index.html /usr/share/nginx/html/404.html

EXPOSE 80

CMD ["/usr/sbin/nginx", "-g", "daemon off;"]