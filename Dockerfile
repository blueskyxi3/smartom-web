FROM nginx

LABEL author="vincentzou"

# 将文件中的内容复制到 /usr/share/nginx/html/ 这个目录下面
COPY dist  /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80 443

