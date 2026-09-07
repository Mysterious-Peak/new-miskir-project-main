FROM nginx:1.25-alpine

LABEL maintainer="oromia"

COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN mkdir -p /home/appus/proj/farmland \
    /home/appus/proj/production \
    /home/appus/proj/harvest \
    /home/appus/proj/logistics \
    /home/appus/proj/processing

EXPOSE 80
