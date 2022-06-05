FROM --platform=linux/x86_64 mysql:8.0.23

RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 467B942D3A79BD29
RUN apt-get update
RUN apt-get install -y curl locales
RUN locale-gen ja_JP.UTF-8
RUN localedef -f UTF-8 -i ja_JP ja_JP
USER mysql
ENV LANG ja_JP.UTF-8
ENV TZ Asia/Tokyo